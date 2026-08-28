import type { Metadata } from "next";

import { CitizenRegisterForm } from "@/components/auth/citizen-register-form";

export const metadata: Metadata = {
  title: "Crear cuenta",
};

export default function CitizenRegisterPage() {
  return <CitizenRegisterForm />;
}
