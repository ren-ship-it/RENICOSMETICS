/**
 * Data access for customer authentication. Thin wrappers over Drizzle so the
 * auth router stays focused on flow + policy.
 */
import { and, eq, gt, isNull, desc } from "drizzle-orm";
import { getDb, getCustomerByEmail, getCustomerById } from "../db";
import {
  customers,
  passwordResetTokens,
  authAuditLog,
  type Customer,
  type InsertAuthAuditLog,
} from "../../drizzle/schema";

export { getCustomerByEmail, getCustomerById };

export async function createCustomerWithPassword(data: {
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  acceptsMarketing?: boolean;
}): Promise<Customer | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(customers).values({
    email: data.email,
    passwordHash: data.passwordHash,
    firstName: data.firstName,
    lastName: data.lastName,
    acceptsMarketing: data.acceptsMarketing ?? false,
  });
  return getCustomerByEmail(data.email);
}

/** Claim an existing guest record (no password) by setting its password. */
export async function setCustomerPassword(customerId: number, passwordHash: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(customers).set({ passwordHash, updatedAt: new Date() }).where(eq(customers.id, customerId));
}

export async function touchLogin(customerId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(customers).set({ lastLoginAt: new Date() }).where(eq(customers.id, customerId));
}

export async function updateCustomerProfile(
  customerId: number,
  data: Partial<Pick<Customer, "firstName" | "lastName" | "phone" | "address" | "suburb" | "state" | "postcode">>,
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(customers).set({ ...data, updatedAt: new Date() }).where(eq(customers.id, customerId));
}

export async function setMarketingConsent(customerId: number, accepts: boolean): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(customers).set({ acceptsMarketing: accepts, updatedAt: new Date() }).where(eq(customers.id, customerId));
}

export async function createResetToken(customerId: number, tokenHash: string, expiresAt: Date): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(passwordResetTokens).values({ customerId, tokenHash, expiresAt });
}

/** Return a valid (unused, unexpired) reset token row by its hash, or undefined. */
export async function getValidResetToken(tokenHash: string) {
  const db = await getDb();
  if (!db) return undefined;
  const [row] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);
  return row;
}

export async function markResetTokenUsed(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, id));
}

export async function auditAuth(entry: InsertAuthAuditLog): Promise<void> {
  const db = await getDb();
  if (!db) return;
  try {
    await db.insert(authAuditLog).values(entry);
  } catch (e) {
    console.warn("[Auth] audit log failed:", e);
  }
}

export async function recentAuthEvents(customerId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(authAuditLog)
    .where(eq(authAuditLog.actorId, String(customerId)))
    .orderBy(desc(authAuditLog.createdAt))
    .limit(limit);
}
