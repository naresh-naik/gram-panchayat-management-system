import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  decimal,
  date,
  time,
  json,
  boolean,
} from "drizzle-orm/mysql-core";

// ─── Users ───
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  passwordHash: text("password_hash"),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["admin", "secretary", "citizen", "monitor"]).default("citizen").notNull(),
  status: mysqlEnum("status", ["pending", "active", "suspended"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Citizens ───
export const citizens = mysqlTable("citizens", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 100 }).notNull(),
  fatherName: varchar("father_name", { length: 100 }),
  motherName: varchar("mother_name", { length: 100 }),
  dob: date("dob").notNull(),
  gender: mysqlEnum("gender", ["male", "female", "other"]).notNull(),
  category: mysqlEnum("category", ["SC", "ST", "OBC", "General"]).notNull(),
  aadhaar: varchar("aadhaar", { length: 12 }).unique(),
  phone: varchar("phone", { length: 15 }),
  email: varchar("email", { length: 255 }),
  address: text("address").notNull(),
  ward: varchar("ward", { length: 50 }).notNull(),
  householdId: bigint("household_id", { mode: "number", unsigned: true }).references(() => households.id),
  occupation: varchar("occupation", { length: 100 }),
  education: varchar("education", { length: 100 }),
  maritalStatus: mysqlEnum("marital_status", ["single", "married", "widowed", "divorced"]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Citizen = typeof citizens.$inferSelect;
export type InsertCitizen = typeof citizens.$inferInsert;

// ─── Households ───
export const households = mysqlTable("households", {
  id: serial("id").primaryKey(),
  headName: varchar("head_name", { length: 100 }).notNull(),
  address: text("address").notNull(),
  ward: varchar("ward", { length: 50 }).notNull(),
  members: bigint("members", { mode: "number" }).notNull().default(1),
  incomeCategory: mysqlEnum("income_category", ["APL", "BPL", "antyodaya"]).notNull(),
  rationCardType: mysqlEnum("ration_card_type", ["yellow", "orange", "white", "none"]).notNull(),
  rationCardNumber: varchar("ration_card_number", { length: 20 }),
  houseType: mysqlEnum("house_type", ["pucca", "semi_pucca", "kutcha"]),
  phone: varchar("phone", { length: 15 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Household = typeof households.$inferSelect;
export type InsertHousehold = typeof households.$inferInsert;

// ─── Welfare Schemes ───
export const welfareSchemes = mysqlTable("welfare_schemes", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  category: mysqlEnum("category", ["education", "health", "agriculture", "housing", "pension", "sanitation", "others"]).notNull(),
  description: text("description").notNull(),
  budget: decimal("budget", { precision: 15, scale: 2 }).notNull(),
  utilizedBudget: decimal("utilized_budget", { precision: 15, scale: 2 }).notNull().default("0"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  status: mysqlEnum("status", ["active", "inactive", "completed"]).notNull().default("active"),
  eligibility: text("eligibility"),
  applicationProcess: text("application_process"),
  image: varchar("image", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type WelfareScheme = typeof welfareSchemes.$inferSelect;
export type InsertWelfareScheme = typeof welfareSchemes.$inferInsert;

// ─── Scheme Enrollments ───
export const schemeEnrollments = mysqlTable("scheme_enrollments", {
  id: serial("id").primaryKey(),
  schemeId: bigint("scheme_id", { mode: "number", unsigned: true }).notNull().references(() => welfareSchemes.id),
  citizenId: bigint("citizen_id", { mode: "number", unsigned: true }).notNull().references(() => citizens.id),
  enrollmentDate: date("enrollment_date").notNull(),
  status: mysqlEnum("status", ["active", "inactive", "rejected"]).notNull().default("active"),
  amountReceived: decimal("amount_received", { precision: 12, scale: 2 }).default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SchemeEnrollment = typeof schemeEnrollments.$inferSelect;
export type InsertSchemeEnrollment = typeof schemeEnrollments.$inferInsert;

// ─── Property Tax ───
export const propertyTax = mysqlTable("property_tax", {
  id: serial("id").primaryKey(),
  citizenId: bigint("citizen_id", { mode: "number", unsigned: true }).notNull().references(() => citizens.id),
  propertyId: varchar("property_id", { length: 50 }).notNull(),
  propertyType: mysqlEnum("property_type", ["residential", "commercial", "agricultural"]).notNull(),
  area: decimal("area", { precision: 10, scale: 2 }).notNull(),
  assessedValue: decimal("assessed_value", { precision: 15, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).notNull(),
  dueDate: date("due_date").notNull(),
  paidDate: date("paid_date"),
  status: mysqlEnum("status", ["pending", "paid", "overdue"]).notNull().default("pending"),
  paymentMethod: mysqlEnum("payment_method", ["cash", "online", "cheque"]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PropertyTax = typeof propertyTax.$inferSelect;
export type InsertPropertyTax = typeof propertyTax.$inferInsert;

// ─── Meetings ───
export const meetings = mysqlTable("meetings", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  type: mysqlEnum("type", ["gram_sabha", "executive", "special"]).notNull(),
  date: date("date").notNull(),
  time: time("time").notNull(),
  location: varchar("location", { length: 200 }).notNull(),
  agenda: json("agenda"),
  status: mysqlEnum("status", ["scheduled", "ongoing", "completed", "cancelled"]).notNull().default("scheduled"),
  minutes: text("minutes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }).references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Meeting = typeof meetings.$inferSelect;
export type InsertMeeting = typeof meetings.$inferInsert;

// ─── Meeting Attendance ───
export const meetingAttendance = mysqlTable("meeting_attendance", {
  id: serial("id").primaryKey(),
  meetingId: bigint("meeting_id", { mode: "number", unsigned: true }).notNull().references(() => meetings.id),
  citizenId: bigint("citizen_id", { mode: "number", unsigned: true }).notNull().references(() => citizens.id),
  role: mysqlEnum("role", ["member", "secretary", "sarpanch", "guest"]).notNull(),
  present: boolean("present").notNull().default(false),
});

export type MeetingAttendance = typeof meetingAttendance.$inferSelect;
export type InsertMeetingAttendance = typeof meetingAttendance.$inferInsert;

// ─── Grievances ───
export const grievances = mysqlTable("grievances", {
  id: serial("id").primaryKey(),
  citizenId: bigint("citizen_id", { mode: "number", unsigned: true }).notNull().references(() => citizens.id),
  category: mysqlEnum("category", ["water", "roads", "electricity", "sanitation", "land_dispute", "welfare", "others"]).notNull(),
  subject: varchar("subject", { length: 200 }).notNull(),
  description: text("description").notNull(),
  attachment: varchar("attachment", { length: 255 }),
  status: mysqlEnum("status", ["submitted", "under_review", "assigned", "resolved", "rejected"]).notNull().default("submitted"),
  referenceNumber: varchar("reference_number", { length: 20 }).notNull().unique(),
  assignedTo: bigint("assigned_to", { mode: "number", unsigned: true }).references(() => users.id),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

export type Grievance = typeof grievances.$inferSelect;
export type InsertGrievance = typeof grievances.$inferInsert;

// ─── Activities (Audit Log) ───
export const activities = mysqlTable("activities", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 50 }).notNull(),
  description: text("description").notNull(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).references(() => users.id),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;
