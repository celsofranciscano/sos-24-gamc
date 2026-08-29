import { NextResponse } from "next/server";
import { gateway } from "@ai-sdk/gateway";

import { auth } from "@/auth";

const REALTIME_MODEL = "openai/gpt-realtime-1.5";

export async function POST() {
  const session = await auth();

  if (!session?.user || session.user.role !== "CITIZEN") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  // Check if API key is configured
  if (!process.env.AI_GATEWAY_API_KEY) {
    return NextResponse.json(
      {
        error:
          "AI Gateway no configurado. Agrega AI_GATEWAY_API_KEY en tu archivo .env. Obtén la key en: https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%2Fapi-keys",
      },
      { status: 503 },
    );
  }

  try {
    const { token, url } =
      await gateway.experimental_realtime.getToken({
        model: REALTIME_MODEL,
      });

    return NextResponse.json({ token, url, model: REALTIME_MODEL });
  } catch (error) {
    console.error("Error getting realtime token:", error);
    return NextResponse.json(
      {
        error:
          "No se pudo obtener el token de voz. Verifica que AI_GATEWAY_API_KEY sea válida.",
      },
      { status: 500 },
    );
  }
}
