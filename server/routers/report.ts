import { eq, count, sum } from "drizzle-orm";
import { createRouter, citizenQuery, monitorQuery } from "../middleware";
import { getDb } from "../queries/connection";
import {
  citizens,
  welfareSchemes,
  schemeEnrollments,
  propertyTax,
  grievances,
  meetings,
} from "@db/schema";
import { citizens as demoCitizens, grievances as demoGrievances, isDemoMode, propertyTaxes, schemes as demoSchemes, enrollments } from "../demo-data";

export const reportRouter = createRouter({
  getDashboardStats: citizenQuery.query(async () => {
    if (isDemoMode) {
      return {
        totalCitizens: demoCitizens.length,
        activeSchemes: demoSchemes.filter((scheme) => scheme.status === "active").length,
        activeEnrollments: enrollments.filter((item) => item.status === "active").length,
        totalRevenue: 12650000 + propertyTaxes.filter((tax) => tax.status === "paid").reduce((sum, tax) => sum + parseFloat(tax.taxAmount), 0),
        grievancesResolved: demoGrievances.filter((item) => item.status === "resolved").length,
        totalGrievances: demoGrievances.length,
        upcomingMeetings: 2,
      };
    }

    const db = getDb();

    const [
      citizenCount,
      schemeCount,
      enrollmentCount,
      grievanceStats,
      meetingCount,
    ] = await Promise.all([
      db.select({ count: count() }).from(citizens),
      db.select({ count: count() }).from(welfareSchemes).where(eq(welfareSchemes.status, "active")),
      db.select({ count: count() }).from(schemeEnrollments).where(eq(schemeEnrollments.status, "active")),
      db
        .select({
          resolved: count(),
          total: count(),
        })
        .from(grievances),
      db.select({ count: count() }).from(meetings).where(eq(meetings.status, "scheduled")),
    ]);

    const revenueResult = await db
      .select({ total: sum(propertyTax.taxAmount) })
      .from(propertyTax)
      .where(eq(propertyTax.status, "paid"));

    return {
      totalCitizens: citizenCount[0]?.count ?? 0,
      activeSchemes: schemeCount[0]?.count ?? 0,
      activeEnrollments: enrollmentCount[0]?.count ?? 0,
      totalRevenue: parseFloat(revenueResult[0]?.total ?? "0"),
      grievancesResolved: 0,
      totalGrievances: grievanceStats[0]?.total ?? 0,
      upcomingMeetings: meetingCount[0]?.count ?? 0,
    };
  }),

  getDemographics: monitorQuery.query(async () => {
    if (isDemoMode) {
      const ageGroups: Record<string, number> = { "0-18": 0, "19-35": 0, "36-50": 0, "51-60": 0, "60+": 0 };
      const gender: Record<string, number> = { male: 0, female: 0, other: 0 };
      const category: Record<string, number> = { SC: 0, ST: 0, OBC: 0, General: 0 };
      const wardDistribution: Record<string, number> = {};
      const now = new Date();
      for (const citizen of demoCitizens) {
        const age = now.getFullYear() - new Date(citizen.dob).getFullYear();
        if (age <= 18) ageGroups["0-18"]++;
        else if (age <= 35) ageGroups["19-35"]++;
        else if (age <= 50) ageGroups["36-50"]++;
        else if (age <= 60) ageGroups["51-60"]++;
        else ageGroups["60+"]++;
        gender[citizen.gender] = (gender[citizen.gender] ?? 0) + 1;
        category[citizen.category] = (category[citizen.category] ?? 0) + 1;
        wardDistribution[citizen.ward] = (wardDistribution[citizen.ward] ?? 0) + 1;
      }
      return { ageGroups, gender, category, wardDistribution };
    }

    const db = getDb();

    const allCitizens = await db.select().from(citizens);

    // Age groups
    const ageGroups: Record<string, number> = {
      "0-18": 0,
      "19-35": 0,
      "36-50": 0,
      "51-60": 0,
      "60+": 0,
    };

    const gender: Record<string, number> = { male: 0, female: 0, other: 0 };
    const category: Record<string, number> = { SC: 0, ST: 0, OBC: 0, General: 0 };
    const wardDistribution: Record<string, number> = {};

    const now = new Date();
    for (const c of allCitizens) {
      // Age
      if (c.dob) {
        const age = now.getFullYear() - new Date(c.dob).getFullYear();
        if (age <= 18) ageGroups["0-18"]++;
        else if (age <= 35) ageGroups["19-35"]++;
        else if (age <= 50) ageGroups["36-50"]++;
        else if (age <= 60) ageGroups["51-60"]++;
        else ageGroups["60+"]++;
      }

      // Gender
      if (c.gender) gender[c.gender] = (gender[c.gender] ?? 0) + 1;

      // Category
      if (c.category) category[c.category] = (category[c.category] ?? 0) + 1;

      // Ward
      if (c.ward) wardDistribution[c.ward] = (wardDistribution[c.ward] ?? 0) + 1;
    }

    return { ageGroups, gender, category, wardDistribution };
  }),

  getSchemeUtilization: monitorQuery.query(async () => {
    if (isDemoMode) {
      return demoSchemes.map((scheme) => {
        const budget = parseFloat(scheme.budget);
        const utilized = parseFloat(scheme.utilizedBudget);
        return {
          id: scheme.id,
          name: scheme.name,
          budget,
          utilized,
          percentage: budget > 0 ? Math.round((utilized / budget) * 100) : 0,
          beneficiaries: enrollments.filter((item) => item.schemeId === scheme.id).length,
          category: scheme.category,
        };
      });
    }

    const db = getDb();

    const schemes = await db.query.welfareSchemes.findMany({
      with: { enrollments: true },
    });

    return schemes.map((scheme) => {
      const budget = parseFloat(scheme.budget);
      const utilized = parseFloat(scheme.utilizedBudget ?? "0");
      return {
        id: scheme.id,
        name: scheme.name,
        budget,
        utilized,
        percentage: budget > 0 ? Math.round((utilized / budget) * 100) : 0,
        beneficiaries: scheme.enrollments?.length ?? 0,
        category: scheme.category,
      };
    });
  }),

  getTaxCollectionTrend: monitorQuery.query(async () => {
    if (isDemoMode) {
      const monthly = Array.from({ length: 12 }, (_, i) => ({
        month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
        collected: 0,
        target: 50000,
      }));
      for (const tax of propertyTaxes) {
        if (tax.status === "paid" && tax.paidDate) {
          monthly[new Date(tax.paidDate).getMonth()].collected += parseFloat(tax.taxAmount);
        }
      }
      monthly[3].collected += 2500000;
      monthly[4].collected += 3500000;
      monthly[5].collected += 2800000;
      monthly[6].collected += 3850000;
      return monthly;
    }

    const db = getDb();
    const taxes = await db.select().from(propertyTax).where(eq(propertyTax.status, "paid"));

    const monthly = Array.from({ length: 12 }, (_, i) => ({
      month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
      collected: 0,
      target: 50000,
    }));

    for (const tax of taxes) {
      if (tax.paidDate) {
        const month = new Date(tax.paidDate).getMonth();
        monthly[month].collected += parseFloat(tax.taxAmount);
      }
    }

    return monthly;
  }),
});
