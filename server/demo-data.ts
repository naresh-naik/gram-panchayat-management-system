import type { User } from "@db/schema";

type PageInput = {
  page?: number;
  limit?: number;
};

export const isDemoMode = process.env.DEMO_MODE === "true" || (process.env.NODE_ENV !== "production" && !process.env.DATABASE_URL);

export const demoUsers: Record<string, User> = {
  admin: {
    id: 1,
    unionId: "local-admin",
    name: "Ramesh Kumar",
    email: "admin@grampanchayat.gov.in",
    passwordHash: null,
    avatar: null,
    role: "admin",
    status: "active",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-06-01"),
    lastSignInAt: new Date("2026-06-22"),
  },
  secretary: {
    id: 2,
    unionId: "local-secretary",
    name: "Sunita Devi",
    email: "secretary@grampanchayat.gov.in",
    passwordHash: null,
    avatar: null,
    role: "secretary",
    status: "active",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-06-01"),
    lastSignInAt: new Date("2026-06-22"),
  },
  monitor: {
    id: 3,
    unionId: "local-monitor",
    name: "Mohan Singh",
    email: "monitor@gov.in",
    passwordHash: null,
    avatar: null,
    role: "monitor",
    status: "active",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-06-01"),
    lastSignInAt: new Date("2026-06-22"),
  },
  citizen: {
    id: 4,
    unionId: "local-citizen",
    name: "Anita Sharma",
    email: "citizen@example.in",
    passwordHash: null,
    avatar: null,
    role: "citizen",
    status: "active",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-06-01"),
    lastSignInAt: new Date("2026-06-22"),
  },
};

export const households = [
  { id: 1, headName: "Ram Prasad Yadav", address: "House No. 12, Ward 1, Near Primary School", ward: "Ward 1", members: 5, incomeCategory: "BPL", rationCardType: "yellow", rationCardNumber: "WB-1234567890", houseType: "pucca", phone: "9876543210", createdAt: new Date("2025-01-10") },
  { id: 2, headName: "Lakshmi Devi", address: "House No. 34, Ward 2, Main Road", ward: "Ward 2", members: 3, incomeCategory: "APL", rationCardType: "white", rationCardNumber: "WB-0987654321", houseType: "semi_pucca", phone: "8765432109", createdAt: new Date("2025-01-12") },
  { id: 3, headName: "Shyam Lal Gupta", address: "House No. 8, Ward 3, Market Lane", ward: "Ward 3", members: 6, incomeCategory: "BPL", rationCardType: "orange", rationCardNumber: "WB-1122334455", houseType: "pucca", phone: "7654321098", createdAt: new Date("2025-01-18") },
  { id: 4, headName: "Farida Begum", address: "House No. 56, Ward 4, Mosque Street", ward: "Ward 4", members: 4, incomeCategory: "APL", rationCardType: "white", rationCardNumber: "WB-6677889900", houseType: "pucca", phone: "9090909090", createdAt: new Date("2025-02-02") },
  { id: 5, headName: "Biren Murmu", address: "House No. 19, Ward 5, Adivasi Para", ward: "Ward 5", members: 7, incomeCategory: "antyodaya", rationCardType: "yellow", rationCardNumber: "WB-5544332211", houseType: "kutcha", phone: "8989898989", createdAt: new Date("2025-02-11") },
] as const;

