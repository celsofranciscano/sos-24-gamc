import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DashboardShell } from "@/components/layout/dashboard/dashboard-shell";
import { DashboardProviders } from "@/components/providers/dashboard-providers";
import prisma from "@/lib/db/prisma";

export default async function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const session = await auth();

  const user = session?.user;

  if (!user || user.role !== "INSTITUTION") {
    redirect("/login");
  }

  let institutionName: string | null = null;

  if (user.institutionId) {
    const institution = await prisma.tbinstitutions.findUnique({
      where: { PK_institution: user.institutionId },
      select: { name: true },
    });
    institutionName = institution?.name ?? null;
  }

  return (
    <DashboardShell user={user} institutionName={institutionName}>
      <DashboardProviders>{children}</DashboardProviders>
    </DashboardShell>
  );
}
