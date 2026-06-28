type VercelRequest = {
  method?: string;
  body?: unknown;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  setHeader: (name: string, value: string) => void;
  json: (body: unknown) => void;
  send: (body: string) => void;
};

type MySqlPool = import("mysql2/promise").Pool;
type ResultSetHeader = import("mysql2/promise").ResultSetHeader;
type RowDataPacket = import("mysql2/promise").RowDataPacket;

type ComplaintInput = {
  from: string;
  name: string;
  message: string;
  ward: string;
  category: string;
  subcategory: string;
};

type CategoryFlow = {
  code: number;
  title: string;
  backendCategory: string;
  aliases: string[];
  subcategories: string[];
};

let pool: MySqlPool | null = null;

const complaintFlows: CategoryFlow[] = [
  {
    code: 1,
    title: "Drinking Water",
    backendCategory: "water",
    aliases: ["water", "drinking", "pump", "borewell"],
    subcategories: ["No water supply", "Dirty or smelly water", "Pipeline leakage", "Hand pump or borewell repair", "Low water pressure"],
  },
  {
    code: 2,
    title: "Sanitation & Drainage",
    backendCategory: "sanitation",
    aliases: ["sanitation", "drain", "drainage", "sewage"],
    subcategories: ["Blocked drainage", "Sewage overflow", "Public toilet repair", "Stagnant water", "Mosquito breeding spot"],
  },
  {
    code: 3,
    title: "Garbage & Waste",
    backendCategory: "sanitation",
    aliases: ["garbage", "waste", "dumping"],
    subcategories: ["Garbage not collected", "Illegal dumping", "Waste burning", "Dead animal removal", "Dustbin required"],
  },
  {
    code: 4,
    title: "Roads & Pathways",
    backendCategory: "roads",
    aliases: ["road", "roads", "pathway", "pothole"],
    subcategories: ["Potholes", "Muddy road", "Broken culvert", "Road waterlogging", "Footpath repair"],
  },
  {
    code: 5,
    title: "Street Lights & Electricity",
    backendCategory: "electricity",
    aliases: ["light", "street light", "electricity", "power"],
    subcategories: ["Street light not working", "New street light needed", "Unsafe electric wire", "Pole damaged", "Transformer issue"],
  },
  {
    code: 6,
    title: "Health & Mosquito Control",
    backendCategory: "sanitation",
    aliases: ["health", "mosquito", "fogging", "fever"],
    subcategories: ["Mosquito fogging needed", "Fever cases in area", "Unsafe drinking water", "Health camp request", "Stray animal health risk"],
  },
  {
    code: 7,
    title: "Welfare, Ration & Pension",
    backendCategory: "welfare",
    aliases: ["welfare", "ration", "pension", "awas"],
    subcategories: ["Ration card problem", "Old age pension", "Widow pension", "PM Awas issue", "Scheme benefit pending"],
  },
  {
    code: 8,
    title: "School & Anganwadi",
    backendCategory: "welfare",
    aliases: ["school", "anganwadi", "midday meal"],
    subcategories: ["Anganwadi repair", "Midday meal issue", "School toilet repair", "Drinking water at school", "Child nutrition service"],
  },
  {
    code: 9,
    title: "MGNREGA & Livelihood",
    backendCategory: "welfare",
    aliases: ["mgnrega", "job card", "livelihood", "shg"],
    subcategories: ["Job card issue", "Wage payment pending", "Attendance mismatch", "Work demand", "SHG support"],
  },
  {
    code: 10,
    title: "Land & Public Assets",
    backendCategory: "land_dispute",
    aliases: ["land", "asset", "encroachment", "pond", "community hall"],
    subcategories: ["Public land encroachment", "Pond maintenance", "Community hall repair", "Playground issue", "Boundary dispute"],
  },
];

