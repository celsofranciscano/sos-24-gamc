import type { Metadata } from "next";
import { KeyRound } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Verificación",
};

export default function VerifyPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Verificación</CardTitle>
      </CardHeader>
      <CardContent>
        <PagePlaceholder
          title="Verificación"
          icon={<KeyRound className="size-5" />}
          description="Verificación de teléfono, correo o código temporal."
        />
      </CardContent>
    </Card>
  );
}
