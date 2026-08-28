import { z } from "zod";
import {
  ApiError,
  apiRoute,
  ok,
  parseBody,
  requireCentral,
  requireSession,
} from "@/lib/api/helpers";
import prisma from "@/lib/db/prisma";
import { publish, topics } from "@/lib/realtime/bus";
import { addSystemEvent, ensureEmergencyRoom, getEmergencyOrThrow } from "@/lib/api/emergency-service";
import { requiredId } from "@/lib/api/schemas";

// ============================================================
// API: REQUERIMIENTOS DE RECURSOS DE LA EMERGENCIA
// GET   /api/dashboard/emergencies/[PK_emergency]/requirements
// POST  /api/dashboard/emergencies/[PK_emergency]/requirements
//       (Central) Registra qué recursos necesita el caso.
// PATCH /api/dashboard/emergencies/[PK_emergency]/requirements
//       Actualiza estado de un requerimiento: { PK_requirement, status }
// ============================================================

export const GET = apiRoute(async (_req, ctx) => {
  const params = await ctx.params;
  await requireSession();
  return ok(
    await prisma.tbemergencyrequirements.findMany({
      where: { FK_emergency: Number(params.PK_emergency) },
      include: { tbresourcetypes: { select: { name: true, code: true } } },
      orderBy: { createdAt: "asc" },
    }),
  );
});

const createSchema = z.object({
  FK_resourceType: requiredId,
  quantity: z.coerce.number().int().min(1).default(1),
});

export const POST = apiRoute(async (req, ctx) => {
  const params = await ctx.params;
  const id = Number(params.PK_emergency);
  const session = await requireCentral();
  const emergency = await getEmergencyOrThrow(id);
  const body = await parseBody(req, createSchema);

  const resourceType = await prisma.tbresourcetypes.findUnique({
    where: { PK_resourceType: body.FK_resourceType },
  });
  if (!resourceType) throw new ApiError(404, "El tipo de recurso no existe.");

  const requirement = await prisma.tbemergencyrequirements.create({
    data: { FK_emergency: id, ...body },
    include: { tbresourcetypes: { select: { name: true } } },
  });

  const room = await ensureEmergencyRoom(id, emergency.emergencyCode);
  await addSystemEvent(
    id,
    room.PK_room,
    `La Central requiere ${body.quantity} × ${resourceType.name}.`,
  );
  publish(topics.emergency(id), "REQUIREMENT_ADDED", { by: session.name });
  return ok(requirement, 201);
});

const patchSchema = z.object({
  PK_requirement: requiredId,
  status: z.enum(["PENDIENTE", "ASIGNADO", "ATENDIDO"]),
});

export const PATCH = apiRoute(async (req, ctx) => {
  const params = await ctx.params;
  const id = Number(params.PK_emergency);
  await requireCentral();
  await getEmergencyOrThrow(id);
  const body = await parseBody(req, patchSchema);

  const requirement = await prisma.tbemergencyrequirements.findFirst({
    where: { PK_requirement: body.PK_requirement, FK_emergency: id },
  });
  if (!requirement) throw new ApiError(404, "El requerimiento no existe.");

  return ok(
    await prisma.tbemergencyrequirements.update({
      where: { PK_requirement: requirement.PK_requirement },
      data: { status: body.status },
    }),
  );
});
