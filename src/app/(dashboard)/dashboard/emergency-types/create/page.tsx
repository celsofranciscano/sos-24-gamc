import type { Metadata } from "next";
import { Plus } from "lucide-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Nueva tipo de emergencia",
      description: "Formulario de creación de tipos de emergencia.",
};

export default function CreateEmergencyTypesPage() {
  return (
    <PagePlaceholder
      title="Nueva tipo de emergencia"
      icon={<Plus className="size-5" />}
    />
  );
}
