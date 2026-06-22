import { z } from "zod";
import { desc } from "drizzle-orm";
import { createRouter, publicQuery, secretaryQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { activities } from "@db/schema";
import { activities as demoActivities, isDemoMode } from "../demo-data";

export const activityRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        userId: z.number().optional(),
        type: z.string().optional(),
        limit: z.number().default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      if (isDemoMode) {
        const params = input ?? { limit: 20 };
        return demoActivities
          .filter((item) => (!params.userId || item.userId === params.userId) && (!params.type || item.type === params.type))
          .slice(0, params.limit);
      }

      const db = getDb();
      const params = input ?? { limit: 20 };

      const items = await db.query.activities.findMany({
        limit: params.limit,
        with: { user: true },
        orderBy: [desc(activities.createdAt)],
      });

      return items;
    }),

  create: secretaryQuery
    .input(
      z.object({
        type: z.string().min(1),
        description: z.string().min(1),
        metadata: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (isDemoMode) {
        return { id: Date.now(), ...input, userId: ctx.user.id, createdAt: new Date() };
      }

      const db = getDb();
      const result = await db.insert(activities).values({
        type: input.type,
        description: input.description,
        userId: ctx.user.id,
        metadata: input.metadata ?? null,
      });
      return { id: Number(result[0].insertId), ...input };
    }),
});
