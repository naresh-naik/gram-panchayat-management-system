import { z } from "zod";
import { and, count, desc, eq, like, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createRouter, citizenQuery, publicQuery, secretaryQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { citizens as citizensTable, grievances, users } from "@db/schema";
import {
  citizens as demoCitizens,
  demoUsers,
  grievances as seededDemoGrievances,
  isDemoMode,
  paginate,
} from "../demo-data";

type GrievanceStatus = "submitted" | "under_review" | "assigned" | "resolved" | "rejected";
type GrievanceCategory = "water" | "roads" | "electricity" | "sanitation" | "land_dispute" | "welfare" | "others";
type GrievancePriority = "low" | "medium" | "high" | "critical";
type GrievanceSource = "web" | "whatsapp" | "office";

type DemoGrievance = {
  id: number;
  citizenId: number;
  category: GrievanceCategory;
  subject: string;
  description: string;
  attachment: string | null;
  status: GrievanceStatus;
  referenceNumber: string;
  source: GrievanceSource;
  whatsappNumber: string | null;
  ward: string | null;
  priority: GrievancePriority;
  aiSummary: string | null;
  aiCategory: string | null;
  slaDueAt: Date | null;
  latestUpdate: string | null;
  assignedTo: number | null;
  resolution: string | null;
  createdAt: Date;
  resolvedAt: Date | null;
  citizen?: (typeof demoCitizens)[number] | null;
  assignee?: typeof demoUsers.secretary | null;
};

function generateRefNumber(): string {
  const prefix = "GRV";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

function addHours(hours: number) {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date;
}

function summarize(text: string) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= 140) return cleaned;
  return `${cleaned.slice(0, 137).trim()}...`;
}

function classifyComplaint(text: string): { category: GrievanceCategory; priority: GrievancePriority; aiCategory: string; slaDueAt: Date } {
  const value = text.toLowerCase();
  const keywordMap: Array<{ category: GrievanceCategory; label: string; words: string[] }> = [
    { category: "sanitation", label: "Sanitation", words: ["garbage", "drain", "drainage", "sewage", "waste", "toilet", "cleaning", "mosquito", "fogging", "stagnant", "health"] },
    { category: "water", label: "Water supply", words: ["water", "tap", "pump", "borewell", "pipeline", "drinking", "pressure", "leakage"] },
    { category: "roads", label: "Road maintenance", words: ["road", "pothole", "pathway", "street", "bridge", "culvert", "muddy", "waterlogging", "drain cover"] },
    { category: "electricity", label: "Electricity", words: ["power", "electric", "light", "wire", "transformer", "pole", "streetlight"] },
    { category: "land_dispute", label: "Land or public asset", words: ["land", "boundary", "encroach", "property", "survey", "pond", "community hall", "playground", "public asset"] },
    { category: "welfare", label: "Welfare scheme", words: ["pension", "ration", "scheme", "benefit", "awas", "job card", "mgnrega", "school", "anganwadi", "livelihood", "shg", "midday meal"] },
  ];
  const matched = keywordMap.find((item) => item.words.some((word) => value.includes(word)));
  const urgentWords = ["emergency", "danger", "accident", "hospital", "fire", "contaminated", "flood", "severe", "urgent"];
  const highWords = ["3 days", "three days", "week", "blocked", "broken", "no water", "not working", "unsafe"];
  const priority: GrievancePriority = urgentWords.some((word) => value.includes(word))
    ? "critical"
    : highWords.some((word) => value.includes(word))
      ? "high"
      : matched
        ? "medium"
        : "low";
  const slaHours = priority === "critical" ? 12 : priority === "high" ? 24 : priority === "medium" ? 72 : 120;

  return {
    category: matched?.category ?? "others",
    priority,
    aiCategory: matched?.label ?? "General citizen service",
    slaDueAt: addHours(slaHours),
  };
}

