import { Prisma } from "@/generated/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

import { auth } from "@/auth";
import prisma from "@/lib/db/prisma";

const PUBLIC_SELECT = {
  PK_citizen: true,
  firstName: true,
  lastName: true,
  CI: true,
  phoneNumber: true,
  email: true,
  status: true,
  createdAt: true,
} satisfies Prisma.tbcitizensSelect;

type RouteContext = { params: Promise<{ PK_citizen: string }> };

async function getCitizenId(context: RouteContext): Promise<number | null> {
  const { PK_citizen } = await context.params;
  const id = Number(PK_citizen);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const session = await auth();

  if (session?.user?.role !== "INSTITUTION") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const id = await getCitizenId(context);

  if (!id) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const citizen = await prisma.tbcitizens.findUnique({
    where: { PK_citizen: id },
    select: PUBLIC_SELECT,
  });

  if (!citizen) {
    return NextResponse.json({ error: "Ciudadano no encontrado." }, { status: 404 });
  }

  return NextResponse.json(citizen);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const session = await auth();

  if (session?.user?.role !== "INSTITUTION") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const id = await getCitizenId(context);

  if (!id) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const data: Prisma.tbcitizensUpdateInput = {};

  if (body.firstName !== undefined)
    data.firstName = String(body.firstName).trim();
  if (body.lastName !== undefined)
    data.lastName = String(body.lastName).trim();
  if (body.CI !== undefined)
    data.CI = body.CI ? String(body.CI).trim() : null;
  if (body.email !== undefined)
    data.email = body.email ? String(body.email).trim() : null;
  if (body.status !== undefined) data.status = Boolean(body.status);
  if (body.password) {
    const password = String(body.password);
    if (password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres." },
        { status: 400 },
      );
    }
    data.password = await bcrypt.hash(password, 10);
  }

  try {
    const citizen = await prisma.tbcitizens.update({
      where: { PK_citizen: id },
      data,
      select: PUBLIC_SELECT,
    });

    return NextResponse.json(citizen);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Ciudadano no encontrado." },
        { status: 404 },
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const target = Array.isArray(error.meta?.target)
        ? error.meta.target.join(", ")
        : "campo único";
      return NextResponse.json(
        { error: `Ya existe un registro para: ${target}.` },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "No se pudo actualizar el ciudadano." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const session = await auth();

  if (session?.user?.role !== "INSTITUTION") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const id = await getCitizenId(context);

  if (!id) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  try {
    await prisma.tbcitizens.delete({ where: { PK_citizen: id } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Ciudadano no encontrado." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "No se pudo eliminar el ciudadano." },
      { status: 500 },
    );
  }
}
