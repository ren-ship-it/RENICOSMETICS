/**
 * AI / Automated-decision transparency logger.
 *
 * Writes to `aiDecisionLog` so every AI-generated output or automated decision
 * (chat replies, churn scores, recommendations, admin BI answers) leaves an
 * auditable trail. This prepares the platform for the Privacy Act reform
 * requirements on ADM disclosure and contestability. Always non-blocking.
 */
import { getDb } from "../db";
import { aiDecisionLog, type InsertAiDecisionLog } from "../../drizzle/schema";

export async function logAiDecision(entry: InsertAiDecisionLog): Promise<void> {
  const db = await getDb();
  if (!db) return;
  try {
    await db.insert(aiDecisionLog).values(entry);
  } catch (e) {
    console.warn("[AI] failed to log decision:", e);
  }
}
