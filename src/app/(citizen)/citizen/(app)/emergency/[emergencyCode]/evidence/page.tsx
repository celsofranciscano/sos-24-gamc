import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Evidencias",
      description: "Fotografías, videos y audios del reporte.",
};

export default function EmergencyEvidencePage() {
  return (
    <PagePlaceholder
      title="Evidencias"
    />
  );
}
