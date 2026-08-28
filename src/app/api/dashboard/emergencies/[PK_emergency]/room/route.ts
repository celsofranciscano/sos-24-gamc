import { z } from "zod";
import { ApiError, apiRoute, ok, parseBody, requireSession } from "@/lib/api/helpers";
import prisma from "@/lib/db/prisma";
import { publish, topics } from "@/lib/realtime/bus";
import { getEmergencyOrThrow } from "@/lib/api/emergency-service";

// ============================================================
// API: SALA DE CRISIS (CANAL ÚNICO)
// GET /api/dashboard/emergencies/[PK_emergency]/room
//     Devuelve la sala con sus miembros resueltos (nombre visible).
// PATCH /api/dashboard/emergencies/[PK_emergency]/room
//      Abre o cierra la sala: { isOpen }
// ============================================================

export async function resolveRoomMembers(roomId: number) {
  const members = await prisma.tbemergencyroommembers.findMany({
    where: { FK_room: roomId },
    orderBy: { joinedAt: "asc" },
    include: {
      tbcitizens: { select: { firstName: true, lastName: true, phoneNumber: true } },
      tbusers: { select: { firstName: true, lastName: true } },
      tbinstitutions: { select: { name: true, acronym: true } },
      tbunits: { select: { unitCode: true, unitName: true } },
    },
  });

  // Las claves foráneas son polimórficas: se resuelve el nombre visible aquí.
  return members.map((member) => ({
    PK_roomMember: member.PK_roomMember,
    memberRole: member.memberRole,
    isActive: member.isActive,
    joinedAt: member.joinedAt,
    displayName:
      member.memberRole === "IA_BOT"
        ? "IA SOS-24"
        : member.tbunits?.unitCode ??
          member.tbinstitutions?.name ??
          ([member.tbusers?.firstName, member.tbusers?.lastName].filter(Boolean).join(" ") ||
            [member.tbcitizens?.firstName, member.tbcitizens?.lastName].filter(Boolean).join(" ") ||
            `Miembro #${member.PK_roomMember}`),
  }));
}

export const GET = apiRoute(async (_req, ctx) => {
  const params = await ctx.params;
  await requireSession();
  const emergency = await getEmergencyOrThrow(Number(params.PK_emergency));

  const room = await prisma.tbemergencyrooms.findUnique({
    where: { FK_emergency: emergency.PK_emergency },
  });
  if (!room) throw new ApiError(404, "La emergencia no tiene sala abierta.");

  return ok({ ...room, members: await resolveRoomMembers(room.PK_room) });
});

const patchSchema = z.object({ isOpen: z.boolean() });

export const PATCH = apiRoute(async (req, ctx) => {
  const params = await ctx.params;
  await requireSession();
  const emergency = await getEmergencyOrThrow(Number(params.PK_emergency));
  const body = await parseBody(req, patchSchema);

  const room = await prisma.tbemergencyrooms.findUnique({
    where: { FK_emergency: emergency.PK_emergency },
  });
  if (!room) throw new ApiError(404, "La emergencia no tiene sala.");

  const updated = await prisma.tbemergencyrooms.update({
    where: { PK_room: room.PK_room },
    data: { isOpen: body.isOpen, ...(body.isOpen ? { closedAt: null } : { closedAt: new Date() }) },
  });
  publish(topics.emergency(emergency.PK_emergency), "ROOM_UPDATED", { isOpen: body.isOpen });
  return ok(updated);
});
