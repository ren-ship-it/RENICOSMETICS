/**
 * First-party, consent-aware event tracking.
 *
 * Sends behavioural events to our own backend (privacy-first; no third party
 * required) and, if present and consented, mirrors key ecommerce events to GA4.
 * Consent is checked BEFORE sending; the server re-checks on ingestion as the
 * authoritative gate. Tracking never throws into the UI.
 */
import { MODULE_BY_EVENT } from "../../../shared/analytics/registry";
import { getConsent } from "./consent";
import { getVisitorId, getSessionId } from "./visitor";
import { trpcVanilla } from "./trpcVanilla";

export interface TrackPayload {
  path?: string;
  referrer?: string;
  productSlug?: string;
  searchQuery?: string;
  value?: number;
  quantity?: number;
  durationMs?: number;
  metadata?: Record<string, unknown>;
}

/** Is this event permitted under the current local consent state? */
function permitted(eventType: string): boolean {
  const mod = MODULE_BY_EVENT[eventType];
  if (!mod) return false;
  const c = getConsent();
  switch (mod.consent) {
    case "essential":
      return true;
    case "analytics":
      return c.analytics;
    case "marketing":
      return c.marketing;
    case "personalisation":
      return c.personalisation;
    default:
      return false;
  }
}

export function track(eventType: string, payload: TrackPayload = {}): void {
  if (typeof window === "undefined") return;
  if (!permitted(eventType)) return;
  const c = getConsent();
  trpcVanilla.analytics.track
    .mutate({
      eventType,
      visitorId: getVisitorId(),
      sessionId: getSessionId(),
      path: payload.path ?? window.location.pathname,
      referrer: payload.referrer ?? (document.referrer || undefined),
      productSlug: payload.productSlug,
      searchQuery: payload.searchQuery,
      value: payload.value,
      quantity: payload.quantity,
      durationMs: payload.durationMs,
      consent: {
        analytics: c.analytics,
        marketing: c.marketing,
        personalisation: c.personalisation,
      },
      metadata: payload.metadata,
    })
    .catch(() => {});
}

// ── Optional GA4 mirror (only fires if GA is loaded AND analytics consented) ──
function gtagEvent(name: string, params: Record<string, unknown>): void {
  const c = getConsent();
  if (!c.analytics) return;
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag !== "function") return;
  try {
    w.gtag("event", name, params);
  } catch {
    /* ignore */
  }
}

// ── Typed convenience helpers ─────────────────────────────────────────────
export const analytics = {
  pageView(path: string, title?: string) {
    track("page_view", { path, metadata: title ? { title } : undefined });
    gtagEvent("page_view", { page_path: path, page_title: title });
  },
  viewItem(p: { slug: string; name: string; price: number }) {
    track("view_item", { productSlug: p.slug, value: p.price, metadata: { name: p.name } });
    gtagEvent("view_item", { currency: "AUD", value: p.price, items: [{ item_id: p.slug, item_name: p.name, price: p.price }] });
  },
  addToCart(p: { slug: string; name: string; price: number; quantity?: number }) {
    track("add_to_cart", { productSlug: p.slug, value: p.price, quantity: p.quantity ?? 1, metadata: { name: p.name } });
    gtagEvent("add_to_cart", { currency: "AUD", value: p.price, items: [{ item_id: p.slug, item_name: p.name, price: p.price, quantity: p.quantity ?? 1 }] });
  },
  removeFromCart(p: { slug: string; quantity?: number }) {
    track("remove_from_cart", { productSlug: p.slug, quantity: p.quantity ?? 1 });
  },
  beginCheckout(p: { value: number; itemCount: number }) {
    track("begin_checkout", { value: p.value, quantity: p.itemCount });
    gtagEvent("begin_checkout", { currency: "AUD", value: p.value });
  },
  purchase(p: { transactionId: string; value: number; items?: Array<{ slug: string; name: string; price: number; quantity: number }> }) {
    track("purchase", { value: p.value, metadata: { transactionId: p.transactionId, items: p.items } });
    gtagEvent("purchase", { transaction_id: p.transactionId, currency: "AUD", value: p.value });
  },
  search(query: string, resultCount: number) {
    track(resultCount > 0 ? "search" : "search_no_results", { searchQuery: query, metadata: { resultCount } });
    gtagEvent("search", { search_term: query });
  },
  sessionEnd(durationMs: number, pageViews: number) {
    track("session_end", { durationMs, metadata: { pageViews } });
  },
};
