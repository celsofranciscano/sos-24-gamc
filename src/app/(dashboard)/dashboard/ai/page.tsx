import type { Metadata } from "next";
import { Bot } from "lucide-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Inteligencia Artificial",
      description: "Monitoreo del motor de IA.",
};

export default function AiPage() {
  return (
    <PagePlaceholder
      title="Inteligencia Artificial"
      icon={<Bot className="size-5" />}
    />
  );
}
