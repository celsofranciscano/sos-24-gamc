import type { Metadata } from "next";
import { Truck } from "lucide-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Detalle de tipo de recurso",
      description: "Vista de detalle. El parámetro dinámico es [PK_resourceType], exactamente como la PK en Prisma.",
};

export default function ResourceTypesDetailPage() {
  return (
    <PagePlaceholder
      title="Detalle de tipo de recurso"
      icon={<Truck className="size-5" />}
    />
  );
}
