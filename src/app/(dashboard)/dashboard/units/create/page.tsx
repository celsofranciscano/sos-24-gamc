import type { Metadata } from "next";
import { Plus } from "lucide-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Nueva unidad",
      description: "Formulario de creación de unidades.",
};

export default function CreateUnitsPage() {
  return (
    <PagePlaceholder
      title="Nueva unidad"
      icon={<Plus className="size-5" />}
    />
  );
}
