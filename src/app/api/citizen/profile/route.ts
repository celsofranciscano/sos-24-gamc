import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

import { auth } from "@/auth";
import prisma from "@/lib/db/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user || session.user.role !== "CITIZEN") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const citizenId = Number(session.user.id);

  const citizen = await prisma.tbcitizens.findUnique({
    where: { PK_citizen: citizenId },
    select: {
      PK_citizen: true,
      firstName: true,
      lastName: true,
      CI: true,
      phoneNumber: true,
      email: true,
      profileImage: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!citizen) {
    return NextResponse.json(
      { error: "Ciudadano no encontrado." },
      { status: 404 },
    );
  }

  return NextResponse.json({ citizen });
}

export async function PUT(request: NextRequest) {
  const session = await auth();

  if (!session?.user || session.user.role !== "CITIZEN") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const citizenId = Number(session.user.id);
  const body = await request.json();

  const data: Record<string, unknown> = {};

  if (body.firstName !== undefined) data.firstName = String(body.firstName).trim();
  if (body.lastName !== undefined) data.lastName = String(body.lastName).trim();
  if (body.CI !== undefined) data.CI = body.CI ? String(body.CI).trim() : null;
  if (body.email !== undefined) data.email = body.email ? String(body.email).trim() : null;
  if (body.profileImage !== undefined) data.profileImage = body.profileImage;

  if (body.currentPassword && body.newPassword) {
    const citizen = await prisma.tbcitizens.findUnique({
      where: { PK_citizen: citizenId },
      select: { password: true },
    });

    if (!citizen?.password) {
      return NextResponse.json(
        { error: "No se puede cambiar la contraseña." },
        { status: 400 },
      );
    }

    const isValid = await bcrypt.compare(
      String(body.currentPassword),
      citizen.password,
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "La contraseña actual es incorrecta." },
        { status: 400 },
      );
    }

    const newPassword = String(body.newPassword);
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "La nueva contraseña debe tener al menos 8 caracteres." },
        { status: 400 },
      );
    }

    data.password = await bcrypt.hash(newPassword, 10);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "No hay datos para actualizar." },
      { status: 400 },
    );
  }

  try {
    const updated = await prisma.tbcitizens.update({
      where: { PK_citizen: citizenId },
      data,
      select: {
        PK_citizen: true,
        firstName: true,
        lastName: true,
        CI: true,
        phoneNumber: true,
        email: true,
        profileImage: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ citizen: updated });
  } catch {
    return NextResponse.json(
      { error: "No se pudo actualizar el perfil." },
      { status: 500 },
    );
  }
}
