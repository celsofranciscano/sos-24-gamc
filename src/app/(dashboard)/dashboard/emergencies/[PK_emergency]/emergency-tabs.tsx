"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LabeledSelect,
} from "@/components/ui/labeled-select";
import {
  ASSIGNMENT_STATUS_META,
  AssignmentStatusBadge,
  EmergencyStatusBadge,
  PRIORITY_META,
  PriorityBadge,
  REQUIREMENT_STATUS_META,
  RequirementStatusBadge,
} from "@/components/dashboard/badges";
import { GoogleMap, type MapMarker, type MapPath } from "@/components/maps/google-map";
import { apiGet, apiPatch, apiPost } from "@/lib/api/client";
import { qk } from "@/lib/query-keys";
import type { EmergencyDetail } from "./page";

// ============================================================
// PESTAÑAS DEL EXPEDIENTE DE EMERGENCIA
// Cada pestaña es una sección independiente del flujo SOS-24.
// Todas se refrescan solas con los eventos en tiempo real.
// ============================================================

type Tab = "resumen" | "mapa" | "reportes" | "ia" | "requerimientos" | "asignaciones" | "sala" | "avances" | "evidencias" | "destinos" | "historial";

const TABS: { key: Tab; label: string }[] = [
  { key: "resumen", label: "Resumen" },
  { key: "mapa", label: "Mapa y GPS" },
  { key: "reportes", label: "Reportes" },
  { key: "ia", label: "Análisis IA" },
  { key: "requerimientos", label: "Requerimientos" },
  { key: "asignaciones", label: "Asignaciones" },
  { key: "sala", label: "Sala común" },
  { key: "avances", label: "Avances" },
  { key: "evidencias", label: "Evidencias" },
  { key: "destinos", label: "Destinos" },
  { key: "historial", label: "Historial" },
];

const base = "/api/dashboard/emergencies";

export function EmergencyTabs({ detail }: { detail: EmergencyDetail }) {
  const [tab, setTab] = useState<Tab>("resumen");
  const id = detail.PK_emergency;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div role="tablist" className="flex gap-1 border-b">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 border-b-2 px-3 py-2 text-sm whitespace-nowrap transition-colors ${
                tab === t.key
                  ? "border-primary font-medium text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "resumen" && <SummaryTab detail={detail} />}
      {tab === "mapa" && <MapTab detail={detail} />}
      {tab === "reportes" && <ReportsTab id={id} />}
      {tab === "ia" && <AiTab id={id} />}
      {tab === "requerimientos" && <RequirementsTab id={id} />}
      {tab === "asignaciones" && <AssignmentsTab detail={detail} />}
      {tab === "sala" && <RoomTab detail={detail} />}
      {tab === "avances" && <ProgressTab id={id} />}
      {tab === "evidencias" && <EvidencesTab id={id} />}
      {tab === "destinos" && <DestinationsTab id={id} />}
      {tab === "historial" && <HistoryTab id={id} />}
    </div>
  );
}

function useInvalidate(emergencyId: number) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["emergencies"] });
}

/* ---------------- RESUMEN ---------------- */

