import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { CitizenAppShell } from "@/components/layout/citizen/citizen-app-shell";

export default async function CitizenAppLayout({
  children,
}: LayoutProps<"/citizen">) {
  const session = await auth();

  if (!session?.user || session.user.role !== "CITIZEN") {
    redirect("/citizen/login");
  }

  return <CitizenAppShell>{children}</CitizenAppShell>;
}
