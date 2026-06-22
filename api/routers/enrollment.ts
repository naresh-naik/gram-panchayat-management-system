import { z } from "zod";
import { eq, and, count } from "drizzle-orm";
import { createRouter, publicQuery, secretaryQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { schemeEnrollments, welfareSchemes } from "@db/schema";
import { enrollments as demoEnrollments, isDemoMode, paginate } from "../demo-data";

export const enrollmentRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        schemeId: z.number().optional(),
        citizenId: z.number().optional(),
        status: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(10),
      }).optional()
    )
    .query(async ({ input }) => {
      if (isDemoMode) {
        const params = input ?? { page: 1, limit: 10 };
        const filtered = demoEnrollments.filter((item) => (
          (!params.schemeId || item.schemeId === params.schemeId) &&
          (!params.citizenId || item.citizenId === params.citizenId) &&
          (!params.status || item.status === params.status)
        ));
        return paginate(filtered, params);
      }

      const db = getDb();
      const params = input ?? { page: 1, limit: 10 };
      const offset = (params.page - 1) * params.limit;

      const conditions = [];
      if (params.schemeId) {
        conditions.push(eq(schemeEnrollments.schemeId, params.schemeId));
      }
      if (params.citizenId) {
        conditions.push(eq(schemeEnrollments.citizenId, params.citizenId));
      }
      if (params.status) {
        conditions.push(eq(schemeEnrollments.status, params.status as "active" | "inactive" | "rejected"));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [items, totalResult] = await Promise.all([
        db.query.schemeEnrollments.findMany({
          where: whereClause,
          limit: params.limit,
          offset,
          with: { citizen: true, scheme: true },
          orderBy: (schemeEnrollments, { desc }) => [desc(schemeEnrollments.createdAt)],
        }),
        db.select({ count: count() }).from(schemeEnrollments).where(whereClause),
      ]);

      const total = totalResult[0]?.count ?? 0;

      return {
        items,
        total,
        page: params.page,
        totalPages: Math.ceil(total / params.limit),
      };
    }),

  create: secretaryQuery
    .input(
      z.object({
        schemeId: z.number(),
        citizenId: z.number(),
        amountReceived: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (isDemoMode) {
        const id = Math.max(...demoEnrollments.map((item) => item.id)) + 1;
        return { id, ...input, enrollmentDate: new Date().toISOString().split("T")[0], status: "active" };
      }

      const db = getDb();
      const enrollmentDate = new Date();
      const data = {
        schemeId: input.schemeId,
        citizenId: input.citizenId,
        enrollmentDate,
        amountReceived: input.amountReceived ?? "0",
        notes: input.notes ?? null,
      };
      const result = await db.insert(schemeEnrollments).values(data);

      // Update utilized budget
      const amount = parseFloat(input.amountReceived ?? "0");
      if (amount > 0) {
        const scheme = await db.query.welfareSchemes.findFirst({
          where: eq(welfareSchemes.id, input.schemeId),
        });
        if (scheme) {
          const currentUtilized = parseFloat(scheme.utilizedBudget ?? "0");
          const newUtilized = (currentUtilized + amount).toFixed(2);
          await db.update(welfareSchemes)
            .set({ utilizedBudget: newUtilized })
            .where(eq(welfareSchemes.id, input.schemeId));
        }
      }

      const id = Number(result[0].insertId);
      return { id, ...input, enrollmentDate: enrollmentDate.toISOString().split("T")[0] };
    }),

  update: secretaryQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["active", "inactive", "rejected"]).optional(),
        amountReceived: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (isDemoMode) {
        return { ...input };
      }

      const db = getDb();
      const { id, ...data } = input;
      await db.update(schemeEnrollments).set(data).where(eq(schemeEnrollments.id, id));
      return { id, ...data };
    }),
});
