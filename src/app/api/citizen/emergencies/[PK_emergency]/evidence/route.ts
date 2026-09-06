import { v2 as cloudinary, type UploadApiErrorResponse, type UploadApiResponse } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import prisma from "@/lib/db/prisma";

function resourceTypeFor(fileType: string): "image" | "video" {
  // Cloudinary no tiene un resource_type "audio" propio: el audio se procesa
  // bajo el mismo pipeline que "video".
  return fileType === "IMAGE" ? "image" : "video";
}

async function uploadToCloudinary(buffer: Buffer, fileType: string): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("CLOUDINARY_NOT_CONFIGURED");
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

  return new Promise<string>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "arconte", resource_type: resourceTypeFor(fileType) },
      (error?: UploadApiErrorResponse, result?: UploadApiResponse) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve(result.secure_url);
      },
    );
    uploadStream.end(buffer);
  });
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

    const buffer = Buffer.from(await file.arrayBuffer());

    try {
      fileUrl = await uploadToCloudinary(buffer, fileType);
    } catch (error) {
      if (error instanceof Error && error.message === "CLOUDINARY_NOT_CONFIGURED") {
        return NextResponse.json(
          { error: "La subida de evidencia no está configurada en el servidor." },
          { status: 503 },
        );
      }
      console.error("evidence upload: fallo subiendo a Cloudinary", error);
      return NextResponse.json(
        { error: "No se pudo subir el archivo de evidencia." },
        { status: 502 },
      );
    }
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
