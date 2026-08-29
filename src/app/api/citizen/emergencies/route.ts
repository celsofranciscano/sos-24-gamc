import { NextResponse } from "next/server";

import { auth } from "@/auth";
import prisma from "@/lib/db/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user || session.user.role !== "CITIZEN") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const citizenId = Number(session.user.id);

  const emergencies = await prisma.tbemergencies.findMany({
    where: { FK_citizen: citizenId },
    select: {
      PK_emergency: true,
      emergencyCode: true,
      priority: true,
      status: true,
      description: true,
      reportedAt: true,
      createdAt: true,
      tbemergencytypes: {
        select: { name: true, code: true },
      },
      tbemergencyassignments: {
        select: {
          status: true,
          tbinstitutions: { select: { name: true } },
          tbunits: { select: { unitCode: true, unitName: true } },
        },
        take: 1,
      },
    },
    orderBy: { reportedAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ emergencies });
}
