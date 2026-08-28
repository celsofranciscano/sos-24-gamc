import type { Metadata } from "next";

import { InstitutionLoginForm } from "@/components/auth/institution-login-form";

export const metadata: Metadata = {
  title: "Acceso institucional",
};

export default function LoginPage() {
  return <InstitutionLoginForm />;
}
