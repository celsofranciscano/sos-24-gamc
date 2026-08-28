"use client";

import { CatalogFormPage } from "@/components/dashboard/catalog-form-page";
import { SUBINSTITUTIONS_CONFIG } from "@/components/dashboard/catalogs-config";

// /subinstitutions/create → creación con página dedicada.
export default function CreateSubinstitutionsPage() {
  return <CatalogFormPage config={ SUBINSTITUTIONS_CONFIG } />;
}
