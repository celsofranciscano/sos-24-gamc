import type { Metadata } from "next";
import { Bot } from "lucide-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Sesiones de IA",
      description: "Sesiones ciudadano-IA y vinculaciones a emergencias.",
};

export default function AiSessionsPage() {
  return (
    <PagePlaceholder
      title="Sesiones de IA"
      icon={<Bot className="size-5" />}
    />
  );
}
