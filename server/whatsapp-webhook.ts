import { Hono, type Context } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { appRouter } from "./router";
import { env } from "./lib/env";

type WhatsAppTextMessage = {
  from: string;
  id: string;
  timestamp?: string;
  type: "text";
  text?: { body?: string };
};

type WhatsAppChange = {
  value?: {
    messages?: WhatsAppTextMessage[];
    contacts?: Array<{ wa_id?: string; profile?: { name?: string } }>;
    metadata?: { phone_number_id?: string; display_phone_number?: string };
  };
};

type WhatsAppWebhookPayload = {
  object?: string;
  entry?: Array<{
    id?: string;
    changes?: WhatsAppChange[];
  }>;
};

type GupshupInboundPayload = {
  app?: string;
  timestamp?: number;
  version?: number;
  type?: string;
  payload?: {
    id?: string;
    source?: string;
    type?: string;
    payload?: Record<string, unknown>;
    sender?: {
      phone?: string;
      name?: string;
      country_code?: string;
      dial_code?: string;
    };
  };
};

const whatsapp = new Hono<{ Bindings: HttpBindings }>();

function isConfigured() {
  return Boolean(env.whatsappVerifyToken);
}

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function signatureIsValid(rawBody: string, signature: string | null) {
  if (!env.appSecret || !signature) return true;
  const expected = `sha256=${createHmac("sha256", env.appSecret).update(rawBody).digest("hex")}`;
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

async function sendWhatsAppReply(to: string, text: string) {
  if (!env.whatsappAccessToken || !env.whatsappPhoneNumberId) {
    return { sent: false, reason: "WhatsApp Cloud API credentials are not configured." };
  }

  const response = await fetch(
    `https://graph.facebook.com/${env.whatsappApiVersion}/${env.whatsappPhoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.whatsappAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { preview_url: false, body: text },
      }),
    },
  );

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    return { sent: false, reason: `WhatsApp reply failed: ${response.status} ${details}` };
  }

  return { sent: true };
}

function gupshupTokenIsValid(c: Context) {
  if (c.req.path.endsWith("/gupshup")) return true;
  if (!env.gupshupWebhookToken) return true;
  const token =
    c.req.param("token") ||
    c.req.query("token") ||
    c.req.header("x-gupshup-token") ||
    c.req.header("x-webhook-token") ||
    "";
  return token === env.gupshupWebhookToken;
}

function extractGupshupMessage(payload: GupshupInboundPayload) {
  if (payload.type && payload.type !== "message") return null;

  const event = payload.payload;
  const message = event?.payload ?? {};
  const messageType = String(event?.type ?? "text");
  const from = normalizePhone(event?.sender?.phone || event?.source || "");
  const citizenName = event?.sender?.name || "Citizen";

  let text = "";
  let attachment = "";

  if (messageType === "text") {
    text = String(message.text ?? "").trim();
  } else if (messageType === "location") {
    const latitude = String(message.latitude ?? message.lat ?? "").trim();
    const longitude = String(message.longitude ?? message.long ?? message.lng ?? "").trim();
    const address = String(message.address ?? message.name ?? "").trim();
    text = `Location shared by citizen${address ? `: ${address}` : ""}${latitude && longitude ? ` (${latitude}, ${longitude})` : ""}. Please review and assign field staff.`;
  } else {
    const caption = String(message.caption ?? message.text ?? "").trim();
    const url = String(message.url ?? message.link ?? "").trim();
    const label = messageType.charAt(0).toUpperCase() + messageType.slice(1);
    text = caption || `${label} complaint evidence received on WhatsApp. Please review the attachment and contact the citizen.`;
    attachment = url;
  }

  if (!from || !text) return null;

  return {
    from,
    citizenName,
    text,
    attachment: attachment || undefined,
    messageId: event?.id ?? "",
  };
}

async function sendGupshupReply(to: string, text: string) {
  if (!env.gupshupApiKey || !env.gupshupSourceNumber || !env.gupshupAppName) {
    return { sent: false, reason: "Gupshup credentials are not configured." };
  }

  const body = new URLSearchParams({
    channel: "whatsapp",
    source: env.gupshupSourceNumber,
    destination: to,
    "src.name": env.gupshupAppName,
    message: JSON.stringify({ type: "text", text }),
  });

  const response = await fetch("https://api.gupshup.io/sm/api/v1/msg", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      apikey: env.gupshupApiKey,
      api_key: env.gupshupApiKey,
    },
    body,
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    return { sent: false, reason: `Gupshup reply failed: ${response.status} ${details}` };
  }

  return { sent: true };
}

function gupshupValidationResponse(c: Context) {
  return c.json({
    ok: true,
    provider: "gupshup",
    message: "Gram Panchayat WhatsApp complaint webhook is ready.",
    callbackUrl: c.req.url,
  });
}

async function handleGupshupWebhook(c: Context) {
  if (!gupshupTokenIsValid(c)) {
    return c.json({ ok: false, message: "Invalid Gupshup webhook token." }, 403);
  }

  const payload = await c.req.json<GupshupInboundPayload>().catch(() => ({}));
  const incoming = extractGupshupMessage(payload);

  if (!incoming) {
    return c.json({
      ok: true,
      processed: [],
      note: "Ignored non-message or unsupported Gupshup event.",
    });
  }

  const caller = appRouter.createCaller({
    req: c.req.raw,
    resHeaders: new Headers(),
  });

  const complaint = await caller.grievance.createWhatsApp({
    whatsappNumber: incoming.from,
    citizenName: incoming.citizenName,
    message: incoming.text,
    attachment: incoming.attachment,
  });
  const reply = `${complaint.reply}\nReference: ${complaint.referenceNumber}. Please keep this number for follow-up.`;
  const replyResult = await sendGupshupReply(incoming.from, reply);

  return c.json({
    ok: true,
    provider: "gupshup",
    processed: [{
      from: incoming.from,
      messageId: incoming.messageId,
      referenceNumber: complaint.referenceNumber,
      replySent: replyResult.sent,
      note: replyResult.sent ? "Complaint registered and Gupshup reply sent." : replyResult.reason,
    }],
  });
}

whatsapp.get("/webhook", (c) => {
  const mode = c.req.query("hub.mode");
  const token = c.req.query("hub.verify_token");
  const challenge = c.req.query("hub.challenge");

  if (mode === "subscribe" && token && token === env.whatsappVerifyToken && challenge) {
    return c.text(challenge);
  }

  return c.json(
    {
      ok: false,
      configured: isConfigured(),
      message: "WhatsApp webhook verification failed. Check WHATSAPP_VERIFY_TOKEN.",
    },
    403,
  );
});

whatsapp.get("/status", (c) => c.json({
  ok: true,
  configured: {
    metaCloudApi: {
      verifyToken: Boolean(env.whatsappVerifyToken),
      accessToken: Boolean(env.whatsappAccessToken),
      phoneNumberId: Boolean(env.whatsappPhoneNumberId),
    },
    gupshup: {
      apiKey: Boolean(env.gupshupApiKey),
      sourceNumber: Boolean(env.gupshupSourceNumber),
      appName: Boolean(env.gupshupAppName),
      webhookToken: Boolean(env.gupshupWebhookToken),
    },
  },
  webhookUrls: {
    metaCloudApi: "/api/whatsapp/webhook",
    gupshup: "/api/whatsapp/gupshup",
    gupshupWithPathToken: "/api/whatsapp/gupshup/:token",
  },
}));

whatsapp.post("/webhook", async (c) => {
  const rawBody = await c.req.text();
  if (!signatureIsValid(rawBody, c.req.header("x-hub-signature-256") ?? null)) {
    return c.json({ ok: false, message: "Invalid WhatsApp webhook signature." }, 403);
  }

  const payload = JSON.parse(rawBody || "{}") as WhatsAppWebhookPayload;
  const caller = appRouter.createCaller({
    req: c.req.raw,
    resHeaders: new Headers(),
  });
  const processed: Array<{
    from: string;
    messageId: string;
    referenceNumber?: string;
    replySent?: boolean;
    note?: string;
  }> = [];

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const contactsById = new Map(
        (change.value?.contacts ?? []).map((contact) => [contact.wa_id, contact.profile?.name]),
      );

      for (const message of change.value?.messages ?? []) {
        if (message.type !== "text" || !message.text?.body?.trim()) continue;

        const from = normalizePhone(message.from);
        const citizenName = contactsById.get(message.from) ?? contactsById.get(from) ?? "Citizen";
        const complaint = await caller.grievance.createWhatsApp({
          whatsappNumber: from,
          citizenName,
          message: message.text.body.trim(),
        });
        const reply = `${complaint.reply}\nTrack it on the Gram Panchayat portal using reference ${complaint.referenceNumber}.`;
        const replyResult = await sendWhatsAppReply(from, reply);

        processed.push({
          from,
          messageId: message.id,
          referenceNumber: complaint.referenceNumber,
          replySent: replyResult.sent,
          note: replyResult.sent ? "Complaint registered and WhatsApp reply sent." : replyResult.reason,
        });
      }
    }
  }

  return c.json({ ok: true, processed });
});

whatsapp.get("/gupshup", gupshupValidationResponse);
whatsapp.get("/gupshup/:token", gupshupValidationResponse);
whatsapp.post("/gupshup", handleGupshupWebhook);
whatsapp.post("/gupshup/:token", handleGupshupWebhook);

export default whatsapp;
