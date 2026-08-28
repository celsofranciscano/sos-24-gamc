"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LabeledSelect, type LabeledOption } from "@/components/ui/labeled-select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet, apiPost, apiPut, type Paged } from "@/lib/api/client";
import { qk } from "@/lib/query-keys";
import type { CatalogField, CatalogRow, CatalogSectionConfig } from "./catalogs-config";

// ============================================================
// FORMULARIO GENÉRICO DE CATÁLOGO (PÁGINA DEDICADA)
// Usado por /create y por /[PK]/edit de cada catálogo.
// ============================================================

type FormState = Record<string, unknown>;

function buildInitial(fields: CatalogField[], row: CatalogRow | null): FormState {
  const initial: FormState = {};
  for (const field of fields) {
    initial[field.name] = row
      ? (row[field.name] ?? "")
      : field.type === "switch"
        ? true
        : "";
  }
  return initial;
}

function buildPayload(fields: CatalogField[], form: FormState): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const field of fields) {
    const value = form[field.name];
    if (field.type === "switch") {
      payload[field.name] = Boolean(value);
    } else if (field.type === "number") {
      payload[field.name] = value === "" || value == null ? null : Number(value);
    } else if (field.type === "select") {
      payload[field.name] = value === "" || value == null ? null : value;
    } else {
      payload[field.name] = value ?? null;
    }
  }
  return payload;
}

/** Control de campo; los hooks remotos viven en un componente por campo. */
function FieldControl({
  field,
  value,
  onChange,
}: {
  field: CatalogField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const remote = field.remote;
  const remoteQuery = useQuery({
    queryKey: [...qk.catalog(remote?.entity ?? "none", "options")],
    queryFn: () => apiGet<Paged<CatalogRow>>(`/api/dashboard/${remote!.entity}?pageSize=200`),
    enabled: Boolean(remote),
  });

  const options = useMemo(() => {
    if (field.options) return field.options;
    if (remote) {
      return (remoteQuery.data?.items ?? []).map((item) => ({
        label: String(item[remote.labelKey] ?? item[remote.valueKey]),
        value: item[remote.valueKey] as string | number,
      }));
    }
    return [];
  }, [field.options, remote, remoteQuery.data]);

  switch (field.type) {
    case "textarea":
      return (
        <Textarea
          rows={3}
          value={String(value ?? "")}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "switch":
      return (
        <div className="flex items-center gap-2 pt-1">
          <Switch checked={Boolean(value)} onCheckedChange={(checked) => onChange(checked)} />
          <span className="text-sm text-muted-foreground">{value ? "Activo" : "Inactivo"}</span>
        </div>
      );
    case "select":
      return (
        <LabeledSelect
          options={options as LabeledOption[]}
          value={value == null || value === "" ? null : String(value)}
          onValueChange={(v) => {
            const match = options.find((o) => String(o.value) === String(v));
            onChange(match ? match.value : v);
          }}
        />
      );
    case "number":
      return (
        <Input
          type="number"
          step="any"
          value={value == null || value === "" ? "" : String(value)}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    default:
      return (
        <Input
          value={String(value ?? "")}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

export function CatalogFormPage({
  config,
  recordId,
}: {
  config: CatalogSectionConfig;
  recordId?: number;
}) {
  const editing = recordId != null;

  const detailQuery = useQuery({
    queryKey: qk.catalog(config.entity, `detail-${recordId}`),
    queryFn: () => apiGet<CatalogRow>(`/api/dashboard/${config.entity}/${recordId}`),
    enabled: editing,
  });

  if (editing && !detailQuery.data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <CatalogForm
      key={recordId ?? "create"}
      config={config}
      recordId={recordId}
      initial={buildInitial(config.fields, detailQuery.data ?? null)}
    />
  );
}

function CatalogForm({
  config,
  recordId,
  initial,
}: {
  config: CatalogSectionConfig;
  recordId?: number;
  initial: FormState;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const editing = recordId != null;

  const [form, setForm] = useState<FormState>(initial);
  const [error, setError] = useState<string | null>(null);

  const set = (name: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = buildPayload(config.fields, form);
      if (editing) return apiPut(`/api/dashboard/${config.entity}/${recordId}`, payload);
      return apiPost(`/api/dashboard/${config.entity}`, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["catalog", config.entity] });
      router.push(`/dashboard/${config.entity}`);
    },
    onError: (err: Error) => setError(err.message),
  });

  const missingRequired = config.fields.some(
    (f) => f.required && f.type !== "switch" && (form[f.name] === "" || form[f.name] == null),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link
          href={`/dashboard/${config.entity}`}
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
          aria-label="Volver"
        >
          <ArrowLeftIcon />
        </Link>
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          {editing ? `Editar ${config.singularLabel.toLowerCase()}` : `Nueva ${config.singularLabel.toLowerCase()}`}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {editing ? `Datos de la ${config.singularLabel.toLowerCase()}` : "Complete la información"}
          </CardTitle>
          <CardDescription>
            Los campos con <span className="text-destructive">*</span> son obligatorios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              mutation.mutate();
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {config.fields.map((field) => (
                <div
                  key={field.name}
                  className={
                    field.type === "textarea" ? "grid gap-1.5 sm:col-span-2" : "grid gap-1.5"
                  }
                >
                  <Label>
                    {field.label}
                    {field.required && field.type !== "switch" && (
                      <span className="text-destructive"> *</span>
                    )}
                  </Label>
                  <FieldControl
                    field={field}
                    value={form[field.name]}
                    onChange={(value) => set(field.name, value)}
                  />
                </div>
              ))}
            </div>

            {error && <p className="text-xs font-medium text-destructive">{error}</p>}

            <div className="flex justify-end gap-2">
              <Link href={`/dashboard/${config.entity}`} className={buttonVariants({ variant: "outline" })}>
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={mutation.isPending || missingRequired}
                className={buttonVariants()}
              >
                {mutation.isPending
                  ? "Guardando..."
                  : editing
                    ? "Guardar cambios"
                    : `Crear ${config.singularLabel.toLowerCase()}`}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
