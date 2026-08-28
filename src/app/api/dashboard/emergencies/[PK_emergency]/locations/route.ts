import { z } from "zod";
import { apiRoute, ok, parseBody, requireSession } from "@/lib/api/helpers";
import prisma from "@/lib/db/prisma";
import { publish, topics } from "@/lib/realtime/bus";
import { getEmergencyOrThrow } from "@/lib/api/emergency-service";
import { nullableFloat, optionalText } from "@/lib/api/schemas";

// ============================================================
// API: UBICACIONES DEL INCIDENTE
// GET  /api/dashboard/emergencies/[PK_emergency]/locations
// POST /api/dashboard/emergencies/[PK_emergency]/locations
// ============================================================

export const GET = apiRoute(async (_req, ctx) => {
  const params = await ctx.params;
  await requireSession();
  return ok(
    await prisma.tbemergencylocations.findMany({
      where: { FK_emergency: Number(params.PK_emergency) },
      orderBy: { createdAt: "asc" },
    }),
  );
});

const createSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: nullableFloat,
  address: optionalText,
});

export const POST = apiRoute(async (req, ctx) => {
  const params = await ctx.params;
  const id = Number(params.PK_emergency);
  await requireSession();
  await getEmergencyOrThrow(id);
  const body = await parseBody(req, createSchema);

  const location = await prisma.tbemergencylocations.create({
    data: { FK_emergency: id, ...body },
  });
  publish(topics.emergency(id), "LOCATION_ADDED");
  return ok(location, 201);
});
