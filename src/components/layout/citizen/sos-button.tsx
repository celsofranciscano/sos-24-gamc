"use client";

import Link from "next/link";
import { Siren } from "lucide-react";

import { cn } from "@/lib/utils";

export function SosButton({ className }: { className?: string }) {
  return (
    <Link
      href="/citizen/emergency/new"
      aria-label="Reportar emergencia"
      className={cn(
        "absolute right-4 bottom-24 z-30 flex size-20 flex-col items-center justify-center gap-0.5 rounded-full bg-destructive text-white shadow-lg shadow-destructive/40 ring-4 ring-destructive/20 transition-transform active:scale-95",
        className,
      )}
    >
      <Siren className="size-7" />
      <span className="text-xs font-bold tracking-wide">SOS</span>
    </Link>
  );
}
