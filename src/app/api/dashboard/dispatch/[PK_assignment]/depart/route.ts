import { apiRoute, ok, requireSession } from "@/lib/api/helpers";
import { applyAssignmentOp } from "@/lib/api/dispatch-service";

// POST /api/dashboard/dispatch/[PK_assignment]/depart
export const POST = apiRoute(async (_req, ctx) => {
  const params = await ctx.params;
  const session = await requireSession();
  await applyAssignmentOp(Number(params.PK_assignment), "depart", session);
  return ok({ status: "ok", op: "depart" });
});
