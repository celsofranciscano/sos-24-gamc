import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Acerca de SOS-24",
};

export default function AboutPage() {
  return (
    <PagePlaceholder
      title="Acerca de SOS-24"
    />
  );
}
