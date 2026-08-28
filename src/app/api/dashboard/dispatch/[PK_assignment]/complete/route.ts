import { apiRoute, ok, requireSession } from "@/lib/api/helpers";
import { applyAssignmentOp } from "@/lib/api/dispatch-service";

// POST /api/dashboard/dispatch/[PK_assignment]/complete
export const POST = apiRoute(async (_req, ctx) => {
  const params = await ctx.params;
  const session = await requireSession();
  await applyAssignmentOp(Number(params.PK_assignment), "complete", session);
  return ok({ status: "ok", op: "complete" });
});
