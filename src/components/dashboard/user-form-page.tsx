"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
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
import { Switch } from "@/components/ui/switch";
import { PasswordInput } from "@/components/ui/password-input";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminPasswordField } from "@/components/dashboard/admin-password-field";
import { apiGet, apiPost, apiPut, type Paged } from "@/lib/api/client";
import { qk } from "@/lib/query-keys";

// ============================================================
// FORMULARIO DE USUARIO (COMPARTIDO)
// Usado por /users/create y por /users/[PK_user]/edit.
// Toda escritura exige la contraseña del administrador que
// ejecuta la acción.
// ============================================================

type Privilege = { PK_privilege: number; privilege: string; privilegeType: string };
type Institution = { PK_institution: number; name: string };
type Subinstitution = { PK_subinstitution: number; name: string };

type UserDetailResponse = {
  PK_user: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  status: boolean;
  FK_privilege: number;
  FK_institution: number | null;
  FK_subinstitution: number | null;
};

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  FK_privilege: string;
  FK_institution: string;
  FK_subinstitution: string;
  password: string;
  status: boolean;
  adminPassword: string;
};

function emptyForm(): FormState {
  return {
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    FK_privilege: "",
    FK_institution: "",
    FK_subinstitution: "",
    password: "",
    status: true,
    adminPassword: "",
  };
}

