import type { Metadata } from "next";
import { Pencil } from "lucide-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Editar unidad",
      description: "Formulario de edición dentro de [PK_unit].",
};

export default function EditUnitsPage() {
  return (
    <PagePlaceholder
      title="Editar unidad"
      icon={<Pencil className="size-5" />}
    />
  );
}
