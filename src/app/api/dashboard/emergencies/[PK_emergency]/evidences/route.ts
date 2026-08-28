import { z } from "zod";
import { apiRoute, ok, parseBody, requireSession } from "@/lib/api/helpers";
import prisma from "@/lib/db/prisma";
import { publish, topics } from "@/lib/realtime/bus";
import { getEmergencyOrThrow } from "@/lib/api/emergency-service";
import { nullableId, optionalText, requiredId } from "@/lib/api/schemas";

// ============================================================
// API: EVIDENCIAS MULTIMEDIA DEL CASO (metadatos)
// GET  /api/dashboard/emergencies/[PK_emergency]/evidences
// POST /api/dashboard/emergencies/[PK_emergency]/evidences
// ============================================================

export const GET = apiRoute(async (_req, ctx) => {
  const params = await ctx.params;
  await requireSession();
  return ok(
    await prisma.tbevidences.findMany({
      where: { FK_emergency: Number(params.PK_emergency) },
      orderBy: { createdAt: "desc" },
    }),
  );
});

const createSchema = z.object({
  fileType: z.enum(["AUDIO", "IMAGE", "VIDEO"]),
  fileUrl: requiredId.or(z.string().min(1)).describe("URL o ruta del archivo"),
  description: optionalText,
  FK_citizen: nullableId,
});

export const POST = apiRoute(async (req, ctx) => {
  const params = await ctx.params;
  const id = Number(params.PK_emergency);
  const session = await requireSession();
  await getEmergencyOrThrow(id);
  const body = await parseBody(req, createSchema);

  const evidence = await prisma.tbevidences.create({
    data: {
      FK_emergency: id,
      fileType: body.fileType,
      fileUrl: String(body.fileUrl),
      description: body.description ?? null,
      FK_user: session.userId,
      ...(body.FK_citizen != null ? { FK_citizen: body.FK_citizen } : {}),
    },
  });

  publish(topics.emergency(id), "EVIDENCE_ADDED", { by: session.name });
  return ok(evidence, 201);
});
