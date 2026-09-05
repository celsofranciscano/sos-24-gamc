import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import prisma from "@/lib/db/prisma";

type RouteContext = { params: Promise<{ PK_emergency: string }> };

export async function POST(_request: NextRequest, context: RouteContext) {
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

  const emergency = await prisma.tbemergencies.findUnique({
    where: { PK_emergency: emergencyId },
    select: { PK_emergency: true },
  });

  if (!emergency) {
    return NextResponse.json(
      { error: "Emergencia no encontrada." },
      { status: 404 },
    );
  }

  // Upsert: si el ciudadano ya visualizó esta emergencia, la restricción
  // @@unique([FK_emergency, FK_citizen]) evita que se cuente de nuevo.
  await prisma.tbemergencyviews.upsert({
    where: {
      FK_emergency_FK_citizen: {
        FK_emergency: emergencyId,
        FK_citizen: citizenId,
      },
    },
    update: {},
    create: {
      FK_emergency: emergencyId,
      FK_citizen: citizenId,
    },
  });

  const viewsCount = await prisma.tbemergencyviews.count({
    where: { FK_emergency: emergencyId },
  });

  return NextResponse.json({ viewsCount });
}
