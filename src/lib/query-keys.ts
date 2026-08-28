import type { RealtimeEvent } from "@/lib/realtime/bus";

// ============================================================
// CLAVES DE REACT QUERY (una sola fuente de verdad)
// Las claves son jerárquicas: invalidar ["emergencies"] refresca
// todas las listas/consultas que empiecen con ese prefijo.
// ============================================================

export const qk = {
  stats: (params?: string) => ["stats", params ?? ""] as const,

  emergencies: (filters?: unknown) => ["emergencies", filters ?? null] as const,
  emergency: (id: number) => ["emergencies", "detail", id] as const,

  assignments: (filters?: unknown) => ["assignments", filters ?? null] as const,
  assignment: (id: number) => ["assignments", "detail", id] as const,
  assignmentTracking: (id: number) => ["assignments", id, "tracking"] as const,

  units: (filters?: unknown) => ["units", filters ?? null] as const,
  unitLocations: (id: number) => ["units", id, "locations"] as const,

  catalog: (entity: string, filters?: unknown) => ["catalog", entity, filters ?? null] as const,
  citizens: (filters?: unknown) => ["citizens", filters ?? null] as const,
  citizen: (id: number) => ["citizens", "detail", id] as const,

  aiSessions: (filters?: unknown) => ["ai", "sessions", filters ?? null] as const,

  notificationsUser: () => ["notifications", "me"] as const,

  reportsOverview: (params?: string) => ["reports", "overview", params ?? ""] as const,
};

/**
 * Traduce un evento del canal en tiempo real a las familias de queries
 * que deben invalidarse. Se usa en el puente SSE del dashboard.
 */
export function queryKeysForEvent(event: RealtimeEvent): readonly unknown[][] {
  if (event.topic.startsWith("emergency:") || event.topic === "emergencies") {
    return [
      ["stats"],
      ["reports"],
      ["emergencies"],
      ["assignments"],
    ];
  }
  if (event.topic.startsWith("assignment:")) {
    return [["assignments"], ["stats"], ["emergencies"]];
  }
  if (event.topic.startsWith("unit:")) {
    return [["units"]];
  }
  if (event.topic.startsWith("notifications:user:")) {
    return [["notifications"]];
  }
  if (event.topic === "dashboard") {
    return [["stats"], ["reports"]];
  }
  return [];
}
