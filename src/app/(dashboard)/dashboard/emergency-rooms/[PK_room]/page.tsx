import type { Metadata } from "next";
import { MessagesSquare } from "lucide-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Sala de emergencia",
      description: "Canal único: ciudadanos, Central GAMC, instituciones, unidades e IA.",
};

export default function EmergencyRoomPage() {
  return (
    <PagePlaceholder
      title="Sala de emergencia"
      icon={<MessagesSquare className="size-5" />}
    />
  );
}
