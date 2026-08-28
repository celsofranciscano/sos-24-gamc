import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Reportes de emergencias",
};

export default function ReportsEmergenciesPage() {
  return (
    <PagePlaceholder
      title="Reportes de emergencias"
      icon={<BarChart3 className="size-5" />}
    />
  );
}
