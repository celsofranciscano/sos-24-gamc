"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Building2, Eye, EyeOff, LogIn, Lock, Mail, Siren } from "lucide-react";
import { useState } from "react";

import { institutionLoginAction, type LoginState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const initialState: LoginState = {};

export function InstitutionLoginForm() {
  const [state, formAction, pending] = useActionState(
    institutionLoginAction,
    initialState,
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-600/20">
            <Building2 className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Acceso institucional
            </h1>
            <p className="text-sm text-muted-foreground">
              Central GAMC e instituciones
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form action={formAction} className="space-y-5">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Correo electrónico
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nombre@institucion.gob.bo"
              autoComplete="email"
              required
              className="h-11 pl-10 bg-muted/50 border-border/50 focus:border-red-500/50 focus:ring-red-500/20 transition-colors"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </Label>
            <Link
              href="#"
              className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              className="h-11 pl-10 pr-10 bg-muted/50 border-border/50 focus:border-red-500/50 focus:ring-red-500/20 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {state.error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-500">
            {state.error}
          </div>
        ) : null}

        {/* Submit */}
        <Button
          type="submit"
          className="w-full h-11 gap-2 bg-red-600 text-white shadow-lg shadow-red-600/20 hover:bg-red-500 font-semibold"
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

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">o</span>
        </div>
      </div>

      {/* Citizen link */}
      <div className="text-center">
        <Link
          href="/citizen/login"
          className="group inline-flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-5 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground hover:border-border"
        >
          <Siren className="size-4 text-red-500" />
          Soy ciudadano
          <span className="text-xs text-muted-foreground/60">→</span>
        </Link>
      </div>
    </div>
  );
}
