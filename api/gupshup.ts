type VercelRequest = {
  method?: string;
  body?: unknown;
  query?: Record<string, string | string[]>;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  setHeader: (name: string, value: string) => void;
  json: (body: unknown) => void;
  send: (body: string) => void;
};

function extractText(body: unknown) {
  if (!body || typeof body !== "object") return "";
  const payload = (body as { payload?: unknown }).payload;
  if (!payload || typeof payload !== "object") return "";
  const messagePayload = (payload as { payload?: unknown }).payload;
  if (!messagePayload || typeof messagePayload !== "object") return "";
  const text = (messagePayload as { text?: unknown }).text;
  return typeof text === "string" ? text : "";
}

function extractSender(body: unknown) {
  if (!body || typeof body !== "object") return "";
  const payload = (body as { payload?: unknown }).payload;
  if (!payload || typeof payload !== "object") return "";
  const sender = (payload as { sender?: unknown; source?: unknown }).sender;
  if (sender && typeof sender === "object") {
    const phone = (sender as { phone?: unknown }).phone;
    if (typeof phone === "string") return phone.replace(/\D/g, "");
  }
  const source = (payload as { source?: unknown }).source;
  return typeof source === "string" ? source.replace(/\D/g, "") : "";
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
      provider: "gupshup",
      message: "Gram Panchayat WhatsApp complaint webhook is reachable.",
    });
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ ok: false, message: "Method not allowed." });
    return;
  }

  const message = extractText(req.body);
  const from = extractSender(req.body);
  const referenceNumber = `GRV-${Date.now().toString(36).toUpperCase()}`;

  console.log(JSON.stringify({
    event: "gupshup_complaint_received",
    from,
    referenceNumber,
    message,
  }));

  res.status(200).json({
    ok: true,
    provider: "gupshup",
    referenceNumber,
    from,
    received: Boolean(message),
    message: "Complaint webhook received.",
  });
}
