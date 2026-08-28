import type { Metadata } from "next";
import { Bell } from "lucide-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Notificaciones",
};

export default function NotificationsPage() {
  return (
    <PagePlaceholder
      title="Notificaciones"
      icon={<Bell className="size-5" />}
    />
  );
}
