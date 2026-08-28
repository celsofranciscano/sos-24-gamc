import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Seguimiento GPS",
      description: "Posición de la unidad en camino.",
};

export default function EmergencyTrackingPage() {
  return (
    <PagePlaceholder
      title="Seguimiento GPS"
    />
  );
}
