import { z } from "zod";
import { eq, like, and, count, desc } from "drizzle-orm";
import { createRouter, publicQuery, secretaryQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { welfareSchemes } from "@db/schema";
import { isDemoMode, paginate, schemes as demoSchemes, withRelations } from "../demo-data";

export const schemeRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        category: z.string().optional(),
        status: z.string().optional(),
        search: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(10),
      }).optional()
    )
    .query(async ({ input }) => {
      if (isDemoMode) {
        const params = input ?? { page: 1, limit: 10 };
        const { schemesWithEnrollments } = withRelations();
        const filtered = schemesWithEnrollments.filter((scheme) => {
          const search = params.search?.toLowerCase();
          return (
            (!search || scheme.name.toLowerCase().includes(search) || scheme.description.toLowerCase().includes(search)) &&
            (!params.category || scheme.category === params.category) &&
            (!params.status || scheme.status === params.status)
          );
        });
        return paginate(filtered, params);
      }

      const db = getDb();
      const params = input ?? { page: 1, limit: 10 };
      const offset = (params.page - 1) * params.limit;

      const conditions = [];
      if (params.category) {
        conditions.push(eq(welfareSchemes.category, params.category as "education" | "health" | "agriculture" | "housing" | "pension" | "sanitation" | "others"));
      }
      if (params.status) {
        conditions.push(eq(welfareSchemes.status, params.status as "active" | "inactive" | "completed"));
      }
      if (params.search) {
        conditions.push(like(welfareSchemes.name, `%${params.search}%`));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [items, totalResult] = await Promise.all([
        db.query.welfareSchemes.findMany({
          where: whereClause,
          limit: params.limit,
          offset,
          with: { enrollments: true },
          orderBy: [desc(welfareSchemes.createdAt)],
        }),
        db.select({ count: count() }).from(welfareSchemes).where(whereClause),
      ]);

      const total = totalResult[0]?.count ?? 0;

      return {
        items,
        total,
        page: params.page,
        totalPages: Math.ceil(total / params.limit),
      };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      if (isDemoMode) {
        const { schemesWithEnrollments } = withRelations();
        return schemesWithEnrollments.find((scheme) => scheme.id === input.id) ?? null;
      }

      const db = getDb();
      const scheme = await db.query.welfareSchemes.findFirst({
        where: eq(welfareSchemes.id, input.id),
        with: { enrollments: { with: { citizen: true } } },
      });
      return scheme ?? null;
    }),

  create: secretaryQuery
    .input(
      z.object({
        name: z.string().min(1),
        category: z.enum(["education", "health", "agriculture", "housing", "pension", "sanitation", "others"]),
        description: z.string().min(1),
        budget: z.string(),
        startDate: z.string(),
        endDate: z.string().optional(),
        eligibility: z.string().optional(),
        applicationProcess: z.string().optional(),
        image: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (isDemoMode) {
        const id = Math.max(...demoSchemes.map((scheme) => scheme.id)) + 1;
        return { id, ...input, status: "active", utilizedBudget: "0", createdAt: new Date() };
      }

      const db = getDb();
      const result = await db.insert(welfareSchemes).values({
        name: input.name,
        category: input.category,
        description: input.description,
        budget: input.budget,
        startDate: new Date(input.startDate),
        endDate: input.endDate ? new Date(input.endDate) : null,
        status: "active",
        eligibility: input.eligibility ?? null,
        applicationProcess: input.applicationProcess ?? null,
        image: input.image ?? null,
        utilizedBudget: "0",
      } as typeof welfareSchemes.$inferInsert);
      const id = Number(result[0].insertId);
      return { id, ...input };
    }),

  update: secretaryQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        category: z.enum(["education", "health", "agriculture", "housing", "pension", "sanitation", "others"]).optional(),
        description: z.string().optional(),
        budget: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        status: z.enum(["active", "inactive", "completed"]).optional(),
        eligibility: z.string().optional(),
        applicationProcess: z.string().optional(),
        image: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...rawData } = input;
      const data: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(rawData)) {
        if (value !== undefined) {
          if ((key === "startDate" || key === "endDate") && typeof value === "string") {
            data[key] = new Date(value);
          } else {
            data[key] = value;
          }
        }
      }
      await db.update(welfareSchemes).set(data as typeof welfareSchemes.$inferInsert).where(eq(welfareSchemes.id, id));
      return { id, ...rawData };
    }),

  delete: secretaryQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      if (isDemoMode) {
        return { success: true, id: input.id };
      }

      const db = getDb();
      await db.delete(welfareSchemes).where(eq(welfareSchemes.id, input.id));
      return { success: true };
    }),
});
