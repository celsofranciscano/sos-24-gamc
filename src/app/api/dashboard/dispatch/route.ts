import { apiRoute, getPagination, getSearchParams, institutionScope, ok, requireSession } from "@/lib/api/helpers";
import prisma from "@/lib/db/prisma";

// ============================================================
// API: DESPACHO GLOBAL
// GET /api/dashboard/dispatch?status=SOLICITADA,EN_CAMINO&FK_institution=
//     Lista de asignaciones con alcance por rol.
// ============================================================

export const GET = apiRoute(async (req) => {
  const session = await requireSession();
  const { skip, take, page, pageSize } = getPagination(req);
  const sp = getSearchParams(req);

  const statusList = sp.get("status")?.split(",").filter(Boolean);
  const emergencyCode = (sp.get("emergencyCode") ?? "").trim();

  const where: Record<string, unknown> = {
    ...institutionScope(session),
    ...(statusList?.length ? { status: { in: statusList } } : {}),
    ...(emergencyCode
      ? { tbemergencies: { emergencyCode: { contains: emergencyCode } } }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.tbemergencyassignments.findMany({
      where,
      skip,
      take,
      orderBy: { assignedAt: "desc" },
      include: {
        tbinstitutions: { select: { PK_institution: true, name: true, acronym: true } },
        tbsubinstitutions: { select: { name: true } },
        tbunits: { select: { PK_unit: true, unitCode: true, unitName: true } },
        tbemergencies: {
          select: {
            PK_emergency: true,
            emergencyCode: true,
            priority: true,
            status: true,
            description: true,
          },
        },
        _count: { select: { tbassignmenttracking: true } },
      },
    }),
    prisma.tbemergencyassignments.count({ where }),
  ]);

  return ok({ items, total, page, pageSize });
});
