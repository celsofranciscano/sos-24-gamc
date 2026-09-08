import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

import { auth } from "@/auth";

// Firma para que el cliente suba el archivo directamente a Cloudinary
// (sin pasar por esta función serverless), evitando el límite de tamaño de
// payload de Vercel (~4.5 MB) que hacía fallar los videos pero no las
// imágenes. Solo se firman `timestamp` y `folder`: son los únicos parámetros
// que el cliente reenvía a Cloudinary junto con la firma.
export async function POST() {
  const session = await auth();

  if (!session?.user || session.user.role !== "CITIZEN") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "La subida de evidencia no está configurada en el servidor." },
      { status: 503 },
    );
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "arconte";
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, apiSecret);

  return NextResponse.json({ signature, timestamp, apiKey, cloudName, folder });
}
