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

  const evidences = await prisma.tbevidences.findMany({
    where: { FK_emergency: emergencyId },
    select: {
      PK_evidence: true,
      fileType: true,
      fileUrl: true,
      description: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ evidences });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const session = await auth();

  if (!session?.user || session.user.role !== "CITIZEN") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { PK_emergency } = await context.params;
  const emergencyId = Number(PK_emergency);
  const citizenId = Number(session.user.id);

  const body = await request.json();
  const { fileType, fileUrl, description } = body;

  if (!fileType || !fileUrl) {
    return NextResponse.json(
      { error: "fileType y fileUrl son obligatorios." },
      { status: 400 },
    );
  }

  const evidence = await prisma.tbevidences.create({
    data: {
      FK_emergency: emergencyId,
      FK_citizen: citizenId,
      fileType,
      fileUrl,
      description: description || null,
    },
    select: {
      PK_evidence: true,
      fileType: true,
      fileUrl: true,
      description: true,
      createdAt: true,
    },
  });

  return NextResponse.json(evidence, { status: 201 });
}
