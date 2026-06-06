/**
 * Single source of truth for shipping & order thresholds.
 *
 * Previously these numbers conflicted across the announcement bar ($80 free,
 * $150 minimum), the cart ($150 free, $150 minimum — which BLOCKED single-item
 * checkout), the checkout session ($150 free) and the chat knowledge base.
 * Everything now reads from here, so changing a number changes it everywhere.
 */

/** Order subtotal (AUD) at/above which standard shipping is free. */
export const FREE_SHIPPING_THRESHOLD = 80;

/** Flat standard shipping cost (AUD) below the free threshold. */
export const STANDARD_SHIPPING_COST = 9.95;

/**
 * Minimum order value (AUD) required to check out. 0 = no minimum. (A $150
 * minimum was blocking purchase of single $128–$148 products.)
 */
export const MINIMUM_ORDER_VALUE = 0;

/** Shipping cost for a given subtotal. */
export function computeShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
}

/** Customer-facing one-liner used in banners/UI. */
export const FREE_SHIPPING_MESSAGE = `Free shipping on orders over $${FREE_SHIPPING_THRESHOLD} AUD`;
