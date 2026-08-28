import { z } from "zod";
import { ApiError, apiRoute, ok, parseBody, requireSession } from "@/lib/api/helpers";
import prisma from "@/lib/db/prisma";
import { publish, topics } from "@/lib/realtime/bus";
import { getAssignmentOrThrow } from "@/lib/api/dispatch-service";

// ============================================================
// API: RASTREO GPS DE UNA ASIGNACIÓN
// GET  /api/dashboard/dispatch/[PK_assignment]/tracking
//      Devuelve la ruta recorrida (ordenada) y el último punto.
// POST /api/dashboard/dispatch/[PK_assignment]/tracking
//      Registra un ping GPS de la unidad asignada.
// ============================================================

export const GET = apiRoute(async (_req, ctx) => {
  const params = await ctx.params;
  await requireSession();
  const points = await prisma.tbassignmenttracking.findMany({
    where: { FK_assignment: Number(params.PK_assignment) },
    orderBy: { createdAt: "asc" },
  });
  return ok({
    points,
    current: points.at(-1) ?? null,
    totalPoints: points.length,
  });
});

const pingSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  speed: z.number().min(0).optional(),
  heading: z.number().min(0).max(360).optional(),
});

export const POST = apiRoute(async (req, ctx) => {
  const params = await ctx.params;
  const session = await requireSession();
  const assignment = await getAssignmentOrThrow(Number(params.PK_assignment));

  if (!session.isCentral && assignment.FK_institution !== session.institutionId) {
    throw new ApiError(403, "No tiene acceso a esta asignación.");
  }
  if (!assignment.FK_unit) throw new ApiError(400, "La asignación no tiene unidad asignada.");
  if (!["EN_CAMINO"].includes(assignment.status)) {
    throw new ApiError(400, `Solo se rastrea en estado EN_CAMINO (actual: ${assignment.status}).`);
  }

  const body = await parseBody(req, pingSchema);

  const [ping] = await prisma.$transaction([
    prisma.tbassignmenttracking.create({
      data: {
        FK_assignment: assignment.PK_assignment,
        FK_unit: assignment.FK_unit,
        ...body,
      },
    }),
    // El historial general de la unidad también registra la posición.
    prisma.tbunitlocations.create({
      data: {
        FK_unit: assignment.FK_unit,
        latitude: body.latitude,
        longitude: body.longitude,
        speed: body.speed ?? null,
        heading: body.heading ?? null,
      },
    }),
  ]);

  publish(topics.assignment(assignment.PK_assignment), "UNIT_POSITION", {
    unitCode: assignment.tbunits?.unitCode,
    emergencyCode: assignment.tbemergencies.emergencyCode,
  });
  publish(topics.unit(assignment.FK_unit), "UNIT_POSITION");

  return ok(ping, 201);
});
