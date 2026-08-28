import { z } from "zod";
import bcrypt from "bcrypt";
import type { CrudEntityConfig } from "@/lib/api/crud-factory";
import {
  booleanField,
  nullableFloat,
  nullableId,
  optionalText,
  requiredId,
  requiredText,
  UNIT_STATUSES,
} from "@/lib/api/schemas";

// ============================================================
// CONFIGURACIONES CRUD DE TODOS LOS CATÁLOGOS DEL DASHBOARD
// Cada catálogo define aquí su modelo, clave primaria, campos de
// búsqueda y esquemas de validación. Las rutas bajo
// /api/dashboard/<entidad> usan estas configs con la fábrica.
// ============================================================

// ---------- TIPOS DE INSTITUCIÓN ----------
const institutionTypeSchema = z.object({
  name: requiredText("El nombre"),
  code: requiredText("El código"),
  description: optionalText,
  status: booleanField,
});

export const institutionTypesCrud: CrudEntityConfig = {
  model: "tbinstitutiontypes",
  pk: "PK_institutionType",
  searchFields: ["name", "code"],
  orderBy: { name: "asc" },
  createSchema: institutionTypeSchema,
  updateSchema: institutionTypeSchema.partial(),
};

// ---------- INSTITUCIONES ----------
const institutionSchema = z.object({
  FK_institutionType: requiredId,
  name: requiredText("El nombre"),
  acronym: optionalText,
  phoneNumber: optionalText,
  email: z.union([z.literal(""), z.string().email()]).transform((v) => (v === "" ? null : v)).nullish(),
  address: optionalText,
  latitude: nullableFloat,
  longitude: nullableFloat,
  status: booleanField,
});

export const institutionsCrud: CrudEntityConfig = {
  model: "tbinstitutions",
  pk: "PK_institution",
  searchFields: ["name", "acronym"],
  filterParams: ["FK_institutionType"],
  orderBy: { name: "asc" },
  include: { tbinstitutiontypes: { select: { PK_institutionType: true, name: true } } },
  createSchema: institutionSchema,
  updateSchema: institutionSchema.partial(),
};

// ---------- SUBINSTITUCIONES (dependencias, bases, módulos) ----------
const subinstitutionSchema = z.object({
  FK_institution: requiredId,
  name: requiredText("El nombre"),
  code: optionalText,
  phoneNumber: optionalText,
  email: z.union([z.literal(""), z.string().email()]).transform((v) => (v === "" ? null : v)).nullish(),
  address: optionalText,
  latitude: nullableFloat,
  longitude: nullableFloat,
  status: booleanField,
});

export const subinstitutionsCrud: CrudEntityConfig = {
  model: "tbsubinstitutions",
  pk: "PK_subinstitution",
  searchFields: ["name", "code"],
  filterParams: ["FK_institution"],
  orderBy: { name: "asc" },
  include: { tbinstitutions: { select: { PK_institution: true, name: true } } },
  createSchema: subinstitutionSchema,
  updateSchema: subinstitutionSchema.partial(),
};

// ---------- TIPOS DE RECURSO ----------
const resourceTypeSchema = z.object({
  name: requiredText("El nombre"),
  code: requiredText("El código"),
  description: optionalText,
  status: booleanField,
});

export const resourceTypesCrud: CrudEntityConfig = {
  model: "tbresourcetypes",
  pk: "PK_resourceType",
  searchFields: ["name", "code"],
  orderBy: { name: "asc" },
  createSchema: resourceTypeSchema,
  updateSchema: resourceTypeSchema.partial(),
};

// ---------- TIPOS DE EMERGENCIA ----------
const emergencyTypeSchema = z.object({
  name: requiredText("El nombre"),
  code: requiredText("El código"),
  description: optionalText,
  status: booleanField,
});

export const emergencyTypesCrud: CrudEntityConfig = {
  model: "tbemergencytypes",
  pk: "PK_emergencyType",
  searchFields: ["name", "code"],
  orderBy: { name: "asc" },
  createSchema: emergencyTypeSchema,
  updateSchema: emergencyTypeSchema.partial(),
};

// ---------- PRIVILEGIOS ----------
const privilegeSchema = z.object({
  privilege: requiredText("El nombre del privilegio"),
  privilegeCode: requiredText("El código"),
  privilegeType: z.enum(["GAMC", "INSTITUTION"]),
  description: optionalText,
});

export const privilegesCrud: CrudEntityConfig = {
  model: "tbprivileges",
  pk: "PK_privilege",
  searchFields: ["privilege", "privilegeCode"],
  orderBy: { privilege: "asc" },
  include: { _count: { select: { tbusers: true } } },
  createSchema: privilegeSchema,
  updateSchema: privilegeSchema.partial(),
};

// ---------- UNIDADES DE RESPUESTA ----------
const unitSchema = z.object({
  FK_institution: requiredId,
  FK_subinstitution: nullableId,
  FK_resourceType: requiredId,
  unitCode: requiredText("El código de unidad"),
  unitName: requiredText("El nombre"),
  phoneNumber: optionalText,
  status: z.enum(UNIT_STATUSES).optional(),
  isAvailable: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const unitsCrud: CrudEntityConfig = {
  model: "tbunits",
  pk: "PK_unit",
  searchFields: ["unitCode", "unitName"],
  filterParams: ["FK_institution", "FK_subinstitution", "FK_resourceType", "status", "isAvailable"],
  orderBy: { unitCode: "asc" },
  include: {
    tbinstitutions: { select: { PK_institution: true, name: true, acronym: true } },
    tbsubinstitutions: { select: { PK_subinstitution: true, name: true } },
    tbresourcetypes: { select: { PK_resourceType: true, name: true } },
  },
  writeAccess: "session",
  scopeField: "FK_institution",
  createSchema: unitSchema,
  updateSchema: unitSchema.partial(),
};

// ---------- USUARIOS DEL SISTEMA (solo Central) ----------
const userCreateSchema = z.object({
  FK_privilege: requiredId,
  FK_institution: nullableId,
  FK_subinstitution: nullableId,
  firstName: requiredText("Los nombres"),
  lastName: requiredText("Los apellidos"),
  phoneNumber: optionalText,
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  status: booleanField,
});

export const usersCrud: CrudEntityConfig = {
  model: "tbusers",
  pk: "PK_user",
  searchFields: ["firstName", "lastName", "email"],
  filterParams: ["FK_privilege", "FK_institution"],
  readAccess: "central",
  writeAccess: "central",
  omitFromResponse: ["password"],
  include: {
    tbprivileges: { select: { PK_privilege: true, privilege: true, privilegeCode: true, privilegeType: true } },
    tbinstitutions: { select: { PK_institution: true, name: true, acronym: true } },
    tbsubinstitutions: { select: { PK_subinstitution: true, name: true } },
  },
  createSchema: userCreateSchema,
  updateSchema: userCreateSchema.extend({ password: z.string().min(6).optional().or(z.literal("")) }).partial(),
  transformCreate: async (data) => ({
    ...data,
    password: await bcrypt.hash(String(data.password), 10),
  }),
  transformUpdate: async (data) => {
    if (!data.password) {
      const copy = { ...data };
      delete copy.password;
      return copy;
    }
    return { ...data, password: await bcrypt.hash(String(data.password), 10) };
  },
};
