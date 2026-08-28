import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Institución",
      description: "Teléfono, dirección y servicios de la institución.",
};

export default function InstitutionDetailPage() {
  return (
    <PagePlaceholder
      title="Institución"
    />
  );
}
