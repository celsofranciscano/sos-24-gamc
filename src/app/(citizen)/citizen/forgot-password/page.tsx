import type { Metadata } from "next";
import { KeyRound } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
};

export default function ForgotPasswordPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Recuperar contraseña</CardTitle>
      </CardHeader>
      <CardContent>
        <PagePlaceholder
          title="Recuperar contraseña"
          icon={<KeyRound className="size-5" />}
          description="Recuperación de contraseña por teléfono o correo."
        />
      </CardContent>
    </Card>
  );
}