/** Envoltorio: carga el usuario (si se edita) y monta el formulario con su estado inicial. */
export function UserFormPage({ userId }: { userId?: number }) {
  const editing = userId != null;

  const detailQuery = useQuery({
    queryKey: qk.catalog("users", `detail-${userId}`),
    queryFn: () => apiGet<UserDetailResponse>(`/api/dashboard/users/${userId}`),
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

  const u = detailQuery.data;
  const initial: FormState = u
    ? {
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phoneNumber: u.phoneNumber ?? "",
        FK_privilege: String(u.FK_privilege),
        FK_institution: u.FK_institution ? String(u.FK_institution) : "",
        FK_subinstitution: u.FK_subinstitution ? String(u.FK_subinstitution) : "",
        password: "",
        status: u.status,
        adminPassword: "",
      }
    : emptyForm();

  return <UserForm key={userId ?? "create"} userId={userId} initial={initial} />;
}

function UserForm({ userId, initial }: { userId?: number; initial: FormState }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const editing = userId != null;

  const [form, setForm] = useState<FormState>(initial);
  const [error, setError] = useState<string | null>(null);

  const privilegesQuery = useQuery({
    queryKey: qk.catalog("privileges", "options"),
    queryFn: () => apiGet<Paged<Privilege>>("/api/dashboard/privileges?pageSize=200"),
  });
  const institutionsQuery = useQuery({
    queryKey: qk.catalog("institutions", "options"),
    queryFn: () => apiGet<Paged<Institution>>("/api/dashboard/institutions?pageSize=200"),
  });

  const selectedPrivilege = privilegesQuery.data?.items.find(
    (p) => String(p.PK_privilege) === form.FK_privilege,
  );
  const isInstitutional = selectedPrivilege?.privilegeType === "INSTITUTION";

  const subinstitutionsQuery = useQuery({
    queryKey: qk.catalog("subinstitutions", form.FK_institution),
    queryFn: () =>
      apiGet<Paged<Subinstitution>>(
        `/api/dashboard/subinstitutions?FK_institution=${form.FK_institution}&pageSize=200`,
      ),
    enabled: isInstitutional && form.FK_institution !== "",
  });

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        FK_privilege: Number(form.FK_privilege),
        FK_institution: isInstitutional && form.FK_institution ? Number(form.FK_institution) : null,
        FK_subinstitution:
          isInstitutional && form.FK_subinstitution ? Number(form.FK_subinstitution) : null,
        status: form.status,
        adminPassword: form.adminPassword,
      };
      if (!editing || form.password) payload.password = form.password;

      if (editing) return apiPut(`/api/dashboard/users/${userId}`, payload);
      return apiPost("/api/dashboard/users", payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["catalog", "users"] }),
        queryClient.invalidateQueries({ queryKey: ["catalog", "privileges"] }),
      ]);
      router.push("/dashboard/users");
    },
    onError: (err: Error) => setError(err.message),
  });

  const canSubmit =
    form.adminPassword.length > 0 &&
    form.firstName.trim() !== "" &&
    form.lastName.trim() !== "" &&
    form.email.trim() !== "" &&
    form.FK_privilege !== "" &&
    (!isInstitutional || form.FK_institution !== "") &&
    (!editing || form.password === "" || form.password.length >= 6);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/users"
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
          aria-label="Volver"
        >
          <ArrowLeftIcon />
        </Link>
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          {editing ? "Editar usuario" : "Nuevo usuario del sistema"}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editing ? "Datos del usuario" : "Datos del nuevo usuario"}</CardTitle>
          <CardDescription>
            Operadores de la Central GAMC o de las instituciones de respuesta. Los campos con{" "}
            <span className="text-destructive">*</span> son obligatorios.
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
              <div className="grid gap-1.5">
                <Label htmlFor="u-first">
                  Nombres <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="u-first"
                  value={form.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="u-last">
                  Apellidos <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="u-last"
                  value={form.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="u-email">
                  Correo (usuario de acceso) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="u-email"
                  type="email"
                  placeholder="nombre@institucion.bo"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="u-phone">Teléfono</Label>
                <Input
                  id="u-phone"
                  value={form.phoneNumber}
                  onChange={(e) => set("phoneNumber", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-1.5 sm:max-w-md">
              <Label>
                Privilegio <span className="text-destructive">*</span>
              </Label>
              <LabeledSelect
                options={(privilegesQuery.data?.items ?? []).map((p) => ({
                  label: `${p.privilege} · ${p.privilegeType === "GAMC" ? "GAMC" : "Institución"}`,
                  value: String(p.PK_privilege),
                }))}
                value={form.FK_privilege || null}
                placeholder="Seleccionar privilegio..."
                onValueChange={(v) => {
                  set("FK_privilege", v ?? "");
                  set("FK_institution", "");
                  set("FK_subinstitution", "");
                }}
              />
            </div>

            {isInstitutional && (
              <div className="grid gap-4 rounded-lg border p-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label>
                    Institución <span className="text-destructive">*</span>
                  </Label>
                  <LabeledSelect
                    options={(institutionsQuery.data?.items ?? []).map((i) => ({
                      label: i.name,
                      value: String(i.PK_institution),
                    }))}
                    value={form.FK_institution || null}
                    placeholder="Seleccionar..."
                    onValueChange={(v) => {
                      set("FK_institution", v ?? "");
                      set("FK_subinstitution", "");
                    }}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Dependencia</Label>
                  <LabeledSelect
                    options={[
                      { label: "Ninguna", value: "__none__" },
                      ...(subinstitutionsQuery.data?.items ?? []).map((s) => ({
                        label: s.name,
                        value: String(s.PK_subinstitution),
                      })),
                    ]}
                    value={form.FK_subinstitution || null}
                    disabled={!subinstitutionsQuery.data}
                    placeholder={
                      form.FK_institution ? "Cargando..." : "Seleccione una institución"
                    }
                    onValueChange={(v) =>
                      set("FK_subinstitution", !v || v === "__none__" ? "" : v)
                    }
                  />
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="u-password">
                  {editing ? "Contraseña nueva" : "Contraseña"}
                  {!editing && <span className="text-destructive"> *</span>}
                </Label>
                <PasswordInput
                  id="u-password"
                  autoComplete="new-password"
                  placeholder={
                    editing ? "Dejar vacío para mantener la actual" : "Mínimo 6 caracteres"
                  }
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={form.status} onCheckedChange={(c) => set("status", c)} />
                <span className="text-sm text-muted-foreground">
                  {form.status ? "Usuario activo" : "Usuario dado de baja"}
                </span>
              </div>
            </div>

            <AdminPasswordField
              value={form.adminPassword}
              onChange={(v) => set("adminPassword", v)}
              error={error}
            />

            <div className="flex justify-end gap-2">
              <Link
                href="/dashboard/users"
                className={buttonVariants({ variant: "outline" })}
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={mutation.isPending || !canSubmit}
                className={buttonVariants()}
              >
                {mutation.isPending ? "Guardando..." : editing ? "Guardar cambios" : "Crear usuario"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
