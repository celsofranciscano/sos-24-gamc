import { z } from "zod";
import {
  ApiError,
  apiRoute,
  institutionScope,
  notify,
  ok,
  parseBody,
  requireCentral,
  requireSession,
} from "@/lib/api/helpers";
import prisma from "@/lib/db/prisma";
import { publish, topics } from "@/lib/realtime/bus";
import {
  addSystemEvent,
  changeEmergencyStatus,
  ensureEmergencyRoom,
  getEmergencyOrThrow,
} from "@/lib/api/emergency-service";
import { nullableId, requiredId } from "@/lib/api/schemas";

// ============================================================
// API: ASIGNACIONES (DESPACHO) DE UNA EMERGENCIA
// GET  /api/dashboard/emergencies/[PK_emergency]/assignments
//      La Central ve todas; una institución solo las suyas.
// POST /api/dashboard/emergencies/[PK_emergency]/assignments (Central)
//      Solicita intervención: crea SOLICITADA y notifica a la institución.
// ============================================================

export const GET = apiRoute(async (_req, ctx) => {
  const params = await ctx.params;
  const session = await requireSession();
  return ok(
    await prisma.tbemergencyassignments.findMany({
      where: {
        FK_emergency: Number(params.PK_emergency),
        ...(session.isCentral ? {} : institutionScope(session)),
      },
      orderBy: { assignedAt: "desc" },
      include: {
        tbinstitutions: { select: { name: true, acronym: true } },
        tbsubinstitutions: { select: { name: true } },
        tbunits: { select: { PK_unit: true, unitCode: true, unitName: true } },
        _count: { select: { tbassignmenttracking: true } },
      },
    }),
  );
});

const createSchema = z.object({
  FK_institution: requiredId,
  FK_subinstitution: nullableId,
  FK_unit: nullableId,
});

export const POST = apiRoute(async (req, ctx) => {
  const params = await ctx.params;
  const id = Number(params.PK_emergency);
  const session = await requireCentral();
  const emergency = await getEmergencyOrThrow(id);
  const body = await parseBody(req, createSchema);

  const institution = await prisma.tbinstitutions.findUnique({
    where: { PK_institution: body.FK_institution },
  });
  if (!institution) throw new ApiError(404, "La institución no existe.");

  let unitLabel = "";
  if (body.FK_unit != null) {
    const unit = await prisma.tbunits.findUnique({ where: { PK_unit: body.FK_unit } });
    if (!unit || unit.FK_institution !== body.FK_institution) {
      throw new ApiError(400, "La unidad no pertenece a la institución indicada.");
    }
    if (!unit.isActive) throw new ApiError(400, "La unidad está fuera del sistema.");
    unitLabel = unit.unitCode;
  }

  const assignment = await prisma.tbemergencyassignments.create({
    data: {
      FK_emergency: id,
      FK_institution: body.FK_institution,
      FK_subinstitution: body.FK_subinstitution ?? null,
      FK_unit: body.FK_unit ?? null,
      status: "SOLICITADA",
    },
    include: {
      tbinstitutions: { select: { name: true, acronym: true } },
      tbunits: { select: { unitCode: true, unitName: true } },
    },
  });

  // El caso pasa a ASIGNADA si aún no lo estaba.
  await changeEmergencyStatus(id, "ASIGNADA", session, `Solicitud a ${institution.name}`);

  // Evento en la sala común + notificación a los operadores de la institución.
  const room = await ensureEmergencyRoom(id, emergency.emergencyCode);
  await addSystemEvent(
    id,
    room.PK_room,
    `Central solicita intervención de ${unitLabel || institution.name}.`,
  );
  await notify({
    title: "Nueva solicitud de despacho",
    message: `${emergency.emergencyCode}: se solicita intervención de ${unitLabel || institution.name}.`,
    notificationType: "DISPATCH_UPDATE",
    emergencyId: id,
    privilegeCodes: ["INSTITUTION_ADMIN", "INSTITUTION_DISPATCHER"],
    institutionId: body.FK_institution,
  });

  publish(topics.assignment(assignment.PK_assignment), "ASSIGNMENT_CREATED", {
    emergencyCode: emergency.emergencyCode,
    institution: institution.acronym ?? institution.name,
  });
  publish(topics.emergency(id), "ASSIGNMENT_CREATED");

  return ok(assignment, 201);
});
