import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { crudList } from "@/lib/api/crud-factory";
import { privilegesCrud } from "@/lib/api/catalogs";
import { apiRoute, ok, parseBody } from "@/lib/api/helpers";
import { verifyAdminPassword } from "@/lib/api/admin-guard";
import { privilegeWriteSchema } from "@/lib/api/schemas";

// ============================================================
// PRIVILEGIOS — LISTADO Y CREACIÓN
// Lectura: cualquier usuario del dashboard.
// Escritura: solo Central GAMC + confirmación con su contraseña.
// ============================================================

export const GET = crudList(privilegesCrud);

export const POST = apiRoute(async (req) => {
  const body = await parseBody(
    req,
    privilegeWriteSchema.extend({ adminPassword: z.string().min(1) }),
  );
  const { adminPassword, ...data } = body;
  await verifyAdminPassword(adminPassword);

  const created = await prisma.tbprivileges.create({
    data,
    include: {
      _count: { select: { tbusers: true } },
    },
  });
  return ok(created, 201);
});
