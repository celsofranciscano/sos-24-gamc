import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import prisma from "@/lib/db/prisma";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "evidence");

function extensionFor(file: File): string {
  const fromName = path.extname(file.name);
  if (fromName) return fromName;
  const fromType = file.type.split("/")[1];
  return fromType ? `.${fromType}` : "";
}

type RouteContext = { params: Promise<{ PK_emergency: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  // Ver la evidencia de un reporte no requiere sesión; solo subir una (POST,
  // abajo) exige estar autenticado como ciudadano.
  const { PK_emergency } = await context.params;
  const emergencyId = Number(PK_emergency);

  const evidences = await prisma.tbevidences.findMany({
    where: { FK_emergency: emergencyId },
    select: {
      PK_evidence: true,
      fileType: true,
      fileUrl: true,
      description: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ evidences });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const session = await auth();

  if (!session?.user || session.user.role !== "CITIZEN") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { PK_emergency } = await context.params;
  const emergencyId = Number(PK_emergency);
  const citizenId = Number(session.user.id);

  const contentType = request.headers.get("content-type") ?? "";

  let fileType: string | undefined;
  let fileUrl: string | undefined;
  let description: string | undefined;

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file");
    fileType = (formData.get("fileType") as string | null) ?? "IMAGE";
    description = (formData.get("description") as string | null) ?? undefined;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file es obligatorio." }, { status: 400 });
    }

    await mkdir(UPLOAD_DIR, { recursive: true });
    const filename = `${randomUUID()}${extensionFor(file)}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(UPLOAD_DIR, filename), buffer);
    fileUrl = `/uploads/evidence/${filename}`;
  } else {
    const body = await request.json();
    fileType = body.fileType;
    fileUrl = body.fileUrl;
    description = body.description;
  }

  if (!fileType || !fileUrl) {
    return NextResponse.json(
      { error: "fileType y fileUrl son obligatorios." },
      { status: 400 },
    );
  }

  const evidence = await prisma.tbevidences.create({
    data: {
      FK_emergency: emergencyId,
      FK_citizen: citizenId,
      fileType,
      fileUrl,
      description: description || null,
    },
    select: {
      PK_evidence: true,
      fileType: true,
      fileUrl: true,
      description: true,
      createdAt: true,
    },
  });

  return NextResponse.json(evidence, { status: 201 });
}
