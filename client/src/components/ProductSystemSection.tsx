import { useEffect, useRef } from "react";

const products = [
  {
    id: "01",
    name: "NEUROVÉCTRIX™ Core",
    descriptor: "Expression Line Modulator",
    format: "15ml White Matte Roll-On",
    pathway: "Neuromodulation",
    phase: "Phase 1",
    heroActives: [
      { name: "SNAP-8™", pct: "10%" },
      { name: "Argireline®", pct: "2%" },
      { name: "Matrixyl™ 3000", pct: "3%" },
    ],
    claim: "5 years younger-looking skin in 5 days",
    claimSource: "PRIMOS 3D, Lubrizol 2020",
  },
  {
    id: "02",
    name: "RECEPTORLIFT™",
    descriptor: "Receptor-Level Firming",
    format: "30ml Airless Pump",
    pathway: "Matrix Signalling",
    phase: "Phase 1",
    heroActives: [
      { name: "Progeline™", pct: "2%" },
      { name: "ChroNOline™", pct: "0.5%" },
      { name: "Matrixyl™ 3000", pct: "3%" },
    ],
    claim: "Reduces progerin synthesis; increases SIRT-1 & SIRT-3",
    claimSource: "Sederma / Croda",
  },
  {
    id: "03",
    name: "STRESSDEFENSE™",
    descriptor: "Night Longevity Serum",
    format: "30ml Frosted Glass Dropper",
    pathway: "Cellular Longevity",
    phase: "Phase 1",
    heroActives: [
      { name: "Nightessence™", pct: "1%" },
      { name: "Reproage", pct: "2%" },
      { name: "Orsirtine ISR", pct: "1%" },
    ],
    claim: "78% of volunteers saw dark circle improvement",
    claimSource: "Ashland Nightessence™ Clinical Data",
  },
  {
    id: "04",
    name: "DERMASHIELD™",
    descriptor: "Clinical Barrier Repair",
    format: "50ml Emulsified Tube",
    pathway: "Barrier Renewal",
    phase: "Phase 1",
    heroActives: [
      { name: "Neutrazen™", pct: "2%" },
      { name: "Rosaliss™", pct: "1%" },
      { name: "Abyssine PF", pct: "1%" },
    ],
    claim: "Activates MARCKSL1 repair marker; supports microbiome",
    claimSource: "Ashland Rosaliss™ PSR™ Technology",
  },
];

function ProductCard({ product, index }: { product: typeof products[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            cardRef.current?.classList.add("visible");
          }, index * 120);
        }
      },
      { threshold: 0, rootMargin: "0px 0px -40px 0px" }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="reveal group border-t border-gold-dim pt-8 pb-10 hover:border-gold transition-colors duration-500 cursor-pointer"
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono-reni text-gold text-xs opacity-60">{product.id}</span>
            <span className="section-label text-[9px]">{product.phase}</span>
          </div>
          <h3 className="font-display text-alabaster text-2xl font-semibold leading-tight group-hover:text-gold transition-colors duration-300">
            {product.name}
          </h3>
          <p className="text-alabaster/50 text-sm font-light tracking-wide mt-1">
            {product.descriptor}
          </p>
        </div>
        <div className="text-right">
          <div className="section-label text-[9px] text-alabaster/40 mb-1">Pathway</div>
          <div className="font-display italic text-gold/80 text-sm">{product.pathway}</div>
        </div>
      </div>

      {/* Format */}
      <div className="font-mono-reni text-alabaster/30 text-[10px] tracking-widest mb-6 uppercase">
        {product.format} · pH 5.0 ± 0.3
      </div>

      {/* Hero Actives */}
      <div className="flex flex-wrap gap-2 mb-6">
        {product.heroActives.map((active) => (
          <div
            key={active.name}
            className="flex items-center gap-2 bg-obsidian-light px-3 py-1.5 border border-gold-dim"
          >
            <span className="text-alabaster/70 text-xs font-medium">{active.name}</span>
            <span className="font-mono-reni text-gold text-xs">{active.pct}</span>
          </div>
        ))}
      </div>

      {/* Claim */}
      <div className="border-l-2 border-gold pl-4">
        <p className="font-display italic text-alabaster/80 text-sm leading-relaxed">
          "{product.claim}"
        </p>
        <p className="text-gold/60 text-[10px] font-mono-reni tracking-wider mt-1">
          {product.claimSource}
        </p>
      </div>
    </div>
  );
}

export default function ProductSystemSection() {
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) headingRef.current?.classList.add("visible");
      },
      { threshold: 0, rootMargin: "0px 0px -40px 0px" }
    );
    if (headingRef.current) observer.observe(headingRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="the-system" className="bg-obsidian py-32">
      <div className="container">
        {/* Section header */}
        <div ref={headingRef} className="reveal mb-20">
          <div className="flex items-center gap-4 mb-6">
            <div className="gold-rule" />
            <span className="section-label">The Reni System</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <h2
              className="font-display text-alabaster font-semibold leading-tight"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", maxWidth: "600px" }}
            >
              Six Pathways.
              <br />
              <span className="text-gold italic">One Complete System.</span>
            </h2>
            <p className="text-alabaster/50 font-light leading-relaxed max-w-sm text-base">
              Each product addresses a single biological pathway. No ingredient cocktails.
              No compromised mechanisms. Clinical architecture for the informed consumer.
            </p>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-0">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        {/* Phase 2/3 teaser */}
        <div className="mt-16 pt-10 border-t border-gold-dim flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="section-label text-alabaster/30 mb-2">Coming in Phase 2 & 3</div>
            <div className="flex flex-wrap gap-6">
              <span className="font-display italic text-alabaster/40 text-lg">NEUROVÉCTRIX™ Eye-Lift</span>
              <span className="text-gold/20 text-lg">·</span>
              <span className="font-display italic text-alabaster/40 text-lg">LIPOVÉCTRIX™</span>
              <span className="text-gold/20 text-lg">·</span>
              <span className="font-display italic text-alabaster/40 text-lg">MICROFILL™</span>
            </div>
          </div>
          <a href="#protocol" className="btn-reni-primary text-[11px] whitespace-nowrap">
            View the Protocol
          </a>
        </div>
      </div>
    </section>
  );
}
