import { z } from "zod";
import { ApiError, apiRoute, ok, parseBody, requireSession } from "@/lib/api/helpers";
import prisma from "@/lib/db/prisma";
import { publish, topics } from "@/lib/realtime/bus";
import { getEmergencyOrThrow } from "@/lib/api/emergency-service";

// ============================================================
// API: MENSAJES DEL CANAL ÚNICO (CHAT DE LA EMERGENCIA)
// GET  /api/dashboard/emergencies/[PK_emergency]/messages
// POST /api/dashboard/emergencies/[PK_emergency]/messages
//      Texto y alertas críticas; también ubicación como mensaje.
// ============================================================

export const GET = apiRoute(async (_req, ctx) => {
  const params = await ctx.params;
  await requireSession();
  const emergency = await getEmergencyOrThrow(Number(params.PK_emergency));

  const room = await prisma.tbemergencyrooms.findUnique({
    where: { FK_emergency: emergency.PK_emergency },
  });
  if (!room) throw new ApiError(404, "La emergencia no tiene sala abierta.");

  return ok(
    await prisma.tbchatmessages.findMany({
      where: { FK_room: room.PK_room },
      orderBy: { createdAt: "asc" },
    }),
  );
});

const createSchema = z.object({
  message: z.string().trim().min(1, "El mensaje no puede estar vacío").max(2000),
  messageType: z.enum(["TEXT", "LOCATION", "CRITICAL_ALERT"]).default("TEXT"),
});

export const POST = apiRoute(async (req, ctx) => {
  const params = await ctx.params;
  const id = Number(params.PK_emergency);
  const session = await requireSession();
  const emergency = await getEmergencyOrThrow(id);
  const body = await parseBody(req, createSchema);

  const room = await prisma.tbemergencyrooms.findUnique({
    where: { FK_emergency: emergency.PK_emergency },
  });
  if (!room) throw new ApiError(404, "La emergencia no tiene sala abierta.");

  const message = await prisma.tbchatmessages.create({
    data: {
      FK_room: room.PK_room,
      FK_user: session.userId,
      FK_institution: session.institutionId ?? undefined,
      senderRole: session.isCentral ? "CENTRAL_GAMC" : "INSTITUTION_DISPATCHER",
      senderName: session.name,
      messageType: body.messageType,
      message: body.message,
    },
  });

  publish(topics.emergency(id), "ROOM_MESSAGE", { by: session.name });
  return ok(message, 201);
});
