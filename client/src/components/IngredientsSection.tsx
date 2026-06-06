import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

const ingredients = [
  {
    tradeName: "SNAP-8™",
    inci: "Acetyl Octapeptide-3",
    supplier: "Lubrizol / Lipotec",
    mechanism: "Inhibits SNARE complex formation; attenuates neurotransmitter release at the neuromuscular junction.",
    evidence: "32.7% lower free energy of interaction vs. Argireline® alone",
    usedIn: "NEUROVÉCTRIX™ Core",
    pct: "10%",
    category: "Neuromodulator",
  },
  {
    tradeName: "Argireline® Amplified",
    inci: "Acetyl Hexapeptide-8 (and) Pentylene Glycol",
    supplier: "Lubrizol / Lipotec",
    mechanism: "Competes with SNAP-25 for Syntaxin 1A binding; reduces muscle contraction depth.",
    evidence: "5 years younger-looking skin in 5 days (PRIMOS 3D, Lubrizol 2020)",
    usedIn: "NEUROVÉCTRIX™ Core",
    pct: "2%",
    category: "Neuromodulator",
  },
  {
    tradeName: "Matrixyl™ 3000",
    inci: "Palmitoyl Tripeptide-1 (and) Palmitoyl Tetrapeptide-7",
    supplier: "Sederma / Croda",
    mechanism: "Stimulates collagen I, III, fibronectin, and hyaluronic acid synthesis via TGF-β pathway.",
    evidence: "Sederma clinical data — measurable wrinkle depth reduction",
    usedIn: "NEUROVÉCTRIX™ Core, RECEPTORLIFT™",
    pct: "3%",
    category: "Matrix Signalling",
  },
  {
    tradeName: "Progeline™",
    inci: "Trifluoroacetyl Tripeptide-2",
    supplier: "Sederma / Croda",
    mechanism: "Reduces progerin synthesis; increases SIRT-1 and SIRT-3 for improved cell lifespan.",
    evidence: "Sederma / Croda clinical data",
    usedIn: "RECEPTORLIFT™, LIPOVÉCTRIX™",
    pct: "2%",
    category: "Receptor Firming",
  },
  {
    tradeName: "Nightessence™",
    inci: "Proprietary Ashland Complex",
    supplier: "Ashland",
    mechanism: "Optimises melatonin, nocturnin, and timezyme — the circadian proteins governing nocturnal skin repair.",
    evidence: "78% of volunteers saw dark circle improvement",
    usedIn: "STRESSDEFENSE™",
    pct: "1%",
    category: "Cellular Longevity",
  },
  {
    tradeName: "Rosaliss™",
    inci: "Proprietary Ashland PSR™ Complex",
    supplier: "Ashland",
    mechanism: "Activates MARCKSL1 repair marker; supports skin microbiome; reverses neurogenic inflammation.",
    evidence: "Ashland PSR™ Technology — plant-based, sugarcane-derived butylene glycol",
    usedIn: "DERMASHIELD™",
    pct: "1%",
    category: "Barrier Renewal",
  },
  {
    tradeName: "Neutrazen™",
    inci: "Palmitoyl Tripeptide-8",
    supplier: "Lipotec / Lubrizol",
    mechanism: "Prevents and reverses neurogenic inflammation; reduces substance P-mediated vasodilation.",
    evidence: "Lipotec clinical data",
    usedIn: "DERMASHIELD™",
    pct: "2%",
    category: "Barrier Renewal",
  },
  {
    tradeName: "ChroNOline™",
    inci: "Caprooyl Tetrapeptide-3",
    supplier: "Sederma / Croda",
    mechanism: "Stimulates DEJ anchoring proteins: collagen VII, laminin 5, and fibronectin.",
    evidence: "Sederma clinical data",
    usedIn: "RECEPTORLIFT™",
    pct: "0.5%",
    category: "Matrix Signalling",
  },
];

const categories = ["All", "Neuromodulator", "Matrix Signalling", "Receptor Firming", "Cellular Longevity", "Barrier Renewal"];

