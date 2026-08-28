"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmergencyStatusBadge, PriorityBadge } from "@/components/dashboard/badges";
import { apiGet } from "@/lib/api/client";

// ============================================================
// PÁGINA: DETALLE DE CIUDADANO + HISTORIAL DE EMERGENCIAS
// ============================================================

type CitizenDetail = {
  PK_citizen: number;
  firstName: string;
  lastName: string;
  CI: string | null;
  phoneNumber: string;
  email: string | null;
  status: boolean;
  createdAt: string;
  device: { device: unknown } | null;
};

type CitizenEmergency = {
  PK_emergency: number;
  emergencyCode: string;
  priority: string;
  status: string;
  reportedAt: string;
  description: string | null;
};

export default function CitizenDetailPage({
  params,
}: {
  params: Promise<{ PK_citizen: string }>;
}) {
  const { PK_citizen } = use(params);
  const id = Number(PK_citizen);

  const citizen = useQuery({
    queryKey: ["citizens", "detail", id],
    queryFn: () => apiGet<CitizenDetail>(`/api/citizens/${id}`),
  });

  // Las emergencias donde el ciudadano es reportante principal se obtienen
  // filtrando la lista general por su presencia.
  const emergencies = useQuery({
    queryKey: ["citizens", id, "emergencies"],
    queryFn: async () => {
      const res = await apiGet<{
        items: (CitizenEmergency & { tbcitizens: { PK_citizen: number } | null })[];
      }>(`/api/dashboard/emergencies?pageSize=100`);
      return res.items.filter((item) => item.tbcitizens?.PK_citizen === id);
    },
  });

  if (citizen.isLoading || !citizen.data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const data = citizen.data;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/citizens"
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
          aria-label="Volver"
        >
          <ArrowLeftIcon />
        </Link>
        <h1 className="text-lg font-semibold tracking-tight">
          {data.firstName} {data.lastName}
        </h1>
        {data.status ? (
          <Badge variant="success">Activo</Badge>
        ) : (
          <Badge variant="secondary">Inactivo</Badge>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base">Datos personales</CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">C.I.</dt><dd>{data.CI ?? "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Teléfono</dt><dd>{data.phoneNumber}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Correo</dt><dd>{data.email ?? "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Registrado</dt><dd>{new Date(data.createdAt).toLocaleDateString("es-BO")}</dd></div>
            </dl>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-0">
            <CardTitle className="text-base">Historial de emergencias</CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            {(emergencies.data?.length ?? 0) === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Sin emergencias reportadas.
              </p>
            ) : (
              <ul className="divide-y">
                {emergencies.data?.map((emergency) => (
                  <li key={emergency.PK_emergency} className="flex flex-wrap items-center gap-2 py-2.5">
                    <Link
                      href={`/dashboard/emergencies/${emergency.PK_emergency}`}
                      className="font-mono text-xs font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {emergency.emergencyCode}
                    </Link>
                    <PriorityBadge value={emergency.priority} />
                    <EmergencyStatusBadge value={emergency.status} />
                    <span className="ml-auto text-xs text-muted-foreground">
                      {new Date(emergency.reportedAt).toLocaleString("es-BO")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
