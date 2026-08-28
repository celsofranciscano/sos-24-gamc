import { z } from "zod";
import { apiRoute, getPagination, getSearchParams, ok, parseBody, requireCentral } from "@/lib/api/helpers";
import prisma from "@/lib/db/prisma";
import { publish, topics } from "@/lib/realtime/bus";

// ============================================================
// API: CIUDADANOS PARA EL DASHBOARD (consulta de la Central)
// GET /api/dashboard/citizens?search=&page=
// PATCH /api/dashboard/citizens  → activar/desactivar: { PK_citizen, status }
// ============================================================

export const GET = apiRoute(async (req) => {
  await requireCentral();
  const { skip, take, page, pageSize } = getPagination(req);
  const search = (getSearchParams(req).get("search") ?? "").trim();

  const where = search
    ? {
        OR: [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { phoneNumber: { contains: search } },
          { CI: { contains: search } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.tbcitizens.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      select: {
        PK_citizen: true,
        firstName: true,
        lastName: true,
        CI: true,
        phoneNumber: true,
        email: true,
        status: true,
        createdAt: true,
        _count: { select: { tbemergencies: true, tbemergencyreports: true } },
      },
    }),
    prisma.tbcitizens.count({ where }),
  ]);

  return ok({ items, total, page, pageSize });
});

const patchSchema = z.object({
  PK_citizen: z.coerce.number().int(),
  status: z.boolean(),
});

export const PATCH = apiRoute(async (req) => {
  await requireCentral();
  const body = await parseBody(req, patchSchema);

  const updated = await prisma.tbcitizens.update({
    where: { PK_citizen: body.PK_citizen },
    data: { status: body.status },
    select: { PK_citizen: true, status: true },
  });
  publish(topics.dashboard, "CITIZEN_UPDATED");
  return ok(updated);
});
