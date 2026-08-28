import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { crudGetById } from "@/lib/api/crud-factory";
import { privilegesCrud } from "@/lib/api/catalogs";
import { ApiError, apiRoute, ok, parseBody } from "@/lib/api/helpers";
import { verifyAdminPassword } from "@/lib/api/admin-guard";
import { privilegeWriteSchema } from "@/lib/api/schemas";

// ============================================================
// PRIVILEGIOS — DETALLE, EDICIÓN Y ELIMINACIÓN CONTROLADA
// - Edición: solo Central GAMC + contraseña del administrador.
//   No se permite cambiar el código si ya tiene usuarios asignados.
// - Eliminación: bloqueada mientras existan usuarios con el
//   privilegio asignado (los usuarios nunca se eliminan físicamente).
// ============================================================

export const GET = crudGetById(privilegesCrud);

export const PUT = apiRoute(async (req, ctx) => {
  const params = await ctx.params;
  const id = Number(params.PK_privilege);

  const body = await parseBody(
    req,
    privilegeWriteSchema.partial().extend({ adminPassword: z.string().min(1) }),
  );
  const { adminPassword, ...data } = body;
  await verifyAdminPassword(adminPassword);

  const existing = await prisma.tbprivileges.findUnique({
    where: { PK_privilege: id },
    include: { _count: { select: { tbusers: true } } },
  });
  if (!existing) throw new ApiError(404, "El privilegio no existe.");

  if (
    data.privilegeCode != null &&
    data.privilegeCode !== existing.privilegeCode &&
    existing._count.tbusers > 0
  ) {
    throw new ApiError(
      409,
      `No se puede cambiar el código: ${existing._count.tbusers} usuario(s) usan este privilegio. Reasígnelos primero.`,
    );
  }

  if (data.privilegeType != null && data.privilegeType !== existing.privilegeType) {
    throw new ApiError(409, "No se puede cambiar el tipo de un privilegio existente.");
  }

  const updated = await prisma.tbprivileges.update({
    where: { PK_privilege: id },
    data,
    include: { _count: { select: { tbusers: true } } },
  });
  return ok(updated);
});

export const DELETE = apiRoute(async (_req, ctx) => {
  const params = await ctx.params;
  const id = Number(params.PK_privilege);

  const existing = await prisma.tbprivileges.findUnique({
    where: { PK_privilege: id },
    include: { _count: { select: { tbusers: true } } },
  });
  if (!existing) throw new ApiError(404, "El privilegio no existe.");

  if (existing._count.tbusers > 0) {
    throw new ApiError(
      409,
      `No se puede eliminar: ${existing._count.tbusers} usuario(s) tienen este privilegio asignado.`,
    );
  }

  await prisma.tbprivileges.delete({ where: { PK_privilege: id } });
  return ok({ deleted: true });
});
