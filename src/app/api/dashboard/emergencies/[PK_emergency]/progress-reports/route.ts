import { z } from "zod";
import { apiRoute, ok, parseBody, requireSession } from "@/lib/api/helpers";
import prisma from "@/lib/db/prisma";
import { publish, topics } from "@/lib/realtime/bus";
import { getEmergencyOrThrow } from "@/lib/api/emergency-service";

// ============================================================
// API: REPORTES DE AVANCE DE LA INSTITUCIÓN
// GET  /api/dashboard/emergencies/[PK_emergency]/progress-reports
// POST /api/dashboard/emergencies/[PK_emergency]/progress-reports
//      Instituciones y Central registran la evolución del caso.
// ============================================================

export const GET = apiRoute(async (_req, ctx) => {
  const params = await ctx.params;
  await requireSession();
  return ok(
    await prisma.tbemergencyprogressreports.findMany({
      where: { FK_emergency: Number(params.PK_emergency) },
      orderBy: { createdAt: "desc" },
      include: {
        tbinstitutions: { select: { acronym: true, name: true } },
        tbusers: { select: { firstName: true, lastName: true } },
      },
    }),
  );
});

const createSchema = z.object({
  reportText: z.string().trim().min(1, "El texto del reporte es obligatorio"),
});

export const POST = apiRoute(async (req, ctx) => {
  const params = await ctx.params;
  const id = Number(params.PK_emergency);
  const session = await requireSession();
  await getEmergencyOrThrow(id);
  const body = await parseBody(req, createSchema);

  const report = await prisma.tbemergencyprogressreports.create({
    data: {
      FK_emergency: id,
      FK_institution: session.institutionId,
      FK_user: session.userId,
      reportText: body.reportText,
    },
    include: {
      tbinstitutions: { select: { acronym: true, name: true } },
      tbusers: { select: { firstName: true, lastName: true } },
    },
  });

  publish(topics.emergency(id), "PROGRESS_ADDED", { by: session.name });
  return ok(report, 201);
});
