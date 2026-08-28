import { apiRoute, institutionScope, ok, requireSession } from "@/lib/api/helpers";
import prisma from "@/lib/db/prisma";

// ============================================================
// API: KPIs PARA EL INICIO DEL DASHBOARD
// GET /api/dashboard/stats
//     Cifras clave del flujo SOS-24 con alcance según el rol:
//     la Central ve todo; una institución solo lo suyo.
// ============================================================

const ACTIVE_STATUSES = ["REPORTADA", "EN_ANALISIS", "CLASIFICADA", "ASIGNADA", "EN_ATENCION"];

export const GET = apiRoute(async () => {
  const session = await requireSession();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  // Emergencias: la institución ve los casos donde participa.
  const emergencyWhere: Record<string, unknown> = session.isCentral
    ? { isMainEmergency: true }
    : { isMainEmergency: true, tbemergencyassignments: { some: institutionScope(session) } };

  const [
    activeEmergencies,
    criticalActive,
    reportedToday,
    resolvedTotal,
    pendingAssignments,
    myUnits,
    availableUnits,
    resolvedCases,
  ] = await Promise.all([
    prisma.tbemergencies.count({ where: { ...emergencyWhere, status: { in: ACTIVE_STATUSES } } }),
    prisma.tbemergencies.count({
      where: { ...emergencyWhere, status: { in: ACTIVE_STATUSES }, priority: "CRITICA" },
    }),
    prisma.tbemergencies.count({ where: { ...emergencyWhere, createdAt: { gte: startOfDay } } }),
    prisma.tbemergencies.count({ where: { ...emergencyWhere, status: "RESUELTA" } }),
    prisma.tbemergencyassignments.count({
      where: { ...institutionScope(session), status: "SOLICITADA" },
    }),
    prisma.tbunits.count({ where: { isActive: true, ...institutionScope(session) } }),
    prisma.tbunits.count({
      where: { isActive: true, isAvailable: true, ...institutionScope(session) },
    }),
    prisma.tbemergencies.findMany({
      where: { ...emergencyWhere, status: "RESUELTA", resolvedAt: { not: null } },
      select: { reportedAt: true, resolvedAt: true },
      orderBy: { resolvedAt: "desc" },
      take: 100,
    }),
  ]);

  // Tiempo promedio de respuesta (reporte → resolución).
  let avgResponseMinutes: number | null = null;
  if (resolvedCases.length > 0) {
    const totalMinutes = resolvedCases.reduce((sum, c) => {
      if (!c.resolvedAt) return sum;
      return sum + (new Date(c.resolvedAt).getTime() - new Date(c.reportedAt).getTime()) / 60000;
    }, 0);
    avgResponseMinutes = Math.round(totalMinutes / resolvedCases.length);
  }

  const recentActivity = await prisma.tbemergencystatushistory.findMany({
    where: {
      tbemergencies: session.isCentral ? {} : { tbemergencyassignments: { some: institutionScope(session) } },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { tbemergencies: { select: { emergencyCode: true } } },
  });

  return ok({
    kpis: {
      activeEmergencies,
      criticalActive,
      reportedToday,
      resolvedTotal,
      pendingAssignments,
      unitsAvailable: availableUnits,
      unitsTotal: myUnits,
      avgResponseMinutes,
    },
    recentActivity,
  });
});
