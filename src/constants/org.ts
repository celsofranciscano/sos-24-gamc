import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Bot,
  Building2,
  Clock,
  Landmark,
  Map,
  MapPin,
  Network,
  Phone,
  Radio,
  Siren,
  ShieldCheck,
  Truck,
  User,
  UserRound,
  Users,
} from "lucide-react";

export const APP_NAME = "SOS-24";
export const APP_FULL_NAME =
  "Sistema Inteligente de Coordinación y Respuesta a Emergencias";
export const ORG_NAME = "Gobierno Autónomo Municipal de Cochabamba";
export const ORG_SHORT_NAME = "GAMC";

export type DashboardAccess = "central" | "institution" | "all";

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  access: DashboardAccess;
};

/**
 * Entrada del menú: un enlace directo o un grupo con subitems.
 * Los grupos se muestran solo si al menos un hijo es visible.
 */
export type DashboardNavEntry =
  | DashboardNavItem
  | { label: string; icon: LucideIcon; items: DashboardNavItem[] };

const CENTRAL_CODES = ["CENTRAL", "DISPATCHER"];

export function isCentralPrivilege(privilegeCode?: string | null): boolean {
  if (!privilegeCode) return false;
  return CENTRAL_CODES.some((prefix) => privilegeCode.startsWith(prefix));
}

export function canAccess(
  item: DashboardNavItem,
  privilegeCode?: string | null,
): boolean {
  if (item.access === "all") return true;
  const central = isCentralPrivilege(privilegeCode);
  return item.access === "central" ? central : !central;
}

// ============================================================
// NAVEGACIÓN DEL DASHBOARD AGRUPADA
// Enlace directo = DashboardNavItem con href.
// Grupo = objeto con items[]; se oculta si ningún hijo es visible.
// ============================================================
export const DASHBOARD_NAV: DashboardNavEntry[] = [
  {
    label: "Inicio",
    href: "/dashboard",
    icon: Landmark,
    access: "all",
  },
  {
    label: "Operación",
    icon: Siren,
    items: [
      {
        label: "Emergencias",
        href: "/dashboard/emergencies",
        icon: Siren,
        access: "all",
      },
      {
        label: "Mapa operativo",
        href: "/dashboard/emergency-map",
        icon: Map,
        access: "all",
      },
      { label: "Despacho", href: "/dashboard/dispatch", icon: Radio, access: "all" },
    ],
  },
  {
    label: "Instituciones",
    icon: Building2,
    items: [
      {
        label: "Instituciones",
        href: "/dashboard/institutions",
        icon: Building2,
        access: "central",
      },
      {
        label: "Subinstituciones",
        href: "/dashboard/subinstitutions",
        icon: Network,
        access: "central",
      },
      {
        label: "Tipos de institución",
        href: "/dashboard/institution-types",
        icon: Landmark,
        access: "central",
      },
    ],
  },
  {
    label: "Unidades y recursos",
    icon: Truck,
    items: [
      { label: "Unidades", href: "/dashboard/units", icon: Truck, access: "all" },
      {
        label: "Tipos de recurso",
        href: "/dashboard/resource-types",
        icon: Truck,
        access: "central",
      },
    ],
  },
  {
    label: "Administración",
    icon: ShieldCheck,
    items: [
      { label: "Usuarios", href: "/dashboard/users", icon: Users, access: "central" },
      {
        label: "Privilegios",
        href: "/dashboard/privileges",
        icon: ShieldCheck,
        access: "central",
      },
      {
        label: "Ciudadanos",
        href: "/dashboard/citizens",
        icon: UserRound,
        access: "central",
      },
    ],
  },
  {
    label: "Catálogos",
    icon: AlertTriangle,
    items: [
      {
        label: "Tipos de emergencia",
        href: "/dashboard/emergency-types",
        icon: AlertTriangle,
        access: "central",
      },
    ],
  },
  {
    label: "Seguimiento",
    icon: BarChart3,
    items: [
      { label: "IA", href: "/dashboard/ai", icon: Bot, access: "all" },
      {
        label: "Notificaciones",
        href: "/dashboard/notifications",
        icon: Bell,
        access: "all",
      },
      {
        label: "Reportes",
        href: "/dashboard/reports",
        icon: BarChart3,
        access: "all",
      },
    ],
  },
];

export type CitizenTab = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const CITIZEN_TABS: CitizenTab[] = [
  { label: "Mapa", href: "/citizen", icon: MapPin },
  { label: "Historial", href: "/citizen/history", icon: Clock },
  { label: "Números", href: "/citizen/emergency-numbers", icon: Phone },
  { label: "Cuenta", href: "/citizen/account", icon: User },
];
