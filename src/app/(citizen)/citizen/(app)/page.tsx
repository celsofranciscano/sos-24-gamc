import type { Metadata } from "next";

import { auth } from "@/auth";
import { CitizenMap } from "@/components/citizen/citizen-map";
import { SosButton } from "@/components/layout/citizen/sos-button";
import { EmergencyQuickStats } from "@/components/citizen/emergency-quick-stats";

export const metadata: Metadata = {
  title: "Mapa",
};

export default async function CitizenHomePage() {
  const session = await auth();
  const firstName = session?.user?.firstName;

  return (
    <div className="relative flex h-full flex-col">
      {/* Header */}
      <section className="space-y-1 px-4 pt-5">
        <h1 className="text-xl font-semibold">
          {firstName ? `Hola, ${firstName}` : "Hola"}
        </h1>
        <p className="text-sm text-muted-foreground">
          ¿Necesitas ayuda? Presiona SOS para reportar una emergencia.
        </p>
      </section>

      {/* Quick stats */}
      <div className="px-4 pt-3">
        <EmergencyQuickStats />
      </div>

      {/* Map */}
      <section className="relative mx-4 mt-3 flex-1 overflow-hidden rounded-2xl border bg-muted/50">
        <CitizenMap
          showMyLocation
          className="h-full"
        />
        <SosButton />
      </section>
    </div>
  );
}
