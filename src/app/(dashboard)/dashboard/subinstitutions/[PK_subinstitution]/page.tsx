"use client";

import { CatalogDetailPage } from "@/components/dashboard/catalog-detail-page";
import { SUBINSTITUTIONS_CONFIG } from "@/components/dashboard/catalogs-config";

// /subinstitutions/[PK_subinstitution] → detalle con acciones de editar y eliminar.
export default function SubinstitutionsDetailPage({
  params,
}: {
  params: Promise<{ PK_subinstitution: string }>;
}) {
  return <CatalogDetailPage config={ SUBINSTITUTIONS_CONFIG } params={ params } />;
}
