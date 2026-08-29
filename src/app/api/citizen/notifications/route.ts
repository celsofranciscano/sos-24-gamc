import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import prisma from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user || session.user.role !== "CITIZEN") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const citizenId = Number(session.user.id);
  const searchParams = request.nextUrl.searchParams;
  const unreadOnly = searchParams.get("unreadOnly") === "true";

  const notifications = await prisma.tbnotifications.findMany({
    where: {
      FK_citizen: citizenId,
      ...(unreadOnly ? { isRead: false } : {}),
    },
    select: {
      PK_notification: true,
      title: true,
      message: true,
      notificationType: true,
      isRead: true,
      createdAt: true,
      FK_emergency: true,
      tbemergencies: {
        select: { emergencyCode: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = await prisma.tbnotifications.count({
    where: { FK_citizen: citizenId, isRead: false },
  });

  return NextResponse.json({ notifications, unreadCount });
}

export async function PUT(request: NextRequest) {
  const session = await auth();

  if (!session?.user || session.user.role !== "CITIZEN") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const citizenId = Number(session.user.id);
  const body = await request.json();

  if (body.markAllAsRead) {
    await prisma.tbnotifications.updateMany({
      where: { FK_citizen: citizenId, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  }

  if (body.PK_notification) {
    await prisma.tbnotifications.updateMany({
      where: {
        PK_notification: Number(body.PK_notification),
        FK_citizen: citizenId,
      },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    { error: "Acción no válida." },
    { status: 400 },
  );
}
