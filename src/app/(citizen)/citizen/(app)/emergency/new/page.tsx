"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Send,
  Siren,
  Loader2,
  CheckCircle2,
  Phone,
} from "lucide-react";

import { RealtimeVoice } from "@/components/citizen/realtime-voice";
import { CitizenMap } from "@/components/citizen/citizen-map";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Step = "location" | "report" | "submitting" | "done";

export default function NewEmergencyPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("location");
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emergencyCode, setEmergencyCode] = useState<string | null>(null);
  const [showVoiceCall, setShowVoiceCall] = useState(false);

  const handleLocationDetected = useCallback(
    (coords: { latitude: number; longitude: number }) => {
      setLocation(coords);
      if (step === "location") {
        setTimeout(() => setStep("report"), 1500);
      }
    },
    [step],
  );

  // AI creates emergency via tool calling
  const handleEmergencyCreated = useCallback(
    (code: string) => {
      setEmergencyCode(code);
      setShowVoiceCall(false);
      setStep("done");
      setTimeout(() => {
        router.push(`/citizen/emergency/${code}`);
      }, 2500);
    },
    [router],
  );

  // Manual submit
  const handleSubmit = useCallback(async () => {
    if (!location) return;
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/citizen/emergency/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          latitude: location.latitude,
          longitude: location.longitude,
          address,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "No se pudo reportar.");
      }

      const data = await response.json();
      setEmergencyCode(data.emergencyCode);
      setStep("done");
      setTimeout(() => {
        router.push(`/citizen/emergency/${data.emergencyCode}`);
      }, 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión.");
      setSubmitting(false);
    }
  }, [location, description, address, router]);

  // Full-screen voice call
  if (showVoiceCall) {
    return (
      <RealtimeVoice
        instructions="Eres SOS-24, un asistente de emergencias. Tu objetivo es recopilar información y crear una emergencia. Sé breve, calmado y directo. Pregunta: qué sucede, dónde, personas afectadas. Cuando tengas info suficiente, usa create_emergency."
        latitude={location?.latitude}
        longitude={location?.longitude}
        onEmergencyCreated={handleEmergencyCreated}
        onDataCollected={(data) => {
          if (data.description) setDescription(data.description);
        }}
        onStatusChange={(s) => {
          if (s === "disconnected" && !emergencyCode) {
            setShowVoiceCall(false);
          }
        }}
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Link
          href="/citizen"
          className="flex size-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-base font-semibold">Reportar emergencia</h1>
          <p className="text-xs text-muted-foreground">
            {step === "location" && "Obteniendo tu ubicación..."}
            {step === "report" && "Elige cómo reportar"}
            {step === "submitting" && "Enviando reporte..."}
            {step === "done" && "Emergencia reportada"}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Step: Location */}
        {step === "location" && (
          <div className="flex flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
              <MapPin className="size-8" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Detectando ubicación</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Necesitamos tu ubicación para enviar ayuda
              </p>
            </div>
            <CitizenMap
              showMyLocation
              onLocationChange={handleLocationDetected}
              height="200px"
              className="w-full"
            />
            {location && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="size-4" />
                Ubicación detectada
              </div>
            )}
          </div>
        )}

        {/* Step: Report */}
        {step === "report" && (
          <div className="flex flex-col gap-4 p-4">
            {/* Map */}
            <CitizenMap
              center={location || undefined}
              markers={
                location
                  ? [{ id: "me", latitude: location.latitude, longitude: location.longitude, label: "Tú", color: "red" }]
                  : []
              }
              height="160px"
              className="w-full"
            />

            {/* PRIMARY: Voice call with AI */}
            <div className="rounded-2xl border-2 border-red-200 dark:border-red-900 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 p-6 text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-600 text-white shadow-xl shadow-red-600/30">
                <Phone className="size-8" />
              </div>
              <h3 className="text-lg font-bold">Habla con la IA</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
                La inteligencia artificial te guiará, recopilará los datos y creará la emergencia automáticamente
              </p>
              <Button
                onClick={() => setShowVoiceCall(true)}
                size="lg"
                className="mt-4 gap-2 bg-red-600 text-white shadow-lg shadow-red-600/30 hover:bg-red-500 rounded-full px-8"
              >
                <Phone className="size-5" />
                Iniciar llamada
              </Button>
            </div>

            {/* SECONDARY: Manual text */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">o escribe</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                ¿Qué está sucediendo?
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe brevemente la emergencia..."
                className="min-h-[100px] resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pb-4">
              <Button
                variant="outline"
                onClick={() => setStep("location")}
                className="flex-1"
              >
                Volver
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!location || submitting || !description}
                className="flex-1 gap-2 bg-red-600 text-white hover:bg-red-500"
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                Enviar reporte
              </Button>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
          </div>
        )}

        {/* Step: Done */}
        {step === "done" && (
          <div className="flex flex-col items-center justify-center gap-4 p-6 text-center min-h-[60vh]">
            <div className="flex size-20 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400 animate-bounce">
              <CheckCircle2 className="size-10" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Emergencia reportada</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Código: <span className="font-mono font-bold text-foreground">{emergencyCode}</span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                La ayuda está en camino...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
