"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Phone, ChevronRight, Building2, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

type Institution = {
  PK_institution: number;
  name: string;
  acronym: string | null;
  phoneNumber: string | null;
  email: string | null;
  address: string | null;
  tbinstitutiontypes: { name: string; code: string };
};

const TYPE_COLORS: Record<string, string> = {
  POLICE: "bg-blue-600",
  FIRE: "bg-orange-600",
  SAR: "bg-emerald-600",
  AMBULANCE: "bg-red-600",
  HEALTH: "bg-pink-600",
};

export default function EmergencyNumbersPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/citizen/emergency-numbers")
      .then((res) => res.json())
      .then((data) => {
        setInstitutions(data.institutions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex h-full flex-col">
      <section className="px-4 pt-5 pb-3">
        <h1 className="text-xl font-semibold">Números de emergencia</h1>
        <p className="text-sm text-muted-foreground">
          Instituciones de respuesta
        </p>
      </section>

      <div className="flex-1 overflow-y-auto px-4 pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : institutions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="size-12 text-muted-foreground/30" />
            <p className="mt-2 text-sm text-muted-foreground">
              No hay instituciones disponibles
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {institutions.map((inst) => {
              const typeCode = inst.tbinstitutiontypes.code;
              const color = TYPE_COLORS[typeCode] || "bg-gray-600";

              return (
                <Link
                  key={inst.PK_institution}
                  href={`/citizen/emergency-numbers/${inst.PK_institution}`}
                  className="flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:bg-muted"
                >
                  <div
                    className={cn(
                      "flex size-11 items-center justify-center rounded-xl text-xs font-bold text-white",
                      color,
                    )}
                  >
                    {inst.acronym || inst.name.slice(0, 3).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{inst.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {inst.tbinstitutiontypes.name}
                    </p>
                  </div>
                  {inst.phoneNumber && (
                    <a
                      href={`tel:${inst.phoneNumber}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex size-9 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400"
                    >
                      <Phone className="size-4" />
                    </a>
                  )}
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
