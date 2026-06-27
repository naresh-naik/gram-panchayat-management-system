import { Hono } from "hono";
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
    verifyToken: Boolean(env.whatsappVerifyToken),
    accessToken: Boolean(env.whatsappAccessToken),
    phoneNumberId: Boolean(env.whatsappPhoneNumberId),
  },
  webhookUrl: "/api/whatsapp/webhook",
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

export default whatsapp;
