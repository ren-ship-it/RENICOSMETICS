/**
 * Demand forecasting model.
 *
 * Holt's linear method (double exponential smoothing) over a daily units-sold
 * series, with a moving-average fallback for short series. Produces a horizon
 * forecast, an average daily demand estimate, days-of-cover from current stock
 * and a reorder recommendation. Operates on AGGREGATE sales only — no identity.
 */

export const FORECAST_MODEL_VERSION = "forecast-holt-1.0";

export interface DemandPoint {
  date: string; // YYYY-MM-DD
  units: number;
}

export interface ForecastResult {
  productSlug: string;
  /** Smoothed estimate of average daily demand. */
  avgDailyDemand: number;
  /** Trend per day (units). Positive = accelerating demand. */
  dailyTrend: number;
  /** Total projected units over the horizon. */
  horizonDays: number;
  forecastUnits: number;
  /** Current stock and derived cover. */
  currentStock: number;
  daysOfCover: number;
  /** Suggested reorder so cover reaches the target window. */
  reorderSuggested: boolean;
  reorderQty: number;
  modelVersion: string;
}

/** Fill missing days with zeros so smoothing sees a continuous series. */
export function densifySeries(points: DemandPoint[]): number[] {
  if (points.length === 0) return [];
  const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));
  const out: number[] = [];
  let prev = new Date(sorted[0]!.date);
  const byDate = new Map(sorted.map(p => [p.date, p.units]));
  const last = new Date(sorted[sorted.length - 1]!.date);
  for (let d = prev; d <= last; d = new Date(d.getTime() + 86400000)) {
    const key = d.toISOString().slice(0, 10);
    out.push(byDate.get(key) ?? 0);
  }
  return out;
}

/** Holt's linear smoothing. Returns level + trend at the end of the series. */
function holt(series: number[], alpha = 0.4, beta = 0.2): { level: number; trend: number } {
  if (series.length === 0) return { level: 0, trend: 0 };
  if (series.length === 1) return { level: series[0]!, trend: 0 };
  let level = series[0]!;
  let trend = series[1]! - series[0]!;
  for (let i = 1; i < series.length; i++) {
    const prevLevel = level;
    level = alpha * series[i]! + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
  }
  return { level, trend };
}

export function forecastDemand(
  productSlug: string,
  points: DemandPoint[],
  opts: { horizonDays?: number; currentStock?: number; targetCoverDays?: number } = {},
): ForecastResult {
  const horizonDays = opts.horizonDays ?? 30;
  const currentStock = opts.currentStock ?? 0;
  const targetCoverDays = opts.targetCoverDays ?? 45;

  const series = densifySeries(points);
  let avgDailyDemand: number;
  let dailyTrend: number;

  if (series.length < 7) {
    // Too short for trend estimation — use simple mean
    const total = series.reduce((s, v) => s + v, 0);
    avgDailyDemand = series.length > 0 ? total / series.length : 0;
    dailyTrend = 0;
  } else {
    const { level, trend } = holt(series);
    avgDailyDemand = Math.max(0, level);
    dailyTrend = trend;
  }

  // Project horizon: integrate level + trend, never below zero per day
  let forecastUnits = 0;
  for (let d = 1; d <= horizonDays; d++) {
    forecastUnits += Math.max(0, avgDailyDemand + dailyTrend * d);
  }
  forecastUnits = Math.round(forecastUnits);

  const dailyForCover = Math.max(0.01, avgDailyDemand);
  const daysOfCover = Math.round(currentStock / dailyForCover);

  const projectedDemandToTarget = Math.round(
    Array.from({ length: targetCoverDays }, (_, i) =>
      Math.max(0, avgDailyDemand + dailyTrend * (i + 1)),
    ).reduce((s, v) => s + v, 0),
  );
  const reorderSuggested = daysOfCover < targetCoverDays && avgDailyDemand > 0;
  const reorderQty = reorderSuggested ? Math.max(0, projectedDemandToTarget - currentStock) : 0;

  return {
    productSlug,
    avgDailyDemand: Math.round(avgDailyDemand * 100) / 100,
    dailyTrend: Math.round(dailyTrend * 1000) / 1000,
    horizonDays,
    forecastUnits,
    currentStock,
    daysOfCover,
    reorderSuggested,
    reorderQty,
    modelVersion: FORECAST_MODEL_VERSION,
  };
}
