import type { NextRequest } from "next/server";
import { requireSession } from "@/lib/api/helpers";
import { bus, type RealtimeEvent } from "@/lib/realtime/bus";

export const dynamic = "force-dynamic";

/**
 * Canal en tiempo real (SSE) del dashboard.
 * Los clientes se conectan con EventSource y reciben todos los eventos
 * publicados por el bus (nuevas emergencias, asignaciones, GPS, mensajes...).
 */
export async function GET(req: NextRequest) {
  await requireSession();

  const encoder = new TextEncoder();
  let cleanup: () => void = () => {};

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: RealtimeEvent | { topic: string; type: string }) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));

      send({ topic: "connection", type: "CONNECTED" });

      const listener = (event: RealtimeEvent) => {
        try {
          send(event);
        } catch {
          cleanup();
        }
      };
      bus.on("event", listener);

      const ping = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {
          cleanup();
        }
      }, 25000);

      cleanup = () => {
        clearInterval(ping);
        bus.off("event", listener);
        try {
          controller.close();
        } catch {
          // ya cerrado
        }
      };

      req.signal.addEventListener("abort", cleanup);
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
