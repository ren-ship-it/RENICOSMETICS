/**
 * Sidekick — aggregated business-intelligence service.
 *
 * Assembles a single, AGGREGATED snapshot of the business for the admin AI
 * assistant and dashboard. By construction this never returns individual
 * customer rows (requirement 6): segmentation and churn are distributions, not
 * people. Identified reads (e.g. a specific at-risk customer list) live behind
 * separate admin-only procedures, not here.
 */
import * as db from "../db";
import {
  conversionFunnel,
  cartAbandonment,
  topSearches,
  topViewedProducts,
  deviceBreakdown,
  sessionMetrics,
  waitlistDemand,
  supportTrends,
  consentSummary,
  eventCounts,
} from "./queries";
import { getSegmentation, getChurnOverview, getForecasts } from "./insights";

export interface BusinessSnapshot {
  generatedAt: string;
  windowDays: number;
  commerce: Awaited<ReturnType<typeof db.getDashboardStats>>;
  revenueByDay: Awaited<ReturnType<typeof db.getRevenueByDay>>;
  topProducts: Awaited<ReturnType<typeof db.getTopProducts>>;
  funnel: Awaited<ReturnType<typeof conversionFunnel>>;
  cart: Awaited<ReturnType<typeof cartAbandonment>>;
  search: Awaited<ReturnType<typeof topSearches>>;
  productEngagement: Awaited<ReturnType<typeof topViewedProducts>>;
  devices: Awaited<ReturnType<typeof deviceBreakdown>>;
  sessions: Awaited<ReturnType<typeof sessionMetrics>>;
  waitlist: Awaited<ReturnType<typeof waitlistDemand>>;
  support: Awaited<ReturnType<typeof supportTrends>>;
  segmentation: Awaited<ReturnType<typeof getSegmentation>>;
  churn: Awaited<ReturnType<typeof getChurnOverview>>;
  forecast: Awaited<ReturnType<typeof getForecasts>>;
  consent: Awaited<ReturnType<typeof consentSummary>>;
  events: Awaited<ReturnType<typeof eventCounts>>;
  /** Which data sources actually returned data, so the AI can be honest about gaps. */
  dataAvailability: Record<string, boolean>;
}

/** Build the full aggregated snapshot. */
export async function buildSnapshot(windowDays = 30): Promise<BusinessSnapshot> {
  const [
    commerce,
    revenueByDay,
    topProducts,
    funnel,
    cart,
    search,
    productEngagement,
    devices,
    sessions,
    waitlist,
    support,
    segmentation,
    churn,
    forecast,
    consent,
    events,
  ] = await Promise.all([
    db.getDashboardStats(),
    db.getRevenueByDay(windowDays),
    db.getTopProducts(8),
    conversionFunnel(windowDays),
    cartAbandonment(windowDays),
    topSearches(windowDays),
    topViewedProducts(windowDays),
    deviceBreakdown(windowDays),
    sessionMetrics(windowDays),
    waitlistDemand(),
    supportTrends(90),
    getSegmentation(),
    getChurnOverview(),
    getForecasts(30),
    consentSummary(90),
    eventCounts(windowDays),
  ]);

  const dataAvailability = {
    orders: (commerce?.totalOrders ?? 0) > 0,
    behaviouralEvents: (events?.length ?? 0) > 0,
    funnel: !!funnel && funnel.stages.some(s => s.visitors > 0),
    search: (search?.top?.length ?? 0) > 0,
    customers: (commerce?.totalCustomers ?? 0) > 0,
    support: (support?.totalConversations ?? 0) > 0,
  };

  return {
    generatedAt: new Date().toISOString(),
    windowDays,
    commerce,
    revenueByDay,
    topProducts,
    funnel,
    cart,
    search,
    productEngagement,
    devices,
    sessions,
    waitlist,
    support,
    segmentation,
    churn,
    forecast,
    consent,
    events,
    dataAvailability,
  };
}

/**
 * Compact, factual text digest of the snapshot for grounding the admin AI.
 * Every line is a verified figure pulled from the database. The assistant is
 * instructed to answer ONLY from this context and to say so when data is
 * missing — it must not invent numbers.
 */
