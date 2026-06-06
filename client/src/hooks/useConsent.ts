/**
 * React hook exposing the current consent state, kept in sync with the
 * `reni:consent` broadcast so components re-render when the visitor updates
 * their preferences.
 */
import { useEffect, useState } from "react";
import { getConsent, CONSENT_EVENT } from "@/lib/consent";
import type { ConsentState } from "../../../shared/analytics/registry";

export function useConsent(): ConsentState {
  const [consent, setConsentState] = useState<ConsentState>(() => getConsent());

  useEffect(() => {
    const handler = () => setConsentState(getConsent());
    window.addEventListener(CONSENT_EVENT, handler);
    // Also re-sync if another tab changed it.
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(CONSENT_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return consent;
}
