"use client";

import { use } from "react";
import { CatalogFormPage } from "@/components/dashboard/catalog-form-page";
import { INSTITUTION_TYPES_CONFIG } from "@/components/dashboard/catalogs-config";

// /institution-types/[PK_institutionType]/edit → edición dentro del parámetro dinámico exacto.
export default function EditInstitutionTypesPage({
  params,
}: {
  params: Promise<{ PK_institutionType: string }>;
}) {
  const { PK_institutionType } = use(params);
  return <CatalogFormPage config={ INSTITUTION_TYPES_CONFIG } recordId={ Number(PK_institutionType) } />;
}
