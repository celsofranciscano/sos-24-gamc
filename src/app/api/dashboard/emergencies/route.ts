import { z } from "zod";
import {
  ApiError,
  apiRoute,
  getPagination,
  getSearchParams,
  institutionScope,
  notify,
  ok,
  parseBody,
  requireSession,
} from "@/lib/api/helpers";
import prisma from "@/lib/db/prisma";
import { publish, topics } from "@/lib/realtime/bus";
import {
  addSystemEvent,
  changeEmergencyStatus,
  ensureEmergencyRoom,
  generateEmergencyCode,
} from "@/lib/api/emergency-service";
import { EMERGENCY_PRIORITIES, nullableFloat, nullableId, optionalText, requiredId } from "@/lib/api/schemas";

// ============================================================
// API: EMERGENCIAS (CASO ÚNICO)
// GET  /api/dashboard/emergencies
//      Filtros: ?status=A,B  ?priority=CRITICA  ?FK_emergencyType=
//               ?search=SOS-0001  ?page=1&pageSize=20
// POST /api/dashboard/emergencies
//      Registro manual por operador (canal MANUAL_OPERATOR):
//      crea caso + reporte inicial + ubicación + sala + historial.
// ============================================================

const emergencyInclude = {
  tbcitizens: { select: { PK_citizen: true, firstName: true, lastName: true, phoneNumber: true } },
  tbemergencytypes: { select: { PK_emergencyType: true, name: true } },
  _count: {
    select: {
      tbemergencyreports: true,
      tbemergencyassignments: true,
      tbevidences: true,
      tbemergencyprogressreports: true,
    },
  },
} as const;

export const GET = apiRoute(async (req) => {
  const session = await requireSession();
  const { skip, take, page, pageSize } = getPagination(req);
  const sp = getSearchParams(req);

  const statusList = sp.get("status")?.split(",").filter(Boolean);
  const priorityList = sp.get("priority")?.split(",").filter(Boolean);
  const type = sp.get("FK_emergencyType");
  const search = (sp.get("search") ?? "").trim();
  const activeOnly = sp.get("active") === "true";

  const where: Record<string, unknown> = {
    isMainEmergency: true,
    ...(statusList?.length ? { status: { in: statusList } } : {}),
    ...(priorityList?.length ? { priority: { in: priorityList } } : {}),
    ...(type ? { FK_emergencyType: Number(type) } : {}),
    ...(activeOnly ? { status: { in: ["REPORTADA", "EN_ANALISIS", "CLASIFICADA", "ASIGNADA", "EN_ATENCION"] } } : {}),
    ...(search
      ? {
          OR: [
            { emergencyCode: { contains: search } },
            { description: { contains: search } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.tbemergencies.findMany({
      where,
      skip,
      take,
      orderBy: { reportedAt: "desc" },
      include: emergencyInclude,
    }),
    prisma.tbemergencies.count({ where }),
  ]);

  return ok({ items, total, page, pageSize });
});

const createSchema = z.object({
  description: optionalText,
  FK_emergencyType: nullableId,
  priority: z.enum(EMERGENCY_PRIORITIES).default("MEDIA"),
  latitude: z.number({ message: "Latitud requerida" }).min(-90).max(90),
  longitude: z.number({ message: "Longitud requerida" }).min(-180).max(180),
  address: optionalText,
  accuracy: nullableFloat,
  affectedPersons: nullableId,
  affectedAnimals: nullableId,
  trappedPersons: nullableId,
  missingPersons: nullableId,
  FK_citizen: nullableId,
});

export const POST = apiRoute(async (req) => {
  const session = await requireSession();
  if (!session.isCentral) throw new ApiError(403, "Solo la Central GAMC puede registrar emergencias manuales.");
  const body = await parseBody(req, createSchema);

  const emergencyCode = await generateEmergencyCode();

  // 1) Caso único principal
  const emergency = await prisma.tbemergencies.create({
    data: {
      emergencyCode,
      FK_citizen: body.FK_citizen ?? null,
      FK_emergencyType: body.FK_emergencyType ?? null,
      priority: body.priority,
      status: "REPORTADA",
      description: body.description ?? null,
      affectedPersons: body.affectedPersons ?? null,
      affectedAnimals: body.affectedAnimals ?? null,
      trappedPersons: body.trappedPersons ?? null,
      missingPersons: body.missingPersons ?? null,
    },
  });

  // 2) Reporte inicial del canal manual
  await prisma.tbemergencyreports.create({
    data: {
      FK_emergency: emergency.PK_emergency,
      FK_citizen: body.FK_citizen ?? null,
      reportChannel: "MANUAL_OPERATOR",
      description: body.description ?? null,
      latitude: body.latitude,
      longitude: body.longitude,
    },
  });

  // 3) Ubicación del incidente
  await prisma.tbemergencylocations.create({
    data: {
      FK_emergency: emergency.PK_emergency,
      latitude: body.latitude,
      longitude: body.longitude,
      accuracy: body.accuracy ?? null,
      address: body.address ?? null,
    },
  });

  // 4) Sala de crisis + miembro central + evento de sistema
  const room = await ensureEmergencyRoom(emergency.PK_emergency, emergencyCode);
  await prisma.tbemergencyroommembers.create({
    data: {
      FK_room: room.PK_room,
      FK_user: session.userId,
      memberRole: "CENTRAL_GAMC",
    },
  });
  await addSystemEvent(
    emergency.PK_emergency,
    room.PK_room,
    `Emergencia ${emergencyCode} registrada manualmente por ${session.name}.`,
  );

  // 5) Historial de estado inicial
  await prisma.tbemergencystatushistory.create({
    data: { FK_emergency: emergency.PK_emergency, newStatus: "REPORTADA", changeReason: "Registro inicial" },
  });

  // 6) Notificación a la Central + tiempo real
  await notify({
    title: "Nueva emergencia",
    message: `${emergencyCode} registrada por ${session.name}.`,
    notificationType: "DISPATCH_UPDATE",
    emergencyId: emergency.PK_emergency,
    privilegeCodes: ["CENTRAL_ADMIN", "CENTRAL_DISPATCHER"],
    userIds: [session.userId],
  });
  publish(topics.emergencies, "EMERGENCY_CREATED", { emergencyCode });
  publish(topics.emergency(emergency.PK_emergency), "EMERGENCY_CREATED");

  return ok(
    await prisma.tbemergencies.findUnique({
      where: { PK_emergency: emergency.PK_emergency },
      include: emergencyInclude,
    }),
    201,
  );
});
