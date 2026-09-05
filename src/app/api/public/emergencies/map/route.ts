import { NextResponse } from "next/server";

import prisma from "@/lib/db/prisma";

// ============================================================
// API PÚBLICA: EMERGENCIAS PARA EL MAPA CIUDADANO
// GET /api/public/emergencies/map
//     Sin autenticación — pensado para el mapa de la app móvil
//     antes de iniciar sesión. Devuelve TODAS las emergencias de
//     TODOS los ciudadanos (no solo las recientes: la moderación
//     de qué se retira de circulación ya la hace la Central GAMC
//     desde el dashboard, marcando el caso CANCELADA o
//     FALSA_ALARMA — ese estado es lo que este endpoint respeta,
//     no una expiración por fecha). Con la misma forma que
//     GET /api/citizen/emergencies, pero sin ningún dato personal
//     del reportante (ni nombre, ni teléfono, ni asignaciones
//     operativas) — solo lo necesario para pintar el pin en el mapa.
// ============================================================

const HIDDEN_STATUSES = ["CANCELADA", "FALSA_ALARMA"];
const MAX_ITEMS = 500;

export async function GET() {
  const emergencies = await prisma.tbemergencies.findMany({
    where: {
      isMainEmergency: true,
      status: { notIn: HIDDEN_STATUSES },
    },
    select: {
      PK_emergency: true,
      emergencyCode: true,
      priority: true,
      status: true,
      description: true,
      reportedAt: true,
      createdAt: true,
      updatedAt: true,
      resolvedAt: true,
      tbemergencytypes: {
        select: { name: true, code: true },
      },
      tbemergencylocations: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { latitude: true, longitude: true, address: true },
      },
    },
    orderBy: { reportedAt: "desc" },
    take: MAX_ITEMS,
  });

  return NextResponse.json({
    emergencies: emergencies.map((emergency) => ({
      PK_emergency: emergency.PK_emergency,
      emergencyCode: emergency.emergencyCode,
      priority: emergency.priority,
      status: emergency.status,
      description: emergency.description,
      reportedAt: emergency.reportedAt,
      createdAt: emergency.createdAt,
      updatedAt: emergency.updatedAt,
      resolvedAt: emergency.resolvedAt,
      tbemergencytypes: emergency.tbemergencytypes,
      tbemergencylocations: emergency.tbemergencylocations,
      tbemergencyassignments: [],
    })),
  });
}
