import { z } from "zod";
import {
  ApiError,
  apiRoute,
  assertInstitutionAccess,
  ok,
  parseBody,
  requireCentral,
  requireSession,
} from "@/lib/api/helpers";
import prisma from "@/lib/db/prisma";
import { changeEmergencyStatus } from "@/lib/api/emergency-service";
import { EMERGENCY_PRIORITIES, nullableFloat, nullableId, optionalText } from "@/lib/api/schemas";

// ============================================================
// API: EXPEDIENTE COMPLETO DE UNA EMERGENCIA
// GET   /api/dashboard/emergencies/[PK_emergency]
//       Devuelve el caso con TODAS sus relaciones (expediente).
// PATCH /api/dashboard/emergencies/[PK_emergency]   (Central)
//       Clasificación: tipo, prioridad, descripción, personas y estado.
// ============================================================

export const GET = apiRoute(async (_req, ctx) => {
  const params = await ctx.params;
  const id = Number(params.PK_emergency);
  await requireSession();

  const emergency = await prisma.tbemergencies.findUnique({
    where: { PK_emergency: id },
    include: {
      tbcitizens: true,
      tbemergencytypes: true,
      parentEmergency: { select: { PK_emergency: true, emergencyCode: true } },
      childEmergencies: { select: { PK_emergency: true, emergencyCode: true } },
      tbemergencyreports: {
        orderBy: { reportedAt: "asc" },
        include: { tbcitizens: { select: { firstName: true, lastName: true, phoneNumber: true } } },
      },
      tbemergencylocations: { orderBy: { createdAt: "asc" } },
      tbcalls: { orderBy: { startedAt: "desc" } },
      tbemergencyroom: {
        include: {
          tbroommembers: {
            where: { isActive: true },
            include: {
              tbcitizens: { select: { firstName: true, lastName: true } },
              tbusers: { select: { firstName: true, lastName: true } },
              tbinstitutions: { select: { name: true, acronym: true } },
              tbunits: { select: { unitCode: true } },
            },
          },
        },
      },
      tbevidences: { orderBy: { createdAt: "desc" } },
      tbaianalyses: { orderBy: { createdAt: "desc" } },
      tbemergencyrequirements: {
        include: { tbresourcetypes: { select: { name: true, code: true } } },
        orderBy: { createdAt: "asc" },
      },
      tbemergencyassignments: {
        orderBy: { assignedAt: "desc" },
        include: {
          tbinstitutions: { select: { PK_institution: true, name: true, acronym: true } },
          tbsubinstitutions: { select: { name: true } },
          tbunits: { select: { PK_unit: true, unitCode: true, unitName: true } },
          _count: { select: { tbassignmenttracking: true } },
        },
      },
      tbemergencystatushistory: {
        orderBy: { createdAt: "asc" },
        include: { tbusers: { select: { firstName: true, lastName: true } } },
      },
      tbemergencyprogressreports: {
        orderBy: { createdAt: "desc" },
        include: {
          tbinstitutions: { select: { acronym: true, name: true } },
          tbusers: { select: { firstName: true, lastName: true } },
        },
      },
      tbemergencydestinations: { include: { tbinstitutions: { select: { name: true } } } },
      tbaisessions: { orderBy: { startedAt: "desc" } },
    },
  });

  if (!emergency || !emergency.isMainEmergency) throw new ApiError(404, "La emergencia no existe.");
  return ok(emergency);
});

const patchSchema = z.object({
  FK_emergencyType: nullableId,
  priority: z.enum(EMERGENCY_PRIORITIES).optional(),
  description: optionalText,
  affectedPersons: nullableId,
  affectedAnimals: nullableId,
  trappedPersons: nullableId,
  missingPersons: nullableId,
  status: z
    .enum([
      "REPORTADA",
      "EN_ANALISIS",
      "CLASIFICADA",
      "ASIGNADA",
      "EN_ATENCION",
      "RESUELTA",
      "FALSA_ALARMA",
      "CANCELADA",
    ])
    .optional(),
  statusReason: optionalText,
});

export const PATCH = apiRoute(async (req, ctx) => {
  const params = await ctx.params;
  const id = Number(params.PK_emergency);
  const session = await requireCentral();
  const body = await parseBody(req, patchSchema);

  const existing = await prisma.tbemergencies.findUnique({
    where: { PK_emergency: id },
    select: { PK_emergency: true, isMainEmergency: true },
  });
  if (!existing?.isMainEmergency) throw new ApiError(404, "La emergencia no existe.");

  const { status, statusReason, ...fields } = body;

  if (Object.keys(fields).length > 0) {
    await prisma.tbemergencies.update({ where: { PK_emergency: id }, data: fields });
  }
  if (status) {
    await changeEmergencyStatus(id, status, session, statusReason ?? undefined);
  }

  return ok(
    await prisma.tbemergencies.findUnique({
      where: { PK_emergency: id },
      include: { tbemergencytypes: { select: { name: true } } },
    }),
  );
});