function valueAt(body: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = body[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function lineValue(text: string, labels: string[]) {
  const lines = text.split(/\r?\n/);
  for (const label of labels) {
    const match = lines
      .map((line) => line.match(new RegExp(`^\\s*${label}\\s*:\\s*(.+)$`, "i")))
      .find(Boolean);
    if (match?.[1]) return match[1].trim();
  }
  return "";
}

function cleanMessageForComplaint(text: string) {
  const problem = lineValue(text, ["Problem", "Complaint", "Description", "Issue"]);
  return problem || text;
}

function mainMenuText() {
  return [
    "Namaste. Gram Panchayat WhatsApp complaint desk.",
    "Reply with a category number:",
    ...complaintFlows.map((item) => `${item.code}. ${item.title}`),
    "",
    "Example: reply 1 for Drinking Water.",
  ].join("\n");
}

function categoryTemplateText(flow: CategoryFlow) {
  return [
    `${flow.title} selected.`,
    "Reply with your complaint in this format:",
    "",
    "GP_COMPLAINT",
    `Category: ${flow.title}`,
    `System Category: ${flow.backendCategory}`,
    `Subcategory: ${flow.subcategories[0]}`,
    "Ward: Ward 1",
    "Problem: type your exact problem here",
    "Location/Landmark: optional",
    "",
    "Subcategory options:",
    ...flow.subcategories.map((item, index) => `${index + 1}. ${item}`),
    "",
    `Fast format: ${flow.code} 1 Ward 1 your problem here`,
  ].join("\n");
}

function findFlowByText(text: string) {
  const normalized = text.trim().toLowerCase();
  const numeric = normalized.match(/^(\d{1,2})$/)?.[1];
  if (numeric) return complaintFlows.find((item) => item.code === Number(numeric));
  return complaintFlows.find((item) => (
    normalized.includes(item.title.toLowerCase()) ||
    item.aliases.some((alias) => normalized.includes(alias))
  ));
}

function isStartIntent(text: string) {
  return /^(hi|hii|hello|hlo|hey|start|menu|complaint|help|gp_complaint|start gp_complaint)$/i.test(text.trim());
}

function parseFastComplaint(text: string) {
  const match = text.trim().match(/^(\d{1,2})[\s.:-]+(\d{1,2})[\s.:-]+(ward\s*\d{1,2}|ward\s*not\s*sure|not\s*sure)[\s,:-]+(.+)$/i);
  if (!match) return null;

  const flow = complaintFlows.find((item) => item.code === Number(match[1]));
  if (!flow) return null;

  const subcategoryIndex = Number(match[2]) - 1;
  const subcategory = flow.subcategories[subcategoryIndex] ?? flow.subcategories[0];
  const ward = match[3]
    .replace(/\s+/g, " ")
    .replace(/^ward/i, "Ward")
    .replace(/not sure/i, "not sure");
  const problem = match[4].trim();

  return {
    message: problem,
    ward,
    category: flow.backendCategory,
    subcategory,
  };
}

function needsMoreDetails(input: ComplaintInput) {
  return !input.message.trim() || input.message.trim().length < 8;
}

function normalizeBackendCategory(value: string, fallbackText: string) {
  const lower = `${value} ${fallbackText}`.toLowerCase();
  if (/(water|tap|pump|pipeline|borewell)/.test(lower)) return "water";
  if (/(road|pothole|pathway|street|bridge|culvert)/.test(lower)) return "roads";
  if (/(electric|power|light|streetlight|transformer|pole|wire)/.test(lower)) return "electricity";
  if (/(garbage|drain|sewage|waste|toilet|sanitation|mosquito|health|fogging)/.test(lower)) return "sanitation";
  if (/(land|boundary|property|encroach|pond|asset|community hall|playground)/.test(lower)) return "land_dispute";
  if (/(pension|ration|scheme|benefit|awas|mgnrega|job card|school|anganwadi|livelihood|shg)/.test(lower)) return "welfare";
  return "others";
}

function summarize(text: string) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  return cleaned.length > 140 ? `${cleaned.slice(0, 137).trim()}...` : cleaned;
}

function addHours(hours: number) {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date;
}

function getSlaDueAt(priority: string) {
  if (priority === "critical") return addHours(12);
  if (priority === "high") return addHours(24);
  if (priority === "medium") return addHours(72);
  return addHours(120);
}

async function getPool() {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) {
    const mysql = await import("mysql2/promise");
    pool = mysql.createPool(process.env.DATABASE_URL);
  }
  return pool;
}

function parseInput(rawBody: unknown): ComplaintInput {
  const body = rawBody && typeof rawBody === "object" ? rawBody as Record<string, unknown> : {};

  const nestedPayload = body.payload && typeof body.payload === "object"
    ? body.payload as Record<string, unknown>
    : {};
  const nestedSender = nestedPayload.sender && typeof nestedPayload.sender === "object"
    ? nestedPayload.sender as Record<string, unknown>
    : {};
  const nestedMessage = nestedPayload.payload && typeof nestedPayload.payload === "object"
    ? nestedPayload.payload as Record<string, unknown>
    : {};

  const merged = { ...nestedMessage, ...nestedSender, ...nestedPayload, ...body };

  const message = valueAt(merged, ["message", "body", "text", "complaint", "description", "Body"]);
  const ward = valueAt(merged, ["ward", "Ward", "area", "location"]);
  const category = valueAt(merged, ["category", "Category", "systemCategory", "System Category"]);
  const parsedWard = lineValue(message, ["Ward", "Ward No", "Ward Number"]);
  const parsedCategory = lineValue(message, ["System Category", "Category"]);
  const fastComplaint = parseFastComplaint(message);

  return {
    from: valueAt(merged, ["from", "phone", "sender", "source", "wa_id", "whatsapp", "mobile"]).replace(/\D/g, ""),
    name: valueAt(merged, ["name", "profile_name", "profileName", "sender_name", "contact_name"]) || "WhatsApp Citizen",
    message: fastComplaint?.message ?? cleanMessageForComplaint(message),
    ward: fastComplaint?.ward ?? (ward && ward.toLowerCase() !== "unknown" ? ward : parsedWard),
    category: fastComplaint?.category ?? (category || parsedCategory),
    subcategory: fastComplaint?.subcategory ?? (valueAt(merged, ["subcategory", "Subcategory", "sub_category"]) || lineValue(message, ["Subcategory", "Sub-category"])),
  };
}

