import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { demoUsers, isDemoMode } from "./demo-data";
import { authenticateRequest } from "./local-auth";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };
  if (isDemoMode) {
    const rawDemoUser = opts.req.headers.get("x-demo-user");
    if (rawDemoUser) {
      try {
        const demoUser = JSON.parse(rawDemoUser) as Partial<User>;
        const role = demoUser.role && demoUsers[demoUser.role] ? demoUser.role : "citizen";
        ctx.user = {
          ...demoUsers[role],
          ...demoUser,
          id: Number(demoUser.id ?? demoUsers[role].id),
          role,
          status: demoUser.status ?? demoUsers[role].status,
          createdAt: new Date(demoUser.createdAt ?? demoUsers[role].createdAt),
          updatedAt: new Date(demoUser.updatedAt ?? demoUsers[role].updatedAt),
          lastSignInAt: new Date(demoUser.lastSignInAt ?? demoUsers[role].lastSignInAt),
        };
        return ctx;
      } catch {
        // Fall back to the role header below.
      }
    }

    const requestedRole = opts.req.headers.get("x-demo-role") ?? "admin";
    ctx.user = demoUsers[requestedRole] ?? demoUsers.admin;
    return ctx;
  }

  try {
    ctx.user = await authenticateRequest(opts.req.headers);
  } catch {
    // Authentication is optional here
  }
  return ctx;
}
