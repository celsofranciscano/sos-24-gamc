import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Reportes por unidad",
};

export default function ReportsUnitsPage() {
  return (
    <PagePlaceholder
      title="Reportes por unidad"
      icon={<BarChart3 className="size-5" />}
    />
  );
}
