/**
 * Client-side consent store.
 *
 * Holds the visitor's consent choices for the four categories, versioned against
 * the policy. Writing consent also (a) persists locally for instant gating and
 * (b) records an append-only entry server-side via the analytics router, and
 * (c) broadcasts a `reni:consent` event so listeners (analytics hook, GA loader)
 * react immediately. The server independently re-checks consent on ingestion, so
 * this store is a UX convenience, not the security boundary.
 */
import { POLICY_VERSION, type ConsentState } from "../../../shared/analytics/registry";
import { getVisitorId } from "./visitor";
import { trpcVanilla } from "./trpcVanilla";

const STORAGE_KEY = "reni_consent_v3";
export const CONSENT_EVENT = "reni:consent";

export type ConsentChoice = Omit<ConsentState, "essential">;

const DENY_ALL: ConsentState = {
  essential: true,
  analytics: false,
  marketing: false,
  personalisation: false,
  version: POLICY_VERSION,
  timestamp: 0,
};

export function getConsent(): ConsentState {
  if (typeof window === "undefined") return DENY_ALL;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DENY_ALL;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    return {
      essential: true,
      analytics: !!parsed.analytics,
      marketing: !!parsed.marketing,
      personalisation: !!parsed.personalisation,
      version: parsed.version ?? "unknown",
      timestamp: parsed.timestamp ?? 0,
    };
  } catch {
    return DENY_ALL;
  }
}

/** Has the visitor made an explicit choice against the CURRENT policy version? */
export function hasDecided(): boolean {
  const c = getConsent();
  return c.timestamp > 0 && c.version === POLICY_VERSION;
}

export function setConsent(
  choice: { analytics: boolean; marketing: boolean; personalisation: boolean },
  source = "banner",
): ConsentState {
  const state: ConsentState = {
    essential: true,
    ...choice,
    version: POLICY_VERSION,
    timestamp: Date.now(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota / privacy-mode errors */
  }

  // Server-side append-only ledger (best effort, non-blocking).
  trpcVanilla.analytics.recordConsent
    .mutate({
      visitorId: getVisitorId(),
      analytics: choice.analytics,
      marketing: choice.marketing,
      personalisation: choice.personalisation,
      source,
    })
    .catch(() => {});

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: state }));
  }
  return state;
}
