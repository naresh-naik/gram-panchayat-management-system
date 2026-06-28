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

let pool: MySqlPool | null = null;

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

  return {
    from: valueAt(merged, ["from", "phone", "sender", "source", "wa_id", "whatsapp", "mobile"]).replace(/\D/g, ""),
    name: valueAt(merged, ["name", "profile_name", "profileName", "sender_name", "contact_name"]) || "WhatsApp Citizen",
    message: cleanMessageForComplaint(message),
    ward: ward && ward.toLowerCase() !== "unknown" ? ward : parsedWard,
    category: category || parsedCategory,
    subcategory: valueAt(merged, ["subcategory", "Subcategory", "sub_category"]) || lineValue(message, ["Subcategory", "Sub-category"]),
  };
}

function classifyComplaint(input: ComplaintInput) {
  return normalizeBackendCategory(input.category, `${input.subcategory} ${input.message}`);
}

function detectPriority(message: string) {
  const lower = message.toLowerCase();
  if (/(emergency|danger|accident|fire|flood|urgent|severe)/.test(lower)) return "critical";
  if (/(no water|blocked|broken|unsafe|three days|3 days|week)/.test(lower)) return "high";
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
    });
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ ok: false, message: "Method not allowed." });
    return;
  }

  const input = parseInput(req.body);
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
