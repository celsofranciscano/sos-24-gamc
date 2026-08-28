"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LabeledSelect, type LabeledOption } from "@/components/ui/labeled-select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { apiDelete, apiGet, apiPost, apiPut, type Paged } from "@/lib/api/client";
import { qk } from "@/lib/query-keys";

// ============================================================
// PÁGINA CRUD GENÉRICA CONFIGURABLE
// Todas las páginas de catálogos del dashboard usan este componente:
// solo definen su configuración (campos, API y clave primaria).
// Incluye búsqueda, creación, edición y eliminación con diálogos.
// ============================================================

export type CrudFieldOption = { label: string; value: string | number };

export type CrudField = {
  name: string;
  label: string;
  type?: "text" | "number" | "textarea" | "select" | "switch" | "password";
  required?: boolean;
  placeholder?: string;
  defaultValue?: unknown;
  options?: CrudFieldOption[];
  /** Opciones cargadas desde otra API de catálogo (/api/dashboard/<entity>). */
  remote?: { entity: string; labelKey: string; valueKey: string };
  hideInTable?: boolean;
  /** Contraseñas u otros campos que pueden quedar vacíos al editar. */
  secretOptional?: boolean;
};

export type CrudConfig = {
  /** Ruta base bajo /api/dashboard (ej: "institutions"). */
  entity: string;
  pk: string;
  title: string;
  description?: string;
  singularLabel: string;
  fields: CrudField[];
};

type Row = Record<string, unknown>;

function buildPayload(fields: CrudField[], form: Record<string, unknown>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const field of fields) {
    const value = form[field.name];
    if (field.type === "password") {
      if (!value) continue; // vacío → no modificar
      payload[field.name] = value;
      continue;
    }
    if (field.type === "number") {
      payload[field.name] = value === "" || value == null ? null : Number(value);
      continue;
    }
    if (field.type === "switch") {
      payload[field.name] = Boolean(value);
      continue;
    }
    if (field.type === "select") {
      payload[field.name] = value === "" || value == null ? null : value;
      continue;
    }
    payload[field.name] = value ?? null;
  }
  return payload;
}

/** Control de formulario según el tipo de campo. Los hooks viven aquí (un componente por campo). */
function FieldControl({
  field,
  value,
  onChange,
}: {
  field: CrudField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const remoteQuery = useQuery({
    queryKey: [...qk.catalog(field.remote!.entity, "options")],
    queryFn: () => apiGet<Paged<Row>>(`/api/dashboard/${field.remote!.entity}?pageSize=200`),
    enabled: Boolean(field.remote),
  });

  const options: CrudFieldOption[] = useMemo(() => {
    if (field.options) return field.options;
    if (field.remote) {
      return (remoteQuery.data?.items ?? []).map((item) => ({
        label: String(item[field.remote!.labelKey] ?? item[field.remote!.valueKey]),
        value: item[field.remote!.valueKey] as string | number,
      }));
    }
    return [];
  }, [field.options, field.remote, remoteQuery.data]);

  switch (field.type) {
    case "textarea":
      return (
        <Textarea
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
    case "password":
      return (
        <Input
          type="password"
          autoComplete="new-password"
          value={String(value ?? "")}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
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

function EntityFormDialog({
  config,
  open,
  onOpenChange,
  editing,
}: {
  config: CrudConfig;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Row | null;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    for (const field of config.fields) {
      initial[field.name] = editing
        ? (editing[field.name] ?? "")
        : (field.defaultValue ?? (field.type === "switch" ? true : ""));
    }
    return initial;
  });
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = buildPayload(config.fields, form);
      if (editing) {
        return apiPut(`/api/dashboard/${config.entity}/${editing[config.pk]}`, payload);
      }
      return apiPost(`/api/dashboard/${config.entity}`, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["catalog", config.entity] });
      onOpenChange(false);
    },
    onError: (err: Error) => setError(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar" : "Crear"} {config.singularLabel.toLowerCase()}
          </DialogTitle>
          <DialogDescription>
            Los campos con <span className="text-destructive">*</span> son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            mutation.mutate();
          }}
        >
          {config.fields.map((field) => (
            <div key={field.name} className="grid gap-1.5">
              <Label htmlFor={`f-${field.name}`}>
                {field.label}
                {field.required && field.type !== "switch" && field.type !== "password" && (
                  <span className="text-destructive"> *</span>
                )}
              </Label>
              <FieldControl
                field={field}
                value={form[field.name]}
                onChange={(value) => setForm((prev) => ({ ...prev, [field.name]: value }))}
              />
            </div>
          ))}

          {error && <p className="text-xs font-medium text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CrudPage({ config }: { config: CrudConfig }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);

  const listQuery = useQuery({
    queryKey: qk.catalog(config.entity),
    queryFn: () => apiGet<Paged<Row>>(`/api/dashboard/${config.entity}?pageSize=200`),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: unknown) => apiDelete(`/api/dashboard/${config.entity}/${id}`),
    onSuccess: async () => {
      setDeleting(null);
      await queryClient.invalidateQueries({ queryKey: ["catalog", config.entity] });
    },
  });

  const rows = useMemo(() => {
    const items = listQuery.data?.items ?? [];
    if (!search.trim()) return items;
    const term = search.trim().toLowerCase();
    return items.filter((item) =>
      Object.values(item).some((v) => String(v ?? "").toLowerCase().includes(term)),
    );
  }, [listQuery.data, search]);

  const tableFields = config.fields.filter((f) => !f.hideInTable);

  const columns: DataTableColumn<Row>[] = tableFields.map((field) => ({
    key: field.name,
    header: field.label,
    render: (row) => {
      if (field.type === "switch") {
        return row[field.name] ? (
          <Badge variant="success">Activo</Badge>
        ) : (
          <Badge variant="secondary">Inactivo</Badge>
        );
      }
      return (
        <span className="line-clamp-2 max-w-[280px]">{String(row[field.name] ?? "—")}</span>
      );
    },
  }));

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
            setEditing(row);
            setDialogOpen(true);
          }}
        >
          <PencilIcon />
        </Button>
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
          <Trash2Icon />
        </Button>
      </div>
    ),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight">{config.title}</h1>
          {config.description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{config.description}</p>
          )}
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <PlusIcon data-icon="inline-start" />
          Nuevo
        </Button>
      </div>

      <div className="relative">
        <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-8"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={listQuery.isLoading}
        emptyMessage={`Sin registros de ${config.title.toLowerCase()}.`}
      />

      {dialogOpen && (
        <EntityFormDialog
          key={String(editing?.[config.pk] ?? "create")}
          config={config}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          editing={editing}
        />
      )}

      <Dialog open={deleting != null} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar registro</DialogTitle>
            <DialogDescription>
              ¿Seguro que deseas eliminar este registro? Esta acción no se puede deshacer.
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

export function CrudPageSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-9 w-full max-w-sm" />
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
