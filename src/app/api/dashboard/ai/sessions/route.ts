import { apiRoute, getPagination, getSearchParams, ok, requireSession } from "@/lib/api/helpers";
import prisma from "@/lib/db/prisma";

// ============================================================
// API: SESIONES DE IA CON CIUDADANOS
// GET /api/dashboard/ai/sessions?search=&page=
// ============================================================

export const GET = apiRoute(async (req) => {
  await requireSession();
  const { skip, take, page, pageSize } = getPagination(req);
  const search = (getSearchParams(req).get("search") ?? "").trim();

  const where = search
    ? {
        OR: [
          { initialIntent: { contains: search } },
          { tbcitizens: { OR: [{ firstName: { contains: search } }, { lastName: { contains: search } }] } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.tbaisessions.findMany({
      where,
      skip,
      take,
      orderBy: { startedAt: "desc" },
      include: {
        tbcitizens: { select: { firstName: true, lastName: true, phoneNumber: true } },
        tbemergencies: { select: { emergencyCode: true, status: true } },
      },
    }),
    prisma.tbaisessions.count({ where }),
  ]);

  return ok({ items, total, page, pageSize });
});
