import { z } from "zod";
import { eq, and, count, desc } from "drizzle-orm";
import { createRouter, citizenQuery, secretaryQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { grievances } from "@db/schema";
import { grievances as demoGrievances, isDemoMode, paginate, withRelations } from "../demo-data";

function generateRefNumber(): string {
  const prefix = "GRV";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export const grievanceRouter = createRouter({
  create: citizenQuery
    .input(
      z.object({
        citizenId: z.number(),
        category: z.enum(["water", "roads", "electricity", "sanitation", "land_dispute", "welfare", "others"]),
        subject: z.string().min(1),
        description: z.string().min(1),
        attachment: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (isDemoMode) {
        const id = Math.max(...demoGrievances.map((item) => item.id)) + 1;
        return { id, referenceNumber: generateRefNumber(), status: "submitted", ...input };
      }

      const db = getDb();
      const referenceNumber = generateRefNumber();
      const result = await db.insert(grievances).values({
        citizenId: input.citizenId,
        category: input.category,
        subject: input.subject,
        description: input.description,
        referenceNumber,
        attachment: input.attachment ?? null,
        status: "submitted",
        assignedTo: null,
        resolution: null,
        resolvedAt: null,
      } as typeof grievances.$inferInsert);
      const id = Number(result[0].insertId);
      return { id, referenceNumber, ...input };
    }),

  list: citizenQuery
    .input(
      z.object({
        citizenId: z.number().optional(),
        status: z.string().optional(),
        category: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(10),
      }).optional()
    )
    .query(async ({ input }) => {
      if (isDemoMode) {
        const params = input ?? { page: 1, limit: 10 };
        const { grievancesWithPeople } = withRelations();
        const filtered = grievancesWithPeople.filter((grievance) => (
          (!params.citizenId || grievance.citizenId === params.citizenId) &&
          (!params.status || grievance.status === params.status) &&
          (!params.category || grievance.category === params.category)
        ));
        return paginate(filtered, params);
      }

      const db = getDb();
      const params = input ?? { page: 1, limit: 10 };
      const offset = (params.page - 1) * params.limit;

      const conditions = [];
      if (params.citizenId) {
        conditions.push(eq(grievances.citizenId, params.citizenId));
      }
      if (params.status) {
        conditions.push(eq(grievances.status, params.status as "submitted" | "under_review" | "assigned" | "resolved" | "rejected"));
      }
      if (params.category) {
        conditions.push(eq(grievances.category, params.category as "water" | "roads" | "electricity" | "sanitation" | "land_dispute" | "welfare" | "others"));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [items, totalResult] = await Promise.all([
        db.query.grievances.findMany({
          where: whereClause,
          limit: params.limit,
          offset,
          with: { citizen: true, assignee: true },
          orderBy: [desc(grievances.createdAt)],
        }),
        db.select({ count: count() }).from(grievances).where(whereClause),
      ]);

      const total = totalResult[0]?.count ?? 0;

      return {
        items,
        total,
        page: params.page,
        totalPages: Math.ceil(total / params.limit),
      };
    }),

  getByRef: citizenQuery
    .input(z.object({ referenceNumber: z.string() }))
    .query(async ({ input }) => {
      if (isDemoMode) {
        const { grievancesWithPeople } = withRelations();
        return grievancesWithPeople.find((item) => item.referenceNumber.toLowerCase() === input.referenceNumber.toLowerCase()) ?? null;
      }

      const db = getDb();
      const grievance = await db.query.grievances.findFirst({
        where: eq(grievances.referenceNumber, input.referenceNumber),
        with: { citizen: true, assignee: true },
      });
      return grievance ?? null;
    }),

  updateStatus: secretaryQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["submitted", "under_review", "assigned", "resolved", "rejected"]),
        assignedTo: z.number().optional(),
        resolution: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (isDemoMode) {
        return {
          id: input.id,
          status: input.status,
          assignedTo: input.assignedTo ?? null,
          resolution: input.resolution ?? null,
          resolvedAt: input.status === "resolved" ? new Date() : null,
        };
      }

      const db = getDb();
      const { id, ...data } = input;

      const updateData: Record<string, unknown> = {};
      if (data.status) updateData.status = data.status;
      if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo;
      if (data.resolution !== undefined) updateData.resolution = data.resolution;
      if (data.status === "resolved") {
        updateData.resolvedAt = new Date();
      }

      await db.update(grievances).set(updateData as typeof grievances.$inferInsert).where(eq(grievances.id, id));
      return { id, ...updateData };
    }),
});
