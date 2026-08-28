import { z } from "zod";
import {
  ApiError,
  apiRoute,
  ok,
  parseBody,
  requireSession,
} from "@/lib/api/helpers";
import prisma from "@/lib/db/prisma";
import { publish, topics } from "@/lib/realtime/bus";
import { addSystemEvent, ensureEmergencyRoom, getEmergencyOrThrow } from "@/lib/api/emergency-service";
import { nullableFloat, nullableId, optionalText, requiredId } from "@/lib/api/schemas";

// ============================================================
// API: DESTINOS DE LA EMERGENCIA (hospitales, refugios...)
// GET  /api/dashboard/emergencies/[PK_emergency]/destinations
// POST /api/dashboard/emergencies/[PK_emergency]/destinations
// PATCH /api/dashboard/emergencies/[PK_emergency]/destinations
//       Marca la llegada: { PK_destination }
// ============================================================

export const GET = apiRoute(async (_req, ctx) => {
  const params = await ctx.params;
  await requireSession();
  return ok(
    await prisma.tbemergencydestinations.findMany({
      where: { FK_emergency: Number(params.PK_emergency) },
      include: { tbinstitutions: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  );
});

const createSchema = z.object({
  destinationName: requiredId.or(z.string().trim().min(1)),
  FK_institution: nullableId,
  latitude: nullableFloat,
  longitude: nullableFloat,
  arrivalEta: z.coerce.date().nullable().optional(),
});

export const POST = apiRoute(async (req, ctx) => {
  const params = await ctx.params;
  const id = Number(params.PK_emergency);
  const session = await requireSession();
  const emergency = await getEmergencyOrThrow(id);
  const body = await parseBody(req, createSchema);

  const destination = await prisma.tbemergencydestinations.create({
    data: {
      FK_emergency: id,
      destinationName: String(body.destinationName),
      FK_institution: body.FK_institution ?? null,
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
      arrivalEta: body.arrivalEta ?? null,
    },
  });

  const room = await ensureEmergencyRoom(id, emergency.emergencyCode);
  await addSystemEvent(
    id,
    room.PK_room,
    `Destino registrado: ${destination.destinationName}${body.arrivalEta ? ` (ETA ${new Date(body.arrivalEta).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" })})` : ""}.`,
  );
  publish(topics.emergency(id), "DESTINATION_ADDED", { by: session.name });
  return ok(destination, 201);
});

const patchSchema = z.object({ PK_destination: requiredId });

export const PATCH = apiRoute(async (req, ctx) => {
  const params = await ctx.params;
  const id = Number(params.PK_emergency);
  await requireSession();
  await getEmergencyOrThrow(id);
  const body = await parseBody(req, patchSchema);

  const existing = await prisma.tbemergencydestinations.findFirst({
    where: { PK_destination: body.PK_destination, FK_emergency: id },
  });
  if (!existing) throw new ApiError(404, "El destino no existe.");

  return ok(await prisma.tbemergencydestinations.update({
    where: { PK_destination: existing.PK_destination },
    data: { arrivedAt: new Date() },
  }));
});