export default function IngredientsSection() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
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

  const filtered = ingredients.filter((ing) => {
    const matchSearch =
      search === "" ||
      ing.tradeName.toLowerCase().includes(search.toLowerCase()) ||
      ing.inci.toLowerCase().includes(search.toLowerCase()) ||
      ing.mechanism.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === "All" || ing.category === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <section id="ingredients" className="bg-alabaster py-32">
      <div className="container">
        {/* Section header */}
        <div ref={headingRef} className="reveal mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="gold-rule" />
            <span className="section-label text-obsidian">Ingredient Transparency</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <h2
              className="font-display text-obsidian font-semibold leading-tight"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", maxWidth: "600px" }}
            >
              Verified Claims.
              <br />
              <span className="text-cerulean italic">Not Aspirational Ones.</span>
            </h2>
            <p className="text-obsidian/50 font-light leading-relaxed max-w-sm text-base">
              Every active ingredient is listed with its INCI name, supplier, mechanism of action,
              and clinical evidence. Full percentages disclosed.
            </p>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-obsidian/30" />
            <input
              type="text"
              placeholder="Search ingredients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-obsidian/10 text-obsidian text-sm font-light placeholder:text-obsidian/30 focus:outline-none focus:border-gold transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-[10px] font-medium tracking-[0.15em] uppercase transition-colors duration-200 ${
                  activeCategory === cat
                    ? "bg-obsidian text-gold"
                    : "bg-white border border-obsidian/10 text-obsidian/50 hover:border-obsidian/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Ingredient Table */}
        <div className="border-t border-obsidian/10">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-obsidian/30 font-display italic text-xl">
              No ingredients found.
            </div>
          ) : (
            filtered.map((ing, index) => (
              <div
                key={ing.tradeName}
                className="border-b border-obsidian/10 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 hover:bg-white transition-colors duration-300 -mx-4 px-4"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Trade name + INCI */}
                <div className="lg:col-span-3">
                  <div className="font-display text-obsidian text-lg font-semibold mb-1">
                    {ing.tradeName}
                  </div>
                  <div className="font-mono-reni text-obsidian/40 text-[10px] tracking-wider leading-relaxed">
                    {ing.inci}
                  </div>
                  <div className="mt-2 text-obsidian/40 text-xs">{ing.supplier}</div>
                </div>

                {/* Mechanism */}
                <div className="lg:col-span-4">
                  <div className="section-label text-[9px] text-obsidian/30 mb-2">Mechanism</div>
                  <p className="text-obsidian/70 text-sm font-light leading-relaxed">
                    {ing.mechanism}
                  </p>
                </div>

                {/* Evidence */}
                <div className="lg:col-span-3">
                  <div className="section-label text-[9px] text-obsidian/30 mb-2">Evidence</div>
                  <p className="font-display italic text-obsidian/60 text-sm leading-relaxed">
                    {ing.evidence}
                  </p>
                </div>

                {/* Used in + % */}
                <div className="lg:col-span-2 flex flex-col items-start lg:items-end gap-2">
                  <div className="font-mono-reni text-gold text-xl font-bold">{ing.pct}</div>
                  <div className="text-obsidian/40 text-xs text-right">{ing.usedIn}</div>
                  <div
                    className="mt-1 px-2 py-0.5 text-[9px] font-medium tracking-wider uppercase"
                    style={{
                      background: "oklch(0.28 0.07 245 / 0.08)",
                      color: "oklch(0.28 0.07 245)",
                    }}
                  >
                    {ing.category}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-12 pt-8 border-t border-obsidian/10">
          <p className="text-obsidian/30 text-xs font-light leading-relaxed max-w-2xl">
            All ingredients are for topical/cosmetic use only. No therapeutic or TGA-registered claims are made.
            Percentages reflect the concentration of the active ingredient as used in the final formulation.
            All claims are sourced directly from supplier technical data sheets and clinical studies.
          </p>
        </div>
      </div>
    </section>
  );
}
