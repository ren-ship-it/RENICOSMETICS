import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

// Generated hero: clean white pump bottle, elegant hands, deep charcoal bg — no text, no labels
const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663375502795/fiWabj6oJEMnYrutYEZXeW/hero-bg-1-ULGymt7HCUPHFYzKDWeuAb.png";

export default function HeroSection() {
  const scrollDown = () => {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-end overflow-hidden">
      {/* Static hero image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        aria-hidden="true"
      />

      {/* Gradient — heavier at bottom for text legibility, lighter at top */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(14,13,13,0.22) 0%, rgba(14,13,13,0.02) 30%, rgba(14,13,13,0.06) 52%, rgba(14,13,13,0.88) 100%)",
        }}
      />
      {/* Side vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(14,13,13,0.42) 100%)",
        }}
      />

      {/* Bottom content — single focal point, left-aligned */}
      <div className="relative z-10 container pb-20 md:pb-28">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10">

          {/* Left — headline + CTAs */}
          <div className="max-w-xl">
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px" style={{ background: "rgba(234,234,223,0.4)" }} />
              <span
                className="text-[10px] tracking-[0.24em] uppercase font-medium"
                style={{ color: "rgba(234,234,223,0.55)" }}
              >
                New · The Structural Anti-Ageing System
              </span>
            </div>

            {/* Headline */}
            <h1
              className="font-display font-light leading-[1.06] mb-8"
              style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)", color: "#EAEADF", letterSpacing: "-0.02em" }}
            >
              One pathway.
              <br />
              <em>One product.</em>
              <br />
              No compromise.
            </h1>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/system">
                <button
                  className="flex items-center gap-3 px-8 py-4 text-[11px] tracking-[0.18em] uppercase font-semibold transition-opacity hover:opacity-85"
                  style={{ background: "#EAEADF", color: "#2D2C2C" }}
                >
                  Explore the System
                  <ArrowRight size={14} />
                </button>
              </Link>
              <Link href="/science">
                <button
                  className="flex items-center gap-3 px-8 py-4 text-[11px] tracking-[0.18em] uppercase font-medium transition-opacity hover:opacity-70"
                  style={{
                    background: "transparent",
                    color: "rgba(234,234,223,0.85)",
                    border: "1px solid rgba(234,234,223,0.4)",
                  }}
                >
                  Our Science
                </button>
              </Link>
            </div>
          </div>

          {/* Right — clinical data strip */}
          <div
            className="hidden md:flex flex-col gap-6 pb-1"
            style={{ borderLeft: "1px solid rgba(234,234,223,0.15)", paddingLeft: "2.5rem" }}
          >
            {[
              { val: "6", label: "Targeted Pathways" },
              { val: "4", label: "Phase 1 SKUs" },
              { val: "100%", label: "Disclosed Ingredients" },
            ].map(({ val, label }) => (
              <div key={label}>
                <div
                  className="font-display font-light leading-none mb-1"
                  style={{ fontSize: "clamp(1.8rem, 2.8vw, 2.6rem)", color: "#EAEADF" }}
                >
                  {val}
                </div>
                <div
                  className="text-[10px] tracking-[0.16em] uppercase"
                  style={{ color: "rgba(234,234,223,0.4)" }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollDown}
        aria-label="Scroll down"
        className="absolute bottom-8 left-1/2 z-10 flex flex-col items-center gap-2 cursor-pointer"
        style={{ transform: "translateX(-50%)" }}
      >
        <span className="text-[9px] tracking-[0.28em] uppercase font-medium" style={{ color: "rgba(234,234,223,0.38)" }}>
          Scroll
        </span>
        <div className="flex flex-col items-center gap-0.5" style={{ animation: "scrollBounce 1.8s ease-in-out infinite" }}>
          <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
            <path d="M1 1L7 7L13 1" stroke="rgba(234,234,223,0.45)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <svg width="14" height="8" viewBox="0 0 14 8" fill="none" style={{ opacity: 0.28 }}>
            <path d="M1 1L7 7L13 1" stroke="rgba(234,234,223,0.45)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>

      <style>{`
        @keyframes scrollBounce {
          0%, 100% { transform: translateY(0); opacity: 0.7; }
          50% { transform: translateY(5px); opacity: 1; }
        }
      `}</style>
    </section>
  );
}