export const citizens = [
  { id: 1, fullName: "Ram Prasad Yadav", fatherName: "Mohan Yadav", motherName: "Kamla Devi", dob: new Date("1975-05-15"), gender: "male", category: "OBC", aadhaar: "123456789012", phone: "9876543210", email: "ram.yadav@example.in", address: "House No. 12, Ward 1", ward: "Ward 1", householdId: 1, occupation: "Farmer", education: "Secondary", maritalStatus: "married", createdAt: new Date("2025-02-01"), updatedAt: new Date("2025-02-01") },
  { id: 2, fullName: "Sita Devi", fatherName: "Hari Prasad", motherName: "Ganga Devi", dob: new Date("1978-08-20"), gender: "female", category: "OBC", aadhaar: "123456789013", phone: "9876543211", email: null, address: "House No. 12, Ward 1", ward: "Ward 1", householdId: 1, occupation: "Self Help Group Member", education: "Primary", maritalStatus: "married", createdAt: new Date("2025-02-02"), updatedAt: new Date("2025-02-02") },
  { id: 3, fullName: "Mohan Kumar", fatherName: "Ram Prasad", motherName: "Sita Devi", dob: new Date("1995-03-10"), gender: "male", category: "OBC", aadhaar: "123456789014", phone: "9876543212", email: "mohan.kumar@example.in", address: "House No. 12, Ward 1", ward: "Ward 1", householdId: 1, occupation: "Teacher", education: "Graduate", maritalStatus: "single", createdAt: new Date("2025-02-04"), updatedAt: new Date("2025-02-04") },
  { id: 4, fullName: "Lakshmi Sharma", fatherName: "Hari Sharma", motherName: "Meena Sharma", dob: new Date("1980-12-01"), gender: "female", category: "General", aadhaar: "223456789012", phone: "8765432109", email: "lakshmi.sharma@example.in", address: "House No. 34, Ward 2", ward: "Ward 2", householdId: 2, occupation: "Shopkeeper", education: "Higher Secondary", maritalStatus: "married", createdAt: new Date("2025-02-06"), updatedAt: new Date("2025-02-06") },
  { id: 5, fullName: "Shyam Lal Gupta", fatherName: "Ramesh Gupta", motherName: "Savita Gupta", dob: new Date("1965-07-25"), gender: "male", category: "SC", aadhaar: "323456789012", phone: "7654321098", email: null, address: "House No. 8, Ward 3", ward: "Ward 3", householdId: 3, occupation: "Mason", education: "Primary", maritalStatus: "married", createdAt: new Date("2025-02-08"), updatedAt: new Date("2025-02-08") },
  { id: 6, fullName: "Farida Begum", fatherName: "Abdul Rahman", motherName: "Noor Jahan", dob: new Date("1988-11-12"), gender: "female", category: "General", aadhaar: "423456789012", phone: "9090909090", email: "farida.begum@example.in", address: "House No. 56, Ward 4", ward: "Ward 4", householdId: 4, occupation: "Anganwadi Worker", education: "Graduate", maritalStatus: "married", createdAt: new Date("2025-02-10"), updatedAt: new Date("2025-02-10") },
  { id: 7, fullName: "Biren Murmu", fatherName: "Lal Murmu", motherName: "Asha Murmu", dob: new Date("1970-01-05"), gender: "male", category: "ST", aadhaar: "523456789012", phone: "8989898989", email: null, address: "House No. 19, Ward 5", ward: "Ward 5", householdId: 5, occupation: "Agricultural Laborer", education: "Primary", maritalStatus: "married", createdAt: new Date("2025-02-12"), updatedAt: new Date("2025-02-12") },
  { id: 8, fullName: "Anita Sharma", fatherName: "Vijay Sharma", motherName: "Lakshmi Sharma", dob: new Date("2007-09-19"), gender: "female", category: "General", aadhaar: "623456789012", phone: "7878787878", email: "anita.sharma@example.in", address: "House No. 34, Ward 2", ward: "Ward 2", householdId: 2, occupation: "Student", education: "Higher Secondary", maritalStatus: "single", createdAt: new Date("2025-02-14"), updatedAt: new Date("2025-02-14") },
] as const;

export const schemes = [
  { id: 1, name: "Pradhan Mantri Awas Yojana", category: "housing", description: "Financial support for eligible rural families to construct pucca houses with basic facilities.", budget: "5000000", utilizedBudget: "3200000", startDate: new Date("2025-04-01"), endDate: new Date("2026-03-31"), status: "active", eligibility: "BPL families and households without pucca housing", applicationProcess: "Submit Aadhaar, bank passbook, and land record at the Panchayat office", image: null, createdAt: new Date("2025-03-01") },
  { id: 2, name: "Ayushman Bharat Health Cover", category: "health", description: "Health insurance assistance for vulnerable households and senior citizens.", budget: "2000000", utilizedBudget: "1200000", startDate: new Date("2025-04-01"), endDate: new Date("2026-03-31"), status: "active", eligibility: "Eligible families listed in the health entitlement register", applicationProcess: "Verification through health camp or Panchayat help desk", image: null, createdAt: new Date("2025-03-05") },
  { id: 3, name: "PM Kisan Samman Nidhi", category: "agriculture", description: "Income support for small and marginal farmer households.", budget: "3000000", utilizedBudget: "2350000", startDate: new Date("2025-01-01"), endDate: new Date("2025-12-31"), status: "active", eligibility: "Small and marginal farmers with valid land records", applicationProcess: "Apply with land record, Aadhaar, and bank details", image: null, createdAt: new Date("2025-03-06") },
  { id: 4, name: "Swachh Bharat Mission Gramin", category: "sanitation", description: "Support for toilet construction, drainage cleanliness, and solid waste management.", budget: "2500000", utilizedBudget: "1800000", startDate: new Date("2025-04-01"), endDate: new Date("2026-03-31"), status: "active", eligibility: "Households without toilets and community sanitation groups", applicationProcess: "Apply through ward member with household verification", image: null, createdAt: new Date("2025-03-10") },
  { id: 5, name: "Senior Citizen Pension", category: "pension", description: "Monthly pension assistance for eligible elderly residents.", budget: "1800000", utilizedBudget: "960000", startDate: new Date("2025-04-01"), endDate: new Date("2026-03-31"), status: "active", eligibility: "Residents above 60 years meeting income criteria", applicationProcess: "Submit age proof, income certificate, and bank details", image: null, createdAt: new Date("2025-03-12") },
] as const;

