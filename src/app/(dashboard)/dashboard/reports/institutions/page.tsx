import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Reportes por institución",
};

export default function ReportsInstitutionsPage() {
  return (
    <PagePlaceholder
      title="Reportes por institución"
      icon={<BarChart3 className="size-5" />}
    />
  );
}
