import type { Metadata } from "next";
import { Pencil } from "lucide-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Editar tipo de emergencia",
      description: "Formulario de edición dentro de [PK_emergencyType].",
};

export default function EditEmergencyTypesPage() {
  return (
    <PagePlaceholder
      title="Editar tipo de emergencia"
      icon={<Pencil className="size-5" />}
    />
  );
}
