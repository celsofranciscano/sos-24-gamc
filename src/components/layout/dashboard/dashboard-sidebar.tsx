"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut } from "lucide-react";

import {
  APP_NAME,
  DASHBOARD_NAV,
  canAccess,
  type DashboardNavItem,
  type DashboardNavEntry,
} from "@/constants/org";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

type DashboardSidebarProps = {
  privilegeCode?: string | null;
  privilegeName?: string | null;
  userName: string;
  institutionName?: string | null;
  onNavigate?: () => void;
};

function isGroup(entry: DashboardNavEntry): entry is { label: string; icon: DashboardNavItem["icon"]; items: DashboardNavItem[] } {
  return "items" in entry;
}

type NavGroup = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: DashboardNavItem[];
};

type VisibleEntry = { group: NavGroup; items: DashboardNavItem[] } | { direct: DashboardNavItem };

/** true si la ruta actual pertenece a este enlace (o a sus subrutas). */
function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
}

export function DashboardSidebar({
  privilegeCode,
  privilegeName,
  userName,
  institutionName,
  onNavigate,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  // Entradas visibles según el privilegio; los grupos sin hijos visibles desaparecen.
  const entries = useMemo<VisibleEntry[]>(() => {
    const out: VisibleEntry[] = [];
    for (const entry of DASHBOARD_NAV) {
      if (isGroup(entry)) {
        const items = entry.items.filter((i) => canAccess(i, privilegeCode));
        if (items.length > 0) out.push({ group: entry, items });
      } else {
        out.push({ direct: entry as DashboardNavItem });
      }
    }
    return out;
  }, [privilegeCode]);

  const activeHref = useMemo(() => {
    for (const entry of entries) {
      if ("direct" in entry && isActivePath(pathname, entry.direct.href)) {
        return entry.direct.href;
      }
      if ("group" in entry) {
        for (const item of entry.items) {
          if (isActivePath(pathname, item.href)) return item.href;
        }
      }
    }
    return null;
  }, [entries, pathname]);

  // Grupos abiertos: el grupo que contiene la ruta activa inicia abierto.
  const initialOpen = () => {
    const set = new Set<string>();
    for (const entry of entries) {
      if (!("group" in entry)) continue;
      if (entry.items.some((i) => isActivePath(pathname, i.href))) set.add(entry.group.label);
    }
    return set;
  };
  const [openGroups, setOpenGroups] = useState<Set<string>>(initialOpen);

  const toggleGroup = (label: string) =>
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });

  const linkClass = (active: boolean) =>
    cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
      active
        ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
        : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
    );

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border px-4">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2 font-semibold"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            SOS
          </span>
          <span>{APP_NAME}</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {entries.map((entry) => {
          // Enlace directo (ej: Inicio).
          if ("direct" in entry) {
            const item = entry.direct;
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={linkClass(active)}
              >
                <item.icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          }

          // Grupo colapsable.
          const group = entry.group;
          const groupActive = entry.items.some((i) => i.href === activeHref);
          const open = openGroups.has(group.label);

          return (
            <div key={group.label}>
              <button
                type="button"
                onClick={() => toggleGroup(group.label)}
                aria-expanded={open}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  groupActive
                    ? "font-medium text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <group.icon className="size-4 shrink-0" />
                <span className="flex-1 text-left">{group.label}</span>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 transition-transform duration-200",
                    open && "rotate-180",
                  )}
                />
              </button>

              {open && (
                <div className="mt-0.5 mb-1 ml-4 space-y-0.5 border-l border-sidebar-border pl-2">
                  {entry.items.map((item) => {
                    const active = isActivePath(pathname, item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        className={cn(linkClass(active), "gap-2.5 py-1.5 text-[13px]")}
                      >
                        <item.icon className="size-3.5 shrink-0" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="shrink-0 space-y-2 border-t border-sidebar-border p-3">
        <div className="px-2">
          <p className="truncate text-sm font-medium">{userName}</p>
          <p className="truncate text-xs text-muted-foreground">
            {privilegeName ?? "Usuario"}
            {institutionName ? ` · ${institutionName}` : ""}
          </p>
        </div>
        <form action={signOutAction}>
          <Button variant="outline" size="sm" type="submit" className="w-full justify-start gap-2">
            <LogOut className="size-4" />
            Cerrar sesión
          </Button>
        </form>
      </div>
    </div>
  );
}
