import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

// Clinical serum texture — replaces the botanical flat-lay that contradicted the clinical brand identity
const CLINICAL_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663375502795/fiWabj6oJEMnYrutYEZXeW/serum-texture_4f73333f.jpg";

const keyIngredients = [
  {
    name: "SNAP-8™",
    category: "Neuromodulating Peptide",
    desc: "Octapeptide that inhibits SNARE complex formation, attenuating muscle contractions that cause expression lines.",
  },
  {
    name: "Argireline® Amplified",
    category: "Neuromodulating Peptide",
    desc: "Competes with SNAP-25 for Syntaxin 1A binding — topical neuromodulation without needles.",
  },
  {
    name: "Progeline™",
    category: "Longevity Complex",
    desc: "Remodels face contour by reducing progerin synthesis and increasing SIRT-1 and SIRT-3 longevity proteins.",
  },
  {
    name: "Matrixyl™ 3000",
    category: "Collagen Stimulator",
    desc: "Stimulates collagen I, III, fibronectin, and hyaluronic acid synthesis in the dermis.",
  },
  {
    name: "Neutrazen™",
    category: "Anti-Inflammaging",
    desc: "Prevents neurogenic inflammation — reducing vasodilation, oedema, and substance P-mediated irritation.",
  },
  {
    name: "HyaMatrix™ VII+",
    category: "Multi-Depth Hydration",
    desc: "Seven-dimensional hyaluronic acid complex providing hydration from the epidermis to the dermis.",
  },
];

export default function IngredientsShowcase() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Use a generous rootMargin so elements become visible well before they're fully in view
    // This prevents the "invisible content" gap on mobile where IntersectionObserver fires late
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("visible");
            observer.unobserve(e.target); // stop observing once visible
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -40px 0px" }
    );

    if (sectionRef.current) {
      const revealEls = sectionRef.current.querySelectorAll(".reveal");
      revealEls.forEach(el => observer.observe(el));
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="ingredients" style={{ background: "#EAEADF" }} className="py-24 md:py-36">
      <div className="container">

        {/* Header */}
        <div className="reveal flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="reni-divider" />
              <span className="reni-tag">Ingredient Transparency</span>
            </div>
            <h2
              className="font-display font-light leading-tight"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", color: "#2D2C2C", letterSpacing: "-0.01em" }}
            >
              Every active.
              <br />
              <em>Every percentage.</em>
            </h2>
          </div>
          <div className="max-w-xs">
            <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(45,44,44,0.52)" }}>
              Every ingredient is formulated at or above its clinically validated minimum effective concentration. No fillers. No hidden dilution.
            </p>
            <Link href="/science">
              <button
                className="flex items-center gap-2 text-[11px] tracking-[0.16em] uppercase font-medium transition-opacity hover:opacity-60"
                style={{ color: "rgba(45,44,44,0.65)" }}
              >
                View Full Science <ArrowRight size={12} />
              </button>
            </Link>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Image */}
          <div className="reveal">
            <div className="overflow-hidden" style={{ aspectRatio: "1" }}>
              <img
                src={CLINICAL_IMG}
                alt="Cosmetic-grade serum actives — clinical texture"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Caption */}
            <p className="mt-3 text-[10px] tracking-widest uppercase" style={{ color: "rgba(45,44,44,0.35)" }}>
              Cosmetic-grade actives at validated concentrations
            </p>
          </div>

          {/* Ingredient list — each item observed independently */}
          <div>
            {keyIngredients.map((ing, i) => (
              <div
                key={ing.name}
                className="reveal py-5"
                style={{
                  borderBottom: i < keyIngredients.length - 1 ? "1px solid rgba(45,44,44,0.1)" : "none",
                  transitionDelay: `${i * 0.05}s`,
                }}
              >
                <div className="flex items-start justify-between gap-4 mb-1.5">
                  <h3
                    className="font-display text-base font-medium"
                    style={{ color: "#2D2C2C" }}
                  >
                    {ing.name}
                  </h3>
                  <span
                    className="text-[9px] font-medium tracking-wider uppercase px-2 py-1 flex-shrink-0"
                    style={{ background: "rgba(45,44,44,0.07)", color: "#6B7A3E" }}
                  >
                    {ing.category}
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(45,44,44,0.52)" }}>
                  {ing.desc}
                </p>
              </div>
            ))}

            {/* Transparency note */}
            <div
              className="reveal mt-6 p-4 flex items-start gap-3"
              style={{ background: "rgba(45,44,44,0.05)", border: "1px solid rgba(45,44,44,0.08)" }}
            >
              <div
                className="flex-shrink-0 mt-0.5"
                style={{ background: "#6B7A3E", width: "2px", minHeight: "2rem", alignSelf: "stretch" }}
              />
              <p className="text-xs leading-relaxed" style={{ color: "rgba(45,44,44,0.55)" }}>
                Exact concentrations for all hero actives are published on each individual product page. We do not hide percentages in proprietary blends.
              </p>
            </div>
          </div>

        </div>

        {/* Disclaimer */}
        <p className="mt-10 text-[10px]" style={{ color: "rgba(45,44,44,0.3)" }}>
          All products are for topical and cosmetic use only. No therapeutic or TGA-registered claims are made. Melbourne, Victoria, Australia.
        </p>
      </div>
    </section>
  );
}
