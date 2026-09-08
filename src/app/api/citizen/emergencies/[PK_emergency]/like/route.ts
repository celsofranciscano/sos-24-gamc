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

  const where = {
    FK_emergency_FK_citizen: {
      FK_emergency: emergencyId,
      FK_citizen: citizenId,
    },
  };

  const existing = await prisma.tbemergencylikes.findUnique({ where });

  let liked: boolean;
  if (existing) {
    await prisma.tbemergencylikes.delete({ where });
    liked = false;
  } else {
    await prisma.tbemergencylikes.create({
      data: { FK_emergency: emergencyId, FK_citizen: citizenId },
    });
    liked = true;
  }

  const likesCount = await prisma.tbemergencylikes.count({
    where: { FK_emergency: emergencyId },
  });

  return NextResponse.json({ liked, likesCount });
}
