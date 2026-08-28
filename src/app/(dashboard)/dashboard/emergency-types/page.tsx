"use client";

import { CrudPage } from "@/components/dashboard/crud-page";

// Tipos de emergencia: clasificación informativa de los casos.
export default function EmergencyTypesPage() {
  return (
    <CrudPage
      config={{
        entity: "emergency-types",
        pk: "PK_emergencyType",
        title: "Tipos de emergencia",
        description: "Catálogo usado por la IA y los operadores para clasificar casos.",
        singularLabel: "Tipo de emergencia",
        fields: [
          { name: "name", label: "Nombre", required: true },
          { name: "code", label: "Código", required: true },
          { name: "description", label: "Descripción", type: "textarea" },
          { name: "status", label: "Estado", type: "switch" },
        ],
      }}
    />
  );
}
