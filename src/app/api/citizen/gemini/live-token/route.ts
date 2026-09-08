import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

import { auth } from "@/auth";

export async function POST() {
  const session = await auth();

  if (!session?.user || session.user.role !== "CITIZEN") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "El reporte por voz no está configurado en el servidor." },
      { status: 503 },
    );
  }

  const ai = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: "v1alpha" } });

  const now = Date.now();
  const expireTime = new Date(now + 30 * 60 * 1000).toISOString();
  const newSessionExpireTime = new Date(now + 60 * 1000).toISOString();

  try {
    // liveConnectConstraints is intentionally left unset: the client's own
    // `setup` message still controls model/systemInstruction/tools exactly
    // as before, this token only replaces how the connection authenticates.
    const token = await ai.authTokens.create({
      config: {
        uses: 1,
        expireTime,
        newSessionExpireTime,
      },
    });

    return NextResponse.json({ token: token.name, expiresAt: newSessionExpireTime });
  } catch (error) {
    console.error("gemini live-token: fallo creando el token efímero", error);
    return NextResponse.json(
      { error: "No se pudo generar el token para el asistente de voz." },
      { status: 502 },
    );
  }
}
