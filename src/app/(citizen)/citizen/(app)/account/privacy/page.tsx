import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Privacidad y seguridad",
};

export default function PrivacyPage() {
  return (
    <PagePlaceholder
      title="Privacidad y seguridad"
    />
  );
}
