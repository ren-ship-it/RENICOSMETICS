/**
 * Product recommendation model.
 *
 * Item-to-item collaborative filtering from co-occurrence baskets (orders and,
 * optionally, co-viewed products). Similarity uses cosine over co-occurrence
 * counts, which works well for the small, curated Reni catalogue. Builds on
 * AGGREGATE co-occurrence, not individual profiles.
 */

export const RECO_MODEL_VERSION = "reco-itemcf-1.0";

/** A basket is the set of distinct product slugs that appeared together. */
export type Basket = string[];

export interface ItemSimilarity {
  slug: string;
  score: number; // cosine similarity 0..1
  coCount: number; // raw co-occurrence count
}

export interface RecommendationModel {
  /** slug → ranked list of similar slugs */
  similar: Record<string, ItemSimilarity[]>;
  modelVersion: string;
}

export function buildRecommendations(baskets: Basket[], topN = 5): RecommendationModel {
  const itemCount: Record<string, number> = {};
  const pairCount: Record<string, Record<string, number>> = {};

  for (const raw of baskets) {
    const items = Array.from(new Set(raw.filter(Boolean)));
    for (const a of items) {
      itemCount[a] = (itemCount[a] ?? 0) + 1;
      pairCount[a] ??= {};
      for (const b of items) {
        if (a === b) continue;
        pairCount[a]![b] = (pairCount[a]![b] ?? 0) + 1;
      }
    }
  }

  const similar: Record<string, ItemSimilarity[]> = {};
  for (const a of Object.keys(pairCount)) {
    const scored: ItemSimilarity[] = [];
    for (const [b, co] of Object.entries(pairCount[a]!)) {
      const denom = Math.sqrt((itemCount[a] ?? 1) * (itemCount[b] ?? 1));
      const score = denom > 0 ? co / denom : 0;
      scored.push({ slug: b, score: Math.round(score * 1000) / 1000, coCount: co });
    }
    scored.sort((x, y) => y.score - x.score || y.coCount - x.coCount);
    similar[a] = scored.slice(0, topN);
  }

  return { similar, modelVersion: RECO_MODEL_VERSION };
}

/** Recommend items to complement a given set of slugs (e.g. current cart). */
export function recommendForBasket(
  model: RecommendationModel,
  basket: string[],
  limit = 4,
): ItemSimilarity[] {
  const inBasket = new Set(basket);
  const agg: Record<string, { score: number; coCount: number }> = {};
  for (const slug of basket) {
    for (const sim of model.similar[slug] ?? []) {
      if (inBasket.has(sim.slug)) continue;
      agg[sim.slug] ??= { score: 0, coCount: 0 };
      agg[sim.slug]!.score += sim.score;
      agg[sim.slug]!.coCount += sim.coCount;
    }
  }
  return Object.entries(agg)
    .map(([slug, v]) => ({ slug, score: Math.round(v.score * 1000) / 1000, coCount: v.coCount }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
