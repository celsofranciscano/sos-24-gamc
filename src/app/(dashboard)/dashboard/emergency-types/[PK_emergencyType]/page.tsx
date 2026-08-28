import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Detalle de tipo de emergencia",
      description: "Vista de detalle. El parámetro dinámico es [PK_emergencyType], exactamente como la PK en Prisma.",
};

export default function EmergencyTypesDetailPage() {
  return (
    <PagePlaceholder
      title="Detalle de tipo de emergencia"
      icon={<AlertTriangle className="size-5" />}
    />
  );
}
