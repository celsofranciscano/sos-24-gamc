import { z } from "zod";
import { apiRoute, ok, parseBody, requireSession } from "@/lib/api/helpers";
import prisma from "@/lib/db/prisma";
import { publish, topics } from "@/lib/realtime/bus";
import { getEmergencyOrThrow } from "@/lib/api/emergency-service";
import { nullableFloat, optionalText, nullableId } from "@/lib/api/schemas";

// ============================================================
// API: REPORTES CIUDADANOS VINCULADOS AL CASO
// GET  /api/dashboard/emergencies/[PK_emergency]/reports
// POST /api/dashboard/emergencies/[PK_emergency]/reports
//      Vincula un nuevo reporte al caso (deduplicación SOS-24):
//      incrementa reportCount y registra confianza/distancia de IA.
// ============================================================

export const GET = apiRoute(async (_req, ctx) => {
  const params = await ctx.params;
  await requireSession();
  return ok(
    await prisma.tbemergencyreports.findMany({
      where: { FK_emergency: Number(params.PK_emergency) },
      orderBy: { reportedAt: "asc" },
      include: { tbcitizens: { select: { firstName: true, lastName: true, phoneNumber: true } } },
    }),
  );
});

const createSchema = z.object({
  FK_citizen: nullableId,
  reportChannel: z.enum(["APP_CALL", "APP_CHAT", "MANUAL_OPERATOR"]),
  description: optionalText,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  isLinkedByAI: z.boolean().optional(),
  linkingConfidence: nullableFloat,
  distanceMetersFromMain: nullableFloat,
});

export const POST = apiRoute(async (req, ctx) => {
  const params = await ctx.params;
  const id = Number(params.PK_emergency);
  const session = await requireSession();
  const emergency = await getEmergencyOrThrow(id);
  const body = await parseBody(req, createSchema);

  const [report] = await prisma.$transaction([
    prisma.tbemergencyreports.create({ data: { FK_emergency: id, ...body } }),
    prisma.tbemergencies.update({
      where: { PK_emergency: id },
      data: { reportCount: { increment: 1 } },
    }),
  ]);

  publish(topics.emergency(id), "REPORT_ADDED", {
    emergencyCode: emergency.emergencyCode,
    by: session.name,
  });
  return ok(report, 201);
});
