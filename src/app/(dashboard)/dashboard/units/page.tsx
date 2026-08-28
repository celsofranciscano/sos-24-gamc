"use client";

import { CrudPage } from "@/components/dashboard/crud-page";
import { UNIT_STATUS_META } from "@/components/dashboard/badges";

// Unidades de respuesta con estado operativo y disponibilidad.
export default function UnitsPage() {
  return (
    <CrudPage
      config={{
        entity: "units",
        pk: "PK_unit",
        title: "Unidades de respuesta",
        description:
          "Vehículos y equipos despachables. La Central ve todas; cada institución gestiona las suyas.",
        singularLabel: "Unidad",
        fields: [
          { name: "unitCode", label: "Código", required: true, placeholder: "B-01, A-12..." },
          { name: "unitName", label: "Nombre", required: true },
          {
            name: "FK_institution",
            label: "Institución",
            type: "select",
            required: true,
            remote: { entity: "institutions", labelKey: "name", valueKey: "PK_institution" },
          },
          {
            name: "FK_subinstitution",
            label: "Base / dependencia",
            type: "select",
            remote: { entity: "subinstitutions", labelKey: "name", valueKey: "PK_subinstitution" },
          },
          {
            name: "FK_resourceType",
            label: "Tipo de recurso",
            type: "select",
            required: true,
            remote: { entity: "resource-types", labelKey: "name", valueKey: "PK_resourceType" },
          },
          { name: "phoneNumber", label: "Teléfono" },
          {
            name: "status",
            label: "Estado operativo",
            type: "select",
            defaultValue: "DISPONIBLE",
            options: Object.entries(UNIT_STATUS_META).map(([value, meta]) => ({
              value,
              label: meta.label,
            })),
          },
          { name: "isAvailable", label: "Disponible", type: "switch" },
          { name: "isActive", label: "Activa en el sistema", type: "switch" },
        ],
      }}
    />
  );
}
