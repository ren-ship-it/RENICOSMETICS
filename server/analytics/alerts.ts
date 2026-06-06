/**
 * Proactive alerts engine.
 *
 * Derives prioritised, evidence-backed alerts from the aggregated business
 * snapshot. Every alert is grounded in a real figure (no fabrication) and
 * carries: what happened, why it matters, the evidence, a recommended action,
 * and an urgency level. The engine is pure given a snapshot, so it is easy to
 * schedule (cron / event hooks) and to unit test.
 */
import type { BusinessSnapshot } from "./sidekick";

export type AlertSeverity = "critical" | "high" | "medium" | "low";

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  whatHappened: string;
  whyItMatters: string;
  evidence: string;
  recommendedAction: string;
}

const SEVERITY_RANK: Record<AlertSeverity, number> = { critical: 0, high: 1, medium: 2, low: 3 };

export function deriveAlerts(s: BusinessSnapshot): Alert[] {
  const alerts: Alert[] = [];

  // ── Stock / fulfilment ──────────────────────────────────────────────────
  for (const f of s.forecast.filter(x => x.reorderSuggested).slice(0, 8)) {
    const critical = f.daysOfCover <= 7;
    alerts.push({
      id: `stock_${f.productSlug}`,
      severity: critical ? "critical" : "high",
      title: `Low stock cover: ${f.productSlug}`,
      whatHappened: `${f.productSlug} has only ${f.daysOfCover} days of stock cover at current demand.`,
      whyItMatters: "Stocking out loses revenue and pushes customers to the waitlist or competitors.",
      evidence: `Avg demand ~${f.avgDailyDemand}/day, current stock ${f.currentStock}, ${f.daysOfCover}d cover.`,
      recommendedAction: `Reorder approximately ${f.reorderQty} units to reach a 45-day cover window.`,
    });
  }

  if ((s.commerce.lowStockCount ?? 0) > 0 && !s.forecast.some(f => f.reorderSuggested)) {
    alerts.push({
      id: "low_stock_flag",
      severity: "medium",
      title: `${s.commerce.lowStockCount} product(s) below low-stock threshold`,
      whatHappened: "One or more products have dropped below their configured low-stock threshold.",
      whyItMatters: "Threshold breaches are an early warning before a stockout.",
      evidence: `${s.commerce.lowStockCount} item(s) flagged in inventory.`,
      recommendedAction: "Review the Products page and plan replenishment.",
    });
  }

  // ── Conversion / funnel ─────────────────────────────────────────────────
  if (s.cart.started >= 10 && s.cart.abandonmentRate >= 70) {
    alerts.push({
      id: "cart_abandonment_high",
      severity: s.cart.abandonmentRate >= 85 ? "high" : "medium",
      title: `Cart abandonment at ${s.cart.abandonmentRate}%`,
      whatHappened: `${s.cart.abandonmentRate}% of started checkouts did not complete.`,
      whyItMatters: "High abandonment usually signals checkout friction, unexpected costs, or trust gaps.",
      evidence: `${s.cart.started} checkouts started, ${s.cart.completed} completed (last ${s.windowDays}d).`,
      recommendedAction: "Audit the checkout for friction, surface shipping/returns earlier, and consider abandonment reminders (with marketing consent).",
    });
  }

  if (s.funnel && s.funnel.stages[0]!.visitors >= 30 && s.funnel.rates.viewToCart < 5) {
    alerts.push({
      id: "low_view_to_cart",
      severity: "medium",
      title: `Low view-to-cart rate (${s.funnel.rates.viewToCart}%)`,
      whatHappened: "Plenty of product views but few add-to-carts.",
      whyItMatters: "Indicates a product-page or pricing/clarity problem rather than a traffic problem.",
      evidence: `${s.funnel.stages[0]!.visitors} viewers → ${s.funnel.stages[1]!.visitors} add-to-cart.`,
      recommendedAction: "Strengthen product pages: results timelines, guarantee, mechanism clarity, trust signals.",
    });
  }

  // High views, low conversion at the product level
  const topViewSlugs = new Set(s.productEngagement.slice(0, 5).map(p => p.productSlug ?? ""));
  const soldSlugs = new Set((s.topProducts ?? []).map(p => p.productSlug ?? ""));
  for (const p of s.productEngagement.slice(0, 5)) {
    if (p.views >= 25 && p.productSlug && !soldSlugs.has(p.productSlug)) {
      alerts.push({
        id: `view_no_sale_${p.productSlug}`,
        severity: "medium",
        title: `High views, no recorded sales: ${p.productSlug}`,
        whatHappened: `${p.productSlug} is among the most-viewed products but has no sales in the top-sellers list.`,
        whyItMatters: "A strong interest signal that is not converting — often a quick win.",
        evidence: `${p.views} views from ${p.uniqueVisitors} unique visitors.`,
        recommendedAction: "Review price, imagery, stock availability and on-page reassurance for this product.",
      });
    }
  }
  void topViewSlugs;

  // ── Search demand gaps ──────────────────────────────────────────────────
  for (const z of s.search.zeroResults.slice(0, 3)) {
    if ((z.total ?? 0) >= 3) {
      alerts.push({
        id: `zero_search_${z.query}`,
        severity: "low",
        title: `Repeated zero-result search: "${z.query}"`,
        whatHappened: `Customers searched "${z.query}" with no results.`,
        whyItMatters: "Unmet demand or missing content/synonyms — a direct signal of what customers want.",
        evidence: `${z.total} searches returned nothing.`,
        recommendedAction: "Add a synonym/redirect, a matching product, or relevant content.",
      });
    }
  }

  // ── Retention ───────────────────────────────────────────────────────────
  if (s.churn.total >= 10 && s.churn.distribution.high / Math.max(1, s.churn.total) >= 0.3) {
    alerts.push({
      id: "churn_high_share",
      severity: "high",
      title: `${s.churn.distribution.high} customers at high churn risk`,
      whatHappened: "A meaningful share of customers are flagged at high churn risk.",
      whyItMatters: "Retaining an existing customer is far cheaper than acquiring a new one.",
      evidence: `High ${s.churn.distribution.high} / medium ${s.churn.distribution.medium} / low ${s.churn.distribution.low}.`,
      recommendedAction: "Plan a win-back flow for high-risk, consented customers (replenishment reminder + offer).",
    });
  }

  // ── Support ─────────────────────────────────────────────────────────────
  if (s.support.totalConversations >= 10) {
    const topTheme = s.support.themes.find(t => t.frequency > 0);
    if (topTheme && topTheme.frequency / s.support.totalConversations >= 0.25) {
      alerts.push({
        id: `support_theme_${topTheme.theme}`,
        severity: "low",
        title: `Recurring support theme: ${topTheme.theme}`,
        whatHappened: `"${topTheme.theme}" dominates recent support enquiries.`,
        whyItMatters: "A recurring question is a content/UX gap you can fix once to reduce future load.",
        evidence: `${topTheme.frequency} of ${s.support.totalConversations} conversations.`,
        recommendedAction: `Add or improve FAQ/help content for "${topTheme.theme}".`,
      });
    }
    if (s.support.escalationRate >= 25) {
      alerts.push({
        id: "support_escalation",
        severity: "medium",
        title: `Chat escalation rate ${s.support.escalationRate}%`,
        whatHappened: "A high share of chats are being escalated to the team.",
        whyItMatters: "Either the assistant lacks knowledge or genuine issues are spiking.",
        evidence: `${s.support.escalationRate}% of chats escalated.`,
        recommendedAction: "Review escalated chat logs and extend the assistant's knowledge base.",
      });
    }
  }

  // ── Data coverage (honesty) ─────────────────────────────────────────────
  if (!s.dataAvailability.behaviouralEvents) {
    alerts.push({
      id: "no_behavioural_data",
      severity: "low",
      title: "No behavioural analytics events recorded yet",
      whatHappened: "The behavioural event store is empty for this window.",
      whyItMatters: "Funnel, search and engagement insights need event data to be meaningful.",
      evidence: "0 events in the analytics store.",
      recommendedAction: "Confirm front-end tracking is live and that visitors have consented to analytics.",
    });
  }

  return alerts.sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
}
