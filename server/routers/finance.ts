import { z } from "zod";
import { eq, and, count, sum } from "drizzle-orm";
import { createRouter, financeQuery, secretaryQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { propertyTax, welfareSchemes } from "@db/schema";
import { isDemoMode, propertyTaxes, schemes as demoSchemes, withRelations, paginate } from "../demo-data";

export const financeRouter = createRouter({
  getOverview: financeQuery.query(async () => {
    if (isDemoMode) {
      const localCollections = propertyTaxes
        .filter((tax) => tax.status === "paid")
        .reduce((sum, tax) => sum + parseFloat(tax.taxAmount), 0);
      const totalRevenue = 12650000 + localCollections;
      const totalExpenditure = demoSchemes.reduce((sum, scheme) => sum + parseFloat(scheme.utilizedBudget), 0);
      const pendingCollections = propertyTaxes
        .filter((tax) => tax.status === "pending" || tax.status === "overdue")
        .reduce((sum, tax) => sum + parseFloat(tax.taxAmount), 0);
      return {
        totalRevenue,
        totalExpenditure,
        balance: totalRevenue - totalExpenditure,
        pendingCollections,
      };
    }

    const db = getDb();

    const [revenueResult, expenditureResult, pendingResult] = await Promise.all([
      db.select({ total: sum(propertyTax.taxAmount) }).from(propertyTax).where(eq(propertyTax.status, "paid")),
      db.select({ total: sum(welfareSchemes.utilizedBudget) }).from(welfareSchemes),
      db.select({ total: sum(propertyTax.taxAmount) }).from(propertyTax).where(eq(propertyTax.status, "overdue")),
    ]);

    const totalRevenue = parseFloat(revenueResult[0]?.total ?? "0");
    const totalExpenditure = parseFloat(expenditureResult[0]?.total ?? "0");
    const pendingCollections = parseFloat(pendingResult[0]?.total ?? "0");

    return {
      totalRevenue,
      totalExpenditure,
      balance: totalRevenue - totalExpenditure,
      pendingCollections,
    };
  }),

  getRevenueTrend: financeQuery.query(async () => {
    if (isDemoMode) {
      const monthly = Array.from({ length: 12 }, (_, i) => ({
        month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
        amount: 0,
      }));
      for (const tax of propertyTaxes) {
        if (tax.status === "paid" && tax.paidDate) {
          monthly[new Date(tax.paidDate).getMonth()].amount += parseFloat(tax.taxAmount);
        }
      }
      monthly[3].amount += 2500000;
      monthly[4].amount += 3500000;
      monthly[5].amount += 2800000;
      monthly[6].amount += 3850000;
      return monthly;
    }

    const db = getDb();
    const taxes = await db.select().from(propertyTax).where(eq(propertyTax.status, "paid"));

    const monthly = Array.from({ length: 12 }, (_, i) => ({
      month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
      amount: 0,
    }));

    for (const tax of taxes) {
      if (tax.paidDate) {
        const month = new Date(tax.paidDate).getMonth();
        monthly[month].amount += parseFloat(tax.taxAmount);
      }
    }

    return monthly;
  }),

  getExpenditureBreakdown: financeQuery.query(async () => {
    if (isDemoMode) {
      const categoryMap: Record<string, number> = {};
      for (const scheme of demoSchemes) {
        categoryMap[scheme.category] = (categoryMap[scheme.category] ?? 0) + parseFloat(scheme.utilizedBudget);
      }
      const total = Object.values(categoryMap).reduce((a, b) => a + b, 0);
      return Object.entries(categoryMap).map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      }));
    }

    const db = getDb();
    const schemes = await db.select().from(welfareSchemes);

    const categoryMap: Record<string, number> = {};
    for (const scheme of schemes) {
      const cat = scheme.category;
      const amount = parseFloat(scheme.utilizedBudget ?? "0");
      categoryMap[cat] = (categoryMap[cat] ?? 0) + amount;
    }

    const total = Object.values(categoryMap).reduce((a, b) => a + b, 0);
    return Object.entries(categoryMap).map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
    }));
  }),

  listTaxRecords: financeQuery
    .input(
      z.object({
        search: z.string().optional(),
        status: z.string().optional(),
        ward: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(10),
      }).optional()
    )
    .query(async ({ input }) => {
      if (isDemoMode) {
        const params = input ?? { page: 1, limit: 10 };
        const { taxesWithCitizens } = withRelations();
        const filtered = taxesWithCitizens.filter((tax) => !params.status || tax.status === params.status);
        return paginate(filtered, params);
      }

      const db = getDb();
      const params = input ?? { page: 1, limit: 10 };
      const offset = (params.page - 1) * params.limit;

      const conditions = [];
      if (params.status) {
        conditions.push(eq(propertyTax.status, params.status as "pending" | "paid" | "overdue"));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [items, totalResult] = await Promise.all([
        db.query.propertyTax.findMany({
          where: whereClause,
          limit: params.limit,
          offset,
          with: { citizen: true },
          orderBy: (propertyTax, { desc }) => [desc(propertyTax.createdAt)],
        }),
        db.select({ count: count() }).from(propertyTax).where(whereClause),
      ]);

      const total = totalResult[0]?.count ?? 0;

      return {
        items,
        total,
        page: params.page,
        totalPages: Math.ceil(total / params.limit),
      };
    }),

  createTaxRecord: secretaryQuery
    .input(
      z.object({
        citizenId: z.number(),
        propertyId: z.string().min(1),
        propertyType: z.enum(["residential", "commercial", "agricultural"]),
        area: z.string(),
        assessedValue: z.string(),
        taxAmount: z.string(),
        dueDate: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      if (isDemoMode) {
        const id = Math.max(...propertyTaxes.map((tax) => tax.id)) + 1;
        return { id, ...input, status: "pending", paidDate: null, paymentMethod: null };
      }

      const db = getDb();
      const result = await db.insert(propertyTax).values({
        ...input,
        dueDate: new Date(input.dueDate),
        paidDate: null,
        paymentMethod: null,
        status: "pending",
      } as typeof propertyTax.$inferInsert);
      const id = Number(result[0].insertId);
      return { id, ...input };
    }),

  recordPayment: secretaryQuery
    .input(
      z.object({
        id: z.number(),
        paidDate: z.string(),
        paymentMethod: z.enum(["cash", "online", "cheque"]),
      })
    )
    .mutation(async ({ input }) => {
      if (isDemoMode) {
        return { id: input.id, paidDate: input.paidDate, paymentMethod: input.paymentMethod, status: "paid" };
      }

      const db = getDb();
      const { id, ...data } = input;
      await db.update(propertyTax)
        .set({
          ...data,
          paidDate: new Date(data.paidDate),
          status: "paid",
        })
        .where(eq(propertyTax.id, id));
      return { id, ...data, status: "paid" };
    }),
});
