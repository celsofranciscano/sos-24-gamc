import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Reportes",
};

export default function ReportsPage() {
  return (
    <PagePlaceholder
      title="Reportes"
      icon={<BarChart3 className="size-5" />}
    />
  );
}
