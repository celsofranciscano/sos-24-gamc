"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeftIcon, CalendarClockIcon, PencilIcon, UsersIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet } from "@/lib/api/client";

// ============================================================
// PÁGINA: DETALLE DE PRIVILEGIO (/privileges/[PK_privilege])
// ============================================================

type PrivilegeDetail = {
  PK_privilege: number;
  privilege: string;
  privilegeCode: string;
  privilegeType: string;
  description: string | null;
  createdAt: string;
  _count?: { tbusers: number };
};

const dateFormatter = new Intl.DateTimeFormat("es-BO", { dateStyle: "medium", timeStyle: "short" });

export default function PrivilegeDetailPage({
  params,
}: {
  params: Promise<{ PK_privilege: string }>;
}) {
  const { PK_privilege } = use(params);
  const id = Number(PK_privilege);

  const { data: privilege, isLoading } = useQuery({
    queryKey: ["catalog", "privileges", `detail-${id}`],
    queryFn: () => apiGet<PrivilegeDetail>(`/api/dashboard/privileges/${id}`),
  });

  if (isLoading || !privilege) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/privileges"
            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
            aria-label="Volver"
          >
            <ArrowLeftIcon />
          </Link>
          <h1 className="font-heading text-xl font-semibold tracking-tight">Detalle de privilegio</h1>
        </div>
        <Link href={`/dashboard/privileges/${id}/edit`} className={buttonVariants()}>
          <PencilIcon data-icon="inline-start" />
          Editar
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2">
            {privilege.privilege}
            <Badge variant={privilege.privilegeType === "GAMC" ? "info" : "secondary"}>
              {privilege.privilegeType === "GAMC" ? "Central GAMC" : "Institución"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Código único</p>
            <p className="font-mono text-sm font-medium">{privilege.privilegeCode}</p>
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <UsersIcon className="size-3.5" /> Usuarios asignados
            </p>
            <Badge variant="outline">{privilege._count?.tbusers ?? 0} usuario(s)</Badge>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-muted-foreground">Descripción</p>
            <p className="text-sm">{privilege.description ?? "—"}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarClockIcon className="size-3.5" /> Fecha de creación
            </p>
            <p className="text-sm">{dateFormatter.format(new Date(privilege.createdAt))}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
