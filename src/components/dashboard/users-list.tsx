"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PencilIcon,
  PlusIcon,
  SearchIcon,
  UserCheckIcon,
  UserXIcon,
  UsersIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LabeledSelect } from "@/components/ui/labeled-select";
import { StatCard } from "@/components/dashboard/stat-card";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import {
  DeactivateUserDialog,
  type DeactivateTarget,
} from "@/components/dashboard/deactivate-user-dialog";
import { apiGet, type Paged } from "@/lib/api/client";
import { qk } from "@/lib/query-keys";

// ============================================================
// PÁGINA: LISTADO DE USUARIOS DEL SISTEMA
// Navegación: crear → /users/create · detalle → /users/[PK_user]
// · editar → /users/[PK_user]/edit. La baja/reactivación se hace
// con confirmación de contraseña desde aquí o desde el detalle.
// ============================================================

type Privilege = { PK_privilege: number; privilege: string };

type UserRow = {
  PK_user: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  status: boolean;
  FK_privilege: number;
  tbinstitutions?: { PK_institution: number; name: string | null; acronym: string | null } | null;
};

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge variant="success">Activo</Badge>
  ) : (
    <Badge variant="secondary">De baja</Badge>
  );
}

export function UsersList() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [privilegeFilter, setPrivilegeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [toggleTarget, setToggleTarget] = useState<DeactivateTarget | null>(null);

  const listQuery = useQuery({
    queryKey: qk.catalog("users"),
    queryFn: () => apiGet<Paged<UserRow>>("/api/dashboard/users?pageSize=200"),
  });
  const privilegesQuery = useQuery({
    queryKey: qk.catalog("privileges", "filter-options"),
    queryFn: () => apiGet<Paged<Privilege>>("/api/dashboard/privileges?pageSize=200"),
  });

  const items = useMemo(() => listQuery.data?.items ?? [], [listQuery.data]);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((item) => {
      if (privilegeFilter !== "all" && String(item.FK_privilege) !== privilegeFilter)
        return false;
      if (statusFilter === "active" && !item.status) return false;
      if (statusFilter === "inactive" && item.status) return false;
      if (!term) return true;
      return (
        `${item.firstName} ${item.lastName}`.toLowerCase().includes(term) ||
        item.email.toLowerCase().includes(term) ||
        (item.phoneNumber ?? "").toLowerCase().includes(term)
      );
    });
  }, [items, search, privilegeFilter, statusFilter]);

  const stats = useMemo(
    () => ({
      total: items.length,
      active: items.filter((i) => i.status).length,
      inactive: items.filter((i) => !i.status).length,
    }),
    [items],
  );

  const columns: DataTableColumn<UserRow>[] = [
    {
      key: "user",
      header: "Usuario",
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
            <p className="truncate text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "institution",
      header: "Institución",
      render: (row) => (
        <span className="line-clamp-1 max-w-[180px]">
          {row.tbinstitutions?.name ?? (
            <span className="text-muted-foreground">Central GAMC</span>
          )}
        </span>
      ),
    },
    {
      key: "phoneNumber",
      header: "Teléfono",
      render: (row) => row.phoneNumber ?? "—",
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
            aria-label="Editar"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/dashboard/users/${row.PK_user}/edit`);
            }}
          >
            <PencilIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={row.status ? "Dar de baja" : "Reactivar"}
            className={row.status ? "text-destructive hover:text-destructive" : ""}
            onClick={(e) => {
              e.stopPropagation();
              setToggleTarget(row);
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight">
            Usuarios del sistema
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Operadores de la Central GAMC y de las instituciones.
          </p>
        </div>
        <Link href="/dashboard/users/create" className={buttonVariants()}>
          <PlusIcon data-icon="inline-start" />
          Nuevo usuario
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          title="Total usuarios"
          value={stats.total}
          icon={UsersIcon}
          loading={listQuery.isLoading}
        />
        <StatCard
          title="Activos"
          value={stats.active}
          tone="success"
          icon={UserCheckIcon}
          loading={listQuery.isLoading}
        />
        <StatCard
          title="Dados de baja"
          value={stats.inactive}
          tone="danger"
          icon={UserXIcon}
          loading={listQuery.isLoading}
        />
      </div>

      <div className="flex flex-col gap-2 md:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Buscar por nombre, correo o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <LabeledSelect
            className="w-full md:w-48"
            options={[
              { label: "Todos los privilegios", value: "all" },
              ...(privilegesQuery.data?.items ?? []).map((p) => ({
                label: p.privilege,
                value: String(p.PK_privilege),
              })),
            ]}
            value={privilegeFilter}
            onValueChange={(v) => setPrivilegeFilter(v ?? "all")}
          />
          <LabeledSelect
            className="w-full md:w-40"
            options={[
              { label: "Todos", value: "all" },
              { label: "Activos", value: "active" },
              { label: "De baja", value: "inactive" },
            ]}
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v ?? "all")}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={listQuery.isLoading}
        emptyMessage="Sin usuarios que coincidan con los filtros."
        onRowClick={(row) => router.push(`/dashboard/users/${row.PK_user}`)}
        mobileTitle={(row) => (
          <span className="flex items-center justify-between gap-2">
            {row.firstName} {row.lastName}
            <StatusBadge active={row.status} />
          </span>
        )}
      />

      <DeactivateUserDialog target={toggleTarget} onClose={() => setToggleTarget(null)} />
    </div>
  );
}
