import { useEffect, useRef } from "react";
import { Leaf, FlaskConical, ShieldCheck, Recycle } from "lucide-react";

const pillars = [
  {
    icon: Leaf,
    title: "Plant-Derived Actives",
    body:
      "Rosaliss™ is manufactured using Ashland's PSR™ (Plant-Sourced Raw materials) technology, with sugarcane-derived butylene glycol as the delivery vehicle. No petrochemical solvents.",
    source: "Ashland PSR™ Technology",
  },
  {
    icon: FlaskConical,
    title: "Green Chemistry",
    body:
      "Lubrizol's Argireline® Amplified and SNAP-8™ are produced under green chemistry principles, minimising solvent waste and energy consumption in synthesis.",
    source: "Lubrizol / Lipotec Manufacturing",
  },
  {
    icon: ShieldCheck,
    title: "No Harmful Preservatives",
    body:
      "All Reni formulas are preserved with Phenoxyethanol + Ethylhexylglycerin at 1% — a globally accepted, non-formaldehyde-releasing system. No parabens, no MIT.",
    source: "Formulation Guidelines",
  },
  {
    icon: Recycle,
    title: "Packaging Philosophy",
    body:
      "No glass packaging. All primary containers are recyclable: white matte HDPE roll-on, airless PP pump, frosted PETG dropper, and aluminium tube. Designed for responsible end-of-life.",
    source: "Reni Cosmetics Packaging Specification",
  },
];

export default function SustainabilitySection() {
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
    <section className="bg-obsidian py-32">
      <div className="container">
        {/* Section header */}
        <div ref={headingRef} className="reveal mb-20">
          <div className="flex items-center gap-4 mb-6">
            <div className="gold-rule" />
            <span className="section-label">Sourcing & Sustainability</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <h2
              className="font-display text-alabaster font-semibold leading-tight"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", maxWidth: "600px" }}
            >
              Responsible at
              <br />
              <span className="text-gold italic">Every Level.</span>
            </h2>
            <p className="text-alabaster/50 font-light leading-relaxed max-w-sm text-base">
              Sustainability is not a marketing claim at Reni. It is an ingredient-level
              and packaging-level commitment, verifiable through supplier documentation.
            </p>
          </div>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-gold-dim">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                ref={(el) => { cardsRef.current[index] = el; }}
                className="reveal bg-obsidian p-8 hover:bg-obsidian-mid transition-colors duration-500 group"
                style={{ transitionDelay: `${index * 0.1}s` }}
              >
                <div className="mb-6">
                  <Icon
                    size={20}
                    className="text-gold/60 group-hover:text-gold transition-colors duration-300"
                  />
                </div>
                <h3 className="font-display text-alabaster text-lg font-semibold mb-4 leading-tight">
                  {pillar.title}
                </h3>
                <p className="text-alabaster/50 font-light text-sm leading-relaxed mb-6">
                  {pillar.body}
                </p>
                <div className="pt-4 border-t border-gold-dim">
                  <span className="font-mono-reni text-gold/40 text-[10px] tracking-wider">
                    {pillar.source}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
