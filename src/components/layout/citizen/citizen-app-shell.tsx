"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Siren } from "lucide-react";

import { APP_NAME, CITIZEN_TABS } from "@/constants/org";
import { cn } from "@/lib/utils";

export function CitizenAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex h-dvh w-full max-w-md flex-col bg-background sm:my-0">
      <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur">
        <Link href="/citizen" className="flex items-center gap-2 font-semibold">
          <span className="flex size-7 items-center justify-center rounded-lg bg-destructive text-white">
            <Siren className="size-4" />
          </span>
          {APP_NAME}
        </Link>
        <span className="text-xs text-muted-foreground">Cochabamba</span>
      </header>

      <main className="flex-1 overflow-y-auto pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
        {children}
      </main>

      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
      >
        <div className="grid h-[4.5rem] grid-cols-4">
          {CITIZEN_TABS.map((tab) => {
            const active =
              tab.href === "/citizen"
                ? pathname === "/citizen" || pathname.startsWith("/citizen/emergency")
                : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 text-[0.7rem] font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground active:text-foreground",
                )}
              >
                <tab.icon className={cn("size-5", active && "scale-110")} />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