export const enrollments = [
  { id: 1, schemeId: 1, citizenId: 1, enrollmentDate: new Date("2025-04-12"), status: "active", amountReceived: "120000", notes: "First installment released", createdAt: new Date("2025-04-12") },
  { id: 2, schemeId: 2, citizenId: 5, enrollmentDate: new Date("2025-04-18"), status: "active", amountReceived: "0", notes: "Health card issued", createdAt: new Date("2025-04-18") },
  { id: 3, schemeId: 3, citizenId: 7, enrollmentDate: new Date("2025-05-03"), status: "active", amountReceived: "6000", notes: "Annual benefit cycle active", createdAt: new Date("2025-05-03") },
  { id: 4, schemeId: 4, citizenId: 2, enrollmentDate: new Date("2025-05-09"), status: "active", amountReceived: "12000", notes: "Toilet construction verified", createdAt: new Date("2025-05-09") },
] as const;

export const propertyTaxes = [
  { id: 1, citizenId: 1, propertyId: "PROP-0001", propertyType: "residential", area: "1200", assessedValue: "500000", taxAmount: "5000", dueDate: new Date("2026-03-31"), paidDate: new Date("2026-01-15"), status: "paid", paymentMethod: "online", createdAt: new Date("2026-01-10") },
  { id: 2, citizenId: 4, propertyId: "PROP-0002", propertyType: "commercial", area: "850", assessedValue: "900000", taxAmount: "12000", dueDate: new Date("2026-03-31"), paidDate: new Date("2026-02-02"), status: "paid", paymentMethod: "cheque", createdAt: new Date("2026-01-12") },
  { id: 3, citizenId: 5, propertyId: "PROP-0003", propertyType: "residential", area: "700", assessedValue: "350000", taxAmount: "3500", dueDate: new Date("2026-03-31"), paidDate: null, status: "pending", paymentMethod: null, createdAt: new Date("2026-01-14") },
  { id: 4, citizenId: 6, propertyId: "PROP-0004", propertyType: "residential", area: "950", assessedValue: "420000", taxAmount: "4200", dueDate: new Date("2026-03-31"), paidDate: new Date("2026-03-08"), status: "paid", paymentMethod: "cash", createdAt: new Date("2026-01-18") },
  { id: 5, citizenId: 7, propertyId: "PROP-0005", propertyType: "agricultural", area: "5000", assessedValue: "800000", taxAmount: "3000", dueDate: new Date("2026-03-31"), paidDate: null, status: "overdue", paymentMethod: null, createdAt: new Date("2026-01-20") },
] as const;

export const meetings = [
  { id: 1, title: "Gram Sabha - Annual Budget Approval", type: "gram_sabha", date: new Date("2026-07-15"), time: "10:00:00", location: "Panchayat Bhawan, Main Hall", agenda: ["Annual budget review", "Road repair priorities", "Water supply schedule"], status: "scheduled", minutes: null, createdBy: 1, createdAt: new Date("2026-06-01") },
  { id: 2, title: "Executive Committee Meeting", type: "executive", date: new Date("2026-06-10"), time: "14:00:00", location: "Secretary Office", agenda: ["Pending applications", "Fund allocation", "Field verification updates"], status: "completed", minutes: "Reviewed 15 pending applications, approved 12 scheme enrollments, and allocated Rs. 2.5 lakhs for road repair work.", createdBy: 2, createdAt: new Date("2026-06-03") },
  { id: 3, title: "Special Sanitation Review", type: "special", date: new Date("2026-06-28"), time: "11:30:00", location: "Ward 4 Community Hall", agenda: ["Drainage cleaning", "Waste collection route", "Monsoon preparedness"], status: "scheduled", minutes: null, createdBy: 2, createdAt: new Date("2026-06-12") },
] as const;

export const attendance = [
  { id: 1, meetingId: 2, citizenId: 1, role: "sarpanch", present: true },
  { id: 2, meetingId: 2, citizenId: 2, role: "member", present: true },
  { id: 3, meetingId: 2, citizenId: 4, role: "member", present: true },
  { id: 4, meetingId: 2, citizenId: 7, role: "guest", present: false },
] as const;

