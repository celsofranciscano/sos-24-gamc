import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import prisma from "@/lib/db/prisma";

type RouteContext = { params: Promise<{ PK_emergency: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const session = await auth();

  if (!session?.user || session.user.role !== "CITIZEN") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { PK_emergency } = await context.params;
  const emergencyId = Number(PK_emergency);

  if (!Number.isInteger(emergencyId) || emergencyId <= 0) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const citizenId = Number(session.user.id);

  const emergency = await prisma.tbemergencies.findFirst({
    where: {
      PK_emergency: emergencyId,
      FK_citizen: citizenId,
    },
    select: {
      PK_emergency: true,
      emergencyCode: true,
      priority: true,
      status: true,
      description: true,
      affectedPersons: true,
      affectedAnimals: true,
      trappedPersons: true,
      missingPersons: true,
      reportedAt: true,
      acceptedAt: true,
      resolvedAt: true,
      createdAt: true,
      tbemergencytypes: {
        select: { name: true, code: true },
      },
      tbemergencylocations: {
        select: { latitude: true, longitude: true, address: true, accuracy: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      tbemergencyassignments: {
        select: {
          PK_assignment: true,
          status: true,
          assignedAt: true,
          acceptedAt: true,
          arrivedAt: true,
          completedAt: true,
          tbinstitutions: { select: { name: true, acronym: true } },
          tbunits: { select: { unitCode: true, unitName: true, status: true } },
        },
      },
      tbemergencystatushistory: {
        select: {
          newStatus: true,
          previousStatus: true,
          changeReason: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!emergency) {
    return NextResponse.json(
      { error: "Emergencia no encontrada." },
      { status: 404 },
    );
  }

  return NextResponse.json({ emergency });
}
