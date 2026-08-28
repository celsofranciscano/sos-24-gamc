"use client";

import { CatalogFormPage } from "@/components/dashboard/catalog-form-page";
import { INSTITUTION_TYPES_CONFIG } from "@/components/dashboard/catalogs-config";

// /institution-types/create → creación con página dedicada.
export default function CreateInstitutionTypesPage() {
  return <CatalogFormPage config={ INSTITUTION_TYPES_CONFIG } />;
}
