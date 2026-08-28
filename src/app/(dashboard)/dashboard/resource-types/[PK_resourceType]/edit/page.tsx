import type { Metadata } from "next";
import { Pencil } from "lucide-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Editar tipo de recurso",
      description: "Formulario de edición dentro de [PK_resourceType].",
};

export default function EditResourceTypesPage() {
  return (
    <PagePlaceholder
      title="Editar tipo de recurso"
      icon={<Pencil className="size-5" />}
    />
  );
}
