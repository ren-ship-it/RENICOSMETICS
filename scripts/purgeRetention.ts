/**
 * Data retention purge — deletes data past its retention window.
 *
 * Usage: pnpm purge:retention   (run on a schedule, e.g. daily cron)
 *
 * Honours the per-module retention windows declared in the analytics registry,
 * plus sensible cleanup of expired auth tokens. Consent records and the AI
 * decision log are RETAINED as accountability/audit trails.
 */
import "dotenv/config";
import { lt, and, inArray, isNotNull } from "drizzle-orm";
import { getDb } from "../server/db";
import { analyticsEvents, chatLogs, passwordResetTokens } from "../drizzle/schema";
import { ANALYTICS_MODULES } from "../shared/analytics/registry";

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }
  const db = await getDb();
  if (!db) {
    console.error("Database unavailable.");
    process.exit(1);
  }

  // 1) Pseudonymised behavioural events — per-module retention.
  for (const m of ANALYTICS_MODULES) {
    if (!m.retentionDays || m.eventTypes.length === 0) continue;
    const cutoff = daysAgo(m.retentionDays);
    const res: any = await db
      .delete(analyticsEvents)
      .where(and(lt(analyticsEvents.createdAt, cutoff), inArray(analyticsEvents.eventType, m.eventTypes)));
    console.log(`events[${m.id}] older than ${m.retentionDays}d purged`, res?.rowsAffected ?? "");
  }

  // 2) Chat logs — 730 days (matches ai_chat_interactions retention).
  await db.delete(chatLogs).where(lt(chatLogs.createdAt, daysAgo(730)));
  console.log("chatLogs older than 730d purged");

  // 3) Expired/used password reset tokens (security hygiene).
  await db.delete(passwordResetTokens).where(lt(passwordResetTokens.expiresAt, new Date()));
  await db.delete(passwordResetTokens).where(isNotNull(passwordResetTokens.usedAt));
  console.log("expired/used reset tokens purged");

  console.log("Retention purge complete.");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
