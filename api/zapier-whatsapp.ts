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

type ComplaintInput = {
  from: string;
  name: string;
  message: string;
  ward: string;
};

function valueAt(body: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = body[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
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

  return {
    from: valueAt(merged, ["from", "phone", "sender", "source", "wa_id", "whatsapp", "mobile"]).replace(/\D/g, ""),
    name: valueAt(merged, ["name", "profile_name", "profileName", "sender_name", "contact_name"]) || "WhatsApp Citizen",
    message: valueAt(merged, ["message", "body", "text", "complaint", "description", "Body"]),
    ward: valueAt(merged, ["ward", "Ward", "area", "location"]),
  };
}

function classifyComplaint(message: string) {
  const lower = message.toLowerCase();
  if (/(water|tap|pump|pipeline|borewell)/.test(lower)) return "water";
  if (/(road|pothole|street|bridge)/.test(lower)) return "roads";
  if (/(electric|power|light|transformer|pole)/.test(lower)) return "electricity";
  if (/(garbage|drain|sewage|waste|toilet|sanitation)/.test(lower)) return "sanitation";
  if (/(land|boundary|property|encroach)/.test(lower)) return "land_dispute";
  if (/(pension|ration|scheme|benefit|awas|mgnrega|job card)/.test(lower)) return "welfare";
  return "others";
}

function detectPriority(message: string) {
  const lower = message.toLowerCase();
  if (/(emergency|danger|accident|fire|flood|urgent|severe)/.test(lower)) return "critical";
  if (/(no water|blocked|broken|unsafe|three days|3 days|week)/.test(lower)) return "high";
  return "medium";
}

export default function handler(req: VercelRequest, res: VercelResponse) {
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
  const category = classifyComplaint(input.message);
  const priority = detectPriority(input.message);

  console.log(JSON.stringify({
    event: "zapier_whatsapp_complaint_received",
    referenceNumber,
    ...input,
    category,
    priority,
  }));

  res.status(200).json({
    ok: true,
    provider: "zapier",
    referenceNumber,
    received: Boolean(input.message),
    from: input.from,
    name: input.name,
    category,
    priority,
    replyText: `Your complaint has been received. Reference number: ${referenceNumber}. Category: ${category}. Priority: ${priority}.`,
  });
}
