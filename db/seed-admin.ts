import "dotenv/config";
import { eq } from "drizzle-orm";
import { hashPassword } from "../server/lib/password";
import { getDb } from "../server/queries/connection";
import { users } from "./schema";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME?.trim() || "System Administrator";

if (!email || !password) {
  throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required");
}

if (password.length < 12) {
  throw new Error("ADMIN_PASSWORD must be at least 12 characters");
}

const db = getDb();
const passwordHash = await hashPassword(password);
const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);

if (existing[0]) {
  await db
    .update(users)
    .set({
      name,
      passwordHash,
      role: "admin",
      status: "active",
      lastSignInAt: new Date(),
    })
    .where(eq(users.id, existing[0].id));
  console.log(`Updated admin account: ${email}`);
} else {
  await db.insert(users).values({
    unionId: `admin:${email}`,
    name,
    email,
    passwordHash,
    role: "admin",
    status: "active",
    avatar: null,
    lastSignInAt: new Date(),
  });
  console.log(`Created admin account: ${email}`);
}
