import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import prisma from "@/lib/db/prisma";

type RouteContext = { params: Promise<{ PK_emergency: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const session = await auth();

  const { PK_emergency } = await context.params;
  const emergencyId = Number(PK_emergency);

  if (!Number.isInteger(emergencyId) || emergencyId <= 0) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  // Ver el detalle de un reporte no requiere sesión; solo se necesita para
  // saber si el ciudadano actual ya le dio like (likedByMe).
  const citizenId =
    session?.user && session.user.role === "CITIZEN"
      ? Number(session.user.id)
      : -1;

  const emergency = await prisma.tbemergencies.findFirst({
    where: {
      PK_emergency: emergencyId,
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
      tbcitizens: {
        select: { firstName: true, lastName: true },
      },
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
      tbemergencylikes: {
        where: { FK_citizen: citizenId },
        select: { PK_emergencyLike: true },
        take: 1,
      },
      _count: {
        select: { tbemergencyviews: true, tbemergencylikes: true },
      },
    },
  });

  if (!emergency) {
    return NextResponse.json(
      { error: "Emergencia no encontrada." },
      { status: 404 },
    );
  }

  const { tbemergencylikes, _count, ...rest } = emergency;

  return NextResponse.json({
    emergency: {
      ...rest,
      viewsCount: _count.tbemergencyviews,
      likesCount: _count.tbemergencylikes,
      likedByMe: tbemergencylikes.length > 0,
    },
  });
}
