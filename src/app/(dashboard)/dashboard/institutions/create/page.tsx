"use client";

import { CatalogFormPage } from "@/components/dashboard/catalog-form-page";
import { INSTITUTIONS_CONFIG } from "@/components/dashboard/catalogs-config";

// /institutions/create → creación con página dedicada.
export default function CreateInstitutionsPage() {
  return <CatalogFormPage config={ INSTITUTIONS_CONFIG } />;
}
