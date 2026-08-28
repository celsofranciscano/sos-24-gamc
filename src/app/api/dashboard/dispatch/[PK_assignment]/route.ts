import { apiRoute, ok, requireSession } from "@/lib/api/helpers";
import { getAssignmentOrThrow } from "@/lib/api/dispatch-service";

// ============================================================
// API: DETALLE DE UNA ASIGNACIÓN
// GET /api/dashboard/dispatch/[PK_assignment]
// ============================================================

export const GET = apiRoute(async (_req, ctx) => {
  const params = await ctx.params;
  await requireSession();
  return ok(await getAssignmentOrThrow(Number(params.PK_assignment)));
});