function seededDemoWithRelations(): DemoGrievance[] {
  return seededDemoGrievances.map((grievance) => ({
    id: grievance.id,
    citizenId: grievance.citizenId,
    category: grievance.category as GrievanceCategory,
    subject: grievance.subject,
    description: grievance.description,
    attachment: grievance.attachment,
    status: grievance.status as GrievanceStatus,
    referenceNumber: grievance.referenceNumber,
    source: grievance.source as GrievanceSource,
    whatsappNumber: grievance.whatsappNumber,
    ward: grievance.ward,
    priority: grievance.priority as GrievancePriority,
    aiSummary: grievance.aiSummary,
    aiCategory: grievance.aiCategory,
    slaDueAt: grievance.slaDueAt,
    latestUpdate: grievance.latestUpdate,
    assignedTo: grievance.assignedTo,
    resolution: grievance.resolution,
    createdAt: grievance.createdAt,
    resolvedAt: grievance.resolvedAt,
    citizen: demoCitizens.find((citizen) => citizen.id === grievance.citizenId) ?? null,
    assignee: grievance.assignedTo ? demoUsers.secretary : null,
  }));
}

let demoLiveGrievances: DemoGrievance[] = seededDemoWithRelations();

function getDemoList() {
  return demoLiveGrievances.map((grievance) => ({
    ...grievance,
    citizen: demoCitizens.find((citizen) => citizen.id === grievance.citizenId) ?? null,
    assignee: grievance.assignedTo ? demoUsers.secretary : null,
  }));
}

function applyFilters<T extends { citizenId?: number; status: string; category: string; source?: string; priority?: string; subject: string; description: string; referenceNumber: string }>(
  items: T[],
  params: {
    citizenId?: number;
    status?: string;
    category?: string;
    source?: string;
    priority?: string;
    search?: string;
  }
) {
  return items.filter((grievance) => {
    const search = params.search?.toLowerCase().trim();
    return (
      (!params.citizenId || grievance.citizenId === params.citizenId) &&
      (!params.status || grievance.status === params.status) &&
      (!params.category || grievance.category === params.category) &&
      (!params.source || grievance.source === params.source) &&
      (!params.priority || grievance.priority === params.priority) &&
      (!search ||
        grievance.subject.toLowerCase().includes(search) ||
        grievance.description.toLowerCase().includes(search) ||
        grievance.referenceNumber.toLowerCase().includes(search))
    );
  });
}

