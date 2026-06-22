import { relations } from "drizzle-orm";
import {
  users,
  citizens,
  households,
  welfareSchemes,
  schemeEnrollments,
  propertyTax,
  meetings,
  meetingAttendance,
  grievances,
  activities,
} from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  activities: many(activities),
  meetings: many(meetings),
  grievancesAssigned: many(grievances),
}));

export const citizensRelations = relations(citizens, ({ one, many }) => ({
  household: one(households, {
    fields: [citizens.householdId],
    references: [households.id],
  }),
  schemeEnrollments: many(schemeEnrollments),
  propertyTaxes: many(propertyTax),
  meetingAttendance: many(meetingAttendance),
  grievances: many(grievances),
}));

export const householdsRelations = relations(households, ({ many }) => ({
  members: many(citizens),
}));

export const welfareSchemesRelations = relations(welfareSchemes, ({ many }) => ({
  enrollments: many(schemeEnrollments),
}));

export const schemeEnrollmentsRelations = relations(schemeEnrollments, ({ one }) => ({
  scheme: one(welfareSchemes, {
    fields: [schemeEnrollments.schemeId],
    references: [welfareSchemes.id],
  }),
  citizen: one(citizens, {
    fields: [schemeEnrollments.citizenId],
    references: [citizens.id],
  }),
}));

export const propertyTaxRelations = relations(propertyTax, ({ one }) => ({
  citizen: one(citizens, {
    fields: [propertyTax.citizenId],
    references: [citizens.id],
  }),
}));

export const meetingsRelations = relations(meetings, ({ one, many }) => ({
  creator: one(users, {
    fields: [meetings.createdBy],
    references: [users.id],
  }),
  attendance: many(meetingAttendance),
}));

export const meetingAttendanceRelations = relations(meetingAttendance, ({ one }) => ({
  meeting: one(meetings, {
    fields: [meetingAttendance.meetingId],
    references: [meetings.id],
  }),
  citizen: one(citizens, {
    fields: [meetingAttendance.citizenId],
    references: [citizens.id],
  }),
}));

export const grievancesRelations = relations(grievances, ({ one }) => ({
  citizen: one(citizens, {
    fields: [grievances.citizenId],
    references: [citizens.id],
  }),
  assignee: one(users, {
    fields: [grievances.assignedTo],
    references: [users.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));
