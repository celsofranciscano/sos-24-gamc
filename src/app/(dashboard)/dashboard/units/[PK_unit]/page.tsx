import type { Metadata } from "next";
import { Truck } from "lucide-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Detalle de unidad",
      description: "Vista de detalle. El parámetro dinámico es [PK_unit], exactamente como la PK en Prisma.",
};

export default function UnitsDetailPage() {
  return (
    <PagePlaceholder
      title="Detalle de unidad"
      icon={<Truck className="size-5" />}
    />
  );
}
