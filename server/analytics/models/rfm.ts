/**
 * RFM segmentation model.
 *
 * Recency / Frequency / Monetary scoring with quantile-based 1–5 scores and a
 * standard segment matrix. Pure functions — fed by server/analytics/insights.ts.
 */

export interface CustomerOrderSummary {
  customerId: number;
  email?: string | null;
  /** Days since the customer's most recent paid order. */
  recencyDays: number;
  /** Number of paid orders. */
  frequency: number;
  /** Total paid spend (AUD). */
  monetary: number;
}

export interface RfmScore extends CustomerOrderSummary {
  rScore: number; // 1 (worst recency) .. 5 (best)
  fScore: number;
  mScore: number;
  segment: RfmSegment;
}

export type RfmSegment =
  | "Champions"
  | "Loyal"
  | "Potential Loyalist"
  | "New Customer"
  | "Promising"
  | "Needs Attention"
  | "At Risk"
  | "Cannot Lose Them"
  | "Hibernating"
  | "Lost";

/** Quantile thresholds (4 cut points → 5 buckets) for an array of numbers. */
function quantileBreaks(values: number[]): [number, number, number, number] {
  const sorted = [...values].sort((a, b) => a - b);
  const q = (p: number) => {
    if (sorted.length === 0) return 0;
    const idx = Math.min(sorted.length - 1, Math.floor(p * sorted.length));
    return sorted[idx]!;
  };
  return [q(0.2), q(0.4), q(0.6), q(0.8)];
}

/** Score 1..5 where HIGHER input → HIGHER score. */
function scoreAscending(value: number, breaks: [number, number, number, number]): number {
  if (value <= breaks[0]) return 1;
  if (value <= breaks[1]) return 2;
  if (value <= breaks[2]) return 3;
  if (value <= breaks[3]) return 4;
  return 5;
}

/** Recency is inverted: LOWER days → HIGHER score. */
function scoreRecency(days: number, breaks: [number, number, number, number]): number {
  if (days <= breaks[0]) return 5;
  if (days <= breaks[1]) return 4;
  if (days <= breaks[2]) return 3;
  if (days <= breaks[3]) return 2;
  return 1;
}

function segmentFor(r: number, f: number, m: number): RfmSegment {
  const fm = Math.round((f + m) / 2);
  if (r >= 4 && fm >= 4) return "Champions";
  if (r >= 3 && fm >= 4) return "Loyal";
  if (r >= 4 && fm >= 2 && fm < 4) return "Potential Loyalist";
  if (r >= 4 && f <= 1) return "New Customer";
  if (r === 3 && fm <= 2) return "Promising";
  if (r === 3 && fm === 3) return "Needs Attention";
  if (r === 2 && fm >= 3) return "At Risk";
  if (r <= 2 && fm >= 4) return "Cannot Lose Them";
  if (r === 2 && fm <= 2) return "Hibernating";
  return "Lost";
}

export function computeRfm(customers: CustomerOrderSummary[]): RfmScore[] {
  if (customers.length === 0) return [];
  const rBreaks = quantileBreaks(customers.map(c => c.recencyDays));
  const fBreaks = quantileBreaks(customers.map(c => c.frequency));
  const mBreaks = quantileBreaks(customers.map(c => c.monetary));

  return customers.map(c => {
    const rScore = scoreRecency(c.recencyDays, rBreaks);
    const fScore = scoreAscending(c.frequency, fBreaks);
    const mScore = scoreAscending(c.monetary, mBreaks);
    return { ...c, rScore, fScore, mScore, segment: segmentFor(rScore, fScore, mScore) };
  });
}

/** Aggregate segment distribution for dashboards / Sidekick (non-identifying). */
export function segmentDistribution(scores: RfmScore[]): { segment: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const s of scores) counts[s.segment] = (counts[s.segment] ?? 0) + 1;
  return Object.entries(counts)
    .map(([segment, count]) => ({ segment, count }))
    .sort((a, b) => b.count - a.count);
}
