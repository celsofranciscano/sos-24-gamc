import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Mi perfil",
};

export default function ProfilePage() {
  return (
    <PagePlaceholder
      title="Mi perfil"
    />
  );
}
