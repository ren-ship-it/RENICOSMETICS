import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

import { ASSETS } from "@/data/assets";
const TEXTURE_BG = ASSETS.brandStoryTexture;
const WHITE_ICON = ASSETS.brandStoryWhiteIcon;

export default function BrandStory() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) ref.current?.classList.add("visible"); },
      { threshold: 0, rootMargin: "0px 0px -40px 0px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="story" className="relative py-28 md:py-44 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${TEXTURE_BG})` }}
      />
      <div className="absolute inset-0" style={{ background: "rgba(22,21,21,0.88)" }} />

      {/* Content */}
      <div className="relative z-10 container">
        <div ref={ref} className="reveal max-w-2xl mx-auto text-center">

          {/* Icon */}
          <div className="flex justify-center mb-8">
            <img src={WHITE_ICON} alt="Reni Cosmetics icon" className="w-10 h-10 object-contain" style={{ opacity: 0.55 }} />
          </div>

          {/* Tag */}
          <div className="flex items-center justify-center gap-4 mb-7">
            <div className="w-10 h-px" style={{ background: "rgba(234,234,223,0.2)" }} />
            <span
              className="text-[10px] tracking-[0.22em] uppercase font-medium"
              style={{ color: "rgba(234,234,223,0.42)" }}
            >
              Our Philosophy
            </span>
            <div className="w-10 h-px" style={{ background: "rgba(234,234,223,0.2)" }} />
          </div>

          {/* Headline */}
          <h2
            className="font-display font-light leading-tight mb-8"
            style={{ fontSize: "clamp(2.2rem, 5.5vw, 4.2rem)", color: "#EAEADF", letterSpacing: "-0.01em" }}
          >
            Mechanism over
            <br />
            <em>marketing. Always.</em>
          </h2>

          {/* Body */}
          <p
            className="font-body font-light leading-relaxed mb-5 text-base"
            style={{ color: "rgba(234,234,223,0.52)" }}
          >
            Reni Cosmetics was built on a single principle: one product, one pathway. Every SKU in the system targets a single, verified biological mechanism — formulated with actives at or above their clinically validated minimum effective concentration.
          </p>
          <p
            className="font-body font-light leading-relaxed mb-12 text-base"
            style={{ color: "rgba(234,234,223,0.52)" }}
          >
            No ingredient cocktails. No competing mechanisms. No marketing claims without clinical data. Every percentage is disclosed. Every source is verifiable.
          </p>

          {/* CTA */}
          <Link href="/science">
            <button
              className="inline-flex items-center gap-2.5 px-7 py-3.5 text-[11px] tracking-[0.18em] uppercase font-medium transition-opacity hover:opacity-70"
              style={{
                background: "transparent",
                color: "rgba(234,234,223,0.7)",
                border: "1px solid rgba(234,234,223,0.25)",
              }}
            >
              Explore Our Science <ArrowRight size={13} />
            </button>
          </Link>
        </div>

        {/* Stats row */}
        <div
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-px"
          style={{ background: "rgba(234,234,223,0.06)" }}
        >
          {[
            { val: "6", label: "Biological Pathways" },
            { val: "4", label: "Phase 1 SKUs" },
            { val: "0", label: "Proprietary Blends" },
            { val: "100%", label: "Ingredient Transparency" },
          ].map(stat => (
            <div
              key={stat.label}
              className="py-9 px-6 text-center"
              style={{ background: "rgba(22,21,21,0.6)" }}
            >
              <div
                className="font-display font-light mb-1.5"
                style={{ fontSize: "clamp(2rem, 3.5vw, 2.8rem)", color: "#EAEADF" }}
              >
                {stat.val}
              </div>
              <div
                className="text-[10px] tracking-[0.16em] uppercase"
                style={{ color: "rgba(234,234,223,0.35)" }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
