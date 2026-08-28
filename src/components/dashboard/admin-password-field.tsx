"use client";

import { KeyRoundIcon, ShieldCheckIcon } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";

// ============================================================
// CONFIRMACIÓN DE SEGURIDAD PARA ACCIONES SENSIBLES
// El administrador debe ingresar SU PROPIA contraseña para crear,
// editar, cambiar privilegios o dar de baja usuarios.
// ============================================================

export function AdminPasswordField({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}) {
  return (
    <div className="grid gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3">
      <Label htmlFor="admin-password" className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
        <KeyRoundIcon className="size-3.5" />
        Confirmación de seguridad
        <span className="text-destructive">*</span>
      </Label>
      <PasswordInput
        id="admin-password"
        autoComplete="current-password"
        placeholder="Ingrese SU contraseña de administrador"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <ShieldCheckIcon className="size-3 shrink-0" />
        Crear, editar o dar de baja requiere verificar su identidad.
      </p>
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
