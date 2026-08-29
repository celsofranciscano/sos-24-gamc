"use client";

import { useEffect, useState } from "react";
import { Siren, Clock, CheckCircle2 } from "lucide-react";

type Stats = {
  active: number;
  recent: number;
};

export function EmergencyQuickStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/citizen/emergencies")
      .then((res) => res.json())
      .then((data) => {
        const emergencies = data.emergencies || [];
        const active = emergencies.filter(
          (e: { status: string }) =>
            !["RESUELTA", "CANCELADA", "FALSA_ALARMA"].includes(e.status),
        ).length;
        const recent = emergencies.length;
        setStats({ active, recent });
      })
      .catch(() => setStats({ active: 0, recent: 0 }));
  }, []);

  if (!stats) return null;

  return (
    <div className="flex gap-3">
      <div className="flex flex-1 items-center gap-2.5 rounded-xl border bg-card px-3 py-2.5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
          <Siren className="size-4" />
        </div>
        <div>
          <p className="text-lg font-bold leading-none">{stats.active}</p>
          <p className="text-[10px] text-muted-foreground">Activas</p>
        </div>
      </div>
      <div className="flex flex-1 items-center gap-2.5 rounded-xl border bg-card px-3 py-2.5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
          <Clock className="size-4" />
        </div>
        <div>
          <p className="text-lg font-bold leading-none">{stats.recent}</p>
          <p className="text-[10px] text-muted-foreground">Reportes</p>
        </div>
      </div>
    </div>
  );
}
