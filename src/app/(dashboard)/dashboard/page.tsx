"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Radio,
  Siren,
  TruckIcon,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmergencyStatusBadge } from "@/components/dashboard/badges";
import { apiGet } from "@/lib/api/client";
import { qk } from "@/lib/query-keys";

type StatsResponse = {
  kpis: {
    activeEmergencies: number;
    criticalActive: number;
    reportedToday: number;
    resolvedTotal: number;
    pendingAssignments: number;
    unitsAvailable: number;
    unitsTotal: number;
    avgResponseMinutes: number | null;
  };
  recentActivity: {
    PK_statusHistory: number;
    previousStatus: string | null;
    newStatus: string;
    createdAt: string;
    tbemergencies: { emergencyCode: string };
  }[];
};

export default function DashboardHomePage() {
  const { data, isLoading } = useQuery({
    queryKey: qk.stats(),
    queryFn: () => apiGet<StatsResponse>("/api/dashboard/stats"),
  });

  const kpis = data?.kpis;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          Centro de coordinación
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Panorama general del sistema de emergencias SOS-24 en tiempo real.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Emergencias activas"
          value={kpis?.activeEmergencies}
          hint={`${kpis?.reportedToday ?? 0} reportadas hoy`}
          icon={Siren}
          tone="danger"
          loading={isLoading}
        />
        <StatCard
          title="Críticas activas"
          value={kpis?.criticalActive}
          hint="Requieren atención inmediata"
          icon={AlertTriangle}
          tone="warning"
          loading={isLoading}
        />
        <StatCard
          title="Solicitudes pendientes"
          value={kpis?.pendingAssignments}
          hint="Asignaciones sin aceptar"
          icon={Radio}
          tone="info"
          loading={isLoading}
        />
        <StatCard
          title="Unidades disponibles"
          value={kpis ? `${kpis.unitsAvailable}/${kpis.unitsTotal}` : undefined}
          hint="Sobre el total activo"
          icon={TruckIcon}
          tone="success"
          loading={isLoading}
        />
        <StatCard
          title="Casos resueltos"
          value={kpis?.resolvedTotal}
          hint="Histórico"
          icon={CheckCircle2}
          tone="success"
          loading={isLoading}
        />
        <StatCard
          title="Respuesta promedio"
          value={
            kpis?.avgResponseMinutes != null ? `${kpis.avgResponseMinutes} min` : "—"
          }
          hint="Reporte → resolución"
          icon={Clock3}
          loading={isLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actividad reciente</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (data?.recentActivity.length ?? 0) === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Sin actividad registrada todavía.
            </p>
          ) : (
            <ul className="divide-y">
              {data?.recentActivity.map((item) => (
                <li key={item.PK_statusHistory} className="flex items-center justify-between gap-3 py-2.5">
                  <Link
                    href={`/dashboard/emergencies?code=${item.tbemergencies.emergencyCode}`}
                    className="font-mono text-xs text-primary underline-offset-4 hover:underline"
                  >
                    {item.tbemergencies.emergencyCode}
                  </Link>
                  <span className="hidden flex-1 text-sm sm:block">
                    {item.previousStatus ? `${item.previousStatus} →` : ""} {item.newStatus}
                  </span>
                  <div className="flex items-center gap-3">
                    <EmergencyStatusBadge value={item.newStatus} />
                    <time className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {new Date(item.createdAt).toLocaleTimeString("es-BO", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
