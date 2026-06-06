/**
 * Analytics data access: pseudonymised event ingestion + aggregation queries.
 *
 * Every read here returns AGGREGATED, non-identifying results suitable for
 * Sidekick and the admin intelligence dashboard. Identified reads live in the
 * model layer (server/analytics/models/*) and are gated separately.
 */
import { and, desc, eq, gte, sql, count, sum } from "drizzle-orm";
import { getDb } from "../db";
import {
  analyticsEvents,
  consentRecords,
  chatLogs,
  contactMessages,
  waitlist,
  type InsertAnalyticsEvent,
  type InsertConsentRecord,
} from "../../drizzle/schema";

// ─── Writes ─────────────────────────────────────────────────────────────────

export async function insertEvent(event: InsertAnalyticsEvent): Promise<void> {
  const db = await getDb();
  if (!db) return; // non-blocking: never break the UX over analytics
  try {
    await db.insert(analyticsEvents).values(event);
  } catch (e) {
    console.warn("[Analytics] insertEvent failed:", e);
  }
}

export async function insertConsent(record: InsertConsentRecord): Promise<void> {
  const db = await getDb();
  if (!db) return;
  try {
    await db.insert(consentRecords).values(record);
  } catch (e) {
    console.warn("[Analytics] insertConsent failed:", e);
  }
}

// ─── Aggregated reads ───────────────────────────────────────────────────────

function sinceDate(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

/** Counts of each event type over the window. */
export async function eventCounts(days = 30) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ eventType: analyticsEvents.eventType, total: count() })
    .from(analyticsEvents)
    .where(gte(analyticsEvents.createdAt, sinceDate(days)))
    .groupBy(analyticsEvents.eventType)
    .orderBy(desc(count()));
}

/** Conversion funnel: unique visitors at each stage + step conversion rates. */
export async function conversionFunnel(days = 30) {
  const db = await getDb();
  if (!db) return null;
  const since = sinceDate(days);
  const stage = async (eventType: string) => {
    const [row] = await db
      .select({ visitors: sql<number>`COUNT(DISTINCT ${analyticsEvents.visitorId})` })
      .from(analyticsEvents)
      .where(and(gte(analyticsEvents.createdAt, since), eq(analyticsEvents.eventType, eventType)));
    return Number(row?.visitors ?? 0);
  };
  const view = await stage("view_item");
  const addToCart = await stage("add_to_cart");
  const beginCheckout = await stage("begin_checkout");
  const purchase = await stage("purchase");
  const rate = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0);
  return {
    stages: [
      { step: "Product view", visitors: view },
      { step: "Add to cart", visitors: addToCart },
      { step: "Begin checkout", visitors: beginCheckout },
      { step: "Purchase", visitors: purchase },
    ],
    rates: {
      viewToCart: rate(addToCart, view),
      cartToCheckout: rate(beginCheckout, addToCart),
      checkoutToPurchase: rate(purchase, beginCheckout),
      overall: rate(purchase, view),
    },
  };
}

/** Cart abandonment rate over the window. */
export async function cartAbandonment(days = 30) {
  const db = await getDb();
  if (!db) return { started: 0, completed: 0, abandonmentRate: 0 };
  const since = sinceDate(days);
  const distinct = async (eventType: string) => {
    const [row] = await db
      .select({ v: sql<number>`COUNT(DISTINCT ${analyticsEvents.sessionId})` })
      .from(analyticsEvents)
      .where(and(gte(analyticsEvents.createdAt, since), eq(analyticsEvents.eventType, eventType)));
    return Number(row?.v ?? 0);
  };
  const started = await distinct("begin_checkout");
  const completed = await distinct("purchase");
  const abandoned = Math.max(0, started - completed);
  return {
    started,
    completed,
    abandonmentRate: started > 0 ? Math.round((abandoned / started) * 1000) / 10 : 0,
  };
}

/** Top search queries, including a zero-result list to surface demand gaps. */
export async function topSearches(days = 30, limit = 20) {
  const db = await getDb();
  if (!db) return { top: [], zeroResults: [] };
  const since = sinceDate(days);
  const top = await db
    .select({ query: analyticsEvents.searchQuery, total: count() })
    .from(analyticsEvents)
    .where(and(gte(analyticsEvents.createdAt, since), eq(analyticsEvents.eventType, "search")))
    .groupBy(analyticsEvents.searchQuery)
    .orderBy(desc(count()))
    .limit(limit);
  const zeroResults = await db
    .select({ query: analyticsEvents.searchQuery, total: count() })
    .from(analyticsEvents)
    .where(
      and(gte(analyticsEvents.createdAt, since), eq(analyticsEvents.eventType, "search_no_results")),
    )
    .groupBy(analyticsEvents.searchQuery)
    .orderBy(desc(count()))
    .limit(limit);
  return { top, zeroResults };
}

/** Most-viewed products (pseudonymised engagement). */
export async function topViewedProducts(days = 30, limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      productSlug: analyticsEvents.productSlug,
      views: count(),
      uniqueVisitors: sql<number>`COUNT(DISTINCT ${analyticsEvents.visitorId})`,
    })
    .from(analyticsEvents)
    .where(and(gte(analyticsEvents.createdAt, sinceDate(days)), eq(analyticsEvents.eventType, "view_item")))
    .groupBy(analyticsEvents.productSlug)
    .orderBy(desc(count()))
    .limit(limit);
}

