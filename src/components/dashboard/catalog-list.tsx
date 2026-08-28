"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BuildingIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  UserCheckIcon,
  UserXIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LabeledSelect } from "@/components/ui/labeled-select";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/dashboard/stat-card";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import {
  apiDelete,
  apiGet,
  type Paged,
} from "@/lib/api/client";
import { qk } from "@/lib/query-keys";
import type { CatalogRow, CatalogSectionConfig } from "./catalogs-config";

// ============================================================
// LISTADO GENÉRICO DE CATÁLOGOS CON PÁGINAS DEDICADAS
// Estadísticas superiores + búsqueda + filtros + tabla
// responsive. Navegación: crear → /create · detalle → /[PK] ·
// edición → /[PK]/edit · eliminación con confirmación.
// ============================================================

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge variant="success">Activo</Badge>
  ) : (
    <Badge variant="secondary">Inactivo</Badge>
  );
}

export function CatalogList({ config }: { config: CatalogSectionConfig }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleting, setDeleting] = useState<CatalogRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: qk.catalog(config.entity),
    queryFn: () => apiGet<Paged<CatalogRow>>(`/api/dashboard/${config.entity}?pageSize=200`),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: unknown) => apiDelete(`/api/dashboard/${config.entity}/${id}`),
    onSuccess: async () => {
      setDeleting(null);
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ["catalog", config.entity] });
    },
    onError: (err: Error) => setError(err.message),
  });

  const items = useMemo(() => listQuery.data?.items ?? [], [listQuery.data]);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((item) => {
      if (statusFilter === "active" && !item.status) return false;
      if (statusFilter === "inactive" && item.status) return false;
      if (!term) return true;
      return Object.values(item).some((v) =>
        typeof v === "object" && v !== null
          ? Object.values(v).some((s) => String(s ?? "").toLowerCase().includes(term))
          : String(v ?? "").toLowerCase().includes(term),
      );
    });
  }, [items, search, statusFilter]);

  const stats = useMemo(
    () => ({
      total: items.length,
      active: items.filter((i) => i.status).length,
      inactive: items.filter((i) => !i.status).length,
    }),
    [items],
  );

  const columns: DataTableColumn<CatalogRow>[] = config.tableFields.map((fieldName) => {
    const field = config.fields.find((f) => f.name === fieldName);
    return {
      key: fieldName,
      header: field?.label ?? fieldName,
      render: (row) => {
        if (fieldName === "status") return <StatusBadge active={Boolean(row.status)} />;
        if (field?.detailRelation) {
          const rel = row[field.detailRelation.key] as Record<string, unknown> | null;
          return (
            <span className="line-clamp-1 max-w-[200px]">
              {rel ? String(rel[field.detailRelation.labelKey]) : "—"}
            </span>
          );
        }
        const value = row[fieldName];
        if (value == null || value === "") return <span className="text-muted-foreground">—</span>;
        return (
          <span className="line-clamp-2 max-w-[280px]">
            {field?.type === "textarea" ? (
              <span className="text-muted-foreground">{String(value)}</span>
            ) : (
              String(value)
            )}
          </span>
        );
      },
    };
  });

  columns.push({
    key: "__actions",
    header: "",
    className: "w-24 text-right",
    render: (row) => (
      <div className="flex justify-end gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Editar"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/dashboard/${config.entity}/${row[config.pk]}/edit`);
          }}
        >
          <PencilIcon />
        </Button>
        {config.canDelete && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Eliminar"
            className="text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              setDeleting(row);
            }}
          >
            <UserXIcon />
          </Button>
        )}
      </div>
    ),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight">{config.title}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{config.description}</p>
        </div>
        <Link href={`/dashboard/${config.entity}/create`} className={buttonVariants()}>
          <PlusIcon data-icon="inline-start" />
          Nueva {config.singularLabel.toLowerCase()}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          title={`Total de ${config.title.toLowerCase()}`}
          value={stats.total}
          icon={config.icon ?? BuildingIcon}
          loading={listQuery.isLoading}
        />
        <StatCard title="Activos" value={stats.active} tone="success" icon={UserCheckIcon} loading={listQuery.isLoading} />
        <StatCard title="Inactivos" value={stats.inactive} tone="danger" icon={UserXIcon} loading={listQuery.isLoading} />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder={`Buscar en ${config.title.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <LabeledSelect
          className="w-full sm:w-40"
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
        loading={listQuery.isLoading}
        emptyMessage={`Sin registros de ${config.title.toLowerCase()}.`}
        onRowClick={(row) => router.push(`/dashboard/${config.entity}/${row[config.pk]}`)}
        mobileTitle={(row) => (
          <span className="flex items-center justify-between gap-2">
            {String(row[config.tableFields[0]] ?? "")}
            <StatusBadge active={Boolean(row.status)} />
          </span>
        )}
      />

      {error && <p className="text-xs font-medium text-destructive">{error}</p>}

      <Dialog open={deleting != null} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar {config.singularLabel.toLowerCase()}</DialogTitle>
            <DialogDescription>
              ¿Seguro que deseas eliminar este registro? Si tiene datos relacionados la acción
              será rechazada.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleting && deleteMutation.mutate(deleting[config.pk])}
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
