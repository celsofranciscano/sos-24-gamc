"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { LabeledSelect } from "@/components/ui/labeled-select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { AdminPasswordField } from "@/components/dashboard/admin-password-field";
import { apiGet, apiPost, apiPut } from "@/lib/api/client";

// ============================================================
// FORMULARIO DE PRIVILEGIO (COMPARTIDO)
// Usado por /privileges/create y por
// /privileges/[PK_privilege]/edit. Escritura protegida con la
// contraseña del administrador de la Central.
// ============================================================

type PrivilegeDetail = {
  PK_privilege: number;
  privilege: string;
  privilegeCode: string;
  privilegeType: string;
  description: string | null;
  _count?: { tbusers: number };
};

type FormState = {
  privilege: string;
  privilegeCode: string;
  privilegeType: "GAMC" | "INSTITUTION";
  description: string;
  adminPassword: string;
  assignedUsers: number;
};

/** Envoltorio: carga el privilegio (si se edita) y monta el formulario con su estado inicial. */
export function PrivilegeFormPage({ privilegeId }: { privilegeId?: number }) {
  const editing = privilegeId != null;

  const detailQuery = useQuery({
    queryKey: ["catalog", "privileges", `detail-${privilegeId}`],
    queryFn: () => apiGet<PrivilegeDetail>(`/api/dashboard/privileges/${privilegeId}`),
    enabled: editing,
  });

  if (editing && !detailQuery.data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  const p = detailQuery.data;
  const initial: FormState = p
    ? {
        privilege: p.privilege,
        privilegeCode: p.privilegeCode,
        privilegeType: p.privilegeType as FormState["privilegeType"],
        description: p.description ?? "",
        adminPassword: "",
        assignedUsers: p._count?.tbusers ?? 0,
      }
    : {
        privilege: "",
        privilegeCode: "",
        privilegeType: "INSTITUTION" as const,
        description: "",
        adminPassword: "",
        assignedUsers: 0,
      };

  return <PrivilegeForm key={privilegeId ?? "create"} privilegeId={privilegeId} initial={initial} />;
}

function PrivilegeForm({
  privilegeId,
  initial,
}: {
  privilegeId?: number;
  initial: FormState;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const editing = privilegeId != null;

  const [form, setForm] = useState<FormState>(initial);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        privilege: form.privilege,
        privilegeCode: form.privilegeCode,
        privilegeType: form.privilegeType,
        description: form.description,
        adminPassword: form.adminPassword,
      };
      if (editing) return apiPut(`/api/dashboard/privileges/${privilegeId}`, payload);
      return apiPost("/api/dashboard/privileges", payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["catalog", "privileges"] });
      router.push("/dashboard/privileges");
    },
    onError: (err: Error) => setError(err.message),
  });

  const canSubmit =
    form.adminPassword.length > 0 && form.privilege.trim() !== "" && form.privilegeCode.trim() !== "";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/privileges"
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
          aria-label="Volver"
        >
          <ArrowLeftIcon />
        </Link>
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          {editing ? "Editar privilegio" : "Nuevo privilegio"}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {editing ? "Datos del privilegio" : "Datos del nuevo privilegio"}
          </CardTitle>
          <CardDescription>
            Los roles definen qué puede hacer cada usuario del sistema. Tipo GAMC = Central;
            INSTITUTION = instituciones de respuesta.
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
            <div className="grid gap-1.5">
              <Label htmlFor="p-name">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="p-name"
                value={form.privilege}
                placeholder="Ej: Despachador de Policía"
                onChange={(e) => set("privilege", e.target.value)}
              />
            </div>

            <div className="grid gap-1.5 sm:max-w-md">
              <Label htmlFor="p-code">
                Código único <span className="text-destructive">*</span>
              </Label>
              <Input
                id="p-code"
                value={form.privilegeCode}
                placeholder="Ej: POLICE_DISPATCHER"
                className="font-mono uppercase"
                onChange={(e) => set("privilegeCode", e.target.value.toUpperCase())}
              />
              {editing && form.assignedUsers > 0 && (
                <p className="text-[11px] text-muted-foreground">
                  El código no puede modificarse mientras tenga usuarios asignados.
                </p>
              )}
            </div>

            <div className="grid gap-1.5 sm:max-w-md">
              <Label>
                Tipo <span className="text-destructive">*</span>
              </Label>
              <LabeledSelect
                options={[
                  { label: "Central GAMC", value: "GAMC" },
                  { label: "Institución", value: "INSTITUTION" },
                ]}
                value={form.privilegeType}
                disabled={editing}
                onValueChange={(v) =>
                  set("privilegeType", (v ?? "INSTITUTION") as FormState["privilegeType"])
                }
              />
              {editing && (
                <p className="text-[11px] text-muted-foreground">
                  El tipo de un privilegio existente no se puede cambiar.
                </p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="p-desc">Descripción</Label>
              <Textarea
                id="p-desc"
                rows={3}
                value={form.description}
                placeholder="Funciones y permisos asociados al rol..."
                onChange={(e) => set("description", e.target.value)}
              />
            </div>

            <AdminPasswordField
              value={form.adminPassword}
              onChange={(v) => set("adminPassword", v)}
              error={error}
            />

            <div className="flex justify-end gap-2">
              <Link href="/dashboard/privileges" className={buttonVariants({ variant: "outline" })}>
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={mutation.isPending || !canSubmit}
                className={buttonVariants()}
              >
                {mutation.isPending
                  ? "Guardando..."
                  : editing
                    ? "Guardar cambios"
                    : "Crear privilegio"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
