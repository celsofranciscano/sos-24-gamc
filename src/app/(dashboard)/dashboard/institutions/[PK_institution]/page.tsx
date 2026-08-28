"use client";

import { CatalogDetailPage } from "@/components/dashboard/catalog-detail-page";
import { INSTITUTIONS_CONFIG } from "@/components/dashboard/catalogs-config";

// /institutions/[PK_institution] → detalle con acciones de editar y eliminar.
export default function InstitutionsDetailPage({
  params,
}: {
  params: Promise<{ PK_institution: string }>;
}) {
  return <CatalogDetailPage config={ INSTITUTIONS_CONFIG } params={ params } />;
}
