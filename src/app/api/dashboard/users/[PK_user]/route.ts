import { z } from "zod";
import bcrypt from "bcrypt";
import prisma from "@/lib/db/prisma";
import { crudGetById } from "@/lib/api/crud-factory";
import { usersCrud } from "@/lib/api/catalogs";
import {
  ApiError,
  apiRoute,
  appendActionHistory,
  ok,
  parseBody,
  type DashboardSession,
} from "@/lib/api/helpers";
import {
  assertNotLastCentralAdmin,
  resolveUserRelations,
  verifyAdminPassword,
} from "@/lib/api/admin-guard";
import { userWriteSchema } from "../route";

// ============================================================
// USUARIOS DEL SISTEMA — DETALLE, EDICIÓN Y BAJA LÓGICA
// - Edición: exige la contraseña del administrador de la Central.
//   La contraseña nueva es opcional (vacío = no cambiar).
// - NO EXISTE eliminación física: DELETE realiza una BAJA lógica
//   (status=false), también confirmada con contraseña.
// - Nunca se deja al sistema sin un administrador central activo
//   y nadie puede dar de baja su propia cuenta.
// ============================================================

export const GET = crudGetById(usersCrud);

export const PUT = apiRoute(async (req, ctx) => {
  const params = await ctx.params;
  const id = Number(params.PK_user);

  const body = await parseBody(
    req,
    userWriteSchema.partial().extend({ adminPassword: z.string().min(1) }),
  );
  const { adminPassword, ...data } = body;
  const session: DashboardSession = await verifyAdminPassword(adminPassword);

  const existing = await prisma.tbusers.findUnique({
    where: { PK_user: id },
    include: { tbprivileges: { select: { privilegeCode: true } } },
  });
  if (!existing) throw new ApiError(404, "El usuario no existe.");

  const relations = await resolveUserRelations({
    FK_privilege: data.FK_privilege ?? existing.FK_privilege,
    FK_institution: data.FK_institution ?? existing.FK_institution,
    FK_subinstitution: Object.prototype.hasOwnProperty.call(data, "FK_subinstitution")
      ? (data.FK_subinstitution ?? null)
      : existing.FK_subinstitution,
  });

  const nextStatus = data.status ?? existing.status;

  if (data.email != null && data.email !== existing.email) {
    const emailTaken = await prisma.tbusers.findUnique({
      where: { email: data.email },
      select: { PK_user: true },
    });
    if (emailTaken) throw new ApiError(409, "Ya existe un usuario con ese correo electrónico.");
  }

  // Reglas de protección del núcleo administrativo.
  if (!nextStatus && existing.PK_user === session.userId) {
    throw new ApiError(400, "No puede dar de baja su propia cuenta.");
  }
  await assertNotLastCentralAdmin(
    existing.PK_user,
    existing.tbprivileges.privilegeCode,
    relations.privilegeCode,
    nextStatus,
  );

  const updateData: Record<string, unknown> = {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phoneNumber: data.phoneNumber,
    status: nextStatus,
    FK_privilege: data.FK_privilege,
    FK_institution: relations.FK_institution,
    FK_subinstitution: relations.FK_subinstitution,
  };
  for (const key of Object.keys(updateData)) {
    if (updateData[key] === undefined) delete updateData[key];
  }
  if (typeof data.password === "string" && data.password.length > 0) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  const updated = await prisma.tbusers.update({
    where: { PK_user: id },
    data: updateData,
    include: usersCrud.include as never,
  });

  await appendActionHistory("users", "PK_user", id, {
    action: "UPDATE",
    detail:
      `Editado por ${session.name}. Campos: ${Object.keys(updateData).join(", ")}` +
      (updateData.password ? " (contraseña actualizada)" : "") +
      ".",
  });

  const safe = { ...updated } as Record<string, unknown>;
  delete safe.password;
  return ok(safe);
});

/** BAJA LÓGICA (no física): el usuario queda inactivo y conservando historial. */
export const DELETE = apiRoute(async (req, ctx) => {
  const params = await ctx.params;
  const id = Number(params.PK_user);

  const body = await parseBody(req, z.object({ adminPassword: z.string().min(1) }));
  const session = await verifyAdminPassword(body.adminPassword);

  const existing = await prisma.tbusers.findUnique({
    where: { PK_user: id },
    include: { tbprivileges: { select: { privilegeCode: true, privilege: true } } },
  });
  if (!existing) throw new ApiError(404, "El usuario no existe.");
  if (!existing.status) throw new ApiError(409, "El usuario ya se encuentra dado de baja.");

  if (existing.PK_user === session.userId) {
    throw new ApiError(400, "No puede dar de baja su propia cuenta.");
  }

  await assertNotLastCentralAdmin(
    existing.PK_user,
    existing.tbprivileges.privilegeCode,
    existing.tbprivileges.privilegeCode,
    false,
  );

  await prisma.tbusers.update({
    where: { PK_user: id },
    data: { status: false },
  });

  await appendActionHistory("users", "PK_user", id, {
    action: "DEACTIVATE",
    detail: `Baja del usuario (${existing.tbprivileges.privilege}) realizada por ${session.name}.`,
  });

  return ok({ deactivated: true });
});
