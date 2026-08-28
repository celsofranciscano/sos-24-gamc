import type { Metadata } from "next";
import Link from "next/link";
import { LogIn, Siren } from "lucide-react";

import { APP_FULL_NAME, APP_NAME } from "@/constants/org";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: `${APP_NAME} · Emergencia 24/7 con IA`,
  description: APP_FULL_NAME,
};

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-destructive text-white shadow-lg shadow-destructive/30">
        <Siren className="size-8" />
      </span>
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">{APP_NAME}</h1>
        <p className="max-w-md text-muted-foreground">{APP_FULL_NAME}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/citizen/login"
          className={cn(buttonVariants({ size: "lg" }), "gap-2")}
        >
          <Siren className="size-4" />
          Soy ciudadano
        </Link>
        <Link
          href="/login"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2")}
        >
          <LogIn className="size-4" />
          Acceso institucional
        </Link>
      </div>
    </div>
  );
}
