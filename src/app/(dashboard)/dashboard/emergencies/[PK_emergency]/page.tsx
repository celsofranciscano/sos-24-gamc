"use client";

import { use } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon, RefreshCwIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { LabeledSelect } from "@/components/ui/labeled-select";
import {
  EMERGENCY_STATUS_META,
  EmergencyStatusBadge,
  PriorityBadge,
} from "@/components/dashboard/badges";
import { apiGet, apiPatch } from "@/lib/api/client";
import { qk } from "@/lib/query-keys";
import { EmergencyTabs } from "./emergency-tabs";

// ============================================================
// PÁGINA: EXPEDIENTE COMPLETO DE LA EMERGENCIA
// Cabecera con clasificación y estado + pestañas con todas las
// piezas del flujo SOS-24 (reportes, IA, despacho, sala, GPS...).
// ============================================================

export type EmergencyDetail = {
  PK_emergency: number;
  emergencyCode: string;
  priority: string;
  status: string;
  description: string | null;
  affectedPersons: number | null;
  affectedAnimals: number | null;
  trappedPersons: number | null;
  missingPersons: number | null;
  reportedAt: string;
  resolvedAt: string | null;
  tbcitizens: {
    PK_citizen: number;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  } | null;
  tbemergencytypes: { PK_emergencyType: number; name: string } | null;
  parentEmergency: { PK_emergency: number; emergencyCode: string } | null;
  childEmergencies: { PK_emergency: number; emergencyCode: string }[];
  tbemergencyroom: { PK_room: number; roomCode: string; isOpen: boolean } | null;
};

const TABS = [
  "resumen",
  "mapa",
  "reportes",
  "ia",
  "requerimientos",
  "asignaciones",
  "sala",
  "avances",
  "evidencias",
  "destinos",
  "historial",
] as const;

type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  resumen: "Resumen",
  mapa: "Mapa y GPS",
  reportes: "Reportes",
  ia: "Análisis IA",
  requerimientos: "Requerimientos",
  asignaciones: "Asignaciones",
  sala: "Sala común",
  avances: "Avances",
  evidencias: "Evidencias",
  destinos: "Destinos",
  historial: "Historial",
};

function EmergencyHeader({ detail }: { detail: EmergencyDetail }) {
  const queryClient = useQueryClient();

  const patchMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiPatch(`/api/dashboard/emergencies/${detail.PK_emergency}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.emergency(detail.PK_emergency) }),
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/emergencies"
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
          aria-label="Volver"
        >
          <ArrowLeftIcon />
        </Link>
        <h1 className="font-mono text-lg font-semibold tracking-tight">{detail.emergencyCode}</h1>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <PriorityBadge value={detail.priority} />
          <EmergencyStatusBadge value={detail.status} />
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Actualizar"
            onClick={() => queryClient.invalidateQueries({ queryKey: qk.emergency(detail.PK_emergency) })}
          >
            <RefreshCwIcon />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span>Tipo: {detail.tbemergencytypes?.name ?? "Sin clasificar"}</span>
        <span>
          Reportante:{" "}
          {detail.tbcitizens
            ? `${detail.tbcitizens.firstName} ${detail.tbcitizens.lastName} (${detail.tbcitizens.phoneNumber})`
            : "Operador / sin ciudadano"}
        </span>
        <span>Reportada: {new Date(detail.reportedAt).toLocaleString("es-BO")}</span>
        {detail.parentEmergency && (
          <Link
            href={`/dashboard/emergencies/${detail.parentEmergency.PK_emergency}`}
            className="text-primary underline-offset-4 hover:underline"
          >
            Vinculada a {detail.parentEmergency.emergencyCode}
          </Link>
        )}
        {detail.childEmergencies.length > 0 && (
          <Badge variant="secondary">
            {detail.childEmergencies.length} reporte(s) agrupado(s)
          </Badge>
        )}
      </div>

      {/* Cambio de estado (Central GAMC) */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-2 py-3">
          <span className="text-xs font-medium text-muted-foreground">Cambiar estado:</span>
          <LabeledSelect
            className="w-44"
            options={Object.entries(EMERGENCY_STATUS_META)
              .filter(([value]) => value !== "AGRUPADA_DUPLICADA")
              .map(([value, meta]) => ({ label: meta.label, value }))}
            value={detail.status}
            onValueChange={(status) => patchMutation.mutate({ status })}
          />
          {patchMutation.isPending && <span className="text-xs text-muted-foreground">Guardando...</span>}
          {detail.tbemergencyroom && (
            <Badge variant={detail.tbemergencyroom.isOpen ? "success" : "secondary"} className="ml-auto">
              Sala {detail.tbemergencyroom.roomCode}: {detail.tbemergencyroom.isOpen ? "abierta" : "cerrada"}
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function EmergencyDetailPage({
  params,
}: {
  params: Promise<{ PK_emergency: string }>;
}) {
  const { PK_emergency } = use(params);
  const id = Number(PK_emergency);

  const { data: detail, isLoading } = useQuery({
    queryKey: qk.emergency(id),
    queryFn: () => apiGet<EmergencyDetail>(`/api/dashboard/emergencies/${id}`),
    refetchInterval: 30_000,
  });

  if (isLoading || !detail) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <EmergencyHeader detail={detail} />
      <EmergencyTabs detail={detail} />
    </div>
  );
}
