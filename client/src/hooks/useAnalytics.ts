/**
 * useAnalytics — GA4 event tracking hook
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a GA4 property at https://analytics.google.com
 * 2. Add your Measurement ID (G-XXXXXXXXXX) to your .env:
 *    VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
 * 3. The GA4 script is loaded in index.html — replace YOUR_GA4_ID with your actual ID
 *
 * USAGE:
 *   const { trackEvent, trackPageView } = useAnalytics();
 *   trackEvent("add_to_cart", { item_id: "neurovectrix-core", value: 128 });
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function useAnalytics() {
  const isEnabled = typeof window !== "undefined" && typeof window.gtag === "function";

  const trackEvent = (
    eventName: string,
    params?: Record<string, string | number | boolean>
  ) => {
    if (!isEnabled) return;
    try {
      window.gtag!("event", eventName, params);
    } catch (e) {
      console.warn("GA4 trackEvent failed:", e);
    }
  };

  const trackPageView = (path: string, title?: string) => {
    if (!isEnabled) return;
    try {
      window.gtag!("event", "page_view", {
        page_path: path,
        page_title: title,
      });
    } catch (e) {
      console.warn("GA4 trackPageView failed:", e);
    }
  };

  const trackPurchase = (params: {
    transactionId: string;
    value: number;
    currency?: string;
    items?: Array<{ item_id: string; item_name: string; price: number; quantity: number }>;
  }) => {
    if (!isEnabled) return;
    trackEvent("purchase", {
      transaction_id: params.transactionId,
      value: params.value,
      currency: params.currency ?? "AUD",
    });
  };

  const trackAddToCart = (params: { itemId: string; itemName: string; price: number }) => {
    trackEvent("add_to_cart", {
      currency: "AUD",
      value: params.price,
      item_id: params.itemId,
      item_name: params.itemName,
    });
  };

  const trackViewItem = (params: { itemId: string; itemName: string; price: number }) => {
    trackEvent("view_item", {
      currency: "AUD",
      value: params.price,
      item_id: params.itemId,
      item_name: params.itemName,
    });
  };

  return { trackEvent, trackPageView, trackPurchase, trackAddToCart, trackViewItem };
}
