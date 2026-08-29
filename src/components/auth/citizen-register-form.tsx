"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  IdCard,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
  UserPlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function CitizenRegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setPending(true);

    try {
      const response = await fetch("/api/citizens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.get("firstName"),
          lastName: formData.get("lastName"),
          CI: formData.get("CI") || null,
          phoneNumber: formData.get("phoneNumber"),
          email: formData.get("email") || null,
          password,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error ?? "No se pudo completar el registro.");
        return;
      }

      router.push("/citizen/login");
    } catch {
      setError("Error de conexión. Intente nuevamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/citizen/login"
        className="inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white/80"
      >
        <ArrowLeft className="size-3.5" />
        Volver al login
      </Link>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-red-600 text-white shadow-xl shadow-red-600/30">
            <UserPlus className="size-6" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Crear cuenta
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Regístrate para reportar emergencias en Cochabamba
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-8 items-center justify-center rounded-full text-xs font-bold transition-colors",
            step === 1
              ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
              : "bg-green-500 text-white",
          )}
        >
          {step === 2 ? <CheckCircle2 className="size-4" /> : "1"}
        </div>
        <div
          className={cn(
            "h-0.5 flex-1 rounded-full transition-colors",
            step === 1 ? "bg-white/10" : "bg-red-600",
          )}
        />
        <div
          className={cn(
            "flex size-8 items-center justify-center rounded-full text-xs font-bold transition-colors",
            step === 2
              ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
              : "bg-white/10 text-white/30",
          )}
        >
          2
        </div>
      </div>

      {/* Form card */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl shadow-black/20">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1: Personal info */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <p className="text-xs font-medium uppercase tracking-widest text-white/30">
                Datos personales
              </p>

              {/* Names */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-xs font-medium text-white/60">
                    Nombres
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-white/20" />
                    <Input
                      id="firstName"
                      name="firstName"
                      required
                      className="h-11 pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-red-500/50 focus:ring-red-500/20 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-xs font-medium text-white/60">
                    Apellidos
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-white/20" />
                    <Input
                      id="lastName"
                      name="lastName"
                      required
                      className="h-11 pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-red-500/50 focus:ring-red-500/20 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* CI */}
              <div className="space-y-1.5">
                <Label htmlFor="CI" className="text-xs font-medium text-white/60">
                  Cédula de identidad
                </Label>
                <div className="relative">
                  <IdCard className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-white/20" />
                  <Input
                    id="CI"
                    name="CI"
                    inputMode="numeric"
                    placeholder="Opcional"
                    className="h-11 pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-red-500/50 focus:ring-red-500/20 text-sm"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="phoneNumber" className="text-xs font-medium text-white/60">
                  Número de teléfono *
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-white/20" />
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    inputMode="tel"
                    placeholder="70000000"
                    required
                    className="h-11 pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-red-500/50 focus:ring-red-500/20 text-sm"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-white/60">
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-white/20" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Opcional"
                    className="h-11 pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-red-500/50 focus:ring-red-500/20 text-sm"
                  />
                </div>
              </div>

              {/* Next button */}
              <Button
                type="button"
                onClick={() => setStep(2)}
                className="w-full h-11 gap-2 bg-white/10 text-white hover:bg-white/15 font-semibold border border-white/10"
              >
                Siguiente
                <ArrowRight className="size-4" />
              </Button>
            </div>
          )}

          {/* Step 2: Password */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <p className="text-xs font-medium uppercase tracking-widest text-white/30">
                Seguridad
              </p>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium text-white/60">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-white/20" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className="h-11 pl-9 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-red-500/50 focus:ring-red-500/20 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-white/25">Mínimo 8 caracteres</p>
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-medium text-white/60">
                  Confirmar contraseña
                </Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-white/20" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className="h-11 pl-9 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-red-500/50 focus:ring-red-500/20 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error ? (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              ) : null}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setStep(1)}
                  className="h-11 px-4 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10 font-medium"
                >
                  <ArrowLeft className="size-4" />
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-11 gap-2 bg-red-600 text-white shadow-xl shadow-red-600/30 hover:bg-red-500 font-semibold"
                  disabled={pending}
                >
                  {pending ? (
                    <>
                      <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creando cuenta...
                    </>
                  ) : (
                    <>
                      <UserPlus className="size-4" />
                      Registrarme
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Login link */}
      <div className="text-center">
        <p className="text-sm text-white/40">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/citizen/login"
            className="font-semibold text-white/80 hover:text-white transition-colors"
          >
            Inicia sesión
          </Link>
        </p>
      </div>

      {/* Institution link */}
      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white/50 backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white/80"
        >
          <span className="flex size-5 items-center justify-center rounded-md bg-white/10 text-[10px] font-bold">
            GAMC
          </span>
          Acceso institucional
        </Link>
      </div>
    </div>
  );
}
