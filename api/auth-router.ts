import * as cookie from "cookie";
import { z } from "zod";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { demoUsers, isDemoMode } from "./demo-data";
import { findUserByEmail } from "./queries/users";
import { verifyPassword } from "./lib/password";
import { hashPassword } from "./lib/password";
import { signSessionToken } from "./local-session";
import { TRPCError } from "@trpc/server";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";

function publicUser(user: NonNullable<Awaited<ReturnType<typeof findUserByEmail>>>) {
  return {
    id: user.id,
    unionId: user.unionId,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastSignInAt: user.lastSignInAt,
  };
}

function demoPublicUser(role: keyof typeof demoUsers, overrides?: { name?: string; email?: string }) {
  return publicUser({
    ...demoUsers[role],
    name: overrides?.name ?? demoUsers[role].name,
    email: overrides?.email ?? demoUsers[role].email,
  });
}

export const authRouter = createRouter({
  registerCitizen: publicQuery
    .input(z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(12),
    }))
    .mutation(async ({ input }) => {
      if (isDemoMode) {
        return demoPublicUser("citizen", {
          name: input.name.trim(),
          email: input.email.trim().toLowerCase(),
        });
      }

      const email = input.email.trim().toLowerCase();
      const existing = await findUserByEmail(email);
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An account with this email already exists",
        });
      }

      const passwordHash = await hashPassword(input.password);
      const result = await getDb().insert(users).values({
        unionId: `citizen:${email}`,
        name: input.name.trim(),
        email,
        passwordHash,
        role: "citizen",
        status: "pending",
        avatar: null,
        lastSignInAt: new Date(),
      });

      const id = Number(result[0].insertId);
      const user = {
        id,
        unionId: `citizen:${email}`,
        name: input.name.trim(),
        email,
        passwordHash,
        role: "citizen" as const,
        status: "pending" as const,
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignInAt: new Date(),
      };

      return publicUser(user);
    }),

  login: publicQuery
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(8),
    }))
    .mutation(async ({ input, ctx }) => {
      if (isDemoMode) {
        const email = input.email.trim().toLowerCase();
        const matchedRole = Object.entries(demoUsers).find(([, user]) => user.email === email)?.[0] as keyof typeof demoUsers | undefined;
        return demoPublicUser(matchedRole ?? "citizen", {
          email,
          name: matchedRole ? undefined : email.split("@")[0].replace(/[._-]/g, " "),
        });
      }

      const user = await findUserByEmail(input.email);
      const isValid = await verifyPassword(input.password, user?.passwordHash);
      if (!user || !isValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }
      if (user.status === "pending") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Your account is awaiting administrator verification",
        });
      }
      if (user.status === "suspended") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Your account has been suspended",
        });
      }

      const token = await signSessionToken({ userId: user.id });
      const opts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(Session.cookieName, token, {
          httpOnly: opts.httpOnly,
          path: opts.path,
          sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
          secure: opts.secure,
          maxAge: Session.maxAgeMs / 1000,
        }),
      );

      return publicUser(user);
    }),

  me: authedQuery.query((opts) => {
    if (isDemoMode) {
      return opts.ctx.user ?? demoUsers.admin;
    }
    return publicUser(opts.ctx.user);
  }),
  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      }),
    );
    return { success: true };
  }),
});
