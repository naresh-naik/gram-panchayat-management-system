import { getDb } from "../api/queries/connection";
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
} from "./schema";

const db = getDb();

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seed() {
  console.log("Seeding database...");

  // ─── Users ───
  console.log("Creating users...");
  await db.insert(users).values([
    { name: "Ramesh Kumar", email: "admin@grampanchayat.gov.in", role: "admin" as const, unionId: "seed_admin_1", avatar: null, lastSignInAt: new Date() },
    { name: "Sunita Devi", email: "secretary@grampanchayat.gov.in", role: "secretary" as const, unionId: "seed_sec_1", avatar: null, lastSignInAt: new Date() },
    { name: "Mohan Singh", email: "monitor@gov.in", role: "monitor" as const, unionId: "seed_mon_1", avatar: null, lastSignInAt: new Date() },
  ]);

  // ─── Households ───
  console.log("Creating households...");
  const householdData = [
    { headName: "Ram Prasad Yadav", address: "House No. 12, Ward 1, Near Shiv Mandir", ward: "Ward 1", members: 5n, incomeCategory: "BPL" as const, rationCardType: "yellow" as const, rationCardNumber: "WB-1234567890", houseType: "pucca" as const, phone: "9876543210" },
    { headName: "Lakshmi Devi", address: "House No. 34, Ward 2, Main Road", ward: "Ward 2", members: 3n, incomeCategory: "APL" as const, rationCardType: "white" as const, rationCardNumber: "WB-0987654321", houseType: "semi_pucca" as const, phone: "8765432109" },
    { headName: "Shyam Lal Gupta", address: "House No. 56, Ward 3, School Lane", ward: "Ward 3", members: 6n, incomeCategory: "BPL" as const, rationCardType: "orange" as const, rationCardNumber: "WB-1122334455", houseType: "pucca" as const, phone: "7654321098" },
    { headName: "Kamala Devi", address: "House No. 78, Ward 4, Bazar Gali", ward: "Ward 4", members: 4n, incomeCategory: "antyodaya" as const, rationCardType: "yellow" as const, rationCardNumber: "WB-2233445566", houseType: "kutcha" as const, phone: "6543210987" },
    { headName: "Hari Om Mishra", address: "House No. 90, Ward 5, Post Office Road", ward: "Ward 5", members: 7n, incomeCategory: "APL" as const, rationCardType: "white" as const, rationCardNumber: "WB-3344556677", houseType: "pucca" as const, phone: "5432109876" },
    { headName: "Meera Devi", address: "House No. 11, Ward 1, Temple Street", ward: "Ward 1", members: 2n, incomeCategory: "BPL" as const, rationCardType: "yellow" as const, rationCardNumber: "WB-4455667788", houseType: "semi_pucca" as const, phone: "4321098765" },
    { headName: "Gopal Das", address: "House No. 23, Ward 2, River Side", ward: "Ward 2", members: 4n, incomeCategory: "APL" as const, rationCardType: "orange" as const, rationCardNumber: "WB-5566778899", houseType: "pucca" as const, phone: "3210987654" },
    { headName: "Radha Rani", address: "House No. 45, Ward 3, Panchayat Bhawan Road", ward: "Ward 3", members: 3n, incomeCategory: "BPL" as const, rationCardType: "yellow" as const, rationCardNumber: "WB-6677889900", houseType: "kutcha" as const, phone: "2109876543" },
    { headName: "Krishna Murari", address: "House No. 67, Ward 4, Bus Stand Road", ward: "Ward 4", members: 5n, incomeCategory: "antyodaya" as const, rationCardType: "yellow" as const, rationCardNumber: "WB-7788990011", houseType: "semi_pucca" as const, phone: "1098765432" },
    { headName: "Saraswati Devi", address: "House No. 89, Ward 5, Health Center Lane", ward: "Ward 5", members: 6n, incomeCategory: "APL" as const, rationCardType: "white" as const, rationCardNumber: "WB-8899001122", houseType: "pucca" as const, phone: "9988776655" },
  ];

  const householdIds: number[] = [];
  for (const h of householdData) {
    const result = await db.insert(households).values(h);
    householdIds.push(Number(result[0].insertId));
  }

  // ─── Citizens ───
  console.log("Creating citizens...");
  const firstNames = ["Ram", "Sita", "Mohan", "Radha", "Shyam", "Geeta", "Hari", "Lakshmi", "Gopal", "Saraswati", "Krishna", "Meera", "Ramesh", "Kamala", "Suresh", "Usha", "Prakash", "Anita", "Vijay", "Rekha", "Ajay", "Sunita", "Sanjay", "Poonam", "Deepak", "Manju", "Arun", "Kavita", "Rajesh", "Veena"];
  const lastNames = ["Yadav", "Devi", "Gupta", "Mishra", "Lal", "Singh", "Kumar", "Prasad", "Das", "Rani", "Murari", "Sharma", "Patel", "Verma", "Rao", "Naidu", "Reddy", "Iyer", "Joshi", "Pandey"];
  const wards = ["Ward 1", "Ward 2", "Ward 3", "Ward 4", "Ward 5"];
  const occupations = ["Farmer", "Laborer", "Teacher", "Shopkeeper", "Driver", "Tailor", "Carpenter", "Electrician", "Student", "Housewife", "Retired", "Government Employee"];
  const educations = ["Primary", "Secondary", "Higher Secondary", "Graduate", "Post Graduate", "Illiterate"];

  const citizenIds: number[] = [];
  for (let i = 0; i < 50; i++) {
    const fName = randomItem(firstNames);
    const lName = randomItem(lastNames);
    const ward = randomItem(wards);
    const householdId = randomItem(householdIds);
    const dob = randomDate(new Date(1950, 0, 1), new Date(2010, 0, 1));

    const result = await db.insert(citizens).values({
      fullName: `${fName} ${lName}`,
      fatherName: `${randomItem(firstNames)} ${lName}`,
      motherName: `${randomItem(firstNames)} Devi`,
      dob,
      gender: randomItem(["male", "female", "other"]) as "male" | "female" | "other",
      category: randomItem(["SC", "ST", "OBC", "General"]) as "SC" | "ST" | "OBC" | "General",
      aadhaar: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      phone: `98765${String(Math.floor(10000 + Math.random() * 90000))}`,
      email: i < 10 ? `${fName.toLowerCase()}.${lName.toLowerCase()}@email.com` : null,
      address: `House No. ${Math.floor(1 + Math.random() * 100)}, ${ward}`,
      ward,
      householdId,
      occupation: randomItem(occupations),
      education: randomItem(educations),
      maritalStatus: randomItem(["single", "married", "widowed", "divorced"]) as "single" | "married" | "widowed" | "divorced",
    });
    citizenIds.push(Number(result[0].insertId));
  }

  // ─── Welfare Schemes ───
  console.log("Creating welfare schemes...");
  const schemeData = [
    { name: "PM Awas Yojana (Rural)", category: "housing" as const, description: "Provides financial assistance for construction of pucca houses to homeless and those living in kutcha houses.", budget: "5000000", utilizedBudget: "3200000", startDate: new Date("2023-04-01"), endDate: new Date("2026-03-31"), eligibility: "Families without pucca house, BPL/ANTYODAYA ration card holders", applicationProcess: "Apply through Gram Panchayat with ration card and land documents" },
    { name: "MGNREGA", category: "others" as const, description: "Mahatma Gandhi National Rural Employment Guarantee Act provides 100 days of guaranteed wage employment.", budget: "8000000", utilizedBudget: "6500000", startDate: new Date("2023-04-01"), endDate: new Date("2024-03-31"), eligibility: "All adult rural residents willing to do unskilled manual work", applicationProcess: "Register at Gram Panchayat with job card application" },
    { name: "PM Kisan Samman Nidhi", category: "agriculture" as const, description: "Direct income support of Rs. 6000 per year to farmer families across the country.", budget: "3000000", utilizedBudget: "2800000", startDate: new Date("2023-01-01"), endDate: null, eligibility: "Small and marginal farmer families with cultivable land", applicationProcess: "Register through Patwari or online portal with land records" },
    { name: "Ayushman Bharat", category: "health" as const, description: "Health insurance coverage of up to Rs. 5 lakh per family per year for secondary and tertiary care.", budget: "2000000", utilizedBudget: "1200000", startDate: new Date("2023-04-01"), endDate: null, eligibility: "Families identified in SECC 2011 database, BPL families", applicationProcess: "Verify eligibility at Common Service Center or health facility" },
    { name: "Sarva Shiksha Abhiyan", category: "education" as const, description: "Universalization of Elementary Education providing free and compulsory education to children 6-14 years.", budget: "1500000", utilizedBudget: "1100000", startDate: new Date("2023-04-01"), endDate: new Date("2024-03-31"), eligibility: "All children aged 6-14 years", applicationProcess: "Enroll at local government school" },
    { name: "Indira Gandhi National Old Age Pension", category: "pension" as const, description: "Monthly pension to senior citizens belonging to BPL households.", budget: "1800000", utilizedBudget: "1600000", startDate: new Date("2023-04-01"), endDate: null, eligibility: "BPL citizens aged 60 years and above", applicationProcess: "Apply at Gram Panchayat with age proof and BPL card" },
    { name: "Swachh Bharat Mission (Gramin)", category: "sanitation" as const, description: "Promotes cleanliness and aims to make rural areas Open Defecation Free through toilet construction.", budget: "2500000", utilizedBudget: "2200000", startDate: new Date("2023-04-01"), endDate: new Date("2025-03-31"), eligibility: "Rural households without toilet facility", applicationProcess: "Apply through Gram Panchayat with Aadhaar and bank details" },
    { name: "National Rural Livelihood Mission", category: "others" as const, description: "Organizes rural poor into Self Help Groups and supports them with financial assistance.", budget: "1200000", utilizedBudget: "800000", startDate: new Date("2023-04-01"), endDate: new Date("2024-03-31"), eligibility: "Rural poor women, especially SC/ST households", applicationProcess: "Join existing SHG or form new group through Gram Panchayat" },
    { name: "PM Ujjwala Yojana", category: "others" as const, description: "Provides free LPG connections to women from BPL households.", budget: "800000", utilizedBudget: "750000", startDate: new Date("2023-04-01"), endDate: null, eligibility: "Adult women from BPL households without LPG connection", applicationProcess: "Apply at LPG distributor with BPL card and Aadhaar" },
    { name: "Mid-Day Meal Scheme", category: "education" as const, description: "Provides free lunch to school children on working days to improve nutrition and enrollment.", budget: "600000", utilizedBudget: "550000", startDate: new Date("2023-04-01"), endDate: new Date("2024-03-31"), eligibility: "All children studying in government/government-aided schools", applicationProcess: "Automatic enrollment through school admission" },
  ];

  const schemeIds: number[] = [];
  for (const s of schemeData) {
    const result = await db.insert(welfareSchemes).values({
      name: s.name,
      category: s.category,
      description: s.description,
      budget: s.budget,
      utilizedBudget: s.utilizedBudget,
      startDate: s.startDate,
      endDate: s.endDate,
      status: "active",
      eligibility: s.eligibility,
      applicationProcess: s.applicationProcess,
      image: null,
    });
    schemeIds.push(Number(result[0].insertId));
  }

  // ─── Scheme Enrollments ───
  console.log("Creating scheme enrollments...");
  for (let i = 0; i < 30; i++) {
    const schemeId = randomItem(schemeIds);
    const citizenId = randomItem(citizenIds);
    const enrollmentDate = randomDate(new Date(2023, 0, 1), new Date(2024, 11, 31));
    const amountReceived = String(Math.floor(1000 + Math.random() * 50000));

    await db.insert(schemeEnrollments).values({
      schemeId,
      citizenId,
      enrollmentDate,
      status: randomItem(["active", "active", "active", "inactive", "rejected"]) as "active" | "inactive" | "rejected",
      amountReceived,
      notes: null,
    });
  }

  // ─── Property Tax ───
  console.log("Creating property tax records...");
  const propertyTypes = ["residential", "commercial", "agricultural"] as const;
  for (let i = 0; i < 20; i++) {
    const citizenId = randomItem(citizenIds);
    const propertyType = randomItem(propertyTypes);
    const area = (50 + Math.random() * 500).toFixed(2);
    const assessedValue = String(Math.floor(100000 + Math.random() * 5000000));
    const taxAmount = String(Math.floor(500 + Math.random() * 50000));
    const dueDate = randomDate(new Date(2024, 0, 1), new Date(2025, 11, 31));
    const isPaid = Math.random() > 0.3;
    const paidDate = isPaid ? randomDate(new Date(2024, 0, 1), new Date(2025, 5, 14)) : null;

    await db.insert(propertyTax).values({
      citizenId,
      propertyId: `PROP-${String(i + 1).padStart(4, "0")}`,
      propertyType,
      area,
      assessedValue,
      taxAmount,
      dueDate,
      paidDate,
      status: isPaid ? "paid" as const : randomItem(["pending" as const, "overdue" as const]),
      paymentMethod: isPaid ? randomItem(["cash" as const, "online" as const, "cheque" as const]) : null,
    });
  }

  // ─── Meetings ───
  console.log("Creating meetings...");
  const meetingData = [
    { title: "Gram Sabha - Annual Budget Approval", type: "gram_sabha" as const, date: new Date("2025-04-15"), time: "10:00:00", location: "Panchayat Bhawan, Main Hall", agenda: ["Annual Budget Presentation", "Development Work Review", "New Scheme Proposals", "Grievance Redressal"], status: "scheduled" as const, minutes: null },
    { title: "Executive Committee Meeting - March", type: "executive" as const, date: new Date("2025-03-10"), time: "14:00:00", location: "Secretary Office", agenda: ["Review Pending Applications", "Fund Allocation Discussion", "Staff Meeting Schedule"], status: "completed" as const, minutes: "The executive committee reviewed 15 pending applications. Approved 12 welfare scheme enrollments. Allocated Rs. 2.5 lakhs for road repair work. Next meeting scheduled for April 15." },
    { title: "Special Meeting - Flood Relief", type: "special" as const, date: new Date("2024-09-20"), time: "09:00:00", location: "Community Center", agenda: ["Flood Damage Assessment", "Relief Distribution Plan", "Emergency Fund Approval"], status: "completed" as const, minutes: "Emergency relief measures discussed. Approved immediate relief of Rs. 5,000 per affected household. Identified 23 families requiring temporary shelter assistance." },
    { title: "Gram Sabha - Quarterly Review", type: "gram_sabha" as const, date: new Date("2025-01-20"), time: "10:00:00", location: "Panchayat Bhawan", agenda: ["Q3 Progress Report", "Beneficiary Feedback", "New Project Proposals"], status: "completed" as const, minutes: "Quarterly review completed. 85% of annual targets achieved. Citizen satisfaction at 92%. Approved construction of 5 new community toilets." },
    { title: "Executive Committee - April", type: "executive" as const, date: new Date("2025-04-05"), time: "11:00:00", location: "Secretary Office", agenda: ["Monthly Revenue Report", "Tax Collection Status", "Staff Payroll"], status: "scheduled" as const, minutes: null },
    { title: "Gram Sabha - Swachh Bharat Progress", type: "gram_sabha" as const, date: new Date("2024-11-15"), time: "10:00:00", location: "Panchayat Bhawan", agenda: ["ODF Status Review", "Toilet Construction Progress", "IEC Activities Report"], status: "completed" as const, minutes: "Village declared ODF Plus. 245 individual household toilets constructed. Regular cleanliness drives organized in all 5 wards." },
  ];

  const meetingIds: number[] = [];
  for (const m of meetingData) {
    const result = await db.insert(meetings).values({
      title: m.title,
      type: m.type,
      date: m.date,
      time: m.time,
      location: m.location,
      agenda: m.agenda,
      status: m.status,
      minutes: m.minutes,
      createdBy: 1,
    });
    meetingIds.push(Number(result[0].insertId));
  }

  // ─── Meeting Attendance ───
  console.log("Creating meeting attendance...");
  for (const meetingId of meetingIds) {
    const attendees = citizenIds.slice(0, Math.floor(5 + Math.random() * 10));
    for (let i = 0; i < attendees.length; i++) {
      await db.insert(meetingAttendance).values({
        meetingId,
        citizenId: attendees[i],
        role: i === 0 ? "sarpanch" as const : i === 1 ? "secretary" as const : randomItem(["member" as const, "guest" as const]),
        present: Math.random() > 0.2,
      });
    }
  }

  // ─── Grievances ───
  console.log("Creating grievances...");
  const grievanceData = [
    { citizenId: citizenIds[0], category: "water" as const, subject: "Water supply disrupted for 3 days", description: "There has been no water supply in Ward 2 for the past 3 days. The overhead tank is not filling up. Please look into this matter urgently.", status: "resolved" as const, referenceNumber: "GRV-ABC123", resolution: "Water pump motor repaired. Supply restored on 2025-01-18.", assignedTo: 2, resolvedAt: new Date("2025-01-18") },
    { citizenId: citizenIds[5], category: "roads" as const, subject: "Potholes on main road need repair", description: "The main road connecting Ward 3 to the highway has developed several dangerous potholes. Accidents are happening frequently. Request immediate repair work.", status: "assigned" as const, referenceNumber: "GRV-DEF456", resolution: null, assignedTo: 2, resolvedAt: null },
    { citizenId: citizenIds[10], category: "electricity" as const, subject: "Frequent power cuts in Ward 4", description: "Ward 4 is experiencing 6-8 hours of power cuts daily. This is affecting businesses and students. Need a permanent solution.", status: "under_review" as const, referenceNumber: "GRV-GHI789", resolution: null, assignedTo: null, resolvedAt: null },
    { citizenId: citizenIds[15], category: "sanitation" as const, subject: "Drainage blockage near school", description: "The main drain near Government Primary School is completely blocked. Dirty water is overflowing onto the road. Health hazard for school children.", status: "submitted" as const, referenceNumber: "GRV-JKL012", resolution: null, assignedTo: null, resolvedAt: null },
    { citizenId: citizenIds[20], category: "welfare" as const, subject: "PM Awas Yojana application pending", description: "I applied for PM Awas Yojana 6 months ago but have not received any response. My family lives in a kutcha house and needs urgent assistance.", status: "assigned" as const, referenceNumber: "GRV-MNO345", resolution: null, assignedTo: 2, resolvedAt: null },
    { citizenId: citizenIds[25], category: "land_dispute" as const, subject: "Boundary dispute with neighbor", description: "There is a boundary dispute with my neighbor regarding our agricultural land. The Panchayat survey records are unclear. Request mediation.", status: "resolved" as const, referenceNumber: "GRV-PQR678", resolution: "Boundary demarcation completed by Patwari on 2025-02-10. Both parties agreed to the new boundary line.", assignedTo: 2, resolvedAt: new Date("2025-02-10") },
    { citizenId: citizenIds[30], category: "others" as const, subject: "Street lights not working", description: "5 street lights on the road from Ward 1 to the bus stand are not working for the past month. Creates safety issues at night.", status: "resolved" as const, referenceNumber: "GRV-STU901", resolution: "All 5 street lights repaired and new LED bulbs installed on 2025-01-25.", assignedTo: 2, resolvedAt: new Date("2025-01-25") },
    { citizenId: citizenIds[35], category: "water" as const, subject: "Hand pump repair needed", description: "The community hand pump in Ward 5 is not working. 20 families depend on it for drinking water. Request immediate repair.", status: "assigned" as const, referenceNumber: "GRV-VWX234", resolution: null, assignedTo: 2, resolvedAt: null },
    { citizenId: citizenIds[40], category: "roads" as const, subject: "Need new approach road", description: "Our ward does not have a proper approach road. During monsoon it becomes impossible to reach the main road. Request construction of pakka road.", status: "under_review" as const, referenceNumber: "GRV-YZAB56", resolution: null, assignedTo: null, resolvedAt: null },
    { citizenId: citizenIds[45], category: "electricity" as const, subject: "Transformer overloaded", description: "The transformer serving Ward 1 and Ward 2 is overloaded and trips frequently. Need installation of additional transformer.", status: "submitted" as const, referenceNumber: "GRV-CDEF78", resolution: null, assignedTo: null, resolvedAt: null },
  ];

  for (const g of grievanceData) {
    await db.insert(grievances).values({
      citizenId: g.citizenId,
      category: g.category,
      subject: g.subject,
      description: g.description,
      status: g.status,
      referenceNumber: g.referenceNumber,
      resolution: g.resolution,
      assignedTo: g.assignedTo,
      resolvedAt: g.resolvedAt,
      attachment: null,
    });
  }

  console.log("Seed completed successfully!");
}

seed().catch(console.error);
