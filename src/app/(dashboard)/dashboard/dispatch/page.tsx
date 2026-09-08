"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ASSIGNMENT_STATUS_META,
  AssignmentStatusBadge,
  PriorityBadge,
} from "@/components/dashboard/badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LabeledSelect } from "@/components/ui/labeled-select";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet, apiPost, type Paged } from "@/lib/api/client";
import { qk } from "@/lib/query-keys";

// ============================================================
// PÁGINA: DESPACHO
// Asignaciones de todas las emergencias con sus acciones del flujo:
// aceptar / rechazar (institución) · salir, llegar, finalizar, cancelar.
// ============================================================

type DispatchRow = {
  PK_assignment: number;
  status: string;
  assignedAt: string;
  tbinstitutions: { name: string; acronym: string } | null;
  tbunits: { unitCode: string; unitName: string } | null;
  tbemergencies: {
    PK_emergency: number;
    emergencyCode: string;
    priority: string;
    description: string | null;
    status: string;
  };
  _count: { tbassignmenttracking: number };
};

/** Botones de acción según el estado de la asignación. */
function AssignmentActions({ row, onDone }: { row: DispatchRow; onDone: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const op = useMutation({
    mutationFn: async (action: string) => {
      const res = await fetch(`/api/dashboard/dispatch/${row.PK_assignment}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        ...(action === "reject" ? { body: JSON.stringify({ reason: "Rechazada desde el panel" }) } : {}),
      });
      if (!res.ok) throw new Error(((await res.json()) as { message?: string }).message ?? "Error");
      return res.json();
    },
    onSuccess: onDone,
    onError: (err: Error) => setError(err.message),
  });

  const actions: { op: string; label: string; variant?: "default" | "outline" | "destructive" | "secondary" }[] = [];
  if (row.status === "SOLICITADA") {
    actions.push({ op: "accept", label: "Aceptar", variant: "default" });
    actions.push({ op: "reject", label: "Rechazar", variant: "destructive" });
  }
  if (row.status === "ACEPTADA") actions.push({ op: "depart", label: "Unidad sale", variant: "default" });
  if (row.status === "EN_CAMINO") actions.push({ op: "arrive", label: "Llegó al sitio" });
  if (row.status === "EN_SITIO") actions.push({ op: "complete", label: "Finalizar", variant: "default" });
  if (["SOLICITADA", "ACEPTADA"].includes(row.status)) {
    actions.push({ op: "cancel", label: "Cancelar", variant: "outline" });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {actions.map((action) => (
        <Button
          key={action.op}
          size="sm"
          variant={action.variant ?? "default"}
          disabled={op.isPending}
          onClick={() => op.mutate(action.op)}
        >
          {action.label}
        </Button>
      ))}
      {error && <span className="text-xs font-medium text-destructive">{error}</span>}
    </div>
  );
}

export default function DispatchPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("open");
  const [search, setSearch] = useState("");

  const params = new URLSearchParams({ pageSize: "50" });
  if (statusFilter === "open") {
    params.set("status", ["SOLICITADA", "ACEPTADA", "EN_CAMINO", "EN_SITIO"].join(","));
  } else if (statusFilter !== "all") {
    params.set("status", statusFilter);
  }
  if (search.trim()) params.set("emergencyCode", search.trim());

  const list = useQuery({
    queryKey: qk.assignments(params.toString()),
    queryFn: () => apiGet<Paged<DispatchRow>>(`/api/dashboard/dispatch?${params}`),
    refetchInterval: 15_000,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["assignments"] });
    void queryClient.invalidateQueries({ queryKey: ["stats"] });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-xl font-semibold tracking-tight">Despacho</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Solicitudes y seguimiento de unidades asignadas a emergencias.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <Input
          placeholder="Buscar por código SOS-..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <LabeledSelect
          options={[
            { label: "En curso", value: "open" },
            { label: "Todos", value: "all" },
            ...Object.entries(ASSIGNMENT_STATUS_META).map(([value, meta]) => ({
              label: meta.label,
              value,
            })),
          ]}
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(String(v))}
        />
      </div>

      <div className="space-y-2">
        {list.isLoading &&
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}

        {(list.data?.items ?? []).map((row) => (
          <Card key={row.PK_assignment}>
            <CardContent className="space-y-2 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/dashboard/emergencies/${row.tbemergencies.PK_emergency}`}
                  className="font-mono text-xs font-semibold text-primary underline-offset-4 hover:underline"
                >
                  {row.tbemergencies.emergencyCode}
                </Link>
                <PriorityBadge value={row.tbemergencies.priority} />
                <AssignmentStatusBadge value={row.status} />
                <span className="ml-auto text-xs text-muted-foreground">
                  {new Date(row.assignedAt).toLocaleString("es-BO")}
                </span>
              </div>
              <p className="line-clamp-1 text-sm">{row.tbemergencies.description ?? "(sin descripción)"}</p>
              <p className="text-sm">
                <span className="font-medium">{row.tbunits?.unitCode ?? row.tbinstitutions?.acronym}</span>{" "}
                <span className="text-muted-foreground">
                  · {row.tbunits?.unitName ?? row.tbinstitutions?.name}
                  {row._count.tbassignmenttracking > 0 &&
                    ` · ${row._count.tbassignmenttracking} puntos GPS`}
                </span>
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <AssignmentActions row={row} onDone={invalidate} />
                <Link
                  href={`/dashboard/dispatch/${row.PK_assignment}`}
                  className="text-xs text-primary underline-offset-4 hover:underline"
                >
                  Ver rastreo →
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}

        {!list.isLoading && (list.data?.items.length ?? 0) === 0 && (
          <p className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
            No hay despachos que coincidan con los filtros.
          </p>
        )}
      </div>
    </div>
  );
}
