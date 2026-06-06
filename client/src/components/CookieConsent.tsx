import { useState, useEffect } from "react";
import { Link } from "wouter";
import { X, ChevronDown, ChevronUp } from "lucide-react";

const STORAGE_KEY = "reni_cookie_consent_v2";

interface ConsentState {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

function getStoredConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored) {
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const save = (analyticsVal: boolean, marketingVal: boolean) => {
    const consent: ConsentState = {
      essential: true,
      analytics: analyticsVal,
      marketing: marketingVal,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    setVisible(false);
  };

  const acceptAll = () => save(true, true);
  const acceptEssential = () => save(false, false);
  const saveCustom = () => save(analytics, marketing);

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
                We use essential cookies to keep the site working, and optional analytics and marketing cookies to understand how you use the site.
                View our{" "}
                <Link href="/privacy" className="underline hover:opacity-80 transition-opacity" style={{ color: "rgba(234,234,223,0.6)" }}>
                  Privacy Policy
                </Link>
                {" "}for details. All products are for cosmetic use only.
              </p>
              <button
                onClick={() => setExpanded(v => !v)}
                className="flex items-center gap-1 mt-2 text-[11px] font-medium hover:opacity-80 transition-opacity"
                style={{ color: "rgba(234,234,223,0.5)" }}
              >
                Manage preferences
                {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
              {expanded && (
                <div className="mt-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold" style={{ color: "#EAEADF" }}>Essential Cookies</p>
                      <p className="text-[10px]" style={{ color: "rgba(234,234,223,0.35)" }}>Required for cart and site security. Always active.</p>
                    </div>
                    <div className="w-9 h-5 rounded-full flex items-center px-1" style={{ background: "#6B7A3E" }}>
                      <div className="w-3 h-3 rounded-full ml-auto" style={{ background: "#EAEADF" }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold" style={{ color: "#EAEADF" }}>Analytics Cookies</p>
                      <p className="text-[10px]" style={{ color: "rgba(234,234,223,0.35)" }}>Help us understand how visitors use the site (privacy-first, no personal data).</p>
                    </div>
                    <button
                      onClick={() => setAnalytics(v => !v)}
                      className="w-9 h-5 rounded-full flex items-center px-1 transition-colors"
                      style={{ background: analytics ? "#6B7A3E" : "rgba(234,234,223,0.15)" }}
                      aria-pressed={analytics}
                      aria-label="Toggle analytics cookies"
                    >
                      <div className="w-3 h-3 rounded-full transition-all" style={{ background: "#EAEADF", marginLeft: analytics ? "auto" : "0" }} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold" style={{ color: "#EAEADF" }}>Marketing Cookies</p>
                      <p className="text-[10px]" style={{ color: "rgba(234,234,223,0.35)" }}>Used to show relevant ads and measure campaign performance.</p>
                    </div>
                    <button
                      onClick={() => setMarketing(v => !v)}
                      className="w-9 h-5 rounded-full flex items-center px-1 transition-colors"
                      style={{ background: marketing ? "#6B7A3E" : "rgba(234,234,223,0.15)" }}
                      aria-pressed={marketing}
                      aria-label="Toggle marketing cookies"
                    >
                      <div className="w-3 h-3 rounded-full transition-all" style={{ background: "#EAEADF", marginLeft: marketing ? "auto" : "0" }} />
                    </button>
                  </div>
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
              aria-label="Close cookie banner"
            >
              <X size={14} color="rgba(234,234,223,0.4)" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
