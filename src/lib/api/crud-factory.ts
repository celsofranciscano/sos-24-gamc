import type { NextRequest } from "next/server";
import type { ZodType } from "zod";
import prisma from "@/lib/db/prisma";
import {
  ApiError,
  apiRoute,
  assertInstitutionAccess,
  getPagination,
  institutionScope,
  ok,
  parseBody,
  requireCentral,
  requireSession,
  type DashboardSession,
} from "@/lib/api/helpers";
import bcrypt from "bcrypt";

// ============================================================
// FÁBRICA DE APIS CRUD PARA CATÁLOGOS
// Genera handlers GET/POST/PUT/DELETE estandarizados a partir de
// una configuración por entidad. Así cada catálogo del sistema
// define UNA config y obtiene su API completa y consistente.
//
// Uso típico (route.ts):
//   export const GET = crudList(institutionTypesCrud);
//   export const POST = crudCreate(institutionTypesCrud);
// ============================================================

type ModelDelegate = {
  findMany: (args: Record<string, unknown>) => Promise<Record<string, unknown>[]>;
  count: (args: Record<string, unknown>) => Promise<number>;
  findUnique: (args: Record<string, unknown>) => Promise<Record<string, unknown> | null>;
  create: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
  update: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
  delete: (args: Record<string, unknown>) => Promise<unknown>;
};

export type CrudEntityConfig = {
  /** Nombre exacto del modelo en Prisma (ej: "tbinstitutions"). */
  model: string;
  /** Clave primaria (ej: "PK_institution"). */
  pk: string;
  /** Campos de texto sobre los que opera ?search=. */
  searchFields: string[];
  /** Query params de filtro exacto (ej: ["FK_institution"]). */
  filterParams?: string[];
  include?: Record<string, unknown>;
  orderBy?: Record<string, "asc" | "desc">;
  createSchema: ZodType;
  updateSchema: ZodType;
  /** "session": cualquier usuario del dashboard; "central": solo GAMC. */
  readAccess?: "session" | "central";
  writeAccess?: "session" | "central";
  /** Campo de alcance institucional (los usuarios no centrales solo ven/editan lo suyo). */
  scopeField?: string;
  /** Transforma el payload antes de crear (ej: hash de contraseña). */
  transformCreate?: (
    data: Record<string, unknown>,
    session: DashboardSession,
  ) => Promise<Record<string, unknown>> | Record<string, unknown>;
  transformUpdate?: (
    data: Record<string, unknown>,
    session: DashboardSession,
  ) => Promise<Record<string, unknown>> | Record<string, unknown>;
  /** Campos que se eliminan de las respuestas (ej: password). */
  omitFromResponse?: string[];
};

function delegate(config: CrudEntityConfig): ModelDelegate {
  const model = (prisma as unknown as Record<string, ModelDelegate>)[config.model];
  if (!model) throw new ApiError(500, `Modelo desconocido: ${config.model}`);
  return model;
}

async function resolveSession(config: CrudEntityConfig, mode: "read" | "write") {
  const access = mode === "read" ? (config.readAccess ?? "session") : (config.writeAccess ?? "central");
  return mode === "write" && access === "central" ? requireCentral() : requireSession();
}

function stripOmitted(
  config: CrudEntityConfig,
  record: Record<string, unknown> | null,
): Record<string, unknown> | null {
  if (!record || !config.omitFromResponse) return record;
  const copy = { ...record };
  for (const field of config.omitFromResponse) delete copy[field];
  return copy;
}

function buildWhere(config: CrudEntityConfig, req: NextRequest): Record<string, unknown> {
  const sp = req.nextUrl.searchParams;
  const where: Record<string, unknown> = {};

  for (const param of config.filterParams ?? []) {
    const value = sp.get(param);
    if (value !== null && value !== "") {
      where[param] = Number.isNaN(Number(value)) ? value : Number(value);
    }
  }

  const search = (sp.get("search") ?? "").trim();
  if (search && config.searchFields.length > 0) {
    where.OR = config.searchFields.map((field) => ({ [field]: { contains: search } }));
  }
  return where;
}

export function crudList(config: CrudEntityConfig) {
  return apiRoute(async (req) => {
    const session = await resolveSession(config, "read");
    const { skip, take, page, pageSize } = getPagination(req);

    const where = buildWhere(config, req);
    if (config.scopeField) Object.assign(where, institutionScope(session, config.scopeField));

    const [items, total] = await Promise.all([
      delegate(config).findMany({
        where,
        skip,
        take,
        orderBy: config.orderBy ?? { [config.pk]: "desc" },
        ...(config.include ? { include: config.include } : {}),
      }),
      delegate(config).count({ where }),
    ]);

    return ok({
      items: items.map((item) => stripOmitted(config, item)),
      total,
      page,
      pageSize,
    });
  });
}

export function crudCreate(config: CrudEntityConfig) {
  return apiRoute(async (req) => {
    const session = await resolveSession(config, "write");
    const data = await parseBody(req, config.createSchema) as Record<string, unknown>;

    // Un usuario institucional nunca puede crear registros a nombre de otra institución.
    if (config.scopeField && !session.isCentral) {
      data[config.scopeField] = session.institutionId;
    }

    const finalData = config.transformCreate
      ? await config.transformCreate(data, session)
      : data;

    const created = await delegate(config).create({
      data: finalData,
      ...(config.include ? { include: config.include } : {}),
    });
    return ok(stripOmitted(config, created), 201);
  });
}

async function loadOwned(
  config: CrudEntityConfig,
  id: number,
  session: DashboardSession,
): Promise<Record<string, unknown>> {
  const record = await delegate(config).findUnique({ where: { [config.pk]: id } });
  if (!record) throw new ApiError(404, "El registro no existe.");
  if (config.scopeField) assertInstitutionAccess(session, record as { FK_institution?: number });
  return record;
}

export function crudGetById(config: CrudEntityConfig) {
  return apiRoute(async (_req, ctx) => {
    const params = await ctx.params;
    const id = Number(params[config.pk]);
    const session = await resolveSession(config, "read");
    const record = await loadOwned(config, id, session);
    return ok(stripOmitted(config, record));
  });
}

export function crudUpdate(config: CrudEntityConfig) {
  return apiRoute(async (req, ctx) => {
    const params = await ctx.params;
    const id = Number(params[config.pk]);
    const session = await resolveSession(config, "write");
    await loadOwned(config, id, session);

    const data = await parseBody(req, config.updateSchema) as Record<string, unknown>;
    if (config.scopeField && !session.isCentral) delete data[config.scopeField];

    const finalData = config.transformUpdate ? await config.transformUpdate(data, session) : data;

    const updated = await delegate(config).update({
      where: { [config.pk]: id },
      data: finalData,
      ...(config.include ? { include: config.include } : {}),
    });
    return ok(stripOmitted(config, updated));
  });
}

export function crudDelete(config: CrudEntityConfig) {
  return apiRoute(async (_req, ctx) => {
    const params = await ctx.params;
    const id = Number(params[config.pk]);
    const session = await resolveSession(config, "write");
    await loadOwned(config, id, session);
    try {
      await delegate(config).delete({ where: { [config.pk]: id } });
    } catch (error) {
      if ((error as { code?: string }).code === "P2003") {
        throw new ApiError(409, "No se puede eliminar: el registro tiene datos relacionados.");
      }
      throw error;
    }
    return ok({ deleted: true });
  });
}