function classifyComplaint(input: ComplaintInput) {
  return normalizeBackendCategory(input.category, `${input.subcategory} ${input.message}`);
}

function detectPriority(message: string) {
  const lower = message.toLowerCase();
  if (/(emergency|danger|accident|fire|flood|urgent|severe)/.test(lower)) return "critical";
  if (/(no water|blocked|broken|not working|unsafe|three days|3 days|week)/.test(lower)) return "high";
  return "medium";
}

async function persistComplaint(input: ComplaintInput, referenceNumber: string, category: string, priority: string) {
  const db = await getPool();
  if (!db) return { stored: false, note: "DATABASE_URL is not configured." };

  const localPhone = input.from.length > 10 ? input.from.slice(-10) : input.from;
  const ward = input.ward || "Unassigned";
  const [citizenRows] = await db.execute<Array<RowDataPacket & { id: number }>>(
    "SELECT id FROM citizens WHERE phone IN (?, ?) LIMIT 1",
    [input.from, localPhone],
  );

  let citizenId = citizenRows[0]?.id;
  if (!citizenId) {
    const [citizenResult] = await db.execute<ResultSetHeader>(
      `INSERT INTO citizens
        (full_name, dob, gender, category, phone, address, ward, occupation, education)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.name || `WhatsApp Citizen ${localPhone}`,
        "1970-01-01",
        "other",
        "General",
        localPhone,
        "Submitted via WhatsApp. Address verification pending.",
        ward,
        "Verification pending",
        "Verification pending",
      ],
    );
    citizenId = citizenResult.insertId;
  }

  await db.execute(
    `INSERT INTO grievances
      (citizen_id, category, subject, description, status, reference_number, source, whatsapp_number, ward, priority, ai_summary, ai_category, sla_due_at, latest_update)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      citizenId,
      category,
      summarize(input.message),
      input.message,
      "submitted",
      referenceNumber,
      "whatsapp",
      input.from,
      ward,
      priority,
      summarize(input.message),
      input.subcategory || category,
      getSlaDueAt(priority),
      "WhatsApp complaint received through Zapier and acknowledged.",
    ],
  );

  return { stored: true, note: "Complaint stored in database." };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method === "GET") {
    res.status(200).json({
      ok: true,
      provider: "zapier",
      message: "Zapier WhatsApp complaint webhook is reachable.",
      expectedFields: ["from", "name", "message", "ward"],
      startMessage: "START GP_COMPLAINT",
    });
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ ok: false, message: "Method not allowed." });
    return;
  }

  const input = parseInput(req.body);
  const rawText = input.message.trim();

  if (isStartIntent(rawText)) {
    res.status(200).json({
      ok: true,
      provider: "zapier",
      received: true,
      from: input.from,
      name: input.name,
      action: "menu",
      replyText: mainMenuText(),
    });
    return;
  }

  const selectedFlow = findFlowByText(rawText);
  if (selectedFlow && /^\d{1,2}$/.test(rawText)) {
    res.status(200).json({
      ok: true,
      provider: "zapier",
      received: true,
      from: input.from,
      name: input.name,
      action: "category_template",
      category: selectedFlow.backendCategory,
      replyText: categoryTemplateText(selectedFlow),
    });
    return;
  }

  if (needsMoreDetails(input)) {
    res.status(200).json({
      ok: true,
      provider: "zapier",
      received: true,
      from: input.from,
      name: input.name,
      action: "need_details",
      replyText: [
        "Please send more details so we can register your complaint.",
        "",
        mainMenuText(),
      ].join("\n"),
    });
    return;
  }

  const referenceNumber = `GRV-${Date.now().toString(36).toUpperCase()}`;
  const category = classifyComplaint(input);
  const priority = detectPriority(input.message);
  let storage = { stored: false, note: "Not attempted." };

  try {
    if (input.message) {
      storage = await persistComplaint(input, referenceNumber, category, priority);
    }
  } catch (error) {
    storage = { stored: false, note: "Database storage failed; acknowledgement still returned." };
    console.error("zapier_whatsapp_storage_failed", error);
  }

  console.log(JSON.stringify({
    event: "zapier_whatsapp_complaint_received",
    referenceNumber,
    ...input,
    category,
    priority,
    stored: storage.stored,
  }));

  res.status(200).json({
    ok: true,
    provider: "zapier",
    referenceNumber,
    received: Boolean(input.message),
    from: input.from,
    name: input.name,
    category,
    subcategory: input.subcategory,
    ward: input.ward || "Unassigned",
    priority,
    stored: storage.stored,
    storageNote: storage.note,
    replyText: `Your complaint has been received. Reference number: ${referenceNumber}. Category: ${category}. Ward: ${input.ward || "Unassigned"}. Priority: ${priority}.`,
  });
}
