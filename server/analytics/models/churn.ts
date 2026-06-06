/**
 * Predictive churn model.
 *
 * A transparent logistic-regression-style scorer over interpretable features.
 * We deliberately avoid an opaque black box: every score ships with the feature
 * contributions that produced it, so the decision can be explained and
 * contested (Privacy Act ADM reform readiness).
 *
 * churnScore ∈ [0,1] = probability the customer has lapsed / will not reorder.
 */

export const CHURN_MODEL_VERSION = "churn-logistic-1.0";

export interface ChurnFeatures {
  customerId: number;
  email?: string | null;
  recencyDays: number;
  frequency: number;
  monetary: number;
  /** Customer's own median gap between orders, when known. */
  medianInterOrderDays?: number | null;
  /** Days since first order. */
  tenureDays: number;
}

export interface ChurnFactor {
  feature: string;
  contribution: number; // signed log-odds contribution
  detail: string;
}

export interface ChurnResult {
  customerId: number;
  email?: string | null;
  churnScore: number; // 0..1
  churnRisk: "low" | "medium" | "high";
  factors: ChurnFactor[];
  modelVersion: string;
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

/**
 * Hand-calibrated coefficients. The dominant driver is recency measured against
 * the customer's own typical cadence: a customer who usually reorders every 60
 * days and hasn't in 180 is far more at-risk than the raw recency suggests.
 */
const COEFF = {
  intercept: -1.4,
  overdueRatio: 1.7, // (recency / expected cadence) - 1, clamped
  recencyNorm: 0.9, // recencyDays / 180, clamped
  lowFrequency: 0.8, // 1 if frequency <= 1
  freqInverse: -0.35, // more orders → less churn
  monetaryNorm: -0.3, // higher spend → less churn
  youngTenure: 0.4, // 1 if tenureDays < 30 (not yet habituated)
};

const DEFAULT_CADENCE_DAYS = 90; // assumed reorder cadence when unknown

export function scoreChurn(f: ChurnFeatures): ChurnResult {
  const cadence = f.medianInterOrderDays && f.medianInterOrderDays > 0
    ? f.medianInterOrderDays
    : DEFAULT_CADENCE_DAYS;

  const overdueRatio = Math.max(0, Math.min(3, f.recencyDays / cadence - 1));
  const recencyNorm = Math.max(0, Math.min(1, f.recencyDays / 180));
  const lowFrequency = f.frequency <= 1 ? 1 : 0;
  const freqInverse = Math.min(10, f.frequency);
  const monetaryNorm = Math.max(0, Math.min(1, f.monetary / 600));
  const youngTenure = f.tenureDays < 30 ? 1 : 0;

  const terms: ChurnFactor[] = [
    {
      feature: "overdue_vs_cadence",
      contribution: COEFF.overdueRatio * overdueRatio,
      detail: `${f.recencyDays}d since last order vs ~${Math.round(cadence)}d typical cadence`,
    },
    {
      feature: "recency",
      contribution: COEFF.recencyNorm * recencyNorm,
      detail: `${f.recencyDays} days since last purchase`,
    },
    {
      feature: "single_purchase",
      contribution: COEFF.lowFrequency * lowFrequency,
      detail: lowFrequency ? "Only one order placed" : "Repeat purchaser",
    },
    {
      feature: "order_count",
      contribution: COEFF.freqInverse * freqInverse,
      detail: `${f.frequency} lifetime orders`,
    },
    {
      feature: "monetary",
      contribution: COEFF.monetaryNorm * monetaryNorm,
      detail: `$${f.monetary.toFixed(0)} lifetime spend`,
    },
    {
      feature: "early_tenure",
      contribution: COEFF.youngTenure * youngTenure,
      detail: youngTenure ? "New relationship (<30 days)" : `Customer for ${f.tenureDays} days`,
    },
  ];

  const logit = COEFF.intercept + terms.reduce((s, t) => s + t.contribution, 0);
  const churnScore = Math.round(sigmoid(logit) * 10000) / 10000;
  const churnRisk: ChurnResult["churnRisk"] =
    churnScore >= 0.66 ? "high" : churnScore >= 0.4 ? "medium" : "low";

  // Surface the strongest contributing factors first (by absolute impact)
  const factors = terms
    .filter(t => Math.abs(t.contribution) > 0.01)
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  return { customerId: f.customerId, email: f.email, churnScore, churnRisk, factors, modelVersion: CHURN_MODEL_VERSION };
}

export function churnRiskDistribution(results: ChurnResult[]): {
  low: number;
  medium: number;
  high: number;
} {
  const dist = { low: 0, medium: 0, high: 0 };
  for (const r of results) dist[r.churnRisk]++;
  return dist;
}
