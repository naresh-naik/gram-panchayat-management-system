import { and, count, desc, eq, like, or } from "drizzle-orm";
import { z } from "zod";
import { activities, users } from "@db/schema";
import { demoUsers, isDemoMode, paginate } from "../demo-data";
import { createRouter, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";

function toPublicUser(user: typeof users.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    lastSignInAt: user.lastSignInAt,
  };
}

const demoUserList = [
  ...Object.values(demoUsers),
  {
    ...demoUsers.citizen,
    id: 5,
    unionId: "local-pending-citizen",
    name: "Pending Citizen",
    email: "pending.citizen@example.in",
    status: "pending" as const,
  },
].map(toPublicUser);

export const userRouter = createRouter({
  list: adminQuery
    .input(
      z.object({
        search: z.string().optional(),
        role: z.enum(["admin", "secretary", "citizen", "monitor"]).optional(),
        status: z.enum(["pending", "active", "suspended"]).optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }).optional(),
    )
    .query(async ({ input }) => {
      const params = input ?? { page: 1, limit: 20 };

      if (isDemoMode) {
        const search = params.search?.toLowerCase();
        const filtered = demoUserList.filter((user) => (
          (!search || user.name?.toLowerCase().includes(search) || user.email?.toLowerCase().includes(search)) &&
          (!params.role || user.role === params.role) &&
          (!params.status || user.status === params.status)
        ));
        return paginate(filtered, params);
      }

      const db = getDb();
      const where = and(
        params.search
          ? or(like(users.name, `%${params.search}%`), like(users.email, `%${params.search}%`))
          : undefined,
        params.role ? eq(users.role, params.role) : undefined,
        params.status ? eq(users.status, params.status) : undefined,
      );
      const [items, totalResult] = await Promise.all([
        db.query.users.findMany({
          where,
          limit: params.limit,
          offset: (params.page - 1) * params.limit,
          orderBy: [desc(users.createdAt)],
        }),
        db.select({ count: count() }).from(users).where(where),
      ]);

      const filtered = items.map(toPublicUser);

      return {
        items: filtered,
        total: totalResult[0]?.count ?? filtered.length,
        page: params.page,
        totalPages: Math.max(1, Math.ceil((totalResult[0]?.count ?? filtered.length) / params.limit)),
      };
    }),

  updateStatus: adminQuery
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "active", "suspended"]),
    }))
    .mutation(async ({ input, ctx }) => {
      if (isDemoMode) {
        return { id: input.id, status: input.status };
      }

      const db = getDb();
      await db
        .update(users)
        .set({ status: input.status })
        .where(eq(users.id, input.id));
      await db.insert(activities).values({
        type: "user_status_updated",
        description: `User account #${input.id} marked ${input.status}`,
        userId: ctx.user.id,
        metadata: { targetUserId: input.id, status: input.status },
      });
      return { id: input.id, status: input.status };
    }),

  updateRole: adminQuery
    .input(z.object({
      id: z.number(),
      role: z.enum(["admin", "secretary", "citizen", "monitor"]),
    }))
    .mutation(async ({ input, ctx }) => {
      if (isDemoMode) {
        return { id: input.id, role: input.role };
      }

      const db = getDb();
      await db
        .update(users)
        .set({ role: input.role })
        .where(eq(users.id, input.id));
      await db.insert(activities).values({
        type: "user_role_updated",
        description: `User account #${input.id} role changed to ${input.role}`,
        userId: ctx.user.id,
        metadata: { targetUserId: input.id, role: input.role },
      });
      return { id: input.id, role: input.role };
    }),
});
