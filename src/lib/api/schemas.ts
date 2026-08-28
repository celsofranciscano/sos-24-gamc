import { z } from "zod";

// Esquemas zod reutilizables para las APIs del dashboard.

/** Texto obligatorio sin espacios sobrantes. */
export const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} es obligatorio`);

/** Entero obligatorio (IDs de catálogos). */
export const requiredId = z.coerce.number().int().positive();

/** Número entero opcional o nulo (claves foráneas opcionales). */
export const nullableId = z
  .union([z.coerce.number().int(), z.null()])
  .optional()
  .transform((v) => (v === undefined ? undefined : v));

/** Decimal opcional o nulo (coordenadas, precisiones...). */
export const nullableFloat = z
  .preprocess(
    (v) => (v === "" || v == null || (typeof v === "number" && Number.isNaN(v)) ? null : Number(v)),
    z.number(),
  )
  .nullable()
  .optional();

/** Texto opcional que normaliza vacío a null. */
export const optionalText = z
  .string()
  .trim()
  .transform((v) => (v.length > 0 ? v : null))
  .nullish();

export const booleanField = z.boolean().optional();

export const EMERGENCY_PRIORITIES = ["BAJA", "MEDIA", "ALTA", "CRITICA"] as const;

export const UNIT_STATUSES = [
  "DISPONIBLE",
  "EN_CAMINO",
  "EN_SITIO",
  "OCUPADA",
  "FUERA_DE_SERVICIO",
] as const;

/** Privilegios: creación y edición (gestión de la Central GAMC). */
export const privilegeWriteSchema = z.object({
  privilege: requiredText("El nombre del privilegio"),
  privilegeCode: z
    .string()
    .trim()
    .min(2, "El código es obligatorio")
    .transform((v) => v.toUpperCase())
    .refine((v) => /^[A-Z][A-Z0-9_]*$/.test(v), {
      message: "El código solo admite mayúsculas, números y guion bajo (ej: ADMIN_GAMC)",
    }),
  privilegeType: z.enum(["GAMC", "INSTITUTION"]),
  description: optionalText,
});
