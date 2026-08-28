"use client";

import { use } from "react";
import { CatalogFormPage } from "@/components/dashboard/catalog-form-page";
import { INSTITUTIONS_CONFIG } from "@/components/dashboard/catalogs-config";

// /institutions/[PK_institution]/edit → edición dentro del parámetro dinámico exacto.
export default function EditInstitutionsPage({
  params,
}: {
  params: Promise<{ PK_institution: string }>;
}) {
  const { PK_institution } = use(params);
  return <CatalogFormPage config={ INSTITUTIONS_CONFIG } recordId={ Number(PK_institution) } />;
}
