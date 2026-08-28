import { NextResponse, type NextRequest } from "next/server";
import { ZodError, type ZodType } from "zod";
import { auth } from "@/auth";
import prisma from "@/lib/db/prisma";
import { publish, topics } from "@/lib/realtime/bus";

// ============================================================
// HERRAMIENTAS COMUNES PARA TODAS LAS APIS DEL DASHBOARD
// - Respuestas JSON estandarizadas: { ok: true, data } | { ok: false, message }
// - Autenticación y control de alcance (CENTRAL ve todo, INSTITUCION solo lo suyo)
// - Paginación, validación con zod e historial de acciones
// ============================================================

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ ok: true, data }, { status });
}

export function fail(status: number, message: string): NextResponse {
  return NextResponse.json({ ok: false, message }, { status });
}

type Handler = (req: NextRequest, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>;

/** Envuelve un handler de ruta para capturar errores de forma uniforme. */
export function apiRoute(handler: Handler): Handler {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      if (error instanceof ApiError) return fail(error.status, error.message);
      if (error instanceof ZodError) {
        const details = error.issues
          .map((i) => `${i.path.join(".") || "campo"}: ${i.message}`)
          .join("; ");
        return fail(400, `Datos inválidos → ${details}`);
      }
      const code = (error as { code?: string })?.code;
      if (code === "P2002") return fail(409, "Ya existe un registro con ese valor único.");
      if (code === "P2025") return fail(404, "El registro no existe.");
      console.error("[api] Error no controlado:", error);
      return fail(500, "Error interno del servidor.");
    }
  };
}

// ============================================================
// SESIÓN Y ALCANCE (RBAC)
// ============================================================

export type DashboardSession = {
  userId: number;
  name: string;
  privilegeCode: string;
  isCentral: boolean;
  institutionId: number | null;
  subinstitutionId: number | null;
};

/** Exige un usuario institucional autenticado (central o institución). */
export async function requireSession(): Promise<DashboardSession> {
  const session = await auth();
  const user = session?.user;
  if (!user || user.role !== "INSTITUTION") throw new ApiError(401, "No autenticado.");
  return {
    userId: Number(user.id),
    name: `${user.firstName} ${user.lastName}`.trim(),
    privilegeCode: user.privilegeCode ?? "",
    isCentral: user.privilegeCode === "CENTRAL_ADMIN" || user.privilegeCode === "CENTRAL_DISPATCHER",
    institutionId: user.institutionId ?? null,
    subinstitutionId: user.subinstitutionId ?? null,
  };
}

/** Exige que el usuario pertenezca a la Central GAMC. */
export async function requireCentral(): Promise<DashboardSession> {
  const session = await requireSession();
  if (!session.isCentral) throw new ApiError(403, "Requiere permisos de la Central GAMC.");
  return session;
}

/**
 * Filtro de alcance por institución para consultas Prisma.
 * La Central ve todo; una institución solo ve sus propios registros.
 */
export function institutionScope(
  session: DashboardSession,
  field = "FK_institution",
): Record<string, unknown> {
  if (session.isCentral) return {};
  if (!session.institutionId) return { [field]: -1 }; // sin institución asignada → no ve nada
  return { [field]: session.institutionId };
}

/** Verifica que un registro pertenezca a la institución del usuario (si no es Central). */
export function assertInstitutionAccess(
  session: DashboardSession,
  record: { FK_institution?: number | null },
): void {
  if (session.isCentral) return;
  if (!session.institutionId || record.FK_institution !== session.institutionId) {
    throw new ApiError(403, "No tiene acceso a este registro.");
  }
}

// ============================================================
// PAGINACIÓN Y VALIDACIÓN
// ============================================================

export function getPagination(req: NextRequest, defaultSize = 20) {
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get("page") ?? 1) || 1);
  const pageSize = Math.min(200, Math.max(1, Number(sp.get("pageSize") ?? defaultSize) || defaultSize));
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

export function getSearchParams(req: NextRequest) {
  return req.nextUrl.searchParams;
}

/** Valida el body JSON contra un esquema zod. */
export async function parseBody<T>(req: Request, schema: ZodType<T>): Promise<T> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    throw new ApiError(400, "El cuerpo de la petición no es JSON válido.");
  }
  return schema.parse(json);
}

// ============================================================
// AUDITORÍA (actionHistory) Y NOTIFICACIONES + TIEMPO REAL
// ============================================================

/** Agrega una entrada al campo Json actionHistory de cualquier tabla. */
export async function appendActionHistory(
  table: "citizens" | "institutiontypes" | "institutions" | "subinstitutions" | "users" |
  "resourcetypes" | "institutionservices" | "units" | "emergencytypes" | "emergencies" | "calls",
  pkField: string,
  pkValue: number,
  entry: { action: string; detail?: string },
): Promise<void> {
  const modelName = `tb${table}` as keyof typeof prisma;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const delegate = prisma[modelName] as any;
  const record = await delegate.findUnique({ where: { [pkField]: pkValue } });
  if (!record) return;
  const history = Array.isArray(record.actionHistory) ? record.actionHistory : [];
  history.push({ ...entry, by: "dashboard", at: new Date().toISOString() });
  await delegate.update({
    where: { [pkField]: pkValue },
    data: { actionHistory: history },
  });
}

type NotifyOptions = {
  title: string;
  message: string;
  notificationType?: "PUSH" | "SYSTEM_ALERT" | "DISPATCH_UPDATE";
  emergencyId?: number | null;
  /** Usuarios destinatarios explícitos. */
  userIds?: number[];
  /** Notificar a todos los usuarios con esos códigos de privilegio. */
  privilegeCodes?: string[];
  /** Limitar los usuarios por institución. */
  institutionId?: number | null;
  /** Ciudadano destinatario. */
  citizenId?: number | null;
};

/** Crea notificaciones en base de datos y las emite por el canal en tiempo real. */
export async function notify(options: NotifyOptions): Promise<void> {
  const {
    title,
    message,
    notificationType = "SYSTEM_ALERT",
    emergencyId = null,
    userIds = [],
    privilegeCodes = [],
    institutionId = null,
    citizenId = null,
  } = options;

  const data: {
    FK_citizen?: number;
    FK_user?: number;
    FK_emergency?: number | null;
    title: string;
    message: string;
    notificationType: string;
  }[] = [];

  for (const id of new Set(userIds)) {
    data.push({ FK_user: id, title, message, notificationType, FK_emergency: emergencyId });
  }

  if (privilegeCodes.length > 0) {
    const users = await prisma.tbusers.findMany({
      where: {
        status: true,
        ...(institutionId ? { FK_institution: institutionId } : {}),
        tbprivileges: { privilegeCode: { in: privilegeCodes } },
      },
      select: { PK_user: true },
    });
    for (const u of users) {
      if (userIds.includes(u.PK_user)) continue;
      data.push({ FK_user: u.PK_user, title, message, notificationType, FK_emergency: emergencyId });
    }
  }

  if (citizenId != null) {
    data.push({ FK_citizen: citizenId, title, message, notificationType, FK_emergency: emergencyId });
  }

  if (data.length === 0) return;

  await prisma.tbnotifications.createMany({ data });
  for (const item of data) {
    publish(
      item.FK_user != null ? topics.notificationsUser(item.FK_user) : topics.dashboard,
      notificationType,
      { title, message, emergencyId },
    );
  }
}
