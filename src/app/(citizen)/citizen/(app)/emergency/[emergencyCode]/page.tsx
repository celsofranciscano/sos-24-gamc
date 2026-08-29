"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  Building2,
  MessageCircle,
  Clock,
  FileImage,
  MapPin,
  Navigation,
  Phone,
  Shield,
  Siren,
  Truck,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";

type Emergency = {
  PK_emergency: number;
  emergencyCode: string;
  priority: string;
  status: string;
  description: string | null;
  affectedPersons: number | null;
  reportedAt: string;
  acceptedAt: string | null;
  resolvedAt: string | null;
  tbemergencytypes: { name: string; code: string } | null;
  tbemergencylocations: Array<{
    latitude: number;
    longitude: number;
    address: string | null;
  }>;
  tbemergencyassignments: Array<{
    PK_assignment: number;
    status: string;
    assignedAt: string;
    tbinstitutions: { name: string; acronym: string | null };
    tbunits: { unitCode: string; unitName: string; status: string } | null;
  }>;
  tbemergencystatushistory: Array<{
    newStatus: string;
    changeReason: string | null;
    createdAt: string;
  }>;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  REPORTADA: { label: "Reportada", color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-950" },
  EN_ANALISIS: { label: "En análisis", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-950" },
  CLASIFICADA: { label: "Clasificada", color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-950" },
  ASIGNADA: { label: "Asignada", color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-950" },
  EN_ATENCION: { label: "En atención", color: "text-green-600", bg: "bg-green-100 dark:bg-green-950" },
  RESUELTA: { label: "Resuelta", color: "text-green-700", bg: "bg-green-50 dark:bg-green-950" },
  CANCELADA: { label: "Cancelada", color: "text-gray-600", bg: "bg-gray-100 dark:bg-gray-950" },
};

const PRIORITY_CONFIG: Record<string, string> = {
  BAJA: "text-blue-600 bg-blue-100 dark:bg-blue-950",
  MEDIA: "text-yellow-600 bg-yellow-100 dark:bg-yellow-950",
  ALTA: "text-orange-600 bg-orange-100 dark:bg-orange-950",
  CRITICA: "text-red-600 bg-red-100 dark:bg-red-950 animate-pulse",
};

export default function EmergencyDetailPage() {
  const params = useParams();
  const emergencyCode = params.emergencyCode as string;
  const [emergency, setEmergency] = useState<Emergency | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/citizen/emergencies`)
      .then((res) => res.json())
      .then((data) => {
        const found = (data.emergencies || []).find(
          (e: Emergency) => e.emergencyCode === emergencyCode,
        );
        if (found) {
          // Fetch full detail
          return fetch(`/api/citizen/emergencies/${found.PK_emergency}`);
        }
        return null;
      })
      .then((res) => res?.json())
      .then((data) => {
        if (data?.emergency) setEmergency(data.emergency);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [emergencyCode]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!emergency) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <Siren className="size-12 text-muted-foreground/30" />
        <p className="text-muted-foreground">Emergencia no encontrada</p>
        <Link href="/citizen" className="text-sm text-red-500 font-medium">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[emergency.status] || STATUS_CONFIG.REPORTADA;
  const location = emergency.tbemergencylocations[0];

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
        <div className="flex-1">
          <h1 className="text-base font-semibold font-mono">
            {emergency.emergencyCode}
          </h1>
          <p className="text-xs text-muted-foreground">
            {emergency.tbemergencytypes?.name || "Emergencia"}
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-semibold",
            statusConfig.bg,
            statusConfig.color,
          )}
        >
          {statusConfig.label}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Priority + Status */}
        <div className="flex gap-2">
          <div
            className={cn(
              "rounded-xl px-3 py-2 text-xs font-bold",
              PRIORITY_CONFIG[emergency.priority],
            )}
          >
            {emergency.priority}
          </div>
          <div className="rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            <Clock className="mr-1 inline size-3" />
            {new Date(emergency.reportedAt).toLocaleString("es-BO")}
          </div>
        </div>

        {/* Description */}
        {emergency.description && (
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-sm">{emergency.description}</p>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-2">
          <Link
            href={`/citizen/emergency/${emergencyCode}/chat`}
            className="flex flex-col items-center gap-1.5 rounded-xl border bg-card p-3 text-center transition-colors hover:bg-muted"
          >
            <MessageCircle className="size-5 text-blue-500" />
            <span className="text-[10px] font-medium">Chat</span>
          </Link>
          <Link
            href={`/citizen/emergency/${emergencyCode}/tracking`}
            className="flex flex-col items-center gap-1.5 rounded-xl border bg-card p-3 text-center transition-colors hover:bg-muted"
          >
            <Navigation className="size-5 text-green-500" />
            <span className="text-[10px] font-medium">Seguimiento</span>
          </Link>
          <Link
            href={`/citizen/emergency/${emergencyCode}/evidence`}
            className="flex flex-col items-center gap-1.5 rounded-xl border bg-card p-3 text-center transition-colors hover:bg-muted"
          >
            <FileImage className="size-5 text-purple-500" />
            <span className="text-[10px] font-medium">Evidencias</span>
          </Link>
        </div>

        {/* Assignments */}
        {emergency.tbemergencyassignments.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Unidades asignadas
            </h3>
            {emergency.tbemergencyassignments.map((assignment) => (
              <div
                key={assignment.PK_assignment}
                className="flex items-center gap-3 rounded-xl border bg-card p-3"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
                  <Truck className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {assignment.tbunits?.unitName || assignment.tbinstitutions.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {assignment.tbinstitutions.name}
                  </p>
                </div>
                <span className="text-[10px] font-medium text-muted-foreground">
                  {assignment.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Timeline */}
        {emergency.tbemergencystatushistory.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Historial
            </h3>
            <div className="space-y-0">
              {emergency.tbemergencystatushistory.map((event, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="size-2 rounded-full bg-red-500 mt-1.5" />
                    {i < emergency.tbemergencystatushistory.length - 1 && (
                      <div className="w-0.5 flex-1 bg-border" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium">{event.newStatus}</p>
                    {event.changeReason && (
                      <p className="text-xs text-muted-foreground">
                        {event.changeReason}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(event.createdAt).toLocaleString("es-BO")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
