import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import prisma from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user || session.user.role !== "CITIZEN") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const citizenId = Number(session.user.id);
  const body = await request.json();

  const { description, latitude, longitude, address, emergencyTypeName } =
    body;

  if (!latitude || !longitude) {
    return NextResponse.json(
      { error: "Se requiere ubicación (latitude, longitude)." },
      { status: 400 },
    );
  }

  // Generate emergency code
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const count = await prisma.tbemergencies.count();
  const emergencyCode = `EM-${dateStr}-${String(count + 1).padStart(4, "0")}`;

  // Find or create emergency type
  let emergencyTypeId: number | null = null;
  if (emergencyTypeName) {
    const existingType = await prisma.tbemergencytypes.findFirst({
      where: { name: { contains: emergencyTypeName } },
      select: { PK_emergencyType: true },
    });
    emergencyTypeId = existingType?.PK_emergencyType ?? null;
  }

  // Create emergency
  const emergency = await prisma.tbemergencies.create({
    data: {
      FK_citizen: citizenId,
      FK_emergencyType: emergencyTypeId,
      emergencyCode,
      priority: "MEDIA",
      status: "REPORTADA",
      description: description || null,
      reportedAt: now,
    },
    select: {
      PK_emergency: true,
      emergencyCode: true,
      status: true,
      priority: true,
      createdAt: true,
    },
  });

  // Create initial location
  await prisma.tbemergencylocations.create({
    data: {
      FK_emergency: emergency.PK_emergency,
      latitude: Number(latitude),
      longitude: Number(longitude),
      address: address || null,
    },
  });

  // Create initial report
  await prisma.tbemergencyreports.create({
    data: {
      FK_emergency: emergency.PK_emergency,
      FK_citizen: citizenId,
      reportChannel: "APP_CHAT",
      description: description || null,
      latitude: Number(latitude),
      longitude: Number(longitude),
      isLinkedByAI: false,
    },
  });

  // Create status history
  await prisma.tbemergencystatushistory.create({
    data: {
      FK_emergency: emergency.PK_emergency,
      newStatus: "REPORTADA",
      changeReason: "Emergencia reportada por ciudadano",
    },
  });

  // Create emergency room
  const roomCode = `ROOM-${dateStr}-${String(count + 1).padStart(4, "0")}`;
  const room = await prisma.tbemergencyrooms.create({
    data: {
      FK_emergency: emergency.PK_emergency,
      roomCode,
      isOpen: true,
    },
  });

  // Add citizen as room member
  const citizen = await prisma.tbcitizens.findUnique({
    where: { PK_citizen: citizenId },
    select: { firstName: true, lastName: true },
  });

  await prisma.tbemergencyroommembers.create({
    data: {
      FK_room: room.PK_room,
      FK_citizen: citizenId,
      memberRole: "FIRST_REPORTING_CITIZEN",
    },
  });

  // Add citizen welcome message
  await prisma.tbchatmessages.create({
    data: {
      FK_room: room.PK_room,
      FK_citizen: citizenId,
      senderRole: "IA",
      senderName: "SOS-24 IA",
      messageType: "SYSTEM_EVENT",
      message:
        "Emergencia reportada. Un operador de la GAMC será notificado. ¿Puede describir lo que sucede?",
    },
  });

  return NextResponse.json(emergency, { status: 201 });
}
