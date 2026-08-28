"use client";

import { CatalogList } from "@/components/dashboard/catalog-list";
import { SUBINSTITUTIONS_CONFIG } from "@/components/dashboard/catalogs-config";

// Subinstituciones: listado con estadísticas, búsqueda y tabla responsive.
export default function SubinstitutionsPage() {
  return <CatalogList config={ SUBINSTITUTIONS_CONFIG } />;
}
