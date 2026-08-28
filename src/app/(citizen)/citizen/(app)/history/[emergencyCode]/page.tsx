import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Detalle histórico",
      description: "Reutiliza la vista de detalle de emergencia.",
};

export default function HistoryDetailPage() {
  return (
    <PagePlaceholder
      title="Detalle histórico"
    />
  );
}
