"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Siren, ChevronRight, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

type Emergency = {
  PK_emergency: number;
  emergencyCode: string;
  priority: string;
  status: string;
  description: string | null;
  reportedAt: string;
  tbemergencytypes: { name: string } | null;
  tbemergencyassignments: Array<{
    status: string;
    tbinstitutions: { name: string };
  }>;
};

const STATUS_COLORS: Record<string, string> = {
  REPORTADA: "text-yellow-600 bg-yellow-100 dark:bg-yellow-950",
  EN_ANALISIS: "text-blue-600 bg-blue-100 dark:bg-blue-950",
  CLASIFICADA: "text-purple-600 bg-purple-100 dark:bg-purple-950",
  ASIGNADA: "text-orange-600 bg-orange-100 dark:bg-orange-950",
  EN_ATENCION: "text-green-600 bg-green-100 dark:bg-green-950",
  RESUELTA: "text-green-700 bg-green-50 dark:bg-green-950",
  CANCELADA: "text-gray-600 bg-gray-100 dark:bg-gray-950",
};

export default function HistoryPage() {
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/citizen/emergencies")
      .then((res) => res.json())
      .then((data) => {
        setEmergencies(data.emergencies || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex h-full flex-col">
      <section className="px-4 pt-5 pb-3">
        <h1 className="text-xl font-semibold">Historial</h1>
        <p className="text-sm text-muted-foreground">
          Emergencias reportadas
        </p>
      </section>

      <div className="flex-1 overflow-y-auto px-4 pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : emergencies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Siren className="size-12 text-muted-foreground/30" />
            <p className="mt-2 text-sm text-muted-foreground">
              No hay emergencias reportadas
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {emergencies.map((emergency) => {
              const statusColor =
                STATUS_COLORS[emergency.status] || STATUS_COLORS.REPORTADA;
              const institution =
                emergency.tbemergencyassignments[0]?.tbinstitutions?.name;

              return (
                <Link
                  key={emergency.PK_emergency}
                  href={`/citizen/emergency/${emergency.emergencyCode}`}
                  className="flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:bg-muted"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
                    <Siren className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-mono font-medium truncate">
                        {emergency.emergencyCode}
                      </p>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          statusColor,
                        )}
                      >
                        {emergency.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {emergency.tbemergencytypes?.name || "Emergencia"}
                      {institution && ` · ${institution}`}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(emergency.reportedAt).toLocaleString("es-BO")}
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
