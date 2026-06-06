/**
 * Insights orchestrator.
 *
 * Pulls order/customer/product data, runs the model layer, and (for the
 * identified, automated-decision outputs) persists results to `customerInsights`
 * with an entry in `aiDecisionLog` for transparency. Aggregated read helpers
 * here are safe for Sidekick and the admin dashboard.
 */
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import {
  orders,
  orderItems,
  customers,
  products,
  customerInsights,
  aiDecisionLog,
} from "../../drizzle/schema";
import { computeRfm, segmentDistribution, type CustomerOrderSummary } from "./models/rfm";
import { scoreChurn, churnRiskDistribution, CHURN_MODEL_VERSION, type ChurnFeatures } from "./models/churn";
import { forecastDemand, type DemandPoint, type ForecastResult } from "./models/forecast";
import { buildRecommendations, type Basket, type RecommendationModel } from "./models/recommendations";

const DAY_MS = 86400000;

interface CustomerAgg {
  customerId: number;
  email: string;
  orderDates: Date[];
  monetary: number;
}

/** Build per-customer aggregates from paid orders. */
async function loadCustomerAggregates(): Promise<CustomerAgg[]> {
  const db = await getDb();
  if (!db) return [];
  const paidOrders = await db
    .select({
      customerId: orders.customerId,
      email: orders.customerEmail,
      total: orders.total,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.paymentStatus, "paid"));

  const customerRows = await db.select({ id: customers.id, email: customers.email }).from(customers);
  const idByEmail = new Map(customerRows.map(c => [c.email.toLowerCase(), c.id]));

  const byEmail = new Map<string, CustomerAgg>();
  for (const o of paidOrders) {
    if (!o.email) continue;
    const key = o.email.toLowerCase();
    const id = o.customerId ?? idByEmail.get(key) ?? 0;
    const agg = byEmail.get(key) ?? { customerId: id, email: o.email, orderDates: [], monetary: 0 };
    agg.orderDates.push(new Date(o.createdAt));
    agg.monetary += Number(o.total ?? 0);
    if (!agg.customerId && id) agg.customerId = id;
    byEmail.set(key, agg);
  }
  return Array.from(byEmail.values()).filter(a => a.customerId > 0);
}

function toSummary(a: CustomerAgg): CustomerOrderSummary & { tenureDays: number; medianInterOrderDays: number | null } {
  const dates = a.orderDates.sort((x, y) => x.getTime() - y.getTime());
  const now = Date.now();
  const recencyDays = Math.floor((now - dates[dates.length - 1]!.getTime()) / DAY_MS);
  const tenureDays = Math.floor((now - dates[0]!.getTime()) / DAY_MS);
  let medianInterOrderDays: number | null = null;
  if (dates.length >= 2) {
    const gaps: number[] = [];
    for (let i = 1; i < dates.length; i++) {
      gaps.push((dates[i]!.getTime() - dates[i - 1]!.getTime()) / DAY_MS);
    }
    gaps.sort((x, y) => x - y);
    medianInterOrderDays = gaps[Math.floor(gaps.length / 2)]!;
  }
  return {
    customerId: a.customerId,
    email: a.email,
    recencyDays,
    frequency: a.orderDates.length,
    monetary: a.monetary,
    tenureDays,
    medianInterOrderDays,
  };
}

/**
 * Recompute RFM + churn for every customer, persist to `customerInsights`, and
 * write a single batch entry to the AI decision log for ADM transparency.
 */
