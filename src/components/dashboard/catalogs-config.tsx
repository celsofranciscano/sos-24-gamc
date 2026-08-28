import type { LucideIcon } from "lucide-react";

// ============================================================
// CONFIGURACIÓN DE CATÁLOGOS CON PÁGINAS DEDICADAS
// Igual filosofía que la sección de usuarios: listado con
// estadísticas + /create + /[PK] + /[PK]/edit.
// Las APIs ya existen bajo /api/dashboard/<entity>.
// ============================================================

export type CatalogFieldType = "text" | "number" | "textarea" | "select" | "switch";

export type CatalogField = {
  name: string;
  label: string;
  type?: CatalogFieldType;
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string | number }[];
  /** Opciones cargadas desde otra API (/api/dashboard/<entity>). */
  remote?: { entity: string; labelKey: string; valueKey: string };
  /** En el detalle, muestra el nombre de la relación incluida en vez del FK. */
  detailRelation?: { key: string; labelKey: string; fallback?: string };
};

export type CatalogSectionConfig = {
  /** Ruta base bajo /api/dashboard (ej: "institutions"). */
  entity: string;
  /** Clave primaria exacta de Prisma (ej: "PK_institution"). */
  pk: string;
  title: string;
  singularLabel: string;
  description: string;
  fields: CatalogField[];
  /** Nombres de campos que aparecen en la tabla del listado. */
  tableFields: string[];
  icon?: LucideIcon;
  canDelete?: boolean;
};

export type CatalogRow = Record<string, unknown>;

// ---------- TIPOS DE INSTITUCIÓN ----------
export const INSTITUTION_TYPES_CONFIG: CatalogSectionConfig = {
  entity: "institution-types",
  pk: "PK_institutionType",
  title: "Tipos de institución",
  singularLabel: "Tipo de institución",
  description: "Catálogo: Policía, Bomberos, SAR, Salud y demás tipos de respuesta.",
  canDelete: true,
  tableFields: ["name", "code", "description", "status"],
  fields: [
    { name: "name", label: "Nombre", required: true, placeholder: "Ej: Policía" },
    { name: "code", label: "Código único", required: true, placeholder: "Ej: POLICE" },
    {
      name: "description",
      label: "Descripción",
      type: "textarea",
      placeholder: "Funciones generales del tipo...",
    },
    { name: "status", label: "Estado", type: "switch" },
  ],
};

// ---------- INSTITUCIONES ----------
export const INSTITUTIONS_CONFIG: CatalogSectionConfig = {
  entity: "institutions",
  pk: "PK_institution",
  title: "Instituciones",
  singularLabel: "Institución",
  description: "Instituciones coordinadas por la Central GAMC.",
  canDelete: true,
  tableFields: ["name", "FK_institutionType", "phoneNumber", "status"],
  fields: [
    {
      name: "FK_institutionType",
      label: "Tipo de institución",
      type: "select",
      required: true,
      remote: { entity: "institution-types", labelKey: "name", valueKey: "PK_institutionType" },
      detailRelation: { key: "tbinstitutiontypes", labelKey: "name" },
    },
    { name: "name", label: "Nombre oficial", required: true, placeholder: "Ej: Policía Boliviana" },
    { name: "acronym", label: "Sigla", placeholder: "Ej: PB" },
    { name: "phoneNumber", label: "Teléfono", placeholder: "Ej: 110" },
    { name: "email", label: "Correo", placeholder: "contacto@institucion.bo" },
    { name: "address", label: "Dirección" },
    { name: "latitude", label: "Latitud", type: "number", placeholder: "-17.3935" },
    { name: "longitude", label: "Longitud", type: "number", placeholder: "-66.1570" },
    { name: "status", label: "Estado", type: "switch" },
  ],
};

// ---------- SUBINSTITUCIONES ----------
export const SUBINSTITUTIONS_CONFIG: CatalogSectionConfig = {
  entity: "subinstitutions",
  pk: "PK_subinstitution",
  title: "Subinstituciones",
  singularLabel: "Subinstitución",
  description: "Dependencias, bases, módulos y EPIs de cada institución.",
  canDelete: true,
  tableFields: ["name", "FK_institution", "phoneNumber", "status"],
  fields: [
    {
      name: "FK_institution",
      label: "Institución principal",
      type: "select",
      required: true,
      remote: { entity: "institutions", labelKey: "name", valueKey: "PK_institution" },
      detailRelation: { key: "tbinstitutions", labelKey: "name" },
    },
    { name: "name", label: "Nombre de la dependencia", required: true, placeholder: "Ej: EPI Norte" },
    { name: "code", label: "Código interno", placeholder: "Ej: EPI-NORTE" },
    { name: "phoneNumber", label: "Teléfono" },
    { name: "email", label: "Correo" },
    { name: "address", label: "Dirección" },
    { name: "latitude", label: "Latitud", type: "number", placeholder: "-17.3701" },
    { name: "longitude", label: "Longitud", type: "number", placeholder: "-66.1502" },
    { name: "status", label: "Estado", type: "switch" },
  ],
};
