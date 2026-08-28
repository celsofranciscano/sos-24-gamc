import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Mi emergencia",
      description: "Estado, institución, unidad, chat, evidencias y seguimiento.",
};

export default function EmergencyDetailPage() {
  return (
    <PagePlaceholder
      title="Mi emergencia"
    />
  );
}
