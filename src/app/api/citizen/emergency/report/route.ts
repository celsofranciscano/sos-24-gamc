import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import prisma from "@/lib/db/prisma";

type EmergencyPriority = "BAJA" | "MEDIA" | "ALTA" | "CRITICA";

// Vidas en riesgo inminente: estado de salud crítico, armas, incendio con
// personas atrapadas, etc.
const CRITICAL_PATTERNS = [
  /paro (cardiaco|respiratorio)/,
  /no (respira|responde)/,
  /inconsciente/,
  /convulsion/,
  /hemorragia/,
  /(persona|personas|paciente|pacientes).{0,20}(critic)/,
  /(critic).{0,20}(salud|estado|gravedad)/,
  /arma de fuego/,
  /(disparo|balacera|balead|tiroteo)/,
  /apunalad/,
  /explosion/,
  /incendio.{0,30}(atrapad|no puede salir)/,
  /(muriendo|se muere|esta muriendo)/,
  /riesgo de muerte/,
];

// Daño o peligro real ya presente, pero sin indicar riesgo de muerte inminente.
const HIGH_PATTERNS = [
  /herid[oa]s?/,
  /sangr(e|ando)/,
  /accidente/,
  /incendio|fuego/,
  /choque|volcamiento|atropell/,
  /violencia|agresion|golpe(s|ando)?/,
  /amenaza|\barma\b/,
  /robo/,
  /secuestro/,
  /caida.{0,20}(altura|grave)/,
];

// Molestias o situaciones sin riesgo físico directo.
const LOW_PATTERNS = [
  /ruido/,
  /molestia/,
  /estacionamiento|mal estacionado/,
  /objeto perdido|perdid[oa]/,
  /\bbasura\b/,
  /sospechos[oa]/,
];

function stripAccents(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/**
 * Clasifica la prioridad de una emergencia a partir del texto libre de la
 * descripción, con reglas simples por palabras clave (sin depender de que el
 * reporte venga del asistente de voz o del wizard manual). MEDIA es el
 * resultado por defecto cuando no hay señales claras.
 */
function classifyPriority(description?: string | null): EmergencyPriority {
  if (!description) return "MEDIA";
  const text = stripAccents(description.toLowerCase());

  if (CRITICAL_PATTERNS.some((re) => re.test(text))) return "CRITICA";
  if (HIGH_PATTERNS.some((re) => re.test(text))) return "ALTA";
  if (LOW_PATTERNS.some((re) => re.test(text))) return "BAJA";
  return "MEDIA";
}

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
      priority: classifyPriority(description),
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
