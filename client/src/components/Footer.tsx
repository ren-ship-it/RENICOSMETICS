import { useState } from "react";
import { ArrowRight, Instagram, Facebook } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

const LOGO_DARK = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663375502795/hMvCPNXLdbYPQXii.png";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const subscribe = trpc.subscribers.add.useMutation();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // Stored server-side (subscribers table + owner notification).
    try {
      await subscribe.mutateAsync({ email, source: "footer" });
    } catch (err) {
      console.warn("Newsletter signup failed:", err);
    }
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer style={{ background: "#1E1D1D" }}>

      {/* Large centred logo mark — luxury editorial treatment */}
      <div
        className="border-b flex flex-col items-center justify-center py-20 px-6 text-center"
        style={{ borderColor: "rgba(234,234,223,0.07)" }}
      >
        <img
          src={LOGO_DARK}
          alt="Reni Cosmetics"
          className="w-auto object-contain mb-8"
          style={{ height: "clamp(80px, 12vw, 140px)", opacity: 0.92 }}
        />
        <p
          className="font-display font-light italic max-w-sm leading-relaxed"
          style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)", color: "rgba(234,234,223,0.35)", letterSpacing: "0.02em" }}
        >
          One pathway. One product. No compromise.
        </p>
        <div className="flex items-center gap-6 mt-8">
          <a
            href="https://instagram.com/renicosmetics"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Reni Cosmetics on Instagram"
            className="hover:opacity-100 transition-opacity"
            style={{ opacity: 0.45 }}
          >
            <Instagram size={20} color="#EAEADF" />
          </a>
          <div className="w-px h-4" style={{ background: "rgba(234,234,223,0.15)" }} />
          <a
            href="https://facebook.com/renicosmetics"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Reni Cosmetics on Facebook"
            className="hover:opacity-100 transition-opacity"
            style={{ opacity: 0.45 }}
          >
            <Facebook size={20} color="#EAEADF" />
          </a>
          <div className="w-px h-4" style={{ background: "rgba(234,234,223,0.15)" }} />
          <a
            href="https://tiktok.com/@renicosmetics"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Reni Cosmetics on TikTok"
            className="hover:opacity-100 transition-opacity"
            style={{ opacity: 0.45 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#EAEADF" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Newsletter band */}
      <div className="border-b" style={{ borderColor: "rgba(234,234,223,0.07)" }}>
        <div className="container py-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h3 className="font-display text-xl font-light mb-1" style={{ color: "#EAEADF" }}>
              Enter the ritual.
            </h3>
            <p className="text-xs" style={{ color: "rgba(234,234,223,0.35)" }}>
              Protocol updates, ingredient deep-dives, and early access.
            </p>
          </div>
          {subscribed ? (
            <p className="text-sm font-medium" style={{ color: "#6B7A3E" }}>
              Thank you — you're on the list.
            </p>
          ) : (
            <div className="max-w-sm w-full">
              <form onSubmit={handleSubscribe} className="flex gap-0">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="flex-1 px-4 py-3 text-xs font-body outline-none"
                  style={{
                    background: "rgba(234,234,223,0.06)",
                    color: "#EAEADF",
                    border: "1px solid rgba(234,234,223,0.12)",
                    borderRight: "none",
                  }}
                />
                <button
                  type="submit"
                  className="px-5 py-3 flex items-center justify-center transition-opacity hover:opacity-80"
                  style={{ background: "#EAEADF", color: "#1E1D1D" }}
                >
                  <ArrowRight size={15} />
                </button>
              </form>
              <p className="text-[10px] mt-2" style={{ color: "rgba(234,234,223,0.2)" }}>
                By subscribing, you agree to receive marketing emails from Reni Cosmetics. Unsubscribe anytime. View our{" "}
                <a href="/privacy" className="underline hover:opacity-70 transition-opacity">Privacy Policy</a>.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3-column link grid */}
      <div className="container py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Column 1 — Explore */}
          <div>
            <h4 className="text-[9px] tracking-[0.2em] uppercase font-semibold mb-6" style={{ color: "rgba(234,234,223,0.3)" }}>Explore</h4>
            <ul className="flex flex-col gap-3.5">
              {[
                { label: "Shop All", href: "/shop" },
                { label: "The Bundle", href: "/bundle" },
                { label: "Layering Guide", href: "/layering-guide" },
                { label: "The System", href: "/system" },
                { label: "Our Science", href: "/science" },
                { label: "The Journal", href: "/journal" },
                { label: "About Reni", href: "/about" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-xs hover:opacity-100 transition-opacity"
                    style={{ color: "rgba(234,234,223,0.4)" }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2 — Products */}
          <div>
            <h4 className="text-[9px] tracking-[0.2em] uppercase font-semibold mb-6" style={{ color: "rgba(234,234,223,0.3)" }}>Products</h4>
            <ul className="flex flex-col gap-3.5">
              {[
                { label: "NEUROVÉCTRIX™ Core", href: "/products/neurovectrix-core" },
                { label: "RECEPTORLIFT™", href: "/products/receptorlift" },
                { label: "STRESSDEFENSE™", href: "/products/stressdefense" },
                { label: "DERMASHIELD™", href: "/products/dermashield" },
                { label: "Find Your Protocol →", href: "/quiz" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-xs hover:opacity-100 transition-opacity"
                    style={{ color: "rgba(234,234,223,0.4)" }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Support */}
          <div>
            <h4 className="text-[9px] tracking-[0.2em] uppercase font-semibold mb-6" style={{ color: "rgba(234,234,223,0.3)" }}>Support</h4>
            <ul className="flex flex-col gap-3.5">
              {[
                { label: "Help Centre", href: "/help" },
                { label: "Shipping & Returns", href: "/shipping" },
                { label: "FAQ", href: "/faq" },
                { label: "Contact Us", href: "/contact" },
                { label: "Stockists", href: "/stockists" },
                { label: "Refer a Friend", href: "/referral" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-xs hover:opacity-100 transition-opacity"
                    style={{ color: "rgba(234,234,223,0.4)" }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

          {/* Bottom bar */}
          <div className="border-t" style={{ borderColor: "rgba(234,234,223,0.06)" }}>
            <div className="container py-5 flex flex-col md:flex-row items-center justify-between gap-3">
              <p className="text-[10px]" style={{ color: "rgba(234,234,223,0.2)" }}>
                © {new Date().getFullYear()} Reni Cosmetics. All rights reserved. ABN 92 692 713 821 · Melbourne, Australia.
              </p>
              <div className="flex items-center flex-wrap gap-3">
                <Link href="/privacy" className="text-[10px] hover:opacity-70 transition-opacity" style={{ color: "rgba(234,234,223,0.2)" }}>
                  Privacy Policy
                </Link>
                <span style={{ color: "rgba(234,234,223,0.12)" }}>·</span>
                <Link href="/terms" className="text-[10px] hover:opacity-70 transition-opacity" style={{ color: "rgba(234,234,223,0.2)" }}>
                  Terms &amp; Conditions
                </Link>
                <span style={{ color: "rgba(234,234,223,0.12)" }}>·</span>
                <Link href="/terms-of-use" className="text-[10px] hover:opacity-70 transition-opacity" style={{ color: "rgba(234,234,223,0.2)" }}>
                  Terms of Use
                </Link>
                <span style={{ color: "rgba(234,234,223,0.12)" }}>·</span>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent("reni:open-consent"))}
                  className="text-[10px] hover:opacity-70 transition-opacity"
                  style={{ color: "rgba(234,234,223,0.2)" }}
                >
                  Cookie Preferences
                </button>
                <span style={{ color: "rgba(234,234,223,0.12)" }}>·</span>
                <p className="text-[10px]" style={{ color: "rgba(234,234,223,0.18)" }}>
                  Topical/cosmetic use only. No TGA-registered claims.
                </p>
              </div>
            </div>
          </div>

    </footer>
  );
}
