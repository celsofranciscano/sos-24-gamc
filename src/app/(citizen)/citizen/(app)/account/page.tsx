import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Mi cuenta",
      description: "Perfil, notificaciones, dispositivo, privacidad y acerca de.",
};

export default function AccountPage() {
  return (
    <PagePlaceholder
      title="Mi cuenta"
    />
  );
}
