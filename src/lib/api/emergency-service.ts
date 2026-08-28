import prisma from "@/lib/db/prisma";
import { ApiError } from "@/lib/api/helpers";
import { publish, topics } from "@/lib/realtime/bus";
import type { DashboardSession } from "@/lib/api/helpers";

// ============================================================
// SERVICIO DE EMERGENCIAS (FLUJO SOS-24)
// Lógica de negocio central reutilizada por todas las rutas:
// códigos únicos, salas de crisis, cambios de estado con historial,
// notificaciones y eventos en tiempo real.
// ============================================================

/** Genera el código visible de la emergencia: SOS-AAAAMMDD-0001 */
export async function generateEmergencyCode(): Promise<string> {
  const now = new Date();
  const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const countToday = await prisma.tbemergencies.count({
    where: { createdAt: { gte: startOfDay } },
  });
  return `SOS-${ymd}-${String(countToday + 1).padStart(4, "0")}`;
}

export async function getEmergencyOrThrow(PK_emergency: number) {
  const emergency = await prisma.tbemergencies.findUnique({
    where: { PK_emergency },
    include: {
      tbcitizens: true,
      tbemergencytypes: true,
      tbemergencyroom: { select: { PK_room: true, roomCode: true, isOpen: true } },
    },
  });
  if (!emergency || !emergency.isMainEmergency) {
    throw new ApiError(404, "La emergencia no existe.");
  }
  return emergency;
}

/** Garantiza que la emergencia tenga su sala de crisis (canal único). */
export async function ensureEmergencyRoom(PK_emergency: number, emergencyCode: string) {
  const existing = await prisma.tbemergencyrooms.findUnique({ where: { FK_emergency: PK_emergency } });
  if (existing) return existing;
  return prisma.tbemergencyrooms.create({
    data: {
      FK_emergency: PK_emergency,
      roomCode: `SALA-${emergencyCode.replace("SOS-", "")}`,
    },
  });
}

/** Mensaje de sistema dentro de la sala (eventos automáticos del flujo). */
export async function addSystemEvent(PK_emergency: number, roomId: number, message: string) {
  await prisma.tbchatmessages.create({
    data: {
      FK_room: roomId,
      senderRole: "SYSTEM",
      senderName: "Sistema",
      messageType: "SYSTEM_EVENT",
      message,
    },
  });
  publish(topics.emergency(PK_emergency), "ROOM_MESSAGE");
}

/**
 * Cambia el estado de la emergencia registrando historial,
 * notificando a la Central y publicando el evento en tiempo real.
 */
export async function changeEmergencyStatus(
  PK_emergency: number,
  newStatus: string,
  session: DashboardSession | null,
  changeReason?: string,
): Promise<void> {
  const emergency = await prisma.tbemergencies.findUnique({
    where: { PK_emergency },
    select: { PK_emergency: true, emergencyCode: true, status: true, FK_citizen: true },
  });
  if (!emergency) throw new ApiError(404, "La emergencia no existe.");
  if (emergency.status === newStatus) return;

  await prisma.$transaction([
    prisma.tbemergencies.update({
      where: { PK_emergency },
      data: {
        status: newStatus,
        ...(newStatus === "RESUELTA" ? { resolvedAt: new Date() } : {}),
        ...(newStatus === "ASIGNADA" ? { acceptedAt: new Date() } : {}),
      },
    }),
    prisma.tbemergencystatushistory.create({
      data: {
        FK_emergency: PK_emergency,
        FK_user: session?.userId ?? null,
        previousStatus: emergency.status,
        newStatus,
        changeReason: changeReason ?? null,
      },
    }),
  ]);

  publish(topics.emergency(PK_emergency), "EMERGENCY_STATUS", {
    emergencyCode: emergency.emergencyCode,
    previousStatus: emergency.status,
    newStatus,
  });
  publish(topics.emergencies, "EMERGENCY_STATUS");

  if (emergency.FK_citizen != null) {
    const labels: Record<string, string> = {
      REPORTADA: "Emergencia registrada",
      EN_ANALISIS: "Emergencia en análisis",
      CLASIFICADA: "Emergencia clasificada",
      ASIGNADA: "Unidad asignada a tu emergencia",
      EN_ATENCION: "Emergencia en atención",
      RESUELTA: "La emergencia ha sido atendida",
      FALSA_ALARMA: "Reporte verificado como falsa alarma",
      CANCELADA: "Emergencia cancelada",
      AGRUPADA_DUPLICADA: "Reporte vinculado a una emergencia existente",
    };
    await prisma.tbnotifications.create({
      data: {
        FK_citizen: emergency.FK_citizen,
        FK_emergency: PK_emergency,
        title: labels[newStatus] ?? "Actualización de emergencia",
        message: `Caso ${emergency.emergencyCode}: ${labels[newStatus] ?? newStatus}`,
        notificationType: "DISPATCH_UPDATE",
      },
    });
  }
}
