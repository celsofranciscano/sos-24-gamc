"use client";

import { CatalogList } from "@/components/dashboard/catalog-list";
import { INSTITUTIONS_CONFIG } from "@/components/dashboard/catalogs-config";

// Instituciones: listado con estadísticas, búsqueda y tabla responsive.
export default function InstitutionsPage() {
  return <CatalogList config={ INSTITUTIONS_CONFIG } />;
}
