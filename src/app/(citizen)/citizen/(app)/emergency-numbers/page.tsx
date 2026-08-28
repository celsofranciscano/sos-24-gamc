import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Números de emergencia",
      description: "Policía, Bomberos, Ambulancias, SAR y Seguridad Ciudadana.",
};

export default function EmergencyNumbersPage() {
  return (
    <PagePlaceholder
      title="Números de emergencia"
    />
  );
}
