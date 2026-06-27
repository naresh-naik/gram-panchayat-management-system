import { ErrorMessages } from "@contracts/constants";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const createRouter = t.router;
export const publicQuery = t.procedure;

const requireAuth = t.middleware(async (opts) => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ErrorMessages.unauthenticated,
    });
  }
  if (ctx.user.status !== "active") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: ctx.user.status === "pending"
        ? "Account is awaiting verification"
        : "Account is suspended",
    });
  }

  return next({ ctx: { ...ctx, user: ctx.user } });
});

function requireRole(roles: string[]) {
  return t.middleware(async (opts) => {
    const { ctx, next } = opts;

    if (!ctx.user || !roles.includes(ctx.user.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: ErrorMessages.insufficientRole,
      });
    }

    return next({ ctx: { ...ctx, user: ctx.user } });
  });
}

// ─── Role-based procedures ───
// Any authenticated user
export const authedQuery = t.procedure.use(requireAuth);

// Admin only
export const adminQuery = authedQuery.use(requireRole(["admin"]));

// Admin or Secretary (Panchayat employees)
export const secretaryQuery = authedQuery.use(requireRole(["admin", "secretary"]));

// Admin or Monitor (Government monitors)
export const monitorQuery = authedQuery.use(requireRole(["admin", "monitor"]));

// Admin, Secretary, or Citizen (Any village user)
export const citizenQuery = authedQuery.use(requireRole(["admin", "secretary", "citizen", "monitor"]));

// Admin, Secretary, or Monitor (finance and operational oversight)
export const financeQuery = authedQuery.use(requireRole(["admin", "secretary", "monitor"]));