function SummaryTab({ detail }: { detail: EmergencyDetail }) {
  const invalidate = useInvalidate(detail.PK_emergency);
  const patch = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiPatch(`${base}/${detail.PK_emergency}`, data),
    onSuccess: invalidate,
  });

  const rows: { label: string; value?: React.ReactNode }[] = [
    { label: "Personas afectadas", value: detail.affectedPersons ?? "—" },
    { label: "Personas atrapadas", value: detail.trappedPersons ?? "—" },
    { label: "Personas desaparecidas", value: detail.missingPersons ?? "—" },
    { label: "Animales afectados", value: detail.affectedAnimals ?? "—" },
    {
      label: "Resuelta",
      value: detail.resolvedAt ? new Date(detail.resolvedAt).toLocaleString("es-BO") : "—",
    },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Descripción del caso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm whitespace-pre-line text-muted-foreground">
            {detail.description ?? "Sin descripción registrada."}
          </p>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {rows.map((row) => (
              <div key={row.label} className="rounded-lg bg-muted/50 px-3 py-2">
                <dt className="text-[11px] text-muted-foreground">{row.label}</dt>
                <dd className="text-sm font-medium tabular-nums">{row.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Clasificación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-1.5">
            <Label>Prioridad</Label>
            <LabeledSelect
              options={Object.entries(PRIORITY_META).map(([value, meta]) => ({
                label: meta.label,
                value,
              }))}
              value={detail.priority}
              onValueChange={(priority) => patch.mutate({ priority })}
            />
          </div>
          <PriorityBadge value={detail.priority} />
          {patch.isPending && <p className="text-xs text-muted-foreground">Guardando...</p>}
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------- MAPA Y GPS ---------------- */

type TrackingPoint = { latitude: number; longitude: number; createdAt: string };

function MapTab({ detail }: { detail: EmergencyDetail }) {
  const locationsQuery = useQuery({
    queryKey: [...qk.emergency(detail.PK_emergency), "locations"],
    queryFn: () => apiGet<{ latitude: number; longitude: number; address: string | null; createdAt: string }[]>(`${base}/${detail.PK_emergency}/locations`),
  });
  const assignmentsQuery = useQuery({
    queryKey: [...qk.emergency(detail.PK_emergency), "assignments"],
    queryFn: () =>
      apiGet<
        {
          PK_assignment: number;
          status: string;
          tbunits: { unitCode: string } | null;
        }[]
      >(`${base}/${detail.PK_emergency}/assignments`),
  });

  // Rutas GPS de asignaciones en camino (una sola consulta combinada).
  const activeAssignments = (assignmentsQuery.data ?? []).filter((a) => a.status === "EN_CAMINO");
  const trackingQuery = useQuery({
    queryKey: [...qk.emergency(detail.PK_emergency), "tracking", activeAssignments.map((a) => a.PK_assignment).join(",")],
    queryFn: async () => {
      const results = await Promise.all(
        activeAssignments.map(async (assignment) => ({
          PK_assignment: assignment.PK_assignment,
          unitCode: assignment.tbunits?.unitCode ?? "",
          ...(await apiGet<{ points: TrackingPoint[] }>(`/api/dashboard/dispatch/${assignment.PK_assignment}/tracking`)),
        })),
      );
      return results;
    },
    enabled: activeAssignments.length > 0,
    refetchInterval: 15_000,
  });

  if (locationsQuery.isLoading) return <Card><CardContent className="h-96 animate-pulse rounded-xl bg-muted" /></Card>;

  const markers: MapMarker[] = (locationsQuery.data ?? []).map((location, index) => ({
    id: `loc-${index}`,
    lat: location.latitude,
    lng: location.longitude,
    color: "#dc2626",
    title: location.address ?? `Ubicación ${index + 1}`,
  }));

  const paths: MapPath[] = (trackingQuery.data ?? [])
    .map((result) => ({
      id: `route-${result.PK_assignment}`,
      color: "#2563eb",
      points: result.points.map((p) => ({ lat: p.latitude, lng: p.longitude })),
    }))
    .filter((path) => path.points.length > 0);

  return (
    <div className="space-y-3">
      <GoogleMap markers={markers} paths={paths} zoom={15} className="h-96" />
      {paths.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Azul: ruta GPS de unidades en camino ({(trackingQuery.data ?? []).map((r) => r.unitCode).filter(Boolean).join(", ")}) · Rojo: ubicaciones del incidente.
        </p>
      )}
    </div>
  );
}

/* ---------------- REPORTES CIUDADANOS ---------------- */

type ReportRow = {
  PK_report: number;
  reportChannel: string;
  description: string | null;
  reportedAt: string;
  isLinkedByAI: boolean;
  linkingConfidence: number | null;
  distanceMetersFromMain: number | null;
  tbcitizens: { firstName: string; lastName: string } | null;
};

function ReportsTab({ id }: { id: number }) {
  const [description, setDescription] = useState("");
  const invalidate = useInvalidate(id);

  const list = useQuery({
    queryKey: [...qk.emergency(id), "reports"],
    queryFn: () => apiGet<ReportRow[]>(`${base}/${id}/reports`),
  });

  const create = useMutation({
    mutationFn: (fd: FormData) =>
      apiPost(`${base}/${id}/reports`, {
        reportChannel: String(fd.get("reportChannel")),
        description: String(fd.get("description") ?? "") || null,
        latitude: Number(fd.get("latitude")),
        longitude: Number(fd.get("longitude")),
      }),
    onSuccess: () => {
      setDescription("");
      invalidate();
    },
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vincular reporte al caso</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3 sm:grid-cols-5"
            onSubmit={(e) => {
              e.preventDefault();
              create.mutate(new FormData(e.currentTarget));
            }}
          >
            <select name="reportChannel" defaultValue="APP_CHAT" className="h-8 rounded-lg border bg-transparent px-2 text-sm">
              <option value="APP_CHAT">Chat app</option>
              <option value="APP_CALL">Llamada</option>
              <option value="MANUAL_OPERATOR">Operador</option>
            </select>
            <Input name="latitude" type="number" step="any" placeholder="Latitud" required />
            <Input name="longitude" type="number" step="any" placeholder="Longitud" required />
            <Input
              name="description"
              placeholder="Descripción del reportante"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Button type="submit" disabled={create.isPending}>
              Vincular
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {(list.data ?? []).map((report) => (
          <Card key={report.PK_report}>
            <CardContent className="flex flex-wrap items-start justify-between gap-2 py-3">
              <div className="min-w-0 space-y-1">
                <p className="text-sm">{report.description ?? "(sin texto)"}</p>
                <p className="text-xs text-muted-foreground">
                  {report.tbcitizens ? `${report.tbcitizens.firstName} ${report.tbcitizens.lastName} · ` : ""}
                  {report.reportChannel} · {new Date(report.reportedAt).toLocaleString("es-BO")}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {report.isLinkedByAI && (
                  <Badge variant="info">IA {Math.round((report.linkingConfidence ?? 0) * 100)}%</Badge>
                )}
                {report.distanceMetersFromMain != null && (
                  <Badge variant="secondary">{Math.round(report.distanceMetersFromMain)} m</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {(list.data?.length ?? 0) === 0 && !list.isLoading && (
          <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
            Solo el reporte inicial. Aquí aparecerán los reportes duplicados que la IA vincule.
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------------- ANÁLISIS IA ---------------- */

type AiAnalysis = {
  PK_aiAnalysis: number;
  confidenceScore: number;
  suggestedPriority: string;
  extractedEntities: unknown;
  createdAt: string;
};

function AiTab({ id }: { id: number }) {
  const list = useQuery({
    queryKey: [...qk.emergency(id), "ai"],
    queryFn: () => apiGet<AiAnalysis[]>(`${base}/${id}/ai-analyses`),
  });

  const analyses = list.data ?? [];
  if (analyses.length === 0) {
    return (
      <p className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
        Sin análisis de IA registrados para este caso.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {analyses.map((analysis) => (
        <Card key={analysis.PK_aiAnalysis}>
          <CardContent className="space-y-3 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <PriorityBadge value={analysis.suggestedPriority} />
              <Badge variant={analysis.confidenceScore >= 0.8 ? "success" : "warning"}>
                Confianza {Math.round(analysis.confidenceScore * 100)}%
              </Badge>
              <span className="ml-auto text-xs text-muted-foreground">
                {new Date(analysis.createdAt).toLocaleString("es-BO")}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.round(analysis.confidenceScore * 100)}%` }}
              />
            </div>
            <pre className="max-h-48 overflow-auto rounded-lg bg-muted/60 p-3 text-xs">
              {JSON.stringify(analysis.extractedEntities, null, 2)}
            </pre>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ---------------- REQUERIMIENTOS ---------------- */

type RequirementRow = {
  PK_requirement: number;
  quantity: number;
  status: string;
  tbresourcetypes: { name: string; code: string } | null;
};

function RequirementsTab({ id }: { id: number }) {
  const invalidate = useInvalidate(id);
  const resourceTypes = useQuery({
    queryKey: qk.catalog("resource-types", "options"),
    queryFn: () => apiGet<{ items: { PK_resourceType: number; name: string }[] }>("/api/dashboard/resource-types?pageSize=200"),
  });
  const list = useQuery({
    queryKey: [...qk.emergency(id), "requirements"],
    queryFn: () => apiGet<RequirementRow[]>(`${base}/${id}/requirements`),
  });

  const create = useMutation({
    mutationFn: (fd: FormData) =>
      apiPost(`${base}/${id}/requirements`, {
        FK_resourceType: Number(fd.get("FK_resourceType")),
        quantity: Number(fd.get("quantity") || 1),
      }),
    onSuccess: invalidate,
  });

  const patch = useMutation({
    mutationFn: (input: { PK_requirement: number; status: string }) =>
      apiPatch(`${base}/${id}/requirements`, input),
    onSuccess: invalidate,
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agregar requerimiento</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 sm:grid-cols-4" onSubmit={(e) => { e.preventDefault(); create.mutate(new FormData(e.currentTarget)); }}>
            <select name="FK_resourceType" required className="h-8 rounded-lg border bg-transparent px-2 text-sm">
              <option value="">Tipo de recurso...</option>
              {(resourceTypes.data?.items ?? []).map((rt) => (
                <option key={rt.PK_resourceType} value={rt.PK_resourceType}>{rt.name}</option>
              ))}
            </select>
            <Input name="quantity" type="number" min={1} defaultValue={1} />
            <Button type="submit" disabled={create.isPending}>Agregar</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {(list.data ?? []).map((req) => (
          <Card key={req.PK_requirement}>
            <CardContent className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div>
                <p className="text-sm font-medium">
                  {req.quantity} × {req.tbresourcetypes?.name ?? "Recurso"}
                </p>
                <RequirementStatusBadge value={req.status} />
              </div>
              <LabeledSelect
                className="w-32"
                options={Object.entries(REQUIREMENT_STATUS_META).map(([value, meta]) => ({
                  label: meta.label,
                  value,
                }))}
                value={req.status}
                onValueChange={(status) =>
                  patch.mutate({ PK_requirement: req.PK_requirement, status: String(status) })
                }
              />
            </CardContent>
          </Card>
        ))}
        {(list.data?.length ?? 0) === 0 && !list.isLoading && (
          <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">
            Sin requerimientos registrados.
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------------- ASIGNACIONES ---------------- */

type AssignmentRow = {
  PK_assignment: number;
  status: string;
  assignedAt: string;
  acceptedAt: string | null;
  arrivedAt: string | null;
  completedAt: string | null;
  tbinstitutions: { name: string; acronym: string } | null;
  tbsubinstitutions: { name: string } | null;
  tbunits: { unitCode: string; unitName: string } | null;
};

function AssignmentsTab({ detail }: { detail: EmergencyDetail }) {
  const id = detail.PK_emergency;
  const invalidate = useInvalidate(id);
  const institutions = useQuery({
    queryKey: qk.catalog("institutions", "options"),
    queryFn: () => apiGet<{ items: { PK_institution: number; name: string }[] }>("/api/dashboard/institutions?pageSize=200"),
  });
  const units = useQuery({
    queryKey: qk.catalog("units", "available"),
    queryFn: () => apiGet<{ items: { PK_unit: number; unitCode: string; unitName: string; FK_institution: number; isAvailable: boolean; status: string }[] }>("/api/dashboard/units?pageSize=200"),
  });
  const list = useQuery({
    queryKey: [...qk.emergency(id), "assignments"],
    queryFn: () => apiGet<AssignmentRow[]>(`${base}/${id}/assignments`),
  });

  const [institutionId, setInstitutionId] = useState<number | null>(null);

  const create = useMutation({
    mutationFn: (fd: FormData) =>
      apiPost(`${base}/${id}/assignments`, {
        FK_institution: Number(fd.get("FK_institution")),
        FK_unit: fd.get("FK_unit") ? Number(fd.get("FK_unit")) : null,
      }),
    onSuccess: invalidate,
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nueva solicitud de intervención</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3 sm:grid-cols-4"
            onSubmit={(e) => {
              e.preventDefault();
              create.mutate(new FormData(e.currentTarget));
              setInstitutionId(null);
            }}
          >
            <select
              name="FK_institution"
              required
              value={institutionId ?? ""}
              onChange={(e) => setInstitutionId(e.target.value ? Number(e.target.value) : null)}
              className="h-8 rounded-lg border bg-transparent px-2 text-sm"
            >
              <option value="">Institución...</option>
              {(institutions.data?.items ?? []).map((inst) => (
                <option key={inst.PK_institution} value={inst.PK_institution}>{inst.name}</option>
              ))}
            </select>
            <select name="FK_unit" className="h-8 rounded-lg border bg-transparent px-2 text-sm">
              <option value="">Unidad específica (opcional)</option>
              {(units.data?.items ?? [])
                .filter((unit) => institutionId == null || unit.FK_institution === institutionId)
                .map((unit) => (
                  <option key={unit.PK_unit} value={unit.PK_unit}>
                    {unit.unitCode} — {unit.status}
                  </option>
                ))}
            </select>
            <Button type="submit" disabled={create.isPending}>Solicitar</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {(list.data ?? []).map((assignment) => (
          <Card key={assignment.PK_assignment}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {assignment.tbunits?.unitCode ?? assignment.tbinstitutions?.acronym}{" "}
                  <span className="font-normal text-muted-foreground">
                    · {assignment.tbunits?.unitName ?? assignment.tbinstitutions?.name}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Solicitada {new Date(assignment.assignedAt).toLocaleString("es-BO")}
                  {assignment.acceptedAt && ` · Aceptada ${new Date(assignment.acceptedAt).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" })}`}
                  {assignment.arrivedAt && ` · Llegó ${new Date(assignment.arrivedAt).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" })}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <AssignmentStatusBadge value={assignment.status} />
                <Link href={`/dashboard/dispatch/${assignment.PK_assignment}`} className="text-xs text-primary underline-offset-4 hover:underline">
                  Ver despacho →
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
        {(list.data?.length ?? 0) === 0 && !list.isLoading && (
          <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
            Sin asignaciones todavía.
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------------- SALA COMÚN ---------------- */

type MessageRow = {
  PK_chatMessage: number;
  senderRole: string;
  senderName: string;
  messageType: string;
  message: string | null;
  createdAt: string;
};

function RoomTab({ detail }: { detail: EmergencyDetail }) {
  const id = detail.PK_emergency;
  const room = detail.tbemergencyroom;
  const messages = useQuery({
    queryKey: [...qk.emergency(id), "messages"],
    queryFn: () => apiGet<MessageRow[]>(`${base}/${id}/messages`),
    refetchInterval: 10_000,
  });

  const send = useMutation({
    mutationFn: (messageText: string) =>
      apiPost(`${base}/${id}/messages`, { message: messageText, messageType: "TEXT" }),
    onSuccess: () => messages.refetch(),
  });

  if (!room) {
    return <p className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">Esta emergencia no tiene sala abierta.</p>;
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Sala {room.roomCode}</CardTitle>
        {!room.isOpen && <Badge variant="secondary">Cerrada</Badge>}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
          {(messages.data ?? []).map((msg) => (
            <div
              key={msg.PK_chatMessage}
              className={`rounded-lg px-3 py-2 text-sm ${
                msg.senderRole === "SYSTEM"
                  ? "bg-muted/60 text-muted-foreground italic"
                  : msg.messageType === "CRITICAL_ALERT"
                    ? "bg-red-500/10 text-red-700 dark:text-red-400"
                    : "bg-accent"
              }`}
            >
              {msg.senderRole !== "SYSTEM" && (
                <span className="mr-2 text-xs font-semibold">{msg.senderName}</span>
              )}
              {msg.messageType !== "SYSTEM_EVENT" && <span>{msg.message}</span>}
              {msg.messageType === "SYSTEM_EVENT" && <span>{msg.message}</span>}
              <span className="ml-2 text-[10px] text-muted-foreground">
                {new Date(msg.createdAt).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
        </div>
        {room.isOpen && (
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const input = new FormData(e.currentTarget).get("message");
              if (typeof input === "string" && input.trim()) {
                send.mutate(input.trim());
                (e.currentTarget.querySelector("input[name=message]") as HTMLInputElement).value = "";
              }
            }}
          >
            <Input name="message" placeholder={`Mensaje como ${detail.emergencyCode.split("-")[0]}...`} autoComplete="off" />
            <Button type="submit" size="icon" disabled={send.isPending} aria-label="Enviar">
              <SendIcon />
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

/* ---------------- AVANCES ---------------- */

type ProgressRow = {
  PK_progressReport: number;
  reportText: string;
  createdAt: string;
  tbinstitutions: { acronym: string; name: string } | null;
  tbusers: { firstName: string; lastName: string } | null;
};

function ProgressTab({ id }: { id: number }) {
  const invalidate = useInvalidate(id);
  const list = useQuery({
    queryKey: [...qk.emergency(id), "progress"],
    queryFn: () => apiGet<ProgressRow[]>(`${base}/${id}/progress-reports`),
  });
  const create = useMutation({
    mutationFn: (reportText: string) => apiPost(`${base}/${id}/progress-reports`, { reportText }),
    onSuccess: invalidate,
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="py-4">
          <form
            className="flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              const input = new FormData(e.currentTarget).get("report");
              if (typeof input === "string" && input.trim()) {
                create.mutate(input.trim());
                (e.currentTarget.querySelector("textarea[name=report]") as HTMLTextAreaElement).value = "";
              }
            }}
          >
            <Textarea name="report" placeholder="Reportar avance del caso..." className="sm:flex-1" />
            <Button type="submit" disabled={create.isPending} className="self-end">
              Registrar avance
            </Button>
          </form>
        </CardContent>
      </Card>
      <div className="space-y-2">
        {(list.data ?? []).map((row) => (
          <Card key={row.PK_progressReport}>
            <CardContent className="py-3">
              <p className="text-sm">{row.reportText}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {[row.tbinstitutions?.name, row.tbusers ? `${row.tbusers.firstName} ${row.tbusers.lastName}` : null]
                  .filter(Boolean)
                  .join(" · ")}{" "}
                · {new Date(row.createdAt).toLocaleString("es-BO")}
              </p>
            </CardContent>
          </Card>
        ))}
        {(list.data?.length ?? 0) === 0 && !list.isLoading && (
          <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">Sin avances.</p>
        )}
      </div>
    </div>
  );
}

/* ---------------- EVIDENCIAS ---------------- */

type EvidenceRow = {
  PK_evidence: number;
  fileType: string;
  fileUrl: string;
  description: string | null;
  createdAt: string;
};

function EvidencesTab({ id }: { id: number }) {
  const invalidate = useInvalidate(id);
  const list = useQuery({
    queryKey: [...qk.emergency(id), "evidences"],
    queryFn: () => apiGet<EvidenceRow[]>(`${base}/${id}/evidences`),
  });
  const create = useMutation({
    mutationFn: (fd: FormData) =>
      apiPost(`${base}/${id}/evidences`, {
        fileType: String(fd.get("fileType")),
        fileUrl: String(fd.get("fileUrl")),
        description: String(fd.get("description") ?? "") || null,
      }),
    onSuccess: invalidate,
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="py-4">
          <form className="grid gap-3 sm:grid-cols-5" onSubmit={(e) => { e.preventDefault(); create.mutate(new FormData(e.currentTarget)); }}>
            <select name="fileType" defaultValue="IMAGE" className="h-8 rounded-lg border bg-transparent px-2 text-sm">
              <option value="IMAGE">Imagen</option>
              <option value="VIDEO">Video</option>
              <option value="AUDIO">Audio</option>
            </select>
            <Input name="fileUrl" placeholder="URL o ruta del archivo" required className="sm:col-span-2" />
            <Input name="description" placeholder="Descripción" />
            <Button type="submit" disabled={create.isPending}>Agregar</Button>
          </form>
        </CardContent>
      </Card>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {(list.data ?? []).map((ev) => (
          <Card key={ev.PK_evidence}>
            <CardContent className="py-3">
              <Badge variant="outline">{ev.fileType}</Badge>
              <p className="mt-1 truncate text-xs">{ev.fileUrl}</p>
              {ev.description && <p className="mt-1 text-sm">{ev.description}</p>}
              <p className="mt-1 text-[11px] text-muted-foreground">{new Date(ev.createdAt).toLocaleString("es-BO")}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- DESTINOS ---------------- */

type DestinationRow = {
  PK_destination: number;
  destinationName: string;
  arrivalEta: string | null;
  arrivedAt: string | null;
  tbinstitutions: { name: string } | null;
};

function DestinationsTab({ id }: { id: number }) {
  const invalidate = useInvalidate(id);
  const list = useQuery({
    queryKey: [...qk.emergency(id), "destinations"],
    queryFn: () => apiGet<DestinationRow[]>(`${base}/${id}/destinations`),
  });
  const create = useMutation({
    mutationFn: (fd: FormData) =>
      apiPost(`${base}/${id}/destinations`, {
        destinationName: String(fd.get("destinationName")),
        arrivalEta: fd.get("arrivalEta") ? new Date(String(fd.get("arrivalEta"))).toISOString() : null,
      }),
    onSuccess: invalidate,
  });
  const arrive = useMutation({
    mutationFn: (PK_destination: number) => apiPatch(`${base}/${id}/destinations`, { PK_destination }),
    onSuccess: invalidate,
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="py-4">
          <form className="grid gap-3 sm:grid-cols-4" onSubmit={(e) => { e.preventDefault(); create.mutate(new FormData(e.currentTarget)); }}>
            <Input name="destinationName" placeholder="Hospital / refugio / centro" required />
            <Input name="arrivalEta" type="datetime-local" aria-label="ETA" />
            <Button type="submit" disabled={create.isPending}>Registrar destino</Button>
          </form>
        </CardContent>
      </Card>
      <div className="space-y-2">
        {(list.data ?? []).map((dest) => (
          <Card key={dest.PK_destination}>
            <CardContent className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div>
                <p className="text-sm font-medium">{dest.destinationName}</p>
                <p className="text-xs text-muted-foreground">
                  {dest.arrivalEta && `ETA ${new Date(dest.arrivalEta).toLocaleString("es-BO")} · `}
                  {dest.arrivedAt ? `Llegó ${new Date(dest.arrivedAt).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" })}` : "En traslado"}
                </p>
              </div>
              {dest.arrivedAt ? (
                <Badge variant="success">En destino</Badge>
              ) : (
                <Button variant="outline" size="sm" onClick={() => arrive.mutate(dest.PK_destination)}>
                  Marcar llegada
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
        {(list.data?.length ?? 0) === 0 && !list.isLoading && (
          <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">Sin destinos registrados.</p>
        )}
      </div>
    </div>
  );
}

/* ---------------- HISTORIAL DE ESTADOS ---------------- */

type HistoryRow = {
  PK_statusHistory: number;
  previousStatus: string | null;
  newStatus: string;
  changeReason: string | null;
  createdAt: string;
  tbusers: { firstName: string; lastName: string } | null;
};

function HistoryTab({ id }: { id: number }) {
  const history = useQuery({
    queryKey: ["emergencies-history", id],
    queryFn: async () => {
      const detail = await apiGet<{ tbemergencystatushistory: HistoryRow[] }>(`${base}/${id}`);
      return detail.tbemergencystatushistory;
    },
  });

  return (
    <ol className="relative ml-3 space-y-4 border-l">
      {(history.data ?? []).map((entry) => (
        <li key={entry.PK_statusHistory} className="ml-4">
          <span className="absolute -left-1.5 mt-1.5 size-3 rounded-full bg-primary" />
          <p className="text-sm">
            <EmergencyStatusBadge value={entry.newStatus} />
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {entry.previousStatus ? `${entry.previousStatus} → ` : ""}
            {new Date(entry.createdAt).toLocaleString("es-BO")}
            {entry.tbusers ? ` · ${entry.tbusers.firstName} ${entry.tbusers.lastName}` : ""}
            {entry.changeReason ? ` · ${entry.changeReason}` : ""}
          </p>
        </li>
      ))}
      {(history.data?.length ?? 0) === 0 && !history.isLoading && (
        <p className="py-6 text-center text-sm text-muted-foreground">Sin cambios de estado.</p>
      )}
    </ol>
  );
}
