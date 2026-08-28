import { ApiError, notify } from "@/lib/api/helpers";
import prisma from "@/lib/db/prisma";
import { publish, topics } from "@/lib/realtime/bus";
import { addSystemEvent, changeEmergencyStatus, ensureEmergencyRoom } from "@/lib/api/emergency-service";
import type { DashboardSession } from "@/lib/api/helpers";

// ============================================================
// SERVICIO DE DESPACHO (FLUJO SOS-24)
// Máquina de estados de una asignación:
//   SOLICITADA → ACEPTADA → EN_CAMINO → EN_SITIO → FINALIZADA
//   (o RECHAZADA / CANCELADA)
// Cada transición actualiza la unidad, registra eventos en la sala
// común, notifica a los actores y publica en tiempo real.
// ============================================================

export type AssignmentOp = "accept" | "reject" | "depart" | "arrive" | "complete" | "cancel";

const OP_TO_STATUS: Record<AssignmentOp, string> = {
  accept: "ACEPTADA",
  reject: "RECHAZADA",
  depart: "EN_CAMINO",
  arrive: "EN_SITIO",
  complete: "FINALIZADA",
  cancel: "CANCELADA",
};

/** Estados previos válidos para cada operación. */
const ALLOWED_FROM: Record<AssignmentOp, string[]> = {
  accept: ["SOLICITADA"],
  reject: ["SOLICITADA"],
  depart: ["ACEPTADA"],
  arrive: ["EN_CAMINO"],
  complete: ["EN_SITIO"],
  cancel: ["SOLICITADA", "ACEPTADA"],
};

export async function getAssignmentOrThrow(PK_assignment: number) {
  const assignment = await prisma.tbemergencyassignments.findUnique({
    where: { PK_assignment },
    include: {
      tbemergencies: { select: { PK_emergency: true, emergencyCode: true, status: true } },
      tbinstitutions: { select: { name: true, acronym: true } },
      tbsubinstitutions: { select: { name: true, latitude: true, longitude: true } },
      tbunits: { select: { PK_unit: true, unitCode: true, unitName: true } },
    },
  });
  if (!assignment) throw new ApiError(404, "La asignación no existe.");
  return assignment;
}

async function releaseUnit(PK_unit: number) {
  // La unidad queda libre solo si no tiene otras asignaciones activas.
  const activeCount = await prisma.tbemergencyassignments.count({
    where: {
      FK_unit: PK_unit,
      status: { in: ["SOLICITADA", "ACEPTADA", "EN_CAMINO", "EN_SITIO"] },
    },
  });
  await prisma.tbunits.update({
    where: { PK_unit: PK_unit },
    data: {
      status: activeCount > 0 ? "OCUPADA" : "DISPONIBLE",
      isAvailable: activeCount === 0,
    },
  });
  publish(topics.unit(PK_unit), "UNIT_STATUS");
}

export async function applyAssignmentOp(
  PK_assignment: number,
  op: AssignmentOp,
  session: DashboardSession,
  reason?: string,
): Promise<void> {
  const assignment = await getAssignmentOrThrow(PK_assignment);

  // Control de acceso: la institución solo opera sus propias asignaciones.
  if (!session.isCentral && assignment.FK_institution !== session.institutionId) {
    throw new ApiError(403, "No tiene acceso a esta asignación.");
  }

  if (!ALLOWED_FROM[op].includes(assignment.status)) {
    throw new ApiError(400, `Operación inválida: ${assignment.status} → ${OP_TO_STATUS[op]}.`);
  }

  const now = new Date();
  await prisma.tbemergencyassignments.update({
    where: { PK_assignment },
    data: {
      status: OP_TO_STATUS[op],
      ...(op === "accept" ? { acceptedAt: now } : {}),
      ...(op === "arrive" ? { arrivedAt: now } : {}),
      ...(op === "complete" ? { completedAt: now } : {}),
    },
  });

  const unitCode = assignment.tbunits?.unitCode ?? assignment.tbinstitutions.acronym;
  const room = await ensureEmergencyRoom(
    assignment.FK_emergency,
    assignment.tbemergencies.emergencyCode,
  );

  switch (op) {
    case "accept": {
      await addSystemEvent(assignment.FK_emergency, room.PK_room, `${unitCode} aceptó la asignación.`);
      break;
    }
    case "reject": {
      await addSystemEvent(
        assignment.FK_emergency,
        room.PK_room,
        `${unitCode} rechazó la asignación${reason ? `: ${reason}` : "."}`,
      );
      if (assignment.FK_unit) await releaseUnit(assignment.FK_unit);
      await notify({
        title: "Asignación rechazada",
        message: `${assignment.tbemergencies.emergencyCode}: ${unitCode} rechazó la asignación.`,
        notificationType: "DISPATCH_UPDATE",
        emergencyId: assignment.FK_emergency,
        privilegeCodes: ["CENTRAL_ADMIN", "CENTRAL_DISPATCHER"],
      });
      break;
    }
    case "depart": {
      if (assignment.FK_unit) {
        await prisma.tbunits.update({
          where: { PK_unit: assignment.FK_unit },
          data: { status: "EN_CAMINO", isAvailable: false },
        });
        publish(topics.unit(assignment.FK_unit), "UNIT_STATUS");

        // Primer punto GPS desde la base (subinstitución o institución).
        const hasTracking = await prisma.tbassignmenttracking.count({
          where: { FK_assignment: PK_assignment },
        });
        const baseLat = assignment.tbsubinstitutions?.latitude;
        const baseLng = assignment.tbsubinstitutions?.longitude;
        if (!hasTracking && baseLat != null && baseLng != null) {
          await prisma.tbassignmenttracking.create({
            data: { FK_assignment: PK_assignment, FK_unit: assignment.FK_unit, latitude: baseLat, longitude: baseLng },
          });
          await prisma.tbunitlocations.create({
            data: { FK_unit: assignment.FK_unit, latitude: baseLat, longitude: baseLng },
          });
          publish(topics.unit(assignment.FK_unit), "UNIT_POSITION");
        }
      }
      await addSystemEvent(assignment.FK_emergency, room.PK_room, `${unitCode} salió hacia el incidente.`);
      break;
    }
    case "arrive": {
      if (assignment.FK_unit) {
        await prisma.tbunits.update({
          where: { PK_unit: assignment.FK_unit },
          data: { status: "EN_SITIO" },
        });
        publish(topics.unit(assignment.FK_unit), "UNIT_STATUS");
      }
      await changeEmergencyStatus(assignment.FK_emergency, "EN_ATENCION", session, `${unitCode} llegó al sitio.`);
      await addSystemEvent(assignment.FK_emergency, room.PK_room, `${unitCode} llegó al lugar del incidente.`);
      break;
    }
    case "complete": {
      if (assignment.FK_unit) await releaseUnit(assignment.FK_unit);
      await addSystemEvent(assignment.FK_emergency, room.PK_room, `${unitCode} finalizó su intervención.`);
      break;
    }
    case "cancel": {
      if (assignment.FK_unit) await releaseUnit(assignment.FK_unit);
      await addSystemEvent(assignment.FK_emergency, room.PK_room, `Asignación de ${unitCode} cancelada.`);
      break;
    }
  }

  publish(topics.assignment(PK_assignment), "ASSIGNMENT_UPDATED", {
    op,
    status: OP_TO_STATUS[op],
    by: session.name,
  });
  publish(topics.emergency(assignment.FK_emergency), "ASSIGNMENT_UPDATED", { op });
}
