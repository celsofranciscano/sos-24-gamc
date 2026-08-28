"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

import { APP_NAME } from "@/constants/org";
import { DashboardSidebar } from "@/components/layout/dashboard/dashboard-sidebar";
import { Button } from "@/components/ui/button";

type DashboardShellProps = {
  children: React.ReactNode;
  user: {
    firstName: string;
    lastName: string;
    privilegeCode?: string | null;
    privilegeName?: string | null;
  };
  institutionName?: string | null;
};

export function DashboardShell({ children, user, institutionName }: DashboardShellProps) {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <div className="min-h-dvh bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-sidebar-border lg:block">
        <DashboardSidebar
          privilegeCode={user.privilegeCode}
          privilegeName={user.privilegeName}
          userName={`${user.firstName} ${user.lastName}`}
          institutionName={institutionName}
        />
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={close}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-sidebar-border shadow-xl">
            <DashboardSidebar
              privilegeCode={user.privilegeCode}
              privilegeName={user.privilegeName}
              userName={`${user.firstName} ${user.lastName}`}
              institutionName={institutionName}
              onNavigate={close}
            />
          </aside>
        </div>
      ) : null}

      <div className="flex min-h-dvh flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
          <span className="font-semibold lg:hidden">{APP_NAME}</span>
          <span className="hidden text-sm text-muted-foreground lg:inline">
            Centro de coordinación de emergencias
          </span>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