export async function recomputeCustomerInsights(): Promise<{ updated: number }> {
  const db = await getDb();
  if (!db) return { updated: 0 };
  const aggs = await loadCustomerAggregates();
  if (aggs.length === 0) return { updated: 0 };

  const summaries = aggs.map(toSummary);
  const rfm = computeRfm(summaries);
  const rfmByCustomer = new Map(rfm.map(r => [r.customerId, r]));

  let updated = 0;
  for (const s of summaries) {
    const r = rfmByCustomer.get(s.customerId)!;
    const churn = scoreChurn({
      customerId: s.customerId,
      email: s.email,
      recencyDays: s.recencyDays,
      frequency: s.frequency,
      monetary: s.monetary,
      medianInterOrderDays: s.medianInterOrderDays,
      tenureDays: s.tenureDays,
    } as ChurnFeatures);

    const predictedNextOrderDays = s.medianInterOrderDays
      ? Math.max(0, Math.round(s.medianInterOrderDays - s.recencyDays))
      : null;

    try {
      await db
        .insert(customerInsights)
        .values({
          customerId: s.customerId,
          email: s.email,
          recencyDays: s.recencyDays,
          frequency: s.frequency,
          monetary: String(s.monetary.toFixed(2)),
          rScore: r.rScore,
          fScore: r.fScore,
          mScore: r.mScore,
          segment: r.segment,
          churnScore: String(churn.churnScore),
          churnRisk: churn.churnRisk,
          ltv: String(s.monetary.toFixed(2)),
          predictedNextOrderDays,
          factors: churn.factors,
          modelVersion: churn.modelVersion,
        })
        .onDuplicateKeyUpdate({
          set: {
            email: s.email,
            recencyDays: s.recencyDays,
            frequency: s.frequency,
            monetary: String(s.monetary.toFixed(2)),
            rScore: r.rScore,
            fScore: r.fScore,
            mScore: r.mScore,
            segment: r.segment,
            churnScore: String(churn.churnScore),
            churnRisk: churn.churnRisk,
            ltv: String(s.monetary.toFixed(2)),
            predictedNextOrderDays,
            factors: churn.factors,
            modelVersion: churn.modelVersion,
            computedAt: new Date(),
          },
        });
      updated++;
    } catch (e) {
      console.warn("[Insights] failed to persist customer insight:", e);
    }
  }

  // ADM transparency: log the batch run, not each individual score
  try {
    await db.insert(aiDecisionLog).values({
      decisionType: "segmentation+churn",
      subjectType: "customer_cohort",
      subjectId: null,
      modelId: "rfm+churn",
      modelVersion: CHURN_MODEL_VERSION,
      disclosed: true,
      humanReviewable: true,
      inputsSummary: { customers: summaries.length, features: ["recency", "frequency", "monetary", "tenure", "cadence"] },
      output: { updated },
      explanation:
        "Batch recomputation of RFM segments and churn risk from paid order history. Scores are advisory inputs for marketing/retention; no automated action is taken without human review.",
    });
  } catch {
    /* non-blocking */
  }

  return { updated };
}

/** Aggregated segmentation view (safe for Sidekick). */
export async function getSegmentation() {
  const aggs = await loadCustomerAggregates();
  const rfm = computeRfm(aggs.map(toSummary));
  return {
    totalCustomers: rfm.length,
    distribution: segmentDistribution(rfm),
    // top-line averages only — no individual rows
    avgFrequency: rfm.length ? Math.round((rfm.reduce((s, r) => s + r.frequency, 0) / rfm.length) * 10) / 10 : 0,
    avgMonetary: rfm.length ? Math.round(rfm.reduce((s, r) => s + r.monetary, 0) / rfm.length) : 0,
  };
}

/** Aggregated churn view (safe for Sidekick). */
export async function getChurnOverview() {
  const aggs = await loadCustomerAggregates();
  const results = aggs.map(toSummary).map(s =>
    scoreChurn({
      customerId: s.customerId,
      email: s.email,
      recencyDays: s.recencyDays,
      frequency: s.frequency,
      monetary: s.monetary,
      medianInterOrderDays: s.medianInterOrderDays,
      tenureDays: s.tenureDays,
    } as ChurnFeatures),
  );
  return {
    total: results.length,
    distribution: churnRiskDistribution(results),
    avgChurnScore: results.length
      ? Math.round((results.reduce((s, r) => s + r.churnScore, 0) / results.length) * 1000) / 1000
      : 0,
  };
}

/**
 * Identified at-risk list. This is an IDENTIFIED read and must only be exposed
 * through an admin-gated procedure, never to Sidekick's aggregated context.
 */
