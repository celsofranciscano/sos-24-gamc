import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ============================================================
// BADGES SEMÁNTICOS DEL SISTEMA
// Colores y etiquetas centralizados para prioridades, estados de
// emergencia, asignaciones, unidades y requerimientos.
// ============================================================

export const PRIORITY_META: Record<string, { label: string; color: string }> = {
  BAJA: { label: "Baja", color: "bg-slate-400" },
  MEDIA: { label: "Media", color: "bg-amber-500" },
  ALTA: { label: "Alta", color: "bg-orange-600" },
  CRITICA: { label: "Crítica", color: "bg-red-600" },
};

export const EMERGENCY_STATUS_META: Record<string, { label: string; color: string }> = {
  REPORTADA: { label: "Reportada", color: "bg-sky-500" },
  EN_ANALISIS: { label: "En análisis", color: "bg-indigo-500" },
  CLASIFICADA: { label: "Clasificada", color: "bg-violet-500" },
  ASIGNADA: { label: "Asignada", color: "bg-blue-600" },
  EN_ATENCION: { label: "En atención", color: "bg-amber-600" },
  RESUELTA: { label: "Resuelta", color: "bg-emerald-600" },
  FALSA_ALARMA: { label: "Falsa alarma", color: "bg-slate-500" },
  CANCELADA: { label: "Cancelada", color: "bg-zinc-500" },
  AGRUPADA_DUPLICADA: { label: "Duplicada", color: "bg-stone-400" },
};

export const ASSIGNMENT_STATUS_META: Record<string, { label: string; color: string }> = {
  SOLICITADA: { label: "Solicitada", color: "bg-amber-500" },
  ACEPTADA: { label: "Aceptada", color: "bg-sky-600" },
  EN_CAMINO: { label: "En camino", color: "bg-indigo-600" },
  EN_SITIO: { label: "En sitio", color: "bg-violet-600" },
  FINALIZADA: { label: "Finalizada", color: "bg-emerald-600" },
  RECHAZADA: { label: "Rechazada", color: "bg-red-600" },
  CANCELADA: { label: "Cancelada", color: "bg-zinc-500" },
};

export const UNIT_STATUS_META: Record<string, { label: string; color: string }> = {
  DISPONIBLE: { label: "Disponible", color: "bg-emerald-500" },
  EN_CAMINO: { label: "En camino", color: "bg-indigo-600" },
  EN_SITIO: { label: "En sitio", color: "bg-violet-600" },
  OCUPADA: { label: "Ocupada", color: "bg-orange-600" },
  FUERA_DE_SERVICIO: { label: "Fuera de servicio", color: "bg-zinc-500" },
};

export const REQUIREMENT_STATUS_META: Record<string, { label: string; color: string }> = {
  PENDIENTE: { label: "Pendiente", color: "bg-amber-500" },
  ASIGNADO: { label: "Asignado", color: "bg-sky-600" },
  ATENDIDO: { label: "Atendido", color: "bg-emerald-600" },
};

function DotBadge({
  meta,
  value,
}: {
  meta: Record<string, { label: string; color: string }>;
  value: string | null | undefined;
}) {
  if (!value) return <span className="text-muted-foreground">—</span>;
  const info = meta[value] ?? { label: value, color: "bg-muted-foreground" };
  return (
    <Badge variant="outline" className="gap-1.5">
      <span className={cn("size-1.5 rounded-full", info.color)} />
      {info.label}
    </Badge>
  );
}

export function PriorityBadge({ value }: { value?: string | null }) {
  return <DotBadge meta={PRIORITY_META} value={value} />;
}

export function EmergencyStatusBadge({ value }: { value?: string | null }) {
  return <DotBadge meta={EMERGENCY_STATUS_META} value={value} />;
}

export function AssignmentStatusBadge({ value }: { value?: string | null }) {
  return <DotBadge meta={ASSIGNMENT_STATUS_META} value={value} />;
}

export function UnitStatusBadge({ value }: { value?: string | null }) {
  return <DotBadge meta={UNIT_STATUS_META} value={value} />;
}

export function RequirementStatusBadge({ value }: { value?: string | null }) {
  return <DotBadge meta={REQUIREMENT_STATUS_META} value={value} />;
}
