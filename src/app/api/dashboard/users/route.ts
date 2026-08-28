import { z } from "zod";
import bcrypt from "bcrypt";
import prisma from "@/lib/db/prisma";
import { crudList } from "@/lib/api/crud-factory";
import { usersCrud } from "@/lib/api/catalogs";
import {
  ApiError,
  apiRoute,
  appendActionHistory,
  ok,
  parseBody,
} from "@/lib/api/helpers";
import { resolveUserRelations, verifyAdminPassword } from "@/lib/api/admin-guard";
import {
  nullableId,
  optionalText,
  requiredId,
  requiredText,
} from "@/lib/api/schemas";

// ============================================================
// USUARIOS DEL SISTEMA — LISTADO Y CREACIÓN
// Lectura y escritura: solo Central GAMC.
// Toda acción de escritura exige la CONTRASEÑA del administrador
// que la ejecuta (confirmación de seguridad).
// Los usuarios NUNCA se eliminan físicamente: solo se da de baja.
// ============================================================

export const GET = crudList(usersCrud);

export const userWriteSchema = z.object({
  FK_privilege: requiredId,
  FK_institution: nullableId,
  FK_subinstitution: nullableId,
  firstName: requiredText("Los nombres"),
  lastName: requiredText("Los apellidos"),
  phoneNumber: optionalText,
  email: z.string().trim().min(3).email("Correo inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  status: z.boolean().optional(),
});

export const POST = apiRoute(async (req) => {
  const body = await parseBody(
    req,
    userWriteSchema.extend({ adminPassword: z.string().min(1) }),
  );
  const { adminPassword, password, status, ...data } = body;

  const session = await verifyAdminPassword(adminPassword);
  const relations = await resolveUserRelations(data);

  const emailTaken = await prisma.tbusers.findUnique({
    where: { email: data.email },
    select: { PK_user: true },
  });
  if (emailTaken) throw new ApiError(409, "Ya existe un usuario con ese correo electrónico.");

  const created = await prisma.tbusers.create({
    data: {
      ...data,
      FK_institution: relations.FK_institution,
      FK_subinstitution: relations.FK_subinstitution,
      password: await bcrypt.hash(password, 10),
      status: status ?? true,
    },
    include: usersCrud.include as never,
  });

  await appendActionHistory("users", "PK_user", created.PK_user, {
    action: "CREATE",
    detail: `Usuario creado por ${session.name} con el privilegio ${relations.privilegeName}.`,
  });

  const safe = { ...created } as Record<string, unknown>;
  delete safe.password;
  return ok(safe, 201);
});
