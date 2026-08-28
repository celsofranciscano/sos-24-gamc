"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { GoogleMap, type MapMarker } from "@/components/maps/google-map";
import { apiGet } from "@/lib/api/client";
import { qk } from "@/lib/query-keys";

// ============================================================
// PÁGINA: MAPA OPERATIVO
// Emergencias activas (color = prioridad) + posiciones GPS de
// todas las unidades. Se actualiza con el canal en tiempo real.
// ============================================================

type EmergencyMapRow = {
  PK_emergency: number;
  emergencyCode: string;
  priority: string;
  status: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  activeAssignments: number;
};

type UnitPosition = {
  PK_unit: number;
  unitCode: string;
  status: string;
  resourceType: string | null;
  institution: string | null;
  latitude: number | null;
  longitude: number | null;
};

export default function EmergencyMapPage() {
  const emergencies = useQuery({
    queryKey: qk.emergencies("map"),
    queryFn: () =>
      apiGet<{ items: EmergencyMapRow[] }>("/api/dashboard/emergencies/map"),
  });
  const units = useQuery({
    queryKey: qk.units("positions"),
    queryFn: () => apiGet<{ items: UnitPosition[] }>("/api/dashboard/units/positions"),
  });

  if (emergencies.isLoading || units.isLoading) {
    return <Skeleton className="h-[70vh] w-full" />;
  }

  const emergencyItems = emergencies.data?.items ?? [];

  const emergencyMarkers: MapMarker[] = emergencyItems
    .filter((emergency) => emergency.latitude != null && emergency.longitude != null)
    .map((emergency) => ({
      id: `em-${emergency.PK_emergency}`,
      lat: emergency.latitude as number,
      lng: emergency.longitude as number,
      color:
        emergency.priority === "CRITICA" ? "#dc2626"
        : emergency.priority === "ALTA" ? "#ea580c"
        : emergency.priority === "MEDIA" ? "#f59e0b"
        : "#94a3b8",
      title: `${emergency.emergencyCode}${emergency.address ? ` · ${emergency.address}` : ""}`,
    }));

  const unitMarkers: MapMarker[] = (units.data?.items ?? [])
    .filter((unit) => unit.latitude != null && unit.longitude != null)
    .map((unit) => ({
      id: `unit-${unit.PK_unit}`,
      lat: unit.latitude as number,
      lng: unit.longitude as number,
      color: "#2563eb",
      title: `${unit.unitCode} · ${unit.resourceType ?? "Unidad"}`,
    }));

  const markers = [...emergencyMarkers, ...unitMarkers];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-xl font-semibold tracking-tight">Mapa operativo</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Emergencias activas y unidades en el mapa de Cochabamba.
        </p>
      </div>

      <GoogleMap markers={markers} zoom={12} className="h-[65vh]" />

      <Card>
        <CardContent className="py-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Rojo/naranja/ámbar = emergencia según prioridad</span>
            <span>Azul = unidad</span>
            <Badge variant="outline" className="ml-auto">{emergencyItems.length} emergencias activas</Badge>
            <Badge variant="outline">{(units.data?.items ?? []).filter((u) => u.latitude != null).length} unidades con GPS</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
