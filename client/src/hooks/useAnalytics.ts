/**
 * useAnalytics — first-party, consent-aware analytics hook.
 *
 * Events are sent to the Reni backend (privacy-first) and, when GA4 is loaded
 * and the visitor has consented to analytics, mirrored to GA4. Consent is
 * enforced both here and again server-side. This hook preserves the original
 * method names (trackEvent, trackPageView, trackPurchase, trackAddToCart,
 * trackViewItem) so existing call sites continue to work, and adds new ones.
 *
 * GA4 setup is optional: set VITE_GA4_MEASUREMENT_ID and enable the snippet in
 * client/index.html to additionally feed Google Analytics. With or without GA4,
 * first-party analytics work on their own.
 */
import { analytics, track, type TrackPayload } from "@/lib/track";

export function useAnalytics() {
  return {
    /** Generic escape hatch — must be a known event type (see registry). */
    trackEvent: (eventType: string, payload?: TrackPayload) => track(eventType, payload),
    trackPageView: (path: string, title?: string) => analytics.pageView(path, title),
    trackViewItem: (params: { itemId: string; itemName: string; price: number }) =>
      analytics.viewItem({ slug: params.itemId, name: params.itemName, price: params.price }),
    trackAddToCart: (params: { itemId: string; itemName: string; price: number; quantity?: number }) =>
      analytics.addToCart({ slug: params.itemId, name: params.itemName, price: params.price, quantity: params.quantity }),
    trackRemoveFromCart: (params: { itemId: string; quantity?: number }) =>
      analytics.removeFromCart({ slug: params.itemId, quantity: params.quantity }),
    trackBeginCheckout: (params: { value: number; itemCount: number }) => analytics.beginCheckout(params),
    trackSearch: (query: string, resultCount: number) => analytics.search(query, resultCount),
    trackPurchase: (params: {
      transactionId: string;
      value: number;
      currency?: string;
      items?: Array<{ item_id: string; item_name: string; price: number; quantity: number }>;
    }) =>
      analytics.purchase({
        transactionId: params.transactionId,
        value: params.value,
        items: params.items?.map(i => ({ slug: i.item_id, name: i.item_name, price: i.price, quantity: i.quantity })),
      }),
  };
}
