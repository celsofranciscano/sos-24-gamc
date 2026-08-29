"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { experimental_useRealtime as useRealtime } from "@ai-sdk/react";
import { createGateway } from "@ai-sdk/gateway";
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Loader2,
  Volume2,
  VolumeX,
  Siren,
  MapPin,
  User,
  AlertTriangle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type RealtimeStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "listening"
  | "speaking"
  | "disconnected"
  | "error";

type CollectedData = {
  description?: string;
  latitude?: number;
  longitude?: number;
  emergencyType?: string;
  affectedPersons?: number;
};

type RealtimeVoiceProps = {
  instructions?: string;
  model?: string;
  onStatusChange?: (status: RealtimeStatus) => void;
  onMessage?: (message: string) => void;
  onDataCollected?: (data: CollectedData) => void;
  onEmergencyCreated?: (emergencyCode: string) => void;
  className?: string;
  latitude?: number;
  longitude?: number;
};

const REALTIME_MODEL_ID = "openai/gpt-realtime-1.5";

// SOS-24 AI Instructions for emergency collection
const SOS_INSTRUCTIONS = `Eres SOS-24, el asistente de inteligencia artificial del sistema de emergencias. Tu objetivo es recopilar información crítica de una emergencia de manera rápida y calmada.

REGLAS ESTRICTAS:
1. Saluda brevemente y pregunta qué está sucediendo
2. Pregunta dónde exactamente (dirección, referencia, barrio)
3. Pregunta cuántas personas están afectadas
4. Pregunta si hay personas heridas o atrapadas
5. Pregunta si hay fuego, derrames, o peligros adicionales
6. Sé breve y directo - no más de 2 oraciones por turno
7. Habla en español boliviano, tono calmado pero urgente
8. Cuando tengas suficiente información, USA LA HERRAMIENTA create_emergency para crear la emergencia
9. Después de crear la emergencia, informa al ciudadano el código y que la ayuda está en camino

HERRAMIENTA DISPONIBLE:
- create_emergency: Usa esta herramienta cuando tengas toda la información necesaria. Pasa todos los datos recopilados.

IMPORTANTE: No esperes a que el ciudadano termine de hablar. Si tienes información suficiente (qué, dónde, cuántos), crea la emergencia inmediatamente.`;

