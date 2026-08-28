import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Chat de emergencia",
      description: "Canal único de la sala de emergencia.",
};

export default function EmergencyChatPage() {
  return (
    <PagePlaceholder
      title="Chat de emergencia"
    />
  );
}
