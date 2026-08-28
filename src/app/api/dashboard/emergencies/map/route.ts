import { apiRoute, ok, requireSession } from "@/lib/api/helpers";
import prisma from "@/lib/db/prisma";

// ============================================================
// API: DATOS PARA EL MAPA OPERATIVO
// GET /api/dashboard/emergencies/map
//     Emergencias activas con su última ubicación registrada.
// ============================================================

const ACTIVE_STATUSES = ["REPORTADA", "EN_ANALISIS", "CLASIFICADA", "ASIGNADA", "EN_ATENCION"];

export const GET = apiRoute(async () => {
  await requireSession();

  const emergencies = await prisma.tbemergencies.findMany({
    where: {
      isMainEmergency: true,
      status: { in: ACTIVE_STATUSES },
    },
    select: {
      PK_emergency: true,
      emergencyCode: true,
      priority: true,
      status: true,
      description: true,
      tbemergencylocations: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { latitude: true, longitude: true, address: true },
      },
      tbemergencyassignments: {
        where: { status: { in: ["SOLICITADA", "ACEPTADA", "EN_CAMINO", "EN_SITIO"] } },
        include: { tbunits: { select: { unitCode: true } } },
      },
    },
    orderBy: { reportedAt: "desc" },
    take: 100,
  });

  return ok({
    items: emergencies.map((emergency) => ({
      PK_emergency: emergency.PK_emergency,
      emergencyCode: emergency.emergencyCode,
      priority: emergency.priority,
      status: emergency.status,
      description: emergency.description,
      latitude: emergency.tbemergencylocations[0]?.latitude ?? null,
      longitude: emergency.tbemergencylocations[0]?.longitude ?? null,
      address: emergency.tbemergencylocations[0]?.address ?? null,
      activeAssignments: emergency.tbemergencyassignments.length,
    })),
  });
});
