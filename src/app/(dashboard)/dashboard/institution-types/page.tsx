"use client";

import { CatalogList } from "@/components/dashboard/catalog-list";
import { INSTITUTION_TYPES_CONFIG } from "@/components/dashboard/catalogs-config";

// Tipos de institución: listado con estadísticas, búsqueda y tabla responsive.
export default function InstitutionTypesPage() {
  return <CatalogList config={ INSTITUTION_TYPES_CONFIG } />;
}
