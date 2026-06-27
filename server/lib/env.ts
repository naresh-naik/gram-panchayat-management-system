import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production" && process.env.DEMO_MODE !== "true") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

export const env = {
  appId: required("APP_ID"),
  appSecret: required("APP_SECRET"),
  isProduction: process.env.NODE_ENV === "production",
  demoMode: process.env.DEMO_MODE === "true",
  databaseUrl: required("DATABASE_URL"),
  ownerUnionId: process.env.OWNER_UNION_ID ?? "",
  whatsappVerifyToken: process.env.WHATSAPP_VERIFY_TOKEN ?? "",
  whatsappAccessToken: process.env.WHATSAPP_ACCESS_TOKEN ?? "",
  whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ?? "",
  whatsappApiVersion: process.env.WHATSAPP_API_VERSION ?? "v21.0",
  gupshupApiKey: process.env.GUPSHUP_API_KEY ?? "",
  gupshupSourceNumber: process.env.GUPSHUP_SOURCE_NUMBER ?? "",
  gupshupAppName: process.env.GUPSHUP_APP_NAME ?? "",
  gupshupWebhookToken: process.env.GUPSHUP_WEBHOOK_TOKEN ?? "",
};
