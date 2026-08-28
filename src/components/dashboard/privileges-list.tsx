"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PencilIcon, PlusIcon, SearchIcon, ShieldCheckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LabeledSelect } from "@/components/ui/labeled-select";
import { StatCard } from "@/components/dashboard/stat-card";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { apiGet, type Paged } from "@/lib/api/client";
import { qk } from "@/lib/query-keys";

// ============================================================
// PÁGINA: LISTADO DE PRIVILEGIOS
// Navegación: crear → /privileges/create · detalle →
// /privileges/[PK_privilege] · editar → .../edit. Sin eliminación.
// ============================================================

type PrivilegeRow = {
  PK_privilege: number;
  privilege: string;
  privilegeCode: string;
  privilegeType: string;
  description: string | null;
  _count?: { tbusers: number };
};

function TypeBadge({ type }: { type: string }) {
  return type === "GAMC" ? (
    <Badge variant="info">Central GAMC</Badge>
  ) : (
    <Badge variant="secondary">Institución</Badge>
  );
}

export function PrivilegesList() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const listQuery = useQuery({
    queryKey: qk.catalog("privileges"),
    queryFn: () => apiGet<Paged<PrivilegeRow>>("/api/dashboard/privileges?pageSize=200"),
  });

  const items = useMemo(() => listQuery.data?.items ?? [], [listQuery.data]);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((item) => {
      if (typeFilter !== "all" && item.privilegeType !== typeFilter) return false;
      if (!term) return true;
      return (
        item.privilege.toLowerCase().includes(term) ||
        item.privilegeCode.toLowerCase().includes(term)
      );
    });
  }, [items, search, typeFilter]);

  const stats = useMemo(
    () => ({
      total: items.length,
      gamc: items.filter((i) => i.privilegeType === "GAMC").length,
      institution: items.filter((i) => i.privilegeType === "INSTITUTION").length,
    }),
    [items],
  );

  const columns: DataTableColumn<PrivilegeRow>[] = [
    {
      key: "privilege",
      header: "Privilegio",
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.privilege}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">{row.privilegeCode}</p>
        </div>
      ),
    },
    {
      key: "privilegeType",
      header: "Tipo",
      render: (row) => <TypeBadge type={row.privilegeType} />,
    },
    {
      key: "users",
      header: "Usuarios",
      render: (row) => <Badge variant="outline">{row._count?.tbusers ?? 0} asignado(s)</Badge>,
    },
    {
      key: "__actions",
      header: "",
      className: "w-16 text-right",
      render: (row) => (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Editar"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/dashboard/privileges/${row.PK_privilege}/edit`);
          }}
        >
          <PencilIcon />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight">Privilegios</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Roles del sistema. Toda creación o edición exige su contraseña de administrador.
          </p>
        </div>
        <Link href="/dashboard/privileges/create" className={buttonVariants()}>
          <PlusIcon data-icon="inline-start" />
          Nuevo privilegio
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          title="Total de privilegios"
          value={stats.total}
          icon={ShieldCheckIcon}
          loading={listQuery.isLoading}
        />
        <StatCard title="Central GAMC" value={stats.gamc} tone="info" loading={listQuery.isLoading} />
        <StatCard
          title="Instituciones"
          value={stats.institution}
          tone="success"
          loading={listQuery.isLoading}
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Buscar por nombre o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <LabeledSelect
          className="w-full sm:w-48"
          options={[
            { label: "Todos los tipos", value: "all" },
            { label: "Central GAMC", value: "GAMC" },
            { label: "Institución", value: "INSTITUTION" },
          ]}
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v ?? "all")}
        />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={listQuery.isLoading}
        emptyMessage="Sin privilegios registrados."
        onRowClick={(row) => router.push(`/dashboard/privileges/${row.PK_privilege}`)}
        mobileTitle={(row) => (
          <span className="flex items-center justify-between gap-2">
            {row.privilege}
            <TypeBadge type={row.privilegeType} />
          </span>
        )}
      />
    </div>
  );
}
