"use client";

import { use } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon, NavigationIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AssignmentStatusBadge, PriorityBadge, UnitStatusBadge } from "@/components/dashboard/badges";
import { GoogleMap, type MapMarker, type MapPath } from "@/components/maps/google-map";
import { apiGet, apiPost } from "@/lib/api/client";
import { qk } from "@/lib/query-keys";

// ============================================================
// PÁGINA: DETALLE DE DESPACHO + RASTREO GPS
// Ruta recorrida por la unidad (Google Maps) y simulador de pings
// para pruebas del flujo sin dispositivos reales.
// ============================================================

type AssignmentDetail = {
  PK_assignment: number;
  status: string;
  assignedAt: string;
  acceptedAt: string | null;
  arrivedAt: string | null;
  completedAt: string | null;
  FK_emergency: number;
  tbinstitutions: { name: string; acronym: string; latitude: number | null; longitude: number | null };
  tbsubinstitutions: { name: string } | null;
  tbunits: { PK_unit: number; unitCode: string; unitName: string } | null;
  tbemergencies: { emergencyCode: string; priority: string; status: string; description: string | null };
};

type TrackingResponse = {
  points: { latitude: number; longitude: number; speed: number | null; createdAt: string }[];
  current: { latitude: number; longitude: number; createdAt: string } | null;
};

export default function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ PK_assignment: string }>;
}) {
  const { PK_assignment } = use(params);
  const id = Number(PK_assignment);
  const queryClient = useQueryClient();

  const detail = useQuery({
    queryKey: ["assignments", "detail", id],
    queryFn: () => apiGet<AssignmentDetail>(`/api/dashboard/dispatch/${id}`),
  });

  const tracking = useQuery({
    queryKey: qk.assignmentTracking(id),
    queryFn: () => apiGet<TrackingResponse>(`/api/dashboard/dispatch/${id}/tracking`),
    refetchInterval: detail.data?.status === "EN_CAMINO" ? 10_000 : false,
  });

  const simulate = useMutation({
    mutationFn: async () => {
      if (!tracking.data?.current || !detail.data) throw new Error("Sin punto previo");
      // Simula avance: punto intermedio hacia la última ubicación conocida de la emergencia.
      const locations = await apiGet<{ latitude: number; longitude: number }[]>(
        `/api/dashboard/emergencies/${detail.data.FK_emergency}/locations`,
      );
      const target = locations.at(-1);
      const current = tracking.data.current;
      const body =
        target != null
          ? {
              latitude: current.latitude + (target.latitude - current.latitude) * 0.35,
              longitude: current.longitude + (target.longitude - current.longitude) * 0.35,
              speed: 42,
            }
          : { latitude: current.latitude, longitude: current.longitude, speed: 42 };
      return apiPost(`/api/dashboard/dispatch/${id}/tracking`, body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.assignmentTracking(id) });
    },
  });

  if (detail.isLoading || !detail.data || tracking.isLoading || !tracking.data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const data = detail.data;
  const unitCode = data.tbunits?.unitCode ?? data.tbinstitutions.acronym;

  const incidentMarkers: MapMarker[] =
    tracking.data.current != null
      ? [
          {
            id: "unit-now",
            lat: tracking.data.current.latitude,
            lng: tracking.data.current.longitude,
            color: "#2563eb",
            title: `${unitCode} (posición actual)`,
          },
        ]
      : [];

  const routePath: MapPath[] =
    tracking.data.points.length > 1
      ? [
          {
            id: "route",
            color: "#2563eb",
            points: tracking.data.points.map((p) => ({ lat: p.latitude, lng: p.longitude })),
          },
        ]
      : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/dashboard/dispatch"
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
          aria-label="Volver"
        >
          <ArrowLeftIcon />
        </Link>
        <h1 className="font-mono text-lg font-semibold">
          {data.tbemergencies.emergencyCode} · {unitCode}
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <PriorityBadge value={data.tbemergencies.priority} />
          <AssignmentStatusBadge value={data.status} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-0">
            <CardTitle className="text-base">Rastreo GPS</CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <GoogleMap markers={incidentMarkers} paths={routePath} zoom={14} className="h-96" />
            <p className="mt-2 text-xs text-muted-foreground">
              Azul: ruta recorrida · Marcador azul: posición actual de {unitCode}
            </p>
            {data.status === "EN_CAMINO" && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                disabled={simulate.isPending || !tracking.data.current}
                onClick={() => simulate.mutate()}
              >
                <NavigationIcon data-icon="inline-start" />
                Simular avance GPS
              </Button>
            )}
            {!tracking.data.current && (
              <p className="mt-2 text-xs text-muted-foreground">
                Sin puntos GPS todavía. Aparecen cuando la unidad sale (primer punto en su base)
                o al recibir pings.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base">Detalle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-3 text-sm">
            <Link
              href={`/dashboard/emergencies/${data.FK_emergency}`}
              className="block font-mono text-xs text-primary underline-offset-4 hover:underline"
            >
              Ver expediente {data.tbemergencies.emergencyCode} →
            </Link>
            <p className="text-muted-foreground">{data.tbemergencies.description ?? "(sin descripción)"}</p>
            <dl className="space-y-1 border-t pt-2 text-xs">
              <div className="flex justify-between"><dt className="text-muted-foreground">Institución</dt><dd>{data.tbinstitutions.name}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Unidad</dt><dd>{data.tbunits ? `${data.tbunits.unitCode} — ${data.tbunits.unitName}` : "Sin unidad específica"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Solicitada</dt><dd>{new Date(data.assignedAt).toLocaleString("es-BO")}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Aceptada</dt><dd>{data.acceptedAt ? new Date(data.acceptedAt).toLocaleString("es-BO") : "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Llegó</dt><dd>{data.arrivedAt ? new Date(data.arrivedAt).toLocaleString("es-BO") : "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Finalizada</dt><dd>{data.completedAt ? new Date(data.completedAt).toLocaleString("es-BO") : "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Puntos GPS</dt><dd>{tracking.data?.points.length ?? 0}</dd></div>
            </dl>
            {data.status === "EN_CAMINO" && (
              <Badge variant="info" className="mt-1">Actualización automática cada 10 s</Badge>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
