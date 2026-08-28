import { z } from "zod";
import { apiRoute, institutionScope, notify, ok, parseBody, requireSession } from "@/lib/api/helpers";
import prisma from "@/lib/db/prisma";
import { publish, topics } from "@/lib/realtime/bus";

// ============================================================
// API: NOTIFICACIONES DEL USUARIO DEL DASHBOARD
// GET   /api/dashboard/notifications/me
// PATCH /api/dashboard/notifications/me  → marca leídas: { PK_notification } o { all: true }
// ============================================================

export const GET = apiRoute(async () => {
  const session = await requireSession();
  const items = await prisma.tbnotifications.findMany({
    where: { FK_user: session.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      tbemergencies: { select: { emergencyCode: true, status: true } },
    },
  });
  return ok({
    items,
    unread: items.filter((n) => !n.isRead).length,
  });
});

const patchSchema = z.union([
  z.object({ all: z.literal(true) }),
  z.object({ all: z.literal(false).optional(), PK_notification: z.coerce.number().int() }),
]);

export const PATCH = apiRoute(async (req) => {
  const session = await requireSession();
  const body = await parseBody(req, patchSchema);

  if ("all" in body && body.all) {
    await prisma.tbnotifications.updateMany({
      where: { FK_user: session.userId, isRead: false },
      data: { isRead: true },
    });
  } else if ("PK_notification" in body) {
    await prisma.tbnotifications.updateMany({
      where: { PK_notification: body.PK_notification, FK_user: session.userId },
      data: { isRead: true },
    });
  }

  publish(topics.notificationsUser(session.userId), "NOTIFICATION_READ");
  return ok({ updated: true });
});
