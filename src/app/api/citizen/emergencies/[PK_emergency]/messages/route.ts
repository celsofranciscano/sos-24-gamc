import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import prisma from "@/lib/db/prisma";

type RouteContext = { params: Promise<{ PK_emergency: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  // Ver los comentarios de un reporte no requiere sesión; solo publicar uno
  // (POST, abajo) exige estar autenticado como ciudadano.
  const { PK_emergency } = await context.params;
  const emergencyId = Number(PK_emergency);

  const room = await prisma.tbemergencyrooms.findUnique({
    where: { FK_emergency: emergencyId },
    select: { PK_room: true },
  });

  if (!room) {
    return NextResponse.json({ messages: [] });
  }

  const messages = await prisma.tbchatmessages.findMany({
    where: { FK_room: room.PK_room },
    select: {
      PK_chatMessage: true,
      senderRole: true,
      senderName: true,
      messageType: true,
      message: true,
      fileUrl: true,
      createdAt: true,
      FK_citizen: true,
    },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  return NextResponse.json({ messages, roomId: room.PK_room });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const session = await auth();

  if (!session?.user || session.user.role !== "CITIZEN") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { PK_emergency } = await context.params;
  const emergencyId = Number(PK_emergency);
  const citizenId = Number(session.user.id);

  const room = await prisma.tbemergencyrooms.findUnique({
    where: { FK_emergency: emergencyId },
    select: { PK_room: true },
  });

  if (!room) {
    return NextResponse.json(
      { error: "Sala de emergencia no encontrada." },
      { status: 404 },
    );
  }

  const body = await request.json();
  const { message, messageType, fileUrl } = body;

  if (!message && !fileUrl) {
    return NextResponse.json(
      { error: "Se requiere message o fileUrl." },
      { status: 400 },
    );
  }

  const citizen = await prisma.tbcitizens.findUnique({
    where: { PK_citizen: citizenId },
    select: { firstName: true, lastName: true },
  });

  const chatMessage = await prisma.tbchatmessages.create({
    data: {
      FK_room: room.PK_room,
      FK_citizen: citizenId,
      senderRole: "CITIZEN",
      senderName: citizen
        ? `${citizen.firstName} ${citizen.lastName}`
        : "Ciudadano",
      messageType: messageType || "TEXT",
      message: message || null,
      fileUrl: fileUrl || null,
    },
    select: {
      PK_chatMessage: true,
      senderRole: true,
      senderName: true,
      messageType: true,
      message: true,
      fileUrl: true,
      createdAt: true,
    },
  });

  return NextResponse.json(chatMessage, { status: 201 });
}
