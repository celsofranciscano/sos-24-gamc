"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LogIn,
  Lock,
  Phone,
  Siren,
} from "lucide-react";

import { citizenLoginAction, type LoginState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: LoginState = {};

export function CitizenLoginForm() {
  const [state, formAction, pending] = useActionState(
    citizenLoginAction,
    initialState,
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white/80"
      >
        <ArrowLeft className="size-3.5" />
        Volver al inicio
      </Link>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-red-600 text-white shadow-xl shadow-red-600/30">
            <Siren className="size-6" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Bienvenido
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Ingresa con tu número de teléfono para acceder
          </p>
        </div>
      </div>

      {/* Form card */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl shadow-black/20">
        <form action={formAction} className="space-y-5">
          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-sm font-medium text-white/80">
              Número de teléfono
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" />
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                inputMode="tel"
                placeholder="70000000"
                autoComplete="tel"
                required
                className="h-12 pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-red-500/50 focus:ring-red-500/20 transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-white/80">
              Contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="h-12 pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-red-500/50 focus:ring-red-500/20 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot password */}
          <div className="text-right">
            <Link
              href="/citizen/forgot-password"
              className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {/* Error */}
          {state.error ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {state.error}
            </div>
          ) : null}

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-12 gap-2 bg-red-600 text-white shadow-xl shadow-red-600/30 hover:bg-red-500 font-semibold text-base rounded-xl"
            disabled={pending}
          >
            {pending ? (
              <>
                <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Ingresando...
              </>
            ) : (
              <>
                <LogIn className="size-4" />
                Iniciar sesión
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Register link */}
      <div className="text-center">
        <p className="text-sm text-white/40">
          ¿No tienes cuenta?{" "}
          <Link
            href="/citizen/register"
            className="font-semibold text-white/80 hover:text-white transition-colors"
          >
            Regístrate aquí
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