export const grievances = [
  { id: 1, citizenId: 1, category: "water", subject: "Water supply disrupted for 3 days", description: "Ward 2 has not received regular water supply due to pump motor failure.", attachment: null, status: "resolved", referenceNumber: "GRV-ABC123", source: "web", whatsappNumber: null, ward: "Ward 2", priority: "high", aiSummary: "Ward 2 water supply is disrupted due to pump motor failure.", aiCategory: "Water supply", slaDueAt: new Date("2026-06-15T10:00:00"), latestUpdate: "Pump motor repaired and supply restored.", assignedTo: 2, resolution: "Pump motor repaired and supply restored on 2026-06-18.", createdAt: new Date("2026-06-14"), resolvedAt: new Date("2026-06-18") },
  { id: 2, citizenId: 5, category: "roads", subject: "Potholes on main road need repair", description: "The road connecting Ward 3 to the highway has several dangerous potholes.", attachment: null, status: "assigned", referenceNumber: "GRV-DEF456", source: "office", whatsappNumber: null, ward: "Ward 3", priority: "medium", aiSummary: "Ward 3 highway connector has dangerous potholes.", aiCategory: "Road maintenance", slaDueAt: new Date("2026-06-19T11:00:00"), latestUpdate: "Assigned to Panchayat works supervisor for estimate.", assignedTo: 2, resolution: null, createdAt: new Date("2026-06-16"), resolvedAt: null },
  { id: 3, citizenId: 8, category: "electricity", subject: "Frequent power cuts near school", description: "Power cuts in Ward 2 are affecting evening study hours for students.", attachment: null, status: "under_review", referenceNumber: "GRV-GHI789", source: "whatsapp", whatsappNumber: "7878787878", ward: "Ward 2", priority: "medium", aiSummary: "Ward 2 school area has frequent power cuts during study hours.", aiCategory: "Electricity", slaDueAt: new Date("2026-06-20T17:00:00"), latestUpdate: "Electricity board contact details verified.", assignedTo: null, resolution: null, createdAt: new Date("2026-06-17"), resolvedAt: null },
  { id: 4, citizenId: 6, category: "sanitation", subject: "Drainage blockage near community hall", description: "Blocked drainage is causing stagnant water near Ward 4 community hall.", attachment: null, status: "submitted", referenceNumber: "GRV-JKL012", source: "whatsapp", whatsappNumber: "9090909090", ward: "Ward 4", priority: "critical", aiSummary: "Blocked drainage near Ward 4 community hall is causing stagnant water.", aiCategory: "Sanitation", slaDueAt: new Date("2026-06-19T20:00:00"), latestUpdate: "WhatsApp acknowledgement sent to citizen.", assignedTo: null, resolution: null, createdAt: new Date("2026-06-19"), resolvedAt: null },
] as const;

export const activities = [
  { id: 1, type: "citizen", description: "New citizen record created for Anita Sharma", userId: 2, metadata: null, createdAt: new Date("2026-06-22T09:30:00") },
  { id: 2, type: "scheme", description: "PM Kisan enrollment approved for Biren Murmu", userId: 2, metadata: null, createdAt: new Date("2026-06-22T08:20:00") },
  { id: 3, type: "finance", description: "Property tax payment recorded for PROP-0004", userId: 1, metadata: null, createdAt: new Date("2026-06-21T16:45:00") },
] as const;

export function paginate<T>(items: T[], params?: PageInput) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const total = items.length;
  const start = (page - 1) * limit;

  return {
    items: items.slice(start, start + limit),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export function withRelations() {
  const citizensWithHouseholds = citizens.map((citizen) => ({
    ...citizen,
    household: households.find((household) => household.id === citizen.householdId) ?? null,
  }));
  const schemesWithEnrollments = schemes.map((scheme) => ({
    ...scheme,
    enrollments: enrollments.filter((item) => item.schemeId === scheme.id),
  }));
  const taxesWithCitizens = propertyTaxes.map((tax) => ({
    ...tax,
    citizen: citizens.find((citizen) => citizen.id === tax.citizenId) ?? null,
  }));
  const meetingsWithAttendance = meetings.map((meeting) => ({
    ...meeting,
    attendance: attendance.filter((item) => item.meetingId === meeting.id),
  }));
  const grievancesWithPeople = grievances.map((grievance) => ({
    ...grievance,
    citizen: citizens.find((citizen) => citizen.id === grievance.citizenId) ?? null,
    assignee: grievance.assignedTo ? demoUsers.secretary : null,
  }));

  return {
    citizensWithHouseholds,
    schemesWithEnrollments,
    taxesWithCitizens,
    meetingsWithAttendance,
    grievancesWithPeople,
  };
}
