import { apiRoute, institutionScope, ok, requireSession } from "@/lib/api/helpers";
import prisma from "@/lib/db/prisma";

// ============================================================
// API: REPORTES ESTADÍSTICOS
// GET /api/dashboard/reports/overview
//     Agregados para el módulo de reportes:
//     por estado, prioridad, tipo e institución + serie mensual.
// ============================================================

export const GET = apiRoute(async () => {
  const session = await requireSession();

  // Alcance institucional: emergencias donde la institución participa.
  const emergencyScope = session.isCentral
    ? {}
    : { tbemergencyassignments: { some: institutionScope(session) } };

  const [byStatus, byPriority, byTypeRaw, assignments, emergencies] = await Promise.all([
    prisma.tbemergencies.groupBy({ by: ["status"], where: emergencyScope, _count: { _all: true } }),
    prisma.tbemergencies.groupBy({ by: ["priority"], where: emergencyScope, _count: { _all: true } }),
    prisma.tbemergencies.groupBy({
      by: ["FK_emergencyType"],
      where: emergencyScope,
      _count: { _all: true },
    }),
    prisma.tbemergencyassignments.findMany({
      select: {
        FK_institution: true,
        status: true,
        assignedAt: true,
        acceptedAt: true,
        completedAt: true,
        tbinstitutions: { select: { name: true, acronym: true } },
      },
    }),
    prisma.tbemergencies.findMany({
      where: emergencyScope,
      select: { createdAt: true },
    }),
  ]);

  const typeIds = byTypeRaw.map((t) => t.FK_emergencyType).filter((id): id is number => id != null);
  const types = typeIds.length
    ? await prisma.tbemergencytypes.findMany({ where: { PK_emergencyType: { in: typeIds } } })
    : [];
  const typeNameById = new Map(types.map((t) => [t.PK_emergencyType, t.name]));

  // Agrupado de desempeño por institución (asignaciones).
  type InstitutionEntry = {
    institution: string;
    total: number;
    completed: number;
    rejected: number;
    avgAcceptSum: number;
    acceptSamples: number;
  };
  const institutionMap = new Map<number, InstitutionEntry>();
  for (const assignment of assignments) {
    const key = assignment.FK_institution;
    const entry =
      institutionMap.get(key) ??
      {
        institution: assignment.tbinstitutions?.acronym ?? assignment.tbinstitutions?.name ?? `#${key}`,
        total: 0,
        completed: 0,
        rejected: 0,
        avgAcceptSum: 0,
        acceptSamples: 0,
      };
    entry.total += 1;
    if (assignment.status === "FINALIZADA") entry.completed += 1;
    if (assignment.status === "RECHAZADA") entry.rejected += 1;
    if (assignment.acceptedAt) {
      const minutes = (new Date(assignment.acceptedAt).getTime() - new Date(assignment.assignedAt).getTime()) / 60000;
      entry.avgAcceptSum += minutes;
      entry.acceptSamples += 1;
    }
    institutionMap.set(key, entry);
  }

  // Serie mensual de los últimos 6 meses.
  const months: { label: string; count: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const label = start.toLocaleDateString("es-BO", { month: "short" });
    months.push({
      label,
      count: emergencies.filter((e) => {
        const d = new Date(e.createdAt);
        return d >= start && d < end;
      }).length,
    });
  }

  return ok({
    byStatus: byStatus.map((s) => ({ key: s.status, count: s._count._all })),
    byPriority: byPriority.map((p) => ({ key: p.priority ?? "SIN_CLASIFICAR", count: p._count._all })),
    byType: byTypeRaw.map((t) => ({
      key: t.FK_emergencyType ? (typeNameById.get(t.FK_emergencyType) ?? "Otro") : "Sin clasificar",
      count: t._count._all,
    })),
    byInstitution: Array.from(institutionMap.values()).map((entry) => ({
      ...entry,
      avgAcceptMinutes:
        entry.avgAcceptSum > 0 && entry.acceptSamples > 0
          ? Math.round(entry.avgAcceptSum / entry.acceptSamples)
          : null,
    })),
    monthly: months,
  });
});
