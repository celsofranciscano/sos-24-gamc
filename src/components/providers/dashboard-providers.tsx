"use client";

import { useEffect, useRef, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { queryKeysForEvent } from "@/lib/query-keys";
import type { RealtimeEvent } from "@/lib/realtime/bus";

function RealtimeBridge({ onEvent }: { onEvent?: (event: RealtimeEvent) => void }) {
  const [connected, setConnected] = useState(false);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    const source = new EventSource("/api/dashboard/realtime");

    source.onopen = () => setConnected(true);
    source.onerror = () => setConnected(false);
    source.onmessage = (message) => {
      try {
        const event = JSON.parse(message.data) as RealtimeEvent;
        if (event.type === "CONNECTED") {
          setConnected(true);
          return;
        }
        onEventRef.current?.(event);
      } catch {
        // evento malformado: ignorar
      }
    };

    return () => source.close();
  }, []);

  return (
    <div
      aria-label="Estado del canal en tiempo real"
      className={`fixed bottom-4 right-4 z-50 hidden items-center gap-2 rounded-full border bg-background/90 px-3 py-1.5 text-xs shadow-sm backdrop-blur md:flex ${
        connected ? "text-emerald-600 border-emerald-200" : "text-muted-foreground"
      }`}
    >
      <span className="relative flex size-2">
        <span
          className={`absolute inline-flex h-full w-full rounded-full ${connected ? "animate-ping bg-emerald-400" : "bg-muted-foreground"} opacity-75`}
        />
        <span
          className={`relative inline-flex size-2 rounded-full ${connected ? "bg-emerald-500" : "bg-muted-foreground"}`}
        />
      </span>
      {connected ? "Tiempo real conectado" : "Reconectando..."}
    </div>
  );
}

export function DashboardProviders({
  children,
  onRealtimeEvent,
}: {
  children: React.ReactNode;
  onRealtimeEvent?: (event: RealtimeEvent) => void;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 15_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeBridge
        onEvent={(event) => {
          for (const key of queryKeysForEvent(event)) {
            void queryClient.invalidateQueries({ queryKey: key });
          }
          onRealtimeEvent?.(event);
        }}
      />
      {children}
    </QueryClientProvider>
  );
}
