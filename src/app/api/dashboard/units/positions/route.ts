import { apiRoute, institutionScope, ok, requireSession } from "@/lib/api/helpers";
import prisma from "@/lib/db/prisma";

// ============================================================
// API: POSICIÓN ACTUAL DE LAS UNIDADES (MAPA OPERATIVO)
// GET /api/dashboard/units/positions
//     Última ubicación GPS conocida de cada unidad activa.
// ============================================================

export const GET = apiRoute(async () => {
  const session = await requireSession();

  const units = await prisma.tbunits.findMany({
    where: { isActive: true, ...institutionScope(session) },
    select: {
      PK_unit: true,
      unitCode: true,
      unitName: true,
      status: true,
      isAvailable: true,
      tbinstitutions: { select: { acronym: true } },
      tbresourcetypes: { select: { name: true } },
    },
    orderBy: { unitCode: "asc" },
  });

  if (units.length === 0) return ok({ items: [] });

  // Última posición por unidad: el registro más reciente de cada una.
  const positions = await prisma.tbunitlocations.findMany({
    where: { FK_unit: { in: units.map((u) => u.PK_unit) } },
    orderBy: { createdAt: "desc" },
    take: 1000,
  });

  const latestByUnit = new Map<number, (typeof positions)[number]>();
  for (const position of positions) {
    if (!latestByUnit.has(position.FK_unit)) latestByUnit.set(position.FK_unit, position);
  }

  return ok({
    items: units.map((unit) => ({
      PK_unit: unit.PK_unit,
      unitCode: unit.unitCode,
      unitName: unit.unitName,
      status: unit.status,
      isAvailable: unit.isAvailable,
      resourceType: unit.tbresourcetypes?.name ?? null,
      institution: unit.tbinstitutions?.acronym ?? null,
      latitude: latestByUnit.get(unit.PK_unit)?.latitude ?? null,
      longitude: latestByUnit.get(unit.PK_unit)?.longitude ?? null,
      lastSeenAt: latestByUnit.get(unit.PK_unit)?.createdAt ?? null,
    })),
  });
});