/** Device / browser / OS / geo breakdowns. */
export async function deviceBreakdown(days = 30) {
  const db = await getDb();
  if (!db) return { device: [], browser: [], os: [], country: [] };
  const since = sinceDate(days);
  const grp = (col: any) =>
    db
      .select({ key: col, total: sql<number>`COUNT(DISTINCT ${analyticsEvents.visitorId})` })
      .from(analyticsEvents)
      .where(gte(analyticsEvents.createdAt, since))
      .groupBy(col)
      .orderBy(desc(sql`COUNT(DISTINCT ${analyticsEvents.visitorId})`))
      .limit(15);
  return {
    device: await grp(analyticsEvents.deviceType),
    browser: await grp(analyticsEvents.browser),
    os: await grp(analyticsEvents.os),
    country: await grp(analyticsEvents.country),
  };
}

/** Session metrics: sessions, avg duration, avg pages per session. */
export async function sessionMetrics(days = 30) {
  const db = await getDb();
  if (!db) return { sessions: 0, avgDurationSec: 0, avgPageViews: 0 };
  const since = sinceDate(days);
  const [sessionsRow] = await db
    .select({ sessions: sql<number>`COUNT(DISTINCT ${analyticsEvents.sessionId})` })
    .from(analyticsEvents)
    .where(gte(analyticsEvents.createdAt, since));
  const [pvRow] = await db
    .select({ pv: count() })
    .from(analyticsEvents)
    .where(and(gte(analyticsEvents.createdAt, since), eq(analyticsEvents.eventType, "page_view")));
  const [durRow] = await db
    .select({ totalMs: sum(analyticsEvents.durationMs) })
    .from(analyticsEvents)
    .where(and(gte(analyticsEvents.createdAt, since), eq(analyticsEvents.eventType, "session_end")));
  const sessions = Number(sessionsRow?.sessions ?? 0);
  const pageViews = Number(pvRow?.pv ?? 0);
  const totalDurSec = Number(durRow?.totalMs ?? 0) / 1000;
  return {
    sessions,
    avgDurationSec: sessions > 0 ? Math.round(totalDurSec / sessions) : 0,
    avgPageViews: sessions > 0 ? Math.round((pageViews / sessions) * 10) / 10 : 0,
  };
}

/** Waitlist demand by product. */
export async function waitlistDemand(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      productSlug: waitlist.productSlug,
      productName: waitlist.productName,
      signups: count(),
    })
    .from(waitlist)
    .groupBy(waitlist.productSlug, waitlist.productName)
    .orderBy(desc(count()))
    .limit(limit);
}

/**
 * Support trends — keyword theming across chat logs + contact messages.
 * Aggregated only: returns theme → frequency, plus escalation rate. The themes
 * are a fixed taxonomy so no free-text leaves the aggregation.
 */
const SUPPORT_THEMES: Record<string, RegExp> = {
  shipping: /\b(ship|shipping|delivery|deliver|track|tracking|dispatch|postage)\b/i,
  returns: /\b(return|refund|exchange|money back|guarantee)\b/i,
  ingredients: /\b(ingredient|inci|peptide|argireline|snap-?8|allerg|sensitiv)\b/i,
  pricing: /\b(price|cost|discount|promo|code|expensive|afterpay)\b/i,
  stock: /\b(stock|sold out|out of stock|available|restock|waitlist)\b/i,
  usage: /\b(how to|apply|routine|layer|order|use|morning|night|am|pm)\b/i,
  order_status: /\b(order|where is|status|haven'?t received|missing)\b/i,
  account: /\b(account|login|password|email|unsubscribe)\b/i,
};

export async function supportTrends(days = 90) {
  const db = await getDb();
  if (!db) return { themes: [], escalationRate: 0, totalConversations: 0 };
  const since = sinceDate(days);
  const chats = await db
    .select({ msg: chatLogs.userMessage, escalated: chatLogs.escalated })
    .from(chatLogs)
    .where(gte(chatLogs.createdAt, since));
  const contacts = await db
    .select({ msg: contactMessages.message, subject: contactMessages.subject })
    .from(contactMessages)
    .where(gte(contactMessages.createdAt, since));

  const counts: Record<string, number> = {};
  for (const key of Object.keys(SUPPORT_THEMES)) counts[key] = 0;
  const tally = (text: string) => {
    for (const [theme, re] of Object.entries(SUPPORT_THEMES)) {
      if (re.test(text)) counts[theme]!++;
    }
  };
  let escalated = 0;
  for (const c of chats) {
    tally(c.msg ?? "");
    if (c.escalated) escalated++;
  }
  for (const c of contacts) tally(`${c.subject ?? ""} ${c.msg ?? ""}`);

  const totalConversations = chats.length + contacts.length;
  const themes = Object.entries(counts)
    .map(([theme, freq]) => ({ theme, frequency: freq }))
    .sort((a, b) => b.frequency - a.frequency);
  return {
    themes,
    escalationRate: chats.length > 0 ? Math.round((escalated / chats.length) * 1000) / 10 : 0,
    totalConversations,
  };
}

/** Consent ledger summary — opt-in rates for each category over the window. */
export async function consentSummary(days = 90) {
  const db = await getDb();
  if (!db) return { total: 0, analytics: 0, marketing: 0, personalisation: 0 };
  const since = sinceDate(days);
  const [row] = await db
    .select({
      total: count(),
      analytics: sql<number>`SUM(CASE WHEN ${consentRecords.analytics} THEN 1 ELSE 0 END)`,
      marketing: sql<number>`SUM(CASE WHEN ${consentRecords.marketing} THEN 1 ELSE 0 END)`,
      personalisation: sql<number>`SUM(CASE WHEN ${consentRecords.personalisation} THEN 1 ELSE 0 END)`,
    })
    .from(consentRecords)
    .where(gte(consentRecords.createdAt, since));
  return {
    total: Number(row?.total ?? 0),
    analytics: Number(row?.analytics ?? 0),
    marketing: Number(row?.marketing ?? 0),
    personalisation: Number(row?.personalisation ?? 0),
  };
}
