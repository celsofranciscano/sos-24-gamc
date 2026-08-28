import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Reportar emergencia",
      description: "Flujo SOS: ubicación GPS + sesión con IA.",
};

export default function NewEmergencyPage() {
  return (
    <PagePlaceholder
      title="Reportar emergencia"
    />
  );
}
