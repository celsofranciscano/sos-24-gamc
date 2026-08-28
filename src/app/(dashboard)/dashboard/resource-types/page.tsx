"use client";

import { CrudPage } from "@/components/dashboard/crud-page";

// Tipos de recurso: qué capacidades existen (ambulancia, unidad policial...).
export default function ResourceTypesPage() {
  return (
    <CrudPage
      config={{
        entity: "resource-types",
        pk: "PK_resourceType",
        title: "Tipos de recurso",
        description:
          "Recursos que pueden requerir las emergencias y poseer las unidades de respuesta.",
        singularLabel: "Tipo de recurso",
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
