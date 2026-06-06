/**
 * Lazily-constructed Stripe client.
 *
 * Constructing Stripe at module load throws ("Neither apiKey nor config
 * provided") whenever STRIPE_SECRET_KEY is unset — which crashes server boot and
 * the test suite in any environment without the key. Construct on first use
 * instead, and surface a clear error only when checkout/webhooks are actually
 * exercised.
 */
import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        "STRIPE_SECRET_KEY is not configured. Set it before using checkout or webhooks.",
      );
    }
    _stripe = new Stripe(key, { apiVersion: "2025-04-30.basil" as any });
  }
  return _stripe;
}

/** True when Stripe can be used (key present). Lets callers degrade gracefully. */
export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}
