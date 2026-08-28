import type { Metadata } from "next";
import { MapPin } from "lucide-react";

import { auth } from "@/auth";
import { SosButton } from "@/components/layout/citizen/sos-button";

export const metadata: Metadata = {
  title: "Mapa",
};

export default async function CitizenHomePage() {
  const session = await auth();
  const firstName = session?.user?.firstName;

  return (
    <div className="relative flex h-full flex-col">
      <section className="space-y-1 px-4 pt-5">
        <h1 className="text-xl font-semibold">
          {firstName ? `Hola, ${firstName}` : "Hola"}
        </h1>
        <p className="text-sm text-muted-foreground">
          ¿Necesitas ayuda? Presiona SOS para reportar una emergencia.
        </p>
      </section>

      <section className="relative mx-4 mt-4 flex-1 overflow-hidden rounded-2xl border bg-muted/50">
        <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
          <MapPin className="size-8" />
          <p className="text-sm">Tu ubicación</p>
          <p className="text-xs">Cochabamba, Bolivia</p>
        </div>
        <SosButton />
      </section>
    </div>
  );
}
