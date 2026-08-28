import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Historial",
      description: "Emergencias reportadas, ordenadas por fecha descendente.",
};

export default function HistoryPage() {
  return (
    <PagePlaceholder
      title="Historial"
    />
  );
}
