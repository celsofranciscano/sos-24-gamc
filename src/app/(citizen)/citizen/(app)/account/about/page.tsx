import Link from "next/link";
import { ArrowLeft, Siren, ExternalLink } from "lucide-react";

import { APP_NAME, APP_FULL_NAME, ORG_NAME } from "@/constants/org";

export default function AboutPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Link
          href="/citizen/account"
          className="flex size-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-base font-semibold">Acerca de</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="flex size-20 items-center justify-center rounded-3xl bg-red-600 text-white shadow-xl shadow-red-600/30">
            <Siren className="size-10" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">
              {APP_NAME}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {APP_FULL_NAME}
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="rounded-2xl border bg-card p-4 space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Versión
            </p>
            <p className="text-sm font-medium mt-1">1.0.0</p>
          </div>
          <div className="border-t" />
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Organización
            </p>
            <p className="text-sm font-medium mt-1">{ORG_NAME}</p>
          </div>
          <div className="border-t" />
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Descripción
            </p>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              {APP_NAME} es un sistema de gestión de emergencias 24/7 con
              inteligencia artificial que coordina la respuesta ante emergencias
              en tiempo real entre ciudadanos, instituciones y unidades de
              respuesta.
            </p>
          </div>
        </div>

        {/* Links */}
        <div className="rounded-2xl border bg-card divide-y">
          <a
            href="#"
            className="flex items-center justify-between p-4 text-sm font-medium"
          >
            Términos de uso
            <ExternalLink className="size-4 text-muted-foreground" />
          </a>
          <a
            href="#"
            className="flex items-center justify-between p-4 text-sm font-medium"
          >
            Política de privacidad
            <ExternalLink className="size-4 text-muted-foreground" />
          </a>
          <a
            href="#"
            className="flex items-center justify-between p-4 text-sm font-medium"
          >
            Licencias open source
            <ExternalLink className="size-4 text-muted-foreground" />
          </a>
        </div>
      </div>
    </div>
  );
}
