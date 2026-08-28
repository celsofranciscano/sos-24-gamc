"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusIcon, SearchIcon, SirenIcon } from "lucide-react";
import { SessionProvider, useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LabeledSelect } from "@/components/ui/labeled-select";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import {
  EMERGENCY_STATUS_META,
  EmergencyStatusBadge,
  PRIORITY_META,
  PriorityBadge,
} from "@/components/dashboard/badges";
import { apiGet, apiPost, type Paged } from "@/lib/api/client";
import { qk } from "@/lib/query-keys";

// ============================================================
// PÁGINA: LISTA DE EMERGENCIAS
// Filtros por estado/prioridad/búsqueda + actualización en vivo.
// La Central puede registrar emergencias manuales (por llamada).
// ============================================================

type EmergencyRow = {
  PK_emergency: number;
  emergencyCode: string;
  priority: string;
  status: string;
  description: string | null;
  reportCount: number;
  reportedAt: string;
  tbcitizens: { firstName: string; lastName: string; phoneNumber: string } | null;
  tbemergencytypes: { name: string } | null;
  _count: { tbemergencyreports: number; tbemergencyassignments: number };
};

const ACTIVE_STATUSES = ["REPORTADA", "EN_ANALISIS", "CLASIFICADA", "ASIGNADA", "EN_ATENCION"];

function EmergenciesContent() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const isCentral = (session?.user?.privilegeCode ?? "").startsWith("CENTRAL");

  const [search, setSearch] = useState(searchParams.get("code") ?? "");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);

  const params = new URLSearchParams({ pageSize: "50" });
  if (search.trim()) params.set("search", search.trim());
  if (statusFilter === "active") params.set("status", ACTIVE_STATUSES.join(","));
  else if (statusFilter !== "all") params.set("status", statusFilter);
  if (priorityFilter !== "all") params.set("priority", priorityFilter);

  const listQuery = useQuery({
    queryKey: qk.emergencies(params.toString()),
    queryFn: () => apiGet<Paged<EmergencyRow>>(`/api/dashboard/emergencies?${params}`),
  });

  const columns: DataTableColumn<EmergencyRow>[] = [
    {
      key: "emergencyCode",
      header: "Código",
      render: (row) => (
        <Link
          href={`/dashboard/emergencies/${row.PK_emergency}`}
          className="font-mono text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          {row.emergencyCode}
        </Link>
      ),
    },
    {
      key: "type",
      header: "Tipo",
      render: (row) => row.tbemergencytypes?.name ?? <span className="text-muted-foreground">Sin clasificar</span>,
    },
    { key: "priority", header: "Prioridad", render: (row) => <PriorityBadge value={row.priority} /> },
    { key: "status", header: "Estado", render: (row) => <EmergencyStatusBadge value={row.status} /> },
    { key: "reports", header: "Reportes", render: (row) => row._count.tbemergencyreports },
    {
      key: "assignments",
      header: "Asignaciones",
      render: (row) => row._count.tbemergencyassignments,
    },
    {
      key: "reportedAt",
      header: "Reportada",
      render: (row) => (
        <span className="text-xs tabular-nums">
          {new Date(row.reportedAt).toLocaleString("es-BO")}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight">Emergencias</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Casos únicos consolidados. Se actualizan en tiempo real.
          </p>
        </div>
        {isCentral && (
          <Button onClick={() => setCreateOpen(true)}>
            <PlusIcon data-icon="inline-start" />
            Registrar emergencia
          </Button>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="relative sm:col-span-1">
          <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Código o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <LabeledSelect
          options={[
            { label: "Activas", value: "active" },
            { label: "Todos los estados", value: "all" },
            ...Object.entries(EMERGENCY_STATUS_META).map(([value, meta]) => ({
              label: meta.label,
              value,
            })),
          ]}
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(String(v))}
        />
        <LabeledSelect
          options={[
            { label: "Toda prioridad", value: "all" },
            ...Object.entries(PRIORITY_META).map(([value, meta]) => ({
              label: meta.label,
              value,
            })),
          ]}
          value={priorityFilter}
          onValueChange={(v) => setPriorityFilter(String(v))}
        />
      </div>

      {listQuery.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={listQuery.data?.items ?? []}
          emptyMessage="No hay emergencias que coincidan con los filtros."
          onRowClick={(row) =>
            (window.location.href = `/dashboard/emergencies/${row.PK_emergency}`)
          }
          mobileTitle={(row) => (
            <span className="flex items-center gap-2 font-mono text-xs">
              <SirenIcon className="size-3.5 text-destructive" />
              {row.emergencyCode}
            </span>
          )}
        />
      )}

      {createOpen && (
        <CreateEmergencyDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={() => {
            setCreateOpen(false);
            void queryClient.invalidateQueries({ queryKey: ["emergencies"] });
            void queryClient.invalidateQueries({ queryKey: ["stats"] });
          }}
        />
      )}
    </div>
  );
}

function CreateEmergencyDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const typesQuery = useQuery({
    queryKey: qk.catalog("emergency-types", "options"),
    queryFn: () => apiGet<Paged<{ PK_emergencyType: number; name: string }>>("/api/dashboard/emergency-types?pageSize=200"),
  });

  const mutation = useMutation({
    mutationFn: (form: FormData) =>
      apiPost("/api/dashboard/emergencies", {
        description: String(form.get("description") ?? "") || null,
        FK_emergencyType: form.get("FK_emergencyType") ? Number(form.get("FK_emergencyType")) : null,
        priority: String(form.get("priority") ?? "MEDIA"),
        latitude: Number(form.get("latitude")),
        longitude: Number(form.get("longitude")),
        address: String(form.get("address") ?? "") || null,
      }),
    onSuccess: onCreated,
    onError: (err: Error) => setError(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar emergencia manual</DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            mutation.mutate(new FormData(e.currentTarget));
          }}
        >
          <div className="grid gap-1.5">
            <Label htmlFor="em-desc">Descripción</Label>
            <Textarea id="em-desc" name="description" placeholder="¿Qué está ocurriendo?" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="em-type">Tipo</Label>
              <select id="em-type" name="FK_emergencyType" className="h-8 rounded-lg border bg-transparent px-2 text-sm">
                <option value="">Sin clasificar</option>
                {(typesQuery.data?.items ?? []).map((t) => (
                  <option key={t.PK_emergencyType} value={t.PK_emergencyType}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="em-priority">Prioridad</Label>
              <select id="em-priority" name="priority" defaultValue="MEDIA" className="h-8 rounded-lg border bg-transparent px-2 text-sm">
                {Object.entries(PRIORITY_META).map(([value, meta]) => (
                  <option key={value} value={value}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="em-address">Dirección aproximada</Label>
            <Input id="em-address" name="address" placeholder="Av. XXXX, Cochabamba" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="em-lat">Latitud *</Label>
              <Input id="em-lat" name="latitude" type="number" step="any" defaultValue="-17.3895" required />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="em-lng">Longitud *</Label>
              <Input id="em-lng" name="longitude" type="number" step="any" defaultValue="-66.1568" required />
            </div>
          </div>
          {error && <p className="text-xs font-medium text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Registrando..." : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function EmergenciesPage() {
  return (
    <SessionProvider>
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <EmergenciesContent />
      </Suspense>
    </SessionProvider>
  );
}
