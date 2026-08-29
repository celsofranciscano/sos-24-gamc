import Link from "next/link";
import { ArrowLeft, Smartphone, Monitor } from "lucide-react";

export default function DevicesPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Link
          href="/citizen/account"
          className="flex size-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-base font-semibold">Dispositivos</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Smartphone className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium">Este dispositivo</p>
              <p className="text-xs text-muted-foreground">
                Dispositivo actual · Activo
              </p>
            </div>
            <span className="ml-auto rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
              Activo
            </span>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground text-center">
          Los dispositivos registrados se utilizan para enviar notificaciones
          push de emergencias.
        </p>
      </div>
    </div>
  );
}