export async function getAtRiskCustomers(limit = 25) {
  const aggs = await loadCustomerAggregates();
  return aggs
    .map(toSummary)
    .map(s => ({
      summary: s,
      churn: scoreChurn({
        customerId: s.customerId,
        email: s.email,
        recencyDays: s.recencyDays,
        frequency: s.frequency,
        monetary: s.monetary,
        medianInterOrderDays: s.medianInterOrderDays,
        tenureDays: s.tenureDays,
      } as ChurnFeatures),
    }))
    .filter(x => x.churn.churnRisk !== "low")
    .sort((a, b) => b.churn.churnScore - a.churn.churnScore)
    .slice(0, limit)
    .map(x => ({
      customerId: x.summary.customerId,
      email: x.summary.email,
      recencyDays: x.summary.recencyDays,
      frequency: x.summary.frequency,
      monetary: Math.round(x.summary.monetary),
      churnScore: x.churn.churnScore,
      churnRisk: x.churn.churnRisk,
      topFactor: x.churn.factors[0]?.detail ?? "",
    }));
}

/** Per-product demand forecast from paid order line items. */
export async function getForecasts(horizonDays = 30): Promise<ForecastResult[]> {
  const db = await getDb();
  if (!db) return [];
  const paidOrders = await db
    .select({ id: orders.id, createdAt: orders.createdAt })
    .from(orders)
    .where(eq(orders.paymentStatus, "paid"));
  const orderDate = new Map(paidOrders.map(o => [o.id, new Date(o.createdAt)]));
  const items = await db
    .select({ orderId: orderItems.orderId, slug: orderItems.productSlug, qty: orderItems.quantity })
    .from(orderItems);
  const prods = await db
    .select({ slug: products.slug, stock: products.stockQty })
    .from(products);
  const stockBySlug = new Map(prods.map(p => [p.slug, p.stock ?? 0]));

  // Build per-slug daily series
  const seriesBySlug = new Map<string, Map<string, number>>();
  for (const it of items) {
    if (!it.slug) continue;
    const date = orderDate.get(it.orderId);
    if (!date) continue; // unpaid / unknown order
    const day = date.toISOString().slice(0, 10);
    const m = seriesBySlug.get(it.slug) ?? new Map<string, number>();
    m.set(day, (m.get(day) ?? 0) + (it.qty ?? 0));
    seriesBySlug.set(it.slug, m);
  }

  const results: ForecastResult[] = [];
  for (const [slug, m] of Array.from(seriesBySlug.entries())) {
    const points: DemandPoint[] = Array.from(m.entries()).map(([date, units]) => ({ date, units }));
    results.push(
      forecastDemand(slug, points, {
        horizonDays,
        currentStock: stockBySlug.get(slug) ?? 0,
        targetCoverDays: 45,
      }),
    );
  }
  // Products with no sales history still get a baseline entry
  for (const p of prods) {
    if (!seriesBySlug.has(p.slug)) {
      results.push(forecastDemand(p.slug, [], { horizonDays, currentStock: p.stock ?? 0 }));
    }
  }
  return results.sort((a, b) => Number(b.reorderSuggested) - Number(a.reorderSuggested) || a.daysOfCover - b.daysOfCover);
}

/** Build the recommendation model from paid-order baskets. */
export async function getRecommendationModel(): Promise<RecommendationModel> {
  const db = await getDb();
  if (!db) return { similar: {}, modelVersion: "reco-itemcf-1.0" };
  const paid = await db.select({ id: orders.id }).from(orders).where(eq(orders.paymentStatus, "paid"));
  const paidIds = new Set(paid.map(o => o.id));
  const items = await db
    .select({ orderId: orderItems.orderId, slug: orderItems.productSlug })
    .from(orderItems);
  const basketMap = new Map<number, string[]>();
  for (const it of items) {
    if (!it.slug || !paidIds.has(it.orderId)) continue;
    const arr = basketMap.get(it.orderId) ?? [];
    arr.push(it.slug);
    basketMap.set(it.orderId, arr);
  }
  const baskets: Basket[] = Array.from(basketMap.values());
  return buildRecommendations(baskets);
}
