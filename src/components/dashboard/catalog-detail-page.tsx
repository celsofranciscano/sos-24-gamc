"use client";

import { useState } from "react";
import { use } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, PencilIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiDelete, apiGet } from "@/lib/api/client";
import { qk } from "@/lib/query-keys";
import type { CatalogRow, CatalogSectionConfig } from "./catalogs-config";

// ============================================================
// DETALLE GENÉRICO DE CATÁLOGO (PÁGINA DEDICADA /[PK])
// Ficha de solo lectura + editar + eliminar con confirmación.
// ============================================================

export function CatalogDetailPage({
  config,
  params,
}: {
  config: CatalogSectionConfig;
  params: Promise<Record<string, string>>;
}) {
  const routeParams = use(params);
  const id = Number(routeParams[config.pk]);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detailQuery = useQuery({
    queryKey: qk.catalog(config.entity, `detail-${id}`),
    queryFn: () => apiGet<CatalogRow>(`/api/dashboard/${config.entity}/${id}`),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiDelete(`/api/dashboard/${config.entity}/${id}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["catalog", config.entity] });
      router.push(`/dashboard/${config.entity}`);
    },
    onError: (err: Error) => setError(err.message),
  });

  if (detailQuery.isLoading || !detailQuery.data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const row = detailQuery.data;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/${config.entity}`}
            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
            aria-label="Volver"
          >
            <ArrowLeftIcon />
          </Link>
          <h1 className="font-heading text-xl font-semibold tracking-tight">
            Detalle de {config.singularLabel.toLowerCase()}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {config.canDelete && (
            <>
              <Button variant="outline" onClick={() => setDeleteOpen(true)}>
                Eliminar
              </Button>
              <Dialog open={deleteOpen} onOpenChange={(open) => !open && setDeleteOpen(false)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Eliminar {config.singularLabel.toLowerCase()}</DialogTitle>
                    <DialogDescription>
                      ¿Seguro que deseas eliminar este registro? Si tiene datos relacionados la
                      acción será rechazada.
                    </DialogDescription>
                  </DialogHeader>
                  {error && <p className="text-xs font-medium text-destructive">{error}</p>}
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                      Cancelar
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate()}
                    >
                      {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
          <Link href={`/dashboard/${config.entity}/${id}/edit`} className={buttonVariants()}>
            <PencilIcon data-icon="inline-start" />
            Editar
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2">
            {String(row[config.tableFields[0]] ?? "")}
            <Badge variant={row.status ? "success" : "secondary"}>
              {row.status ? "Activo" : "Inactivo"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {config.fields.map((field) => {
            let value: React.ReactNode;
            if (field.type === "switch") {
              value = row[field.name] ? "Activo" : "Inactivo";
            } else if (field.detailRelation) {
              const rel = row[field.detailRelation.key] as Record<string, unknown> | null | undefined;
              value = rel ? String(rel[field.detailRelation.labelKey]) : (field.detailRelation.fallback ?? "—");
            } else {
              const raw = row[field.name];
              value =
                raw == null || raw === "" ? (
                  <span className="text-muted-foreground">—</span>
                ) : (
                  String(raw)
                );
            }
            return (
              <div key={field.name}>
                <p className="text-xs text-muted-foreground">{field.label}</p>
                <p className="text-sm font-medium break-words">{value}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
