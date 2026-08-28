import type { Metadata } from "next";

import { CitizenLoginForm } from "@/components/auth/citizen-login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default function CitizenLoginPage() {
  return <CitizenLoginForm />;
}