export function RealtimeVoice({
  instructions,
  onStatusChange,
  onMessage,
  onDataCollected,
  onEmergencyCreated,
  className,
  latitude,
  longitude,
}: RealtimeVoiceProps) {
  const [tokenData, setTokenData] = useState<{
    token: string;
    url: string;
  } | null>(null);
  const [status, setStatus] = useState<RealtimeStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<Array<{
    role: "user" | "assistant";
    text: string;
  }>>([]);
  const [collectedData, setCollectedData] = useState<CollectedData>({});
  const [callDuration, setCallDuration] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleStatusChange = useCallback(
    (newStatus: RealtimeStatus) => {
      setStatus(newStatus);
      onStatusChange?.(newStatus);
    },
    [onStatusChange],
  );

  // Call timer
  useEffect(() => {
    if (status === "connected" || status === "listening" || status === "speaking") {
      const interval = setInterval(() => setCallDuration((d) => d + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [status]);

  // Create model from token
  const model = tokenData
    ? createGateway({ apiKey: tokenData.token }).experimental_realtime(
        REALTIME_MODEL_ID,
      )
    : null;

  const {
    status: realtimeStatus,
    isPlaying,
    isCapturing,
    connect,
    disconnect,
    addToolOutput,
  } = useRealtime({
    model: model as any,
    api: { token: tokenData?.token ?? "" },
    sessionConfig: {
      instructions: instructions ?? SOS_INSTRUCTIONS,
      tools: [
        {
          type: "function",
          name: "create_emergency",
          description: "Crea una emergencia en el sistema SOS-24 con la información recopilada del ciudadano",
          parameters: {
            type: "object",
            properties: {
              description: {
                type: "string",
                description: "Descripción de la emergencia",
              },
              emergencyType: {
                type: "string",
                description: "Tipo de emergencia: INCENDIO, ACCIDENTE, MEDICAL, ROBBERY, FLOOD, MISSING_PERSON, ANIMAL, RESCUE",
              },
              affectedPersons: {
                type: "number",
                description: "Número de personas afectadas",
              },
              trappedPersons: {
                type: "number",
                description: "Número de personas atrapadas",
              },
              latitude: {
                type: "number",
                description: "Latitud de la ubicación",
              },
              longitude: {
                type: "number",
                description: "Longitud de la ubicación",
              },
            },
            required: ["description", "latitude", "longitude"],
          },
        },
      ],
    },
    onEvent: (event: any) => {
      // Handle transcript messages
      if (event.type === "message") {
        if (event.role === "assistant") {
          const audioParts = event.content?.filter((c: any) => c.type === "audio");
          const text = audioParts?.map((c: any) => c.transcript).join("");
          if (text) {
            setTranscript((prev) => [...prev, { role: "assistant", text }]);
            onMessage?.(text);
          }
        }
        if (event.role === "user") {
          const audioParts = event.content?.filter((c: any) => c.type === "audio");
          const text = audioParts?.map((c: any) => c.transcript).join("");
          if (text) {
            setTranscript((prev) => [...prev, { role: "user", text }]);
          }
        }
      }

      // Handle tool calls
      if (event.type === "tool_call") {
        const toolName = event.toolCall?.toolName;
        const args = event.toolCall?.args;

        if (toolName === "create_emergency" && args) {
          const data: CollectedData = {
            description: args.description,
            latitude: args.latitude ?? latitude,
            longitude: args.longitude ?? longitude,
            emergencyType: args.emergencyType,
            affectedPersons: args.affectedPersons,
          };
          setCollectedData(data);
          onDataCollected?.(data);

          // Call the API to create the emergency
          fetch("/api/citizen/emergency/report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          })
            .then((res) => res.json())
            .then((result) => {
              if (result.emergencyCode) {
                onEmergencyCreated?.(result.emergencyCode);
                // Send tool result back to AI
                addToolOutput(event.toolCall.toolCallId, {
                  emergencyCode: result.emergencyCode,
                  success: true,
                });
              }
            })
            .catch(() => {
              addToolOutput(event.toolCall.toolCallId, {
                success: false,
                error: "Error al crear emergencia",
              });
            });
        }
      }
    },
    onError: (err: Error) => {
      handleStatusChange("error");
      setError(err.message || "Error desconocido.");
    },
  });

  // Sync realtime status
  useEffect(() => {
    if (!tokenData) return;
    switch (realtimeStatus) {
      case "connecting":
        handleStatusChange("connecting");
        break;
      case "connected":
        handleStatusChange(isPlaying ? "speaking" : "listening");
        break;
      case "error":
        handleStatusChange("error");
        break;
      case "disconnected":
        handleStatusChange("disconnected");
        break;
    }
  }, [realtimeStatus, isPlaying, tokenData, handleStatusChange]);

  // Audio visualization
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        const bars = 32;
        const barWidth = width / bars;

        for (let i = 0; i < bars; i++) {
          const value = dataArray[i % dataArray.length] || 0;
          const barHeight = (value / 255) * height * 0.8;

          const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
          gradient.addColorStop(0, "rgba(239, 68, 68, 0.3)");
          gradient.addColorStop(1, "rgba(239, 68, 68, 0.8)");

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(
            i * barWidth + 1,
            height - barHeight,
            barWidth - 2,
            barHeight,
            2,
          );
          ctx.fill();
        }
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [status]);

  // Setup microphone analyser
  useEffect(() => {
    if (isCapturing && !analyserRef.current) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          streamRef.current = stream;
          const audioContext = new AudioContext();
          const source = audioContext.createMediaStreamSource(stream);
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          analyserRef.current = analyser;
        })
        .catch(() => {
          // Mic not available
        });
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        analyserRef.current = null;
      }
    };
  }, [isCapturing]);

  // Fetch token and connect
  const handleStart = useCallback(async () => {
    setError(null);
    handleStatusChange("connecting");
    setCallDuration(0);
    setTranscript([]);

    try {
      const response = await fetch("/api/realtime-token", {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "No se pudo obtener el token.");
      }

      const data = await response.json();
      setTokenData(data);
    } catch (err) {
      handleStatusChange("error");
      setError(err instanceof Error ? err.message : "Error de conexión.");
    }
  }, [handleStatusChange]);

  // Connect when token is ready
  useEffect(() => {
    if (tokenData && model) {
      connect().catch((err: unknown) => {
        handleStatusChange("error");
        setError(err instanceof Error ? err.message : "Error al conectar.");
      });
    }
  }, [tokenData, model, connect, handleStatusChange]);

  const handleStop = useCallback(() => {
    disconnect();
    handleStatusChange("disconnected");
    setTokenData(null);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      analyserRef.current = null;
    }
  }, [disconnect, handleStatusChange]);

  // Cleanup
  useEffect(() => {
    return () => {
      disconnect();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [disconnect]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const isIdle = status === "idle" || status === "disconnected";
  const isActive = status === "connected" || status === "listening" || status === "speaking";
  const isCallActive = !isIdle;

  // ─── IDLE STATE: Show start button ───
  if (isIdle) {
    return (
      <div className={cn("flex flex-col items-center gap-6", className)}>
        <Button
          onClick={handleStart}
          size="lg"
          className="gap-3 bg-red-600 text-white shadow-2xl shadow-red-600/40 hover:bg-red-500 rounded-full px-10 py-7 text-base font-semibold"
        >
          <Phone className="size-5" />
          Iniciar llamada con IA
        </Button>
        {error && (
          <p className="text-sm text-red-500 text-center max-w-xs">{error}</p>
        )}
      </div>
    );
  }

  // ─── ACTIVE CALL: Full-screen voice UI ───
  return (
    <div className={cn("fixed inset-0 z-50 flex flex-col bg-black", className)}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-gray-900" />

      {/* Animated orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-500",
            status === "speaking"
              ? "size-64 bg-red-500/20 blur-3xl"
              : status === "listening"
                ? "size-48 bg-blue-500/15 blur-3xl"
                : "size-32 bg-white/5 blur-3xl",
          )}
        />
        <div
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-700",
            status === "speaking"
              ? "size-96 bg-red-500/10 blur-3xl"
              : status === "listening"
                ? "size-64 bg-blue-500/10 blur-3xl"
                : "size-48 bg-white/5 blur-3xl",
          )}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-600/30">
            <Siren className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">SOS-24 IA</p>
            <p className="text-xs text-white/50">
              {status === "connecting" && "Conectando..."}
              {status === "connected" && formatDuration(callDuration)}
              {status === "listening" && "Escuchando..."}
              {status === "speaking" && "Hablando..."}
              {status === "error" && "Error"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
        >
          {isMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
        </button>
      </div>

      {/* Center: Voice visualization */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-8">
        {/* Animated rings */}
        <div className="relative size-40">
          {/* Outer ring */}
          <div
            className={cn(
              "absolute inset-0 rounded-full border-2 transition-all duration-300",
              status === "speaking"
                ? "border-red-500/60 scale-110"
                : status === "listening"
                  ? "border-blue-400/40 scale-105"
                  : "border-white/10",
            )}
          />
          {/* Middle ring */}
          <div
            className={cn(
              "absolute inset-4 rounded-full border transition-all duration-300",
              status === "speaking"
                ? "border-red-400/40 scale-110"
                : status === "listening"
                  ? "border-blue-300/30 scale-105"
                  : "border-white/5",
            )}
          />
          {/* Inner circle with AI avatar */}
          <div
            className={cn(
              "absolute inset-8 rounded-full flex items-center justify-center transition-all duration-300",
              status === "speaking"
                ? "bg-gradient-to-br from-red-500 to-red-600 shadow-2xl shadow-red-500/40"
                : status === "listening"
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-2xl shadow-blue-500/30"
                  : "bg-gradient-to-br from-gray-700 to-gray-800 shadow-xl",
            )}
          >
            {status === "connecting" ? (
              <Loader2 className="size-8 text-white animate-spin" />
            ) : (
              <Siren className="size-8 text-white" />
            )}
          </div>
        </div>

        {/* Audio visualizer canvas */}
        <canvas
          ref={canvasRef}
          width={300}
          height={60}
          className="opacity-60"
        />

        {/* Status text */}
        <div className="text-center">
          <p className="text-lg font-medium text-white">
            {status === "connecting" && "Conectando con la IA..."}
            {status === "connected" && "Lista para escuchar"}
            {status === "listening" && "Te estoy escuchando..."}
            {status === "speaking" && "Procesando información..."}
            {status === "error" && "Error de conexión"}
          </p>
          <p className="mt-1 text-sm text-white/40">
            {status === "listening" && "Habla con calma, la IA te guiará"}
            {status === "speaking" && "La IA está analizando tu reporte"}
          </p>
        </div>
      </div>

      {/* Transcript */}
      {transcript.length > 0 && (
        <div className="relative z-10 mx-6 max-h-32 overflow-y-auto rounded-2xl bg-white/5 p-4 backdrop-blur-sm border border-white/10">
          {transcript.slice(-4).map((msg, i) => (
            <p
              key={i}
              className={cn(
                "text-sm mb-1",
                msg.role === "assistant" ? "text-white/80" : "text-blue-300/80",
              )}
            >
              <span className="font-medium">
                {msg.role === "assistant" ? "IA: " : "Tú: "}
              </span>
              {msg.text}
            </p>
          ))}
        </div>
      )}

      {/* Bottom controls */}
      <div className="relative z-10 flex items-center justify-center gap-6 pb-12 pt-6">
        {/* End call button */}
        <button
          onClick={handleStop}
          className="flex size-16 items-center justify-center rounded-full bg-red-600 text-white shadow-2xl shadow-red-600/40 hover:bg-red-500 transition-all active:scale-95"
        >
          <PhoneOff className="size-7" />
        </button>
      </div>

      {/* Error overlay */}
      {error && status === "error" && (
        <div className="absolute bottom-24 left-0 right-0 z-20 flex justify-center px-6">
          <div className="rounded-xl bg-red-500/20 border border-red-500/30 px-4 py-3 text-sm text-red-300 backdrop-blur-sm">
            {error}
          </div>
        </div>
      )}
    </div>
  );
}
