import { z } from "zod";
import { ApiError, apiRoute, ok, parseBody, requireSession } from "@/lib/api/helpers";
import prisma from "@/lib/db/prisma";
import { getEmergencyOrThrow } from "@/lib/api/emergency-service";

// ============================================================
// API: LLAMADAS ASOCIADAS A LA EMERGENCIA
// GET   /api/dashboard/emergencies/[PK_emergency]/calls
// POST  /api/dashboard/emergencies/[PK_emergency]/calls → registra llamada
// PATCH /api/dashboard/emergencies/[PK_emergency]/calls → finaliza llamada { PK_call }
// ============================================================

export const GET = apiRoute(async (_req, ctx) => {
  const params = await ctx.params;
  await requireSession();
  return ok(
    await prisma.tbcalls.findMany({
      where: { FK_emergency: Number(params.PK_emergency) },
      orderBy: { startedAt: "desc" },
    }),
  );
});

const createSchema = z.object({
  callType: z.enum(["ENTRANTE_IA", "OPERADOR", "SALIENTE"]),
  transcription: z.string().trim().optional(),
});

export const POST = apiRoute(async (req, ctx) => {
  const params = await ctx.params;
  const id = Number(params.PK_emergency);
  await requireSession();
  await getEmergencyOrThrow(id);
  const body = await parseBody(req, createSchema);

  const call = await prisma.tbcalls.create({
    data: {
      FK_emergency: id,
      callType: body.callType,
      status: "EN_PROCESO",
      answeredAt: new Date(),
      ...(body.transcription ? { transcription: body.transcription } : {}),
    },
  });
  return ok(call, 201);
});

const patchSchema = z.object({ PK_call: z.coerce.number().int() });

export const PATCH = apiRoute(async (req, ctx) => {
  const params = await ctx.params;
  const id = Number(params.PK_emergency);
  await requireSession();
  await getEmergencyOrThrow(id);
  const body = await parseBody(req, patchSchema);

  const call = await prisma.tbcalls.findFirst({
    where: { PK_call: body.PK_call, FK_emergency: id },
  });
  if (!call) throw new ApiError(404, "La llamada no existe.");

  const endedAt = new Date();
  return ok(
    await prisma.tbcalls.update({
      where: { PK_call: call.PK_call },
      data: {
        status: "FINALIZADA",
        endedAt,
        durationSeconds: Math.round((endedAt.getTime() - call.startedAt.getTime()) / 1000),
      },
    }),
  );
});
