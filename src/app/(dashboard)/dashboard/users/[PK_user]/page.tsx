"use client";

import { useState } from "react";
import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowLeftIcon,
  BuildingIcon,
  CalendarClockIcon,
  HistoryIcon,
  MailIcon,
  PencilIcon,
  PhoneIcon,
  ShieldCheckIcon,
  UserCheckIcon,
  UserXIcon,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { DeactivateUserDialog } from "@/components/dashboard/deactivate-user-dialog";
import { apiGet } from "@/lib/api/client";
import { qk } from "@/lib/query-keys";

// ============================================================
// PÁGINA: DETALLE DE USUARIO (/users/[PK_user])
// Ficha completa con acciones: editar y dar de baja / reactivar
// (siempre con confirmación de contraseña del administrador).
// ============================================================

type UserDetail = {
  PK_user: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  actionHistory: { action: string; detail?: string; by?: string; at?: string }[] | null;
  tbprivileges: {
    PK_privilege: number;
    privilege: string;
    privilegeCode: string;
    privilegeType: string;
  };
  tbinstitutions: { PK_institution: number; name: string; acronym: string | null } | null;
  tbsubinstitutions: { PK_subinstitution: number; name: string } | null;
};

const dateFormatter = new Intl.DateTimeFormat("es-BO", {
  dateStyle: "medium",
  timeStyle: "short",
});

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  );
}

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ PK_user: string }>;
}) {
  const { PK_user } = use(params);
  const id = Number(PK_user);
  const [, setToggleOpen] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: qk.catalog("users", `detail-${id}`),
    queryFn: () => apiGet<UserDetail>(`/api/dashboard/users/${id}`),
  });

  if (isLoading || !user) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const history = Array.isArray(user.actionHistory) ? user.actionHistory : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/users"
            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
            aria-label="Volver"
          >
            <ArrowLeftIcon />
          </Link>
          <h1 className="font-heading text-xl font-semibold tracking-tight">
            Detalle de usuario
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className={buttonVariants({ variant: "outline" })} onClick={() => setToggleOpen(true)}>
            {user.status ? (
              <>
                <UserXIcon data-icon="inline-start" />
                Dar de baja
              </>
            ) : (
              <>
                <UserCheckIcon data-icon="inline-start" />
                Reactivar
              </>
            )}
          </button>
          <Link href={`/dashboard/users/${id}/edit`} className={buttonVariants()}>
            <PencilIcon data-icon="inline-start" />
            Editar
          </Link>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar className="size-14 text-lg">
            <AvatarFallback>
              {`${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold">
              {user.firstName} {user.lastName}
            </p>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          </div>
          {user.status ? (
            <Badge variant="success">Activo</Badge>
          ) : (
            <Badge variant="secondary">De baja</Badge>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Información de acceso</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <InfoRow
              icon={ShieldCheckIcon}
              label="Privilegio"
              value={
                <span className="flex flex-wrap items-center gap-2">
                  {user.tbprivileges.privilege}
                  <Badge variant={user.tbprivileges.privilegeType === "GAMC" ? "info" : "outline"}>
                    {user.tbprivileges.privilegeType === "GAMC" ? "Central GAMC" : "Institución"}
                  </Badge>
                </span>
              }
            />
            <InfoRow icon={MailIcon} label="Correo (usuario)" value={user.email} />
            <InfoRow
              icon={PhoneIcon}
              label="Teléfono"
              value={user.phoneNumber ?? "—"}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pertenencia</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <InfoRow
              icon={BuildingIcon}
              label="Institución"
              value={user.tbinstitutions?.name ?? "Central GAMC (sin institución)"}
            />
            <InfoRow
              icon={BuildingIcon}
              label="Dependencia"
              value={user.tbsubinstitutions?.name ?? "—"}
            />
            <Separator />
            <InfoRow
              icon={CalendarClockIcon}
              label="Registro / última actualización"
              value={`${dateFormatter.format(new Date(user.createdAt))} · ${dateFormatter.format(
                new Date(user.updatedAt),
              )}`}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <HistoryIcon className="size-4" />
            Historial de acciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin acciones registradas.</p>
          ) : (
            <ol className="space-y-3">
              {[...history].reverse().map((entry, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <Badge variant="outline" className="mt-0.5 shrink-0 font-mono">
                    {entry.action}
                  </Badge>
                  <div className="min-w-0">
                    <p>{entry.detail ?? "—"}</p>
                    {entry.at && (
                      <p className="text-xs text-muted-foreground">
                        {dateFormatter.format(new Date(entry.at))}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      <DeactivateUserDialog target={user} onClose={() => setToggleOpen(false)} />
    </div>
  );
}
