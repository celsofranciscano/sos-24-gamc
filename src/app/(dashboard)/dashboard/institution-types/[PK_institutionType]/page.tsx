"use client";

import { CatalogDetailPage } from "@/components/dashboard/catalog-detail-page";
import { INSTITUTION_TYPES_CONFIG } from "@/components/dashboard/catalogs-config";

// /institution-types/[PK_institutionType] → detalle con acciones de editar y eliminar.
export default function InstitutionTypesDetailPage({
  params,
}: {
  params: Promise<{ PK_institutionType: string }>;
}) {
  return <CatalogDetailPage config={ INSTITUTION_TYPES_CONFIG } params={ params } />;
}
