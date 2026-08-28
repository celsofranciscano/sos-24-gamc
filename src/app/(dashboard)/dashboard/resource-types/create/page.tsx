import type { Metadata } from "next";
import { Plus } from "lucide-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Nueva tipo de recurso",
      description: "Formulario de creación de tipos de recurso.",
};

export default function CreateResourceTypesPage() {
  return (
    <PagePlaceholder
      title="Nueva tipo de recurso"
      icon={<Plus className="size-5" />}
    />
  );
}
