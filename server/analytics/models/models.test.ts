import { describe, it, expect } from "vitest";
import { computeRfm, segmentDistribution } from "./rfm";
import { scoreChurn } from "./churn";
import { forecastDemand, densifySeries } from "./forecast";
import { buildRecommendations, recommendForBasket } from "./recommendations";

describe("RFM segmentation", () => {
  it("scores recent, frequent, high-value customers as Champions", () => {
    const cohort = Array.from({ length: 10 }, (_, i) => ({
      customerId: i + 1,
      recencyDays: i * 30, // 0..270
      frequency: 10 - i, // 10..1
      monetary: (10 - i) * 100,
    }));
    const scores = computeRfm(cohort);
    const best = scores.find(s => s.customerId === 1)!;
    expect(best.rScore).toBe(5);
    expect(best.fScore).toBe(5);
    expect(best.segment).toBe("Champions");
    expect(segmentDistribution(scores).reduce((s, d) => s + d.count, 0)).toBe(10);
  });

  it("handles an empty cohort", () => {
    expect(computeRfm([])).toEqual([]);
  });
});

describe("Churn scoring", () => {
  it("flags overdue single-purchase customers as higher risk than active repeat buyers", () => {
    const lapsed = scoreChurn({
      customerId: 1,
      recencyDays: 200,
      frequency: 1,
      monetary: 128,
      medianInterOrderDays: 60,
      tenureDays: 210,
    });
    const active = scoreChurn({
      customerId: 2,
      recencyDays: 20,
      frequency: 6,
      monetary: 900,
      medianInterOrderDays: 45,
      tenureDays: 400,
    });
    expect(lapsed.churnScore).toBeGreaterThan(active.churnScore);
    expect(lapsed.churnRisk).toBe("high");
    expect(active.churnRisk).toBe("low");
    expect(lapsed.factors.length).toBeGreaterThan(0); // explainable
  });

  it("keeps scores within [0,1]", () => {
    const r = scoreChurn({ customerId: 1, recencyDays: 5000, frequency: 1, monetary: 0, tenureDays: 1 });
    expect(r.churnScore).toBeGreaterThanOrEqual(0);
    expect(r.churnScore).toBeLessThanOrEqual(1);
  });
});

describe("Demand forecasting", () => {
  it("fills gaps in the series", () => {
    const dense = densifySeries([
      { date: "2026-01-01", units: 2 },
      { date: "2026-01-04", units: 5 },
    ]);
    expect(dense).toEqual([2, 0, 0, 5]);
  });

  it("recommends a reorder when cover is below target", () => {
    const points = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(2026, 0, i + 1).toISOString().slice(0, 10),
      units: 3,
    }));
    const f = forecastDemand("neurovectrix-core", points, { currentStock: 10, targetCoverDays: 45 });
    expect(f.avgDailyDemand).toBeGreaterThan(0);
    expect(f.reorderSuggested).toBe(true);
    expect(f.reorderQty).toBeGreaterThan(0);
  });

  it("does not recommend a reorder with ample stock", () => {
    const points = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(2026, 0, i + 1).toISOString().slice(0, 10),
      units: 1,
    }));
    const f = forecastDemand("dermashield", points, { currentStock: 1000, targetCoverDays: 45 });
    expect(f.reorderSuggested).toBe(false);
  });
});

describe("Recommendations", () => {
  it("learns co-purchase similarity and recommends complements", () => {
    const baskets = [
      ["a", "b"],
      ["a", "b"],
      ["a", "c"],
      ["b", "c"],
    ];
    const model = buildRecommendations(baskets);
    expect(model.similar["a"]).toBeDefined();
    const recs = recommendForBasket(model, ["a"], 2);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.find(r => r.slug === "a")).toBeUndefined(); // never recommend item already in basket
  });
});
