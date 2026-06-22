import { getDb } from "../api/queries/connection";
import {
  citizens, households, welfareSchemes,
  propertyTax, meetings, grievances,
} from "./schema";

const db = getDb();

async function seed() {
  console.log("Seeding database...");

  // Insert households in batch
  const hhData = [
    { headName: "Ram Prasad", address: "Ward 1", ward: "Ward 1", members: 5, incomeCategory: "BPL" as const, rationCardType: "yellow" as const, rationCardNumber: "WB-1234567890", houseType: "pucca" as const, phone: "9876543210" },
    { headName: "Lakshmi Devi", address: "Ward 2", ward: "Ward 2", members: 3, incomeCategory: "APL" as const, rationCardType: "white" as const, rationCardNumber: "WB-0987654321", houseType: "semi_pucca" as const, phone: "8765432109" },
    { headName: "Shyam Gupta", address: "Ward 3", ward: "Ward 3", members: 6, incomeCategory: "BPL" as const, rationCardType: "orange" as const, rationCardNumber: "WB-1122334455", houseType: "pucca" as const, phone: "7654321098" },
  ];

  for (const h of hhData) {
    await db.insert(households).values(h);
  }
  console.log("Households created");

  // Insert citizens
  const citizenData = [
    { fullName: "Ram Prasad Yadav", fatherName: "Mohan Yadav", dob: new Date("1975-05-15"), gender: "male" as const, category: "OBC" as const, aadhaar: "123456789012", phone: "9876543210", address: "Ward 1", ward: "Ward 1", householdId: 1, occupation: "Farmer", education: "Secondary" },
    { fullName: "Sita Devi", fatherName: "Ram Prasad", dob: new Date("1978-08-20"), gender: "female" as const, category: "OBC" as const, aadhaar: "123456789013", phone: "9876543211", address: "Ward 1", ward: "Ward 1", householdId: 1, occupation: "Housewife", education: "Primary" },
    { fullName: "Mohan Kumar", fatherName: "Ram Prasad", dob: new Date("1995-03-10"), gender: "male" as const, category: "OBC" as const, aadhaar: "123456789014", phone: "9876543212", address: "Ward 1", ward: "Ward 1", householdId: 1, occupation: "Teacher", education: "Graduate" },
    { fullName: "Lakshmi Sharma", fatherName: "Hari Sharma", dob: new Date("1980-12-01"), gender: "female" as const, category: "General" as const, aadhaar: "223456789012", phone: "8765432109", address: "Ward 2", ward: "Ward 2", householdId: 2, occupation: "Shopkeeper", education: "Higher Secondary" },
    { fullName: "Shyam Lal Gupta", fatherName: "Ramesh Gupta", dob: new Date("1965-07-25"), gender: "male" as const, category: "SC" as const, aadhaar: "323456789012", phone: "7654321098", address: "Ward 3", ward: "Ward 3", householdId: 3, occupation: "Laborer", education: "Primary" },
  ];

  for (const c of citizenData) {
    await db.insert(citizens).values(c);
  }
  console.log("Citizens created");

  // Insert welfare schemes
  const schemeData = [
    { name: "PM Awas Yojana", category: "housing" as const, description: "Financial assistance for pucca house construction", budget: "5000000", utilizedBudget: "3200000", startDate: new Date("2023-04-01"), status: "active" as const, eligibility: "Homeless families, BPL holders" },
    { name: "Ayushman Bharat", category: "health" as const, description: "Health insurance coverage up to Rs. 5 lakh", budget: "2000000", utilizedBudget: "1200000", startDate: new Date("2023-04-01"), status: "active" as const, eligibility: "BPL families" },
    { name: "PM Kisan Samman", category: "agriculture" as const, description: "Rs. 6000/year income support to farmers", budget: "3000000", utilizedBudget: "2800000", startDate: new Date("2023-01-01"), status: "active" as const, eligibility: "Small and marginal farmers" },
    { name: "MGNREGA", category: "others" as const, description: "100 days guaranteed wage employment", budget: "8000000", utilizedBudget: "6500000", startDate: new Date("2023-04-01"), status: "active" as const, eligibility: "All adult rural residents" },
    { name: "Swachh Bharat", category: "sanitation" as const, description: "Toilet construction for ODF villages", budget: "2500000", utilizedBudget: "2200000", startDate: new Date("2023-04-01"), status: "active" as const, eligibility: "Households without toilet" },
  ];

  for (const s of schemeData) {
    await db.insert(welfareSchemes).values(s);
  }
  console.log("Schemes created");

  // Insert tax records
  const taxData = [
    { citizenId: 1, propertyId: "PROP-0001", propertyType: "residential" as const, area: "1200", assessedValue: "500000", taxAmount: "5000", dueDate: new Date("2025-03-31"), status: "paid" as const, paidDate: new Date("2025-03-15"), paymentMethod: "online" as const },
    { citizenId: 2, propertyId: "PROP-0002", propertyType: "residential" as const, area: "800", assessedValue: "350000", taxAmount: "3500", dueDate: new Date("2025-03-31"), status: "pending" as const },
    { citizenId: 3, propertyId: "PROP-0003", propertyType: "commercial" as const, area: "2000", assessedValue: "1200000", taxAmount: "12000", dueDate: new Date("2025-03-31"), status: "overdue" as const },
    { citizenId: 4, propertyId: "PROP-0004", propertyType: "residential" as const, area: "600", assessedValue: "250000", taxAmount: "2500", dueDate: new Date("2025-06-30"), status: "pending" as const },
    { citizenId: 5, propertyId: "PROP-0005", propertyType: "agricultural" as const, area: "5000", assessedValue: "800000", taxAmount: "3000", dueDate: new Date("2025-06-30"), status: "paid" as const, paidDate: new Date("2025-05-01"), paymentMethod: "cash" as const },
  ];

  for (const t of taxData) {
    await db.insert(propertyTax).values(t);
  }
  console.log("Tax records created");

  // Insert meetings
  const meetingData = [
    { title: "Gram Sabha - Annual Budget", type: "gram_sabha" as const, date: new Date("2025-04-15"), time: "10:00:00" as unknown as string, location: "Panchayat Bhawan", agenda: ["Budget Review", "New Projects"], status: "scheduled" as const, minutes: null },
    { title: "Executive Meeting - March", type: "executive" as const, date: new Date("2025-03-10"), time: "14:00:00" as unknown as string, location: "Secretary Office", agenda: ["Pending Applications", "Fund Allocation"], status: "completed" as const, minutes: "Reviewed 15 applications. Approved 12 scheme enrollments." },
  ];

  for (const m of meetingData) {
    await db.insert(meetings).values(m as typeof meetings.$inferInsert);
  }
  console.log("Meetings created");

  // Insert grievances
  const grievanceData = [
    { citizenId: 1, category: "water" as const, subject: "Water supply disrupted", description: "No water supply in Ward 2 for 3 days", status: "resolved" as const, referenceNumber: "GRV-ABC123", resolution: "Pump repaired on 2025-01-18", assignedTo: null },
    { citizenId: 3, category: "roads" as const, subject: "Potholes on main road", description: "Dangerous potholes on Ward 3 highway road", status: "assigned" as const, referenceNumber: "GRV-DEF456", resolution: null, assignedTo: null },
    { citizenId: 2, category: "electricity" as const, subject: "Frequent power cuts", description: "6-8 hours power cuts daily in Ward 4", status: "under_review" as const, referenceNumber: "GRV-GHI789", resolution: null, assignedTo: null },
  ];

  for (const g of grievanceData) {
    await db.insert(grievances).values(g as typeof grievances.$inferInsert);
  }
  console.log("Grievances created");

  console.log("Seed completed!");
}

seed().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
