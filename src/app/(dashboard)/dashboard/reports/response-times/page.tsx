import type { Metadata } from "next";
import { Timer } from "lucide-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Tiempos de respuesta",
};

export default function ResponseTimesPage() {
  return (
    <PagePlaceholder
      title="Tiempos de respuesta"
      icon={<Timer className="size-5" />}
    />
  );
}
