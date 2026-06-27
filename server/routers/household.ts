import { z } from "zod";
import { eq, like, and, count, desc } from "drizzle-orm";
import { createRouter, secretaryQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { households } from "@db/schema";
import { households as demoHouseholds, isDemoMode, paginate } from "../demo-data";

export const householdRouter = createRouter({
  list: secretaryQuery
    .input(
      z.object({
        search: z.string().optional(),
        ward: z.string().optional(),
        incomeCategory: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(10),
      }).optional()
    )
    .query(async ({ input }) => {
      if (isDemoMode) {
        const params = input ?? { page: 1, limit: 10 };
        const filtered = demoHouseholds.filter((household) => {
          const search = params.search?.toLowerCase();
          return (
            (!search || household.headName.toLowerCase().includes(search) || household.address.toLowerCase().includes(search)) &&
            (!params.ward || household.ward === params.ward) &&
            (!params.incomeCategory || household.incomeCategory === params.incomeCategory)
          );
        }).map((household) => ({ ...household, members: household.members }));
        return paginate(filtered, params);
      }

      const db = getDb();
      const params = input ?? { page: 1, limit: 10 };
      const offset = (params.page - 1) * params.limit;

      const conditions = [];
      if (params.search) {
        conditions.push(like(households.headName, `%${params.search}%`));
      }
      if (params.ward) {
        conditions.push(eq(households.ward, params.ward));
      }
      if (params.incomeCategory) {
        conditions.push(eq(households.incomeCategory, params.incomeCategory as "APL" | "BPL" | "antyodaya"));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [items, totalResult] = await Promise.all([
        db.query.households.findMany({
          where: whereClause,
          limit: params.limit,
          offset,
          with: { members: true },
          orderBy: [desc(households.createdAt)],
        }),
        db.select({ count: count() }).from(households).where(whereClause),
      ]);

      const total = totalResult[0]?.count ?? 0;

      return {
        items,
        total,
        page: params.page,
        totalPages: Math.ceil(total / params.limit),
      };
    }),

  getById: secretaryQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      if (isDemoMode) {
        return demoHouseholds.find((household) => household.id === input.id) ?? null;
      }

      const db = getDb();
      const household = await db.query.households.findFirst({
        where: eq(households.id, input.id),
        with: { members: true },
      });
      return household ?? null;
    }),

  create: secretaryQuery
    .input(
      z.object({
        headName: z.string().min(1),
        address: z.string().min(1),
        ward: z.string().min(1),
        members: z.number().default(1),
        incomeCategory: z.enum(["APL", "BPL", "antyodaya"]),
        rationCardType: z.enum(["yellow", "orange", "white", "none"]),
        rationCardNumber: z.string().optional(),
        houseType: z.enum(["pucca", "semi_pucca", "kutcha"]).optional(),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (isDemoMode) {
        const id = Math.max(...demoHouseholds.map((household) => household.id)) + 1;
        return { id, ...input, createdAt: new Date() };
      }

      const db = getDb();
      const result = await db.insert(households).values({
        ...input,
        rationCardNumber: input.rationCardNumber ?? null,
        houseType: input.houseType ?? null,
        phone: input.phone ?? null,
      } as typeof households.$inferInsert);
      const id = Number(result[0].insertId);
      return { id, ...input };
    }),

  update: secretaryQuery
    .input(
      z.object({
        id: z.number(),
        headName: z.string().optional(),
        address: z.string().optional(),
        ward: z.string().optional(),
        members: z.number().optional(),
        incomeCategory: z.enum(["APL", "BPL", "antyodaya"]).optional(),
        rationCardType: z.enum(["yellow", "orange", "white", "none"]).optional(),
        rationCardNumber: z.string().optional(),
        houseType: z.enum(["pucca", "semi_pucca", "kutcha"]).optional(),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(households).set(data as typeof households.$inferInsert).where(eq(households.id, id));
      return { id, ...data };
    }),

  delete: secretaryQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      if (isDemoMode) {
        return { success: true, id: input.id };
      }

      const db = getDb();
      await db.delete(households).where(eq(households.id, input.id));
      return { success: true };
    }),
});