function toCsv(items: Array<Record<string, unknown>>) {
  const headers = ["referenceNumber", "source", "citizen", "ward", "category", "priority", "status", "subject", "aiSummary", "createdAt", "slaDueAt"];
  const rows = items.map((item) =>
    headers.map((header) => {
      const value = header === "citizen"
        ? (item.citizen as { fullName?: string } | null)?.fullName ?? ""
        : item[header];
      return `"${String(value ?? "").replace(/"/g, '""')}"`;
    }).join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

export const grievanceRouter = createRouter({
  create: citizenQuery
    .input(
      z.object({
        citizenId: z.number(),
        category: z.enum(["water", "roads", "electricity", "sanitation", "land_dispute", "welfare", "others"]).optional(),
        subject: z.string().min(1),
        description: z.string().min(1),
        attachment: z.string().optional(),
        source: z.enum(["web", "whatsapp", "office"]).default("web"),
        whatsappNumber: z.string().optional(),
        ward: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const triage = classifyComplaint(`${input.subject} ${input.description}`);
      const category = input.category ?? triage.category;
      const referenceNumber = generateRefNumber();

      if (isDemoMode) {
        const id = Math.max(...demoLiveGrievances.map((item) => item.id), 0) + 1;
        const citizen = demoCitizens.find((item) => item.id === input.citizenId) ?? demoCitizens[0];
        const item: DemoGrievance = {
          id,
          citizenId: citizen.id,
          category,
          subject: input.subject,
          description: input.description,
          attachment: input.attachment ?? null,
          status: "submitted",
          referenceNumber,
          source: input.source,
          whatsappNumber: input.whatsappNumber ?? null,
          ward: input.ward ?? citizen.ward,
          priority: triage.priority,
          aiSummary: summarize(input.description),
          aiCategory: triage.aiCategory,
          slaDueAt: triage.slaDueAt,
          latestUpdate: "Complaint received and triaged automatically.",
          assignedTo: null,
          resolution: null,
          createdAt: new Date(),
          resolvedAt: null,
        };
        demoLiveGrievances = [item, ...demoLiveGrievances];
        return item;
      }

      const db = getDb();
      const result = await db.insert(grievances).values({
        citizenId: input.citizenId,
        category,
        subject: input.subject,
        description: input.description,
        referenceNumber,
        attachment: input.attachment ?? null,
        status: "submitted",
        source: input.source,
        whatsappNumber: input.whatsappNumber ?? null,
        ward: input.ward ?? null,
        priority: triage.priority,
        aiSummary: summarize(input.description),
        aiCategory: triage.aiCategory,
        slaDueAt: triage.slaDueAt,
        latestUpdate: "Complaint received and triaged automatically.",
        assignedTo: null,
        resolution: null,
        resolvedAt: null,
      } as typeof grievances.$inferInsert);
      const id = Number(result[0].insertId);
      return { id, referenceNumber, category, priority: triage.priority, ...input };
    }),

  createWhatsApp: publicQuery
    .input(
      z.object({
        whatsappNumber: z.string().min(8),
        message: z.string().min(8),
        citizenName: z.string().optional(),
        ward: z.string().optional(),
        attachment: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const subject = summarize(input.message).replace(/\.$/, "");
      const triage = classifyComplaint(input.message);
      const referenceNumber = generateRefNumber();
      const normalizedPhone = input.whatsappNumber.replace(/\D/g, "");
      const localPhone = normalizedPhone.length > 10 ? normalizedPhone.slice(-10) : normalizedPhone;

      if (isDemoMode) {
        const citizen = demoCitizens.find((item) => (
          item.phone === input.whatsappNumber || item.phone === normalizedPhone || item.phone === localPhone
        )) ?? demoCitizens[7] ?? demoCitizens[0];
        const id = Math.max(...demoLiveGrievances.map((item) => item.id), 0) + 1;
        const item: DemoGrievance = {
          id,
          citizenId: citizen.id,
          category: triage.category,
          subject,
          description: input.message,
          attachment: input.attachment ?? null,
          status: "submitted",
          referenceNumber,
          source: "whatsapp",
          whatsappNumber: input.whatsappNumber,
          ward: input.ward ?? citizen.ward,
          priority: triage.priority,
          aiSummary: summarize(input.message),
          aiCategory: triage.aiCategory,
          slaDueAt: triage.slaDueAt,
          latestUpdate: "WhatsApp message acknowledged. Reference number sent to citizen.",
          assignedTo: null,
          resolution: null,
          createdAt: new Date(),
          resolvedAt: null,
        };
        demoLiveGrievances = [item, ...demoLiveGrievances];
        return {
          ...item,
          reply: `Namaste ${input.citizenName ?? citizen.fullName}. Your complaint is registered as ${referenceNumber}. Category: ${triage.aiCategory}. Priority: ${triage.priority}.`,
        };
      }

      const db = getDb();
      let citizen = await db.query.citizens.findFirst({
        where: or(
          eq(citizensTable.phone, input.whatsappNumber),
          eq(citizensTable.phone, normalizedPhone),
          eq(citizensTable.phone, localPhone),
        ),
      });

      if (!citizen) {
        const citizenResult = await db.insert(citizensTable).values({
          fullName: input.citizenName?.trim() || `WhatsApp Citizen ${localPhone}`,
          dob: new Date("1970-01-01"),
          gender: "other",
          category: "General",
          phone: localPhone,
          address: "Submitted via WhatsApp. Address verification pending.",
          ward: input.ward?.trim() || "Unassigned",
          occupation: "Verification pending",
          education: "Verification pending",
        } as typeof citizensTable.$inferInsert);

        const citizenId = Number(citizenResult[0].insertId);
        citizen = await db.query.citizens.findFirst({
          where: eq(citizensTable.id, citizenId),
        });

        if (!citizen) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Could not create a citizen intake record for this WhatsApp complaint.",
          });
        }
      }

      const result = await db.insert(grievances).values({
        citizenId: citizen.id,
        category: triage.category,
        subject,
        description: input.message,
        referenceNumber,
        attachment: input.attachment ?? null,
        status: "submitted",
        source: "whatsapp",
        whatsappNumber: input.whatsappNumber,
        ward: input.ward ?? citizen.ward,
        priority: triage.priority,
        aiSummary: summarize(input.message),
        aiCategory: triage.aiCategory,
        slaDueAt: triage.slaDueAt,
        latestUpdate: "WhatsApp message acknowledged. Reference number sent to citizen.",
        assignedTo: null,
        resolution: null,
        resolvedAt: null,
      } as typeof grievances.$inferInsert);
      return {
        id: Number(result[0].insertId),
        referenceNumber,
        category: triage.category,
        priority: triage.priority,
        reply: `Your complaint is registered as ${referenceNumber}. Category: ${triage.aiCategory}. Priority: ${triage.priority}.`,
      };
    }),

  list: citizenQuery
    .input(
      z.object({
        citizenId: z.number().optional(),
        status: z.string().optional(),
        category: z.string().optional(),
        source: z.string().optional(),
        priority: z.string().optional(),
        search: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(10),
      }).optional()
    )
    .query(async ({ input }) => {
      const params = input ?? { page: 1, limit: 10 };
      if (isDemoMode) {
        return paginate(applyFilters(getDemoList(), params), params);
      }

      const db = getDb();
      const offset = (params.page - 1) * params.limit;

      const conditions = [];
      if (params.citizenId) conditions.push(eq(grievances.citizenId, params.citizenId));
      if (params.status) conditions.push(eq(grievances.status, params.status as GrievanceStatus));
      if (params.category) conditions.push(eq(grievances.category, params.category as GrievanceCategory));
      if (params.source) conditions.push(eq(grievances.source, params.source as GrievanceSource));
      if (params.priority) conditions.push(eq(grievances.priority, params.priority as GrievancePriority));
      if (params.search) conditions.push(like(grievances.subject, `%${params.search}%`));

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

  getByRef: publicQuery
    .input(z.object({ referenceNumber: z.string() }))
    .query(async ({ input }) => {
      if (isDemoMode) {
        return getDemoList().find((item) => item.referenceNumber.toLowerCase() === input.referenceNumber.toLowerCase()) ?? null;
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
        latestUpdate: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (isDemoMode) {
        demoLiveGrievances = demoLiveGrievances.map((item) => item.id === input.id
          ? {
              ...item,
              status: input.status,
              assignedTo: input.assignedTo ?? (input.status === "assigned" ? demoUsers.secretary.id : item.assignedTo),
              resolution: input.resolution ?? item.resolution,
              latestUpdate: input.latestUpdate ?? `Status updated to ${input.status.replace("_", " ")}.`,
              resolvedAt: input.status === "resolved" ? new Date() : item.resolvedAt,
            }
          : item);
        return demoLiveGrievances.find((item) => item.id === input.id) ?? null;
      }

      const db = getDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      updateData.status = data.status;
      updateData.latestUpdate = data.latestUpdate ?? `Status updated by ${ctx.user.name ?? "officer"}.`;
      if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo;
      if (data.status === "assigned" && data.assignedTo === undefined) {
        const secretary = await db.query.users.findFirst({ where: eq(users.role, "secretary") });
        if (secretary) updateData.assignedTo = secretary.id;
      }
      if (data.resolution !== undefined) updateData.resolution = data.resolution;
      if (data.status === "resolved") updateData.resolvedAt = new Date();

      await db.update(grievances).set(updateData as typeof grievances.$inferInsert).where(eq(grievances.id, id));
      return { id, ...updateData };
    }),

  exportCsv: secretaryQuery
    .input(
      z.object({
        status: z.string().optional(),
        category: z.string().optional(),
        source: z.string().optional(),
        priority: z.string().optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const params = input ?? {};
      if (isDemoMode) {
        return toCsv(applyFilters(getDemoList(), params) as unknown as Array<Record<string, unknown>>);
      }

      const db = getDb();
      const conditions = [];
      if (params.status) conditions.push(eq(grievances.status, params.status as GrievanceStatus));
      if (params.category) conditions.push(eq(grievances.category, params.category as GrievanceCategory));
      if (params.source) conditions.push(eq(grievances.source, params.source as GrievanceSource));
      if (params.priority) conditions.push(eq(grievances.priority, params.priority as GrievancePriority));
      if (params.search) conditions.push(like(grievances.subject, `%${params.search}%`));
      const items = await db.query.grievances.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        with: { citizen: true, assignee: true },
        orderBy: [desc(grievances.createdAt)],
      });
      return toCsv(items as unknown as Array<Record<string, unknown>>);
    }),
});
