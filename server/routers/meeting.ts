import { z } from "zod";
import { eq, and, count, desc } from "drizzle-orm";
import { createRouter, citizenQuery, secretaryQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { meetings, meetingAttendance } from "@db/schema";
import { isDemoMode, meetings as demoMeetings, paginate, withRelations } from "../demo-data";

export const meetingRouter = createRouter({
  list: citizenQuery
    .input(
      z.object({
        type: z.string().optional(),
        status: z.string().optional(),
        from: z.string().optional(),
        to: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(10),
      }).optional()
    )
    .query(async ({ input }) => {
      if (isDemoMode) {
        const params = input ?? { page: 1, limit: 10 };
        const { meetingsWithAttendance } = withRelations();
        const filtered = meetingsWithAttendance.filter((meeting) => (
          (!params.type || meeting.type === params.type) &&
          (!params.status || meeting.status === params.status)
        ));
        return paginate(filtered, params);
      }

      const db = getDb();
      const params = input ?? { page: 1, limit: 10 };
      const offset = (params.page - 1) * params.limit;

      const conditions = [];
      if (params.type) {
        conditions.push(eq(meetings.type, params.type as "gram_sabha" | "executive" | "special"));
      }
      if (params.status) {
        conditions.push(eq(meetings.status, params.status as "scheduled" | "ongoing" | "completed" | "cancelled"));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [items, totalResult] = await Promise.all([
        db.query.meetings.findMany({
          where: whereClause,
          limit: params.limit,
          offset,
          with: { attendance: true },
          orderBy: [desc(meetings.date)],
        }),
        db.select({ count: count() }).from(meetings).where(whereClause),
      ]);

      const total = totalResult[0]?.count ?? 0;

      return {
        items,
        total,
        page: params.page,
        totalPages: Math.ceil(total / params.limit),
      };
    }),

  getById: citizenQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      if (isDemoMode) {
        const { meetingsWithAttendance } = withRelations();
        return meetingsWithAttendance.find((meeting) => meeting.id === input.id) ?? null;
      }

      const db = getDb();
      const meeting = await db.query.meetings.findFirst({
        where: eq(meetings.id, input.id),
        with: { attendance: { with: { citizen: true } } },
      });
      return meeting ?? null;
    }),

  create: secretaryQuery
    .input(
      z.object({
        title: z.string().min(1),
        type: z.enum(["gram_sabha", "executive", "special"]),
        date: z.string(),
        time: z.string(),
        location: z.string().min(1),
        agenda: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (isDemoMode) {
        const id = Math.max(...demoMeetings.map((meeting) => meeting.id)) + 1;
        return { id, ...input, createdBy: ctx.user.id, status: "scheduled", minutes: null };
      }

      const db = getDb();
      const result = await db.insert(meetings).values({
        title: input.title,
        type: input.type,
        date: new Date(input.date),
        time: input.time,
        location: input.location,
        agenda: input.agenda ?? null,
        createdBy: ctx.user.id,
      } as typeof meetings.$inferInsert);
      const id = Number(result[0].insertId);
      return { id, ...input };
    }),

  updateMinutes: secretaryQuery
    .input(
      z.object({
        id: z.number(),
        minutes: z.string().min(1),
        status: z.enum(["scheduled", "ongoing", "completed", "cancelled"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (isDemoMode) {
        return { id: input.id, minutes: input.minutes, status: input.status ?? "completed" };
      }

      const db = getDb();
      const { id, minutes, status } = input;
      const data: Record<string, unknown> = { minutes };
      if (status) data.status = status;
      await db.update(meetings).set(data as typeof meetings.$inferInsert).where(eq(meetings.id, id));
      return { id, ...data };
    }),

  markAttendance: secretaryQuery
    .input(
      z.object({
        meetingId: z.number(),
        citizenId: z.number(),
        role: z.enum(["member", "secretary", "sarpanch", "guest"]),
        present: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      if (isDemoMode) {
        return { id: Date.now(), ...input };
      }

      const db = getDb();
      const result = await db.insert(meetingAttendance).values(input);
      const id = Number(result[0].insertId);
      return { id, ...input };
    }),
});
