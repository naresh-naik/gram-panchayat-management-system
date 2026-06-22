import { z } from "zod";
import { eq, like, and, count } from "drizzle-orm";
import { createRouter, secretaryQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { citizens } from "@db/schema";
import { citizens as demoCitizens, isDemoMode, paginate, withRelations } from "../demo-data";

export const citizenRouter = createRouter({
  list: secretaryQuery
    .input(
      z.object({
        search: z.string().optional(),
        ward: z.string().optional(),
        gender: z.string().optional(),
        category: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(10),
      }).optional()
    )
    .query(async ({ input }) => {
      if (isDemoMode) {
        const params = input ?? { page: 1, limit: 10 };
        const { citizensWithHouseholds } = withRelations();
        const filtered = citizensWithHouseholds.filter((citizen) => {
          const search = params.search?.toLowerCase();
          return (
            (!search || citizen.fullName.toLowerCase().includes(search) || citizen.phone?.includes(search)) &&
            (!params.ward || citizen.ward === params.ward) &&
            (!params.gender || citizen.gender === params.gender) &&
            (!params.category || citizen.category === params.category)
          );
        });
        return paginate(filtered, params);
      }

      const db = getDb();
      const params = input ?? { page: 1, limit: 10 };
      const offset = (params.page - 1) * params.limit;

      const conditions = [];
      if (params.search) {
        conditions.push(like(citizens.fullName, `%${params.search}%`));
      }
      if (params.ward) {
        conditions.push(eq(citizens.ward, params.ward));
      }
      if (params.gender) {
        conditions.push(eq(citizens.gender, params.gender as "male" | "female" | "other"));
      }
      if (params.category) {
        conditions.push(eq(citizens.category, params.category as "SC" | "ST" | "OBC" | "General"));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [items, totalResult] = await Promise.all([
        db.query.citizens.findMany({
          where: whereClause,
          limit: params.limit,
          offset,
          with: { household: true },
          orderBy: (citizens, { desc }) => [desc(citizens.createdAt)],
        }),
        db.select({ count: count() }).from(citizens).where(whereClause),
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
        const { citizensWithHouseholds } = withRelations();
        return citizensWithHouseholds.find((citizen) => citizen.id === input.id) ?? null;
      }

      const db = getDb();
      const citizen = await db.query.citizens.findFirst({
        where: eq(citizens.id, input.id),
        with: { household: true },
      });
      return citizen ?? null;
    }),

  create: secretaryQuery
    .input(
      z.object({
        fullName: z.string().min(1),
        fatherName: z.string().optional(),
        motherName: z.string().optional(),
        dob: z.string(),
        gender: z.enum(["male", "female", "other"]),
        category: z.enum(["SC", "ST", "OBC", "General"]),
        aadhaar: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        address: z.string().min(1),
        ward: z.string().min(1),
        householdId: z.number().optional(),
        occupation: z.string().optional(),
        education: z.string().optional(),
        maritalStatus: z.enum(["single", "married", "widowed", "divorced"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (isDemoMode) {
        const id = Math.max(...demoCitizens.map((citizen) => citizen.id)) + 1;
        return { id, ...input, createdAt: new Date(), updatedAt: new Date() };
      }

      const db = getDb();
      const data: Record<string, unknown> = {
        fullName: input.fullName,
        fatherName: input.fatherName ?? null,
        motherName: input.motherName ?? null,
        dob: new Date(input.dob),
        gender: input.gender,
        category: input.category,
        aadhaar: input.aadhaar ?? null,
        phone: input.phone ?? null,
        email: input.email ?? null,
        address: input.address,
        ward: input.ward,
        householdId: input.householdId ?? null,
        occupation: input.occupation ?? null,
        education: input.education ?? null,
        maritalStatus: input.maritalStatus ?? null,
      };
      const result = await db.insert(citizens).values(data as typeof citizens.$inferInsert);
      const id = Number(result[0].insertId);
      return { id, ...input };
    }),

  update: secretaryQuery
    .input(
      z.object({
        id: z.number(),
        fullName: z.string().optional(),
        fatherName: z.string().optional(),
        motherName: z.string().optional(),
        dob: z.string().optional(),
        gender: z.enum(["male", "female", "other"]).optional(),
        category: z.enum(["SC", "ST", "OBC", "General"]).optional(),
        aadhaar: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        address: z.string().optional(),
        ward: z.string().optional(),
        householdId: z.number().optional(),
        occupation: z.string().optional(),
        education: z.string().optional(),
        maritalStatus: z.enum(["single", "married", "widowed", "divorced"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...rawData } = input;
      const data: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(rawData)) {
        if (value !== undefined) {
          if (key === "dob" && typeof value === "string") {
            data[key] = new Date(value);
          } else {
            data[key] = value;
          }
        }
      }
      await db.update(citizens).set(data as typeof citizens.$inferInsert).where(eq(citizens.id, id));
      return { id, ...rawData };
    }),

  delete: secretaryQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      if (isDemoMode) {
        return { success: true, id: input.id };
      }

      const db = getDb();
      await db.delete(citizens).where(eq(citizens.id, input.id));
      return { success: true };
    }),
});
