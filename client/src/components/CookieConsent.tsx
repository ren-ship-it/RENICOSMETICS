import { useState, useEffect } from "react";
import { Link } from "wouter";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { getConsent, setConsent, hasDecided } from "@/lib/consent";

/**
 * Cookie / consent banner.
 *
 * Four categories aligned to the analytics registry: essential (always on),
 * analytics, marketing and personalisation. Choices are stored locally for
 * instant gating AND recorded server-side in an append-only ledger (via
 * setConsent), so we can prove what was consented and when. The banner can be
 * reopened from the footer ("Cookie Preferences") which dispatches `reni:open-consent`.
 */
const OPEN_EVENT = "reni:open-consent";

interface Toggle {
  key: "analytics" | "marketing" | "personalisation";
  label: string;
  desc: string;
}

const TOGGLES: Toggle[] = [
  { key: "analytics", label: "Analytics", desc: "Helps us understand how visitors use the site so we can improve it. Pseudonymised, never sold." },
  { key: "marketing", label: "Marketing", desc: "Used to measure campaigns and, if you opt in, send relevant offers. You can unsubscribe anytime." },
  { key: "personalisation", label: "Personalisation", desc: "Powers product recommendations and tailored content based on your activity." },
];

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);
  const [personalisation, setPersonalisation] = useState(true);

  useEffect(() => {
    if (!hasDecided()) {
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  // Allow re-opening from the footer to change preferences at any time.
  useEffect(() => {
    const open = () => {
      const c = getConsent();
      setAnalytics(c.analytics);
      setMarketing(c.marketing);
      setPersonalisation(c.personalisation);
      setExpanded(true);
      setVisible(true);
    };
    window.addEventListener(OPEN_EVENT, open);
    return () => window.removeEventListener(OPEN_EVENT, open);
  }, []);

  const save = (a: boolean, m: boolean, p: boolean, source: string) => {
    setConsent({ analytics: a, marketing: m, personalisation: p }, source);
    setVisible(false);
  };

  const acceptAll = () => save(true, true, true, "banner_accept_all");
  const acceptEssential = () => save(false, false, false, "banner_essential");
  const saveCustom = () => save(analytics, marketing, personalisation, "banner_custom");

  const state: Record<Toggle["key"], boolean> = { analytics, marketing, personalisation };
  const setters: Record<Toggle["key"], (v: boolean) => void> = {
    analytics: setAnalytics,
    marketing: setMarketing,
    personalisation: setPersonalisation,
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "#1E1D1D",
        borderTop: "1px solid rgba(234,234,223,0.1)",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.35)",
      }}
      role="dialog"
      aria-modal="false"
      aria-label="Cookie consent"
    >
      <div className="container py-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-start gap-5">
            <div className="flex-1">
              <p className="text-xs font-semibold mb-1" style={{ color: "#EAEADF" }}>
                We use cookies to improve your experience.
              </p>
              <p className="text-[11px] leading-relaxed" style={{ color: "rgba(234,234,223,0.45)" }}>
                Essential cookies keep the site working. Optional analytics, marketing and personalisation cookies help us
                improve and tailor your experience. You control them, and you can change your choice anytime. See our{" "}
                <Link href="/privacy" className="underline hover:opacity-80 transition-opacity" style={{ color: "rgba(234,234,223,0.6)" }}>
                  Privacy Policy
                </Link>
                . All products are for cosmetic use only.
              </p>
              <button
                onClick={() => setExpanded(v => !v)}
                className="flex items-center gap-1 mt-2 text-[11px] font-medium hover:opacity-80 transition-opacity"
                style={{ color: "rgba(234,234,223,0.5)" }}
                aria-expanded={expanded}
              >
                Manage preferences
                {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
              {expanded && (
                <div className="mt-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold" style={{ color: "#EAEADF" }}>Essential</p>
                      <p className="text-[10px]" style={{ color: "rgba(234,234,223,0.35)" }}>Required for cart and site security. Always active.</p>
                    </div>
                    <div className="w-9 h-5 rounded-full flex items-center px-1" style={{ background: "#6B7A3E" }} aria-label="Essential cookies always on">
                      <div className="w-3 h-3 rounded-full ml-auto" style={{ background: "#EAEADF" }} />
                    </div>
                  </div>
                  {TOGGLES.map(t => (
                    <div key={t.key} className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-semibold" style={{ color: "#EAEADF" }}>{t.label}</p>
                        <p className="text-[10px]" style={{ color: "rgba(234,234,223,0.35)" }}>{t.desc}</p>
                      </div>
                      <button
                        onClick={() => setters[t.key](!state[t.key])}
                        className="w-9 h-5 rounded-full flex items-center px-1 transition-colors flex-shrink-0"
                        style={{ background: state[t.key] ? "#6B7A3E" : "rgba(234,234,223,0.15)" }}
                        aria-pressed={state[t.key]}
                        aria-label={`Toggle ${t.label.toLowerCase()} cookies`}
                      >
                        <div className="w-3 h-3 rounded-full transition-all" style={{ background: "#EAEADF", marginLeft: state[t.key] ? "auto" : "0" }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 md:flex-shrink-0 md:w-44">
              <button
                onClick={acceptAll}
                className="px-5 py-2.5 text-[11px] tracking-widest uppercase font-semibold transition-opacity hover:opacity-80"
                style={{ background: "#EAEADF", color: "#1E1D1D" }}
              >
                Accept All
              </button>
              {expanded ? (
                <button
                  onClick={saveCustom}
                  className="px-5 py-2.5 text-[11px] tracking-widest uppercase font-semibold transition-opacity hover:opacity-80"
                  style={{ background: "transparent", color: "rgba(234,234,223,0.6)", border: "1px solid rgba(234,234,223,0.2)" }}
                >
                  Save Preferences
                </button>
              ) : (
                <button
                  onClick={acceptEssential}
                  className="px-5 py-2.5 text-[11px] tracking-widest uppercase font-semibold transition-opacity hover:opacity-80"
                  style={{ background: "transparent", color: "rgba(234,234,223,0.6)", border: "1px solid rgba(234,234,223,0.2)" }}
                >
                  Essential Only
                </button>
              )}
            </div>
            <button
              onClick={acceptEssential}
              className="hidden md:flex items-center justify-center w-8 h-8 hover:opacity-60 transition-opacity flex-shrink-0"
              aria-label="Decline optional cookies and close"
            >
              <X size={14} color="rgba(234,234,223,0.4)" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
