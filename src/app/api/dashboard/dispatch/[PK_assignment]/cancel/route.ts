import { apiRoute, ok, requireSession } from "@/lib/api/helpers";
import { applyAssignmentOp } from "@/lib/api/dispatch-service";

// POST /api/dashboard/dispatch/[PK_assignment]/cancel
export const POST = apiRoute(async (_req, ctx) => {
  const params = await ctx.params;
  const session = await requireSession();
  await applyAssignmentOp(Number(params.PK_assignment), "cancel", session);
  return ok({ status: "ok", op: "cancel" });
});
