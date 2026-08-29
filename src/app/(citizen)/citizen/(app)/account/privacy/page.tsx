"use client";

import Link from "next/link";
import { ArrowLeft, Shield, Eye, Trash2 } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Link
          href="/citizen/account"
          className="flex size-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-base font-semibold">Privacidad y seguridad</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="rounded-2xl border bg-card p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <Shield className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium">Datos protegidos</p>
              <p className="text-xs text-muted-foreground">
                Tu información está segura y encriptada
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card divide-y">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <Eye className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Ubicación</p>
                <p className="text-xs text-muted-foreground">
                  Se utiliza únicamente para reportar emergencias y coordinar la
                  respuesta. No se comparte con terceros.
                </p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Contraseña</p>
                <p className="text-xs text-muted-foreground">
                  Almacena tu contraseña de forma segura con encriptación
                  bcrypt.
                </p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <Trash2 className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Eliminar cuenta</p>
                <p className="text-xs text-muted-foreground">
                  Para eliminar tu cuenta, contacta al administrador de la GAMC.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
