"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  Save,
  User,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Profile = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string | null;
  CI: string | null;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [CI, setCI] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    fetch("/api/citizen/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.citizen) {
          setProfile(data.citizen);
          setFirstName(data.citizen.firstName);
          setLastName(data.citizen.lastName);
          setEmail(data.citizen.email || "");
          setCI(data.citizen.CI || "");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const body: Record<string, unknown> = {
        firstName,
        lastName,
        email: email || null,
        CI: CI || null,
      };

      if (newPassword) {
        if (!currentPassword) {
          setError("Debes ingresar tu contraseña actual para cambiarla.");
          setSaving(false);
          return;
        }
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }

      const res = await fetch("/api/citizen/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "No se pudo guardar.");
        return;
      }

      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Error de conexión.");
    } finally {
      setSaving(false);
    }
  }, [firstName, lastName, email, CI, currentPassword, newPassword]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Link
          href="/citizen/account"
          className="flex size-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-base font-semibold">Mi perfil</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Avatar */}
        <div className="flex justify-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400 text-2xl font-bold">
            {firstName[0]}{lastName[0]}
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Nombres</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="pl-9 h-11"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Apellidos</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="pl-9 h-11"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">CI</Label>
            <Input
              value={CI}
              onChange={(e) => setCI(e.target.value)}
              placeholder="Opcional"
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Correo</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Opcional"
                className="pl-9 h-11"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Teléfono</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={profile?.phoneNumber || ""}
                disabled
                className="pl-9 h-11 bg-muted"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              El teléfono no se puede modificar
            </p>
          </div>

          {/* Password change */}
          <div className="rounded-xl border p-4 space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Cambiar contraseña
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs">Contraseña actual</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Opcional"
                  className="pl-9 h-11"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Nueva contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="pl-9 h-11"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3 text-sm text-green-600">
            <CheckCircle2 className="size-4" />
            Perfil actualizado
          </div>
        )}

        {/* Save */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-11 gap-2 bg-red-600 text-white hover:bg-red-500"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Guardar cambios
        </Button>
      </div>
    </div>
  );
}
