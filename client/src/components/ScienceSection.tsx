import { useEffect, useRef } from "react";

import { ASSETS } from "@/data/assets";
const SCIENCE_BG = ASSETS.scienceBg;

const pathways = [
  {
    id: "01",
    name: "Neuromodulation",
    description:
      "SNAP-8™ and Argireline® inhibit SNARE complex formation, attenuating neurotransmitter release and relaxing the repeated muscular contractions that deepen expression lines.",
    keyIngredient: "SNAP-8™ (10%)",
    evidence: "32.7% lower free energy of interaction vs. Argireline® alone",
  },
  {
    id: "02",
    name: "Receptor-Level Firming",
    description:
      "Progeline™ reduces progerin synthesis — the protein responsible for accelerated cellular aging — while increasing SIRT-1 and SIRT-3 expression for improved cell lifespan.",
    keyIngredient: "Progeline™ (2%)",
    evidence: "Sederma / Croda clinical data",
  },
  {
    id: "03",
    name: "Cellular Longevity",
    description:
      "Nightessence™ optimises melatonin, nocturnin, and timezyme — the circadian proteins that govern the skin's natural nocturnal repair cycle.",
    keyIngredient: "Nightessence™ (1%)",
    evidence: "78% of volunteers saw dark circle improvement",
  },
  {
    id: "04",
    name: "Barrier Renewal",
    description:
      "Rosaliss™ using Ashland's PSR™ technology activates the MARCKSL1 repair marker, supporting the skin microbiome and reversing neurogenic inflammation.",
    keyIngredient: "Rosaliss™ (1%)",
    evidence: "Ashland PSR™ Technology — plant-based, sugarcane-derived",
  },
];

export default function ScienceSection() {
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) headingRef.current?.classList.add("visible");
      },
      { threshold: 0, rootMargin: "0px 0px -40px 0px" }
    );
    if (headingRef.current) observer.observe(headingRef.current);

    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("visible");
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -40px 0px" }
    );
    cardsRef.current.forEach((card) => {
      if (card) cardObserver.observe(card);
    });

    return () => { observer.disconnect(); cardObserver.disconnect(); };
  }, []);

  return (
    <section
      id="science"
      className="relative py-32 bg-obsidian overflow-hidden"
      style={{
        backgroundImage: `url(${SCIENCE_BG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ background: "oklch(0.145 0.006 285 / 0.92)" }}
      />

      <div className="relative z-10 container">
        {/* Section header */}
        <div ref={headingRef} className="reveal mb-20">
          <div className="flex items-center gap-4 mb-6">
            <div className="gold-rule" />
            <span className="section-label">The Science of Reni</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <h2
              className="font-display text-alabaster font-semibold leading-tight"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", maxWidth: "640px" }}
            >
              One Pathway.
              <br />
              <span className="text-gold italic">One Product.</span>
              <br />
              No Compromise.
            </h2>
            <div className="max-w-sm">
              <p className="text-alabaster/50 font-light leading-relaxed text-base">
                Most peptide products are formulated on the principle of "more is more."
                Reni Cosmetics operates on a single rule: every SKU addresses one biological
                pathway, at a concentration that is clinically meaningful.
              </p>
            </div>
          </div>
        </div>

        {/* Pathway Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gold-dim">
          {pathways.map((pathway, index) => (
            <div
              key={pathway.id}
              ref={(el) => { cardsRef.current[index] = el; }}
              className="reveal bg-obsidian p-10 hover:bg-obsidian-mid transition-colors duration-500 group"
              style={{ transitionDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-6">
                <span className="font-mono-reni text-gold/40 text-3xl font-bold">
                  {pathway.id}
                </span>
                <div className="section-label text-[9px] text-alabaster/30">Pathway</div>
              </div>

              <h3 className="font-display text-alabaster text-2xl font-semibold mb-4 group-hover:text-gold transition-colors duration-300">
                {pathway.name}
              </h3>

              <p className="text-alabaster/50 font-light leading-relaxed text-sm mb-8">
                {pathway.description}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-gold-dim">
                <div>
                  <div className="section-label text-[9px] text-alabaster/30 mb-1">Key Active</div>
                  <div className="font-mono-reni text-gold text-sm">{pathway.keyIngredient}</div>
                </div>
                <div className="text-right max-w-[55%]">
                  <div className="section-label text-[9px] text-alabaster/30 mb-1">Evidence</div>
                  <div className="font-display italic text-alabaster/60 text-xs leading-relaxed">
                    {pathway.evidence}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom callout */}
        <div className="mt-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-10 border-t border-gold-dim">
          <div className="font-display italic text-alabaster/60 text-xl max-w-lg">
            "This architecture is prescribable. A clinician can say: 'For your expression lines,
            use this. For your structural loss, use that.'"
          </div>
          <a href="#ingredients" className="btn-reni-primary whitespace-nowrap">
            Ingredient Glossary
          </a>
        </div>
      </div>
    </section>
  );
}
