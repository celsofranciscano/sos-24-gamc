"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  SearchIcon,
  SirenIcon,
  UserCheckIcon,
  UserRoundIcon,
  UserXIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LabeledSelect } from "@/components/ui/labeled-select";
import { StatCard } from "@/components/dashboard/stat-card";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { apiGet, type Paged } from "@/lib/api/client";
import { qk } from "@/lib/query-keys";

// ============================================================
// PÁGINA: CIUDADANOS REGISTRADOS (consulta Central)
// Misma UI que /dashboard/users: estadísticas superiores,
// búsqueda con filtros y tabla responsive. La activación /
// desactivación es lógica (nunca se eliminan registros).
// ============================================================

type CitizenRow = {
  PK_citizen: number;
  firstName: string;
  lastName: string;
  CI: string | null;
  phoneNumber: string;
  email: string | null;
  status: boolean;
  createdAt: string;
  _count: { tbemergencies: number; tbemergencyreports: number };
};

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge variant="success">Activo</Badge>
  ) : (
    <Badge variant="secondary">Inactivo</Badge>
  );
}

export function CitizensList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const list = useQuery({
    queryKey: qk.citizens(),
    queryFn: () => apiGet<Paged<CitizenRow>>("/api/dashboard/citizens?pageSize=200"),
  });

  const toggle = useMutation({
    mutationFn: (input: { PK_citizen: number; status: boolean }) =>
      fetch("/api/dashboard/citizens", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }).then(async (res) => {
        if (!res.ok) throw new Error(((await res.json()) as { message?: string }).message ?? "Error");
        return res.json();
      }),
    onSuccess: async () => {
      setTogglingId(null);
      await queryClient.invalidateQueries({ queryKey: ["citizens"] });
    },
  });

  const items = useMemo(() => list.data?.items ?? [], [list.data]);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((item) => {
      if (statusFilter === "active" && !item.status) return false;
      if (statusFilter === "inactive" && item.status) return false;
      if (!term) return true;
      return (
        `${item.firstName} ${item.lastName}`.toLowerCase().includes(term) ||
        (item.CI ?? "").toLowerCase().includes(term) ||
        item.phoneNumber.toLowerCase().includes(term) ||
        (item.email ?? "").toLowerCase().includes(term)
      );
    });
  }, [items, search, statusFilter]);

  const stats = useMemo(
    () => ({
      total: items.length,
      active: items.filter((i) => i.status).length,
      inactive: items.filter((i) => !i.status).length,
      emergencies: items.reduce((acc, i) => acc + i._count.tbemergencies, 0),
    }),
    [items],
  );

  const columns: DataTableColumn<CitizenRow>[] = [
    {
      key: "citizen",
      header: "Ciudadano",
      render: (row) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar className="size-8">
            <AvatarFallback className="text-xs">
              {`${row.firstName.charAt(0)}${row.lastName.charAt(0)}`.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">
              {row.firstName} {row.lastName}
            </p>
            <p className="truncate text-xs text-muted-foreground">{row.email ?? row.phoneNumber}</p>
          </div>
        </div>
      ),
    },
    {
      key: "CI",
      header: "C.I.",
      render: (row) => <span className="font-mono text-xs">{row.CI ?? "—"}</span>,
    },
    {
      key: "phoneNumber",
      header: "Teléfono",
      render: (row) => <span className="font-mono text-xs">{row.phoneNumber}</span>,
    },
    {
      key: "activity",
      header: "Actividad",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline">{row._count.tbemergencies} emergencia(s)</Badge>
          <Badge variant="outline">{row._count.tbemergencyreports} reporte(s)</Badge>
        </div>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (row) => <StatusBadge active={row.status} />,
    },
    {
      key: "__actions",
      header: "",
      className: "w-24 text-right",
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={row.status ? "Desactivar" : "Activar"}
            disabled={toggle.isPending && togglingId === row.PK_citizen}
            className={row.status ? "text-destructive hover:text-destructive" : ""}
            onClick={(e) => {
              e.stopPropagation();
              setTogglingId(row.PK_citizen);
              toggle.mutate({ PK_citizen: row.PK_citizen, status: !row.status });
            }}
          >
            {row.status ? <UserXIcon /> : <UserCheckIcon />}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-xl font-semibold tracking-tight">Ciudadanos</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Personas registradas en la aplicación SOS-24.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Total ciudadanos"
          value={stats.total}
          icon={UserRoundIcon}
          loading={list.isLoading}
        />
        <StatCard
          title="Activos"
          value={stats.active}
          tone="success"
          icon={UserCheckIcon}
          loading={list.isLoading}
        />
        <StatCard
          title="Inactivos"
          value={stats.inactive}
          tone="danger"
          icon={UserXIcon}
          loading={list.isLoading}
        />
        <StatCard
          title="Emergencias reportadas"
          value={stats.emergencies}
          tone="warning"
          icon={SirenIcon}
          loading={list.isLoading}
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Buscar por nombre, teléfono o C.I..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <LabeledSelect
          className="w-full sm:w-44"
          options={[
            { label: "Todos", value: "all" },
            { label: "Activos", value: "active" },
            { label: "Inactivos", value: "inactive" },
          ]}
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v ?? "all")}
        />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={list.isLoading}
        emptyMessage="Sin ciudadanos que coincidan con los filtros."
        onRowClick={(row) => router.push(`/dashboard/citizens/${row.PK_citizen}`)}
        mobileTitle={(row) => (
          <span className="flex items-center justify-between gap-2">
            {row.firstName} {row.lastName}
            <StatusBadge active={row.status} />
          </span>
        )}
      />

      {toggle.isError && (
        <p className="text-xs font-medium text-destructive">{(toggle.error as Error).message}</p>
      )}
    </div>
  );
}
