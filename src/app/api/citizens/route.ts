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

export async function GET(request: NextRequest) {
  const session = await auth();

  if (session?.user?.role !== "INSTITUTION") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search")?.trim();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize")) || 20));

  const where: Prisma.tbcitizensWhereInput = search
    ? {
        OR: [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { phoneNumber: { contains: search } },
          { CI: { contains: search } },
          { email: { contains: search } },
        ],
      }
    : {};

  const [total, citizens] = await prisma.$transaction([
    prisma.tbcitizens.count({ where }),
    prisma.tbcitizens.findMany({
      where,
      select: PUBLIC_SELECT,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({ total, page, pageSize, citizens });
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const firstName = String(body.firstName ?? "").trim();
  const lastName = String(body.lastName ?? "").trim();
  const phoneNumber = String(body.phoneNumber ?? "").trim();
  const CI = body.CI ? String(body.CI).trim() : null;
  const email = body.email ? String(body.email).trim() : null;
  const password = body.password ? String(body.password) : null;

  if (!firstName || !lastName || !phoneNumber) {
    return NextResponse.json(
      { error: "Nombres, apellidos y teléfono son obligatorios." },
      { status: 400 },
    );
  }

  if (password && password.length < 8) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 8 caracteres." },
      { status: 400 },
    );
  }

  const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

  try {
    const citizen = await prisma.tbcitizens.create({
      data: {
        firstName,
        lastName,
        CI,
        phoneNumber,
        email,
        password: hashedPassword,
      },
      select: PUBLIC_SELECT,
    });

    return NextResponse.json(citizen, { status: 201 });
  } catch (error) {
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
      { error: "No se pudo crear el ciudadano." },
      { status: 500 },
    );
  }
}