export function snapshotToContext(s: BusinessSnapshot): string {
  const lines: string[] = [];
  const n = (v: unknown) => (v === null || v === undefined ? "n/a" : String(v));

  lines.push(`# Reni Cosmetics — Business Snapshot (last ${s.windowDays} days)`);
  lines.push(`Generated: ${s.generatedAt}`);
  lines.push("");
  lines.push("## Commerce (all-time)");
  lines.push(
    `Revenue (paid): $${n(s.commerce.totalRevenue)} | Orders: ${n(s.commerce.totalOrders)} | Customers: ${n(s.commerce.totalCustomers)} | Products: ${n(s.commerce.totalProducts)} | Pending orders: ${n(s.commerce.pendingOrders)} | Low-stock items: ${n(s.commerce.lowStockCount)}`,
  );

  if (s.topProducts.length) {
    lines.push("");
    lines.push("## Top products by units sold");
    for (const p of s.topProducts) {
      lines.push(`- ${p.productName}: ${n(p.totalQty)} units, $${n(p.totalRevenue)} revenue`);
    }
  }

  if (s.funnel && s.funnel.stages.some(st => st.visitors > 0)) {
    lines.push("");
    lines.push("## Conversion funnel (unique visitors)");
    for (const st of s.funnel.stages) lines.push(`- ${st.step}: ${st.visitors}`);
    lines.push(
      `Rates: view→cart ${s.funnel.rates.viewToCart}%, cart→checkout ${s.funnel.rates.cartToCheckout}%, checkout→purchase ${s.funnel.rates.checkoutToPurchase}%, overall ${s.funnel.rates.overall}%`,
    );
  }

  lines.push("");
  lines.push(
    `## Cart: ${s.cart.started} checkouts started, ${s.cart.completed} completed, abandonment ${s.cart.abandonmentRate}%`,
  );
  lines.push(
    `## Sessions: ${s.sessions.sessions} sessions, avg ${s.sessions.avgDurationSec}s, ${s.sessions.avgPageViews} pages/session`,
  );

  if (s.search.top.length) {
    lines.push("");
    lines.push("## Top searches: " + s.search.top.map(t => `${t.query} (${t.total})`).join(", "));
    if (s.search.zeroResults.length)
      lines.push("Zero-result searches: " + s.search.zeroResults.map(t => `${t.query} (${t.total})`).join(", "));
  }

  if (s.productEngagement.length) {
    lines.push("");
    lines.push("## Most-viewed products");
    for (const p of s.productEngagement) lines.push(`- ${p.productSlug}: ${p.views} views, ${p.uniqueVisitors} unique`);
  }

  lines.push("");
  lines.push("## Customer segments (aggregate): " + (s.segmentation.distribution.map(d => `${d.segment} ${d.count}`).join(", ") || "no data"));
  lines.push(
    `## Churn risk (aggregate): low ${s.churn.distribution.low}, medium ${s.churn.distribution.medium}, high ${s.churn.distribution.high}; avg score ${s.churn.avgChurnScore}`,
  );

  const reorder = s.forecast.filter(f => f.reorderSuggested);
  if (reorder.length) {
    lines.push("");
    lines.push("## Stock — reorder suggested (demand forecast)");
    for (const f of reorder.slice(0, 10))
      lines.push(`- ${f.productSlug}: ~${f.avgDailyDemand}/day, ${f.daysOfCover}d cover, suggest reorder ${f.reorderQty}`);
  }

  if (s.support.totalConversations) {
    lines.push("");
    lines.push(
      `## Support themes (90d, ${s.support.totalConversations} conversations, ${s.support.escalationRate}% escalated): ` +
        s.support.themes.filter(t => t.frequency > 0).map(t => `${t.theme} ${t.frequency}`).join(", "),
    );
  }

  lines.push("");
  lines.push("## Consent (90d): " + `${s.consent.total} records — analytics ${s.consent.analytics}, marketing ${s.consent.marketing}, personalisation ${s.consent.personalisation}`);

  lines.push("");
  lines.push("## Data availability (true = data present): " + JSON.stringify(s.dataAvailability));

  return lines.join("\n");
}
