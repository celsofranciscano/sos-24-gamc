"use client";

import { use } from "react";
import { CatalogFormPage } from "@/components/dashboard/catalog-form-page";
import { SUBINSTITUTIONS_CONFIG } from "@/components/dashboard/catalogs-config";

// /subinstitutions/[PK_subinstitution]/edit → edición dentro del parámetro dinámico exacto.
export default function EditSubinstitutionsPage({
  params,
}: {
  params: Promise<{ PK_subinstitution: string }>;
}) {
  const { PK_subinstitution } = use(params);
  return <CatalogFormPage config={ SUBINSTITUTIONS_CONFIG } recordId={ Number(PK_subinstitution) } />;
}
