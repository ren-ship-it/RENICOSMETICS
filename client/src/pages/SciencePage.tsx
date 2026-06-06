import { useEffect } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageErrorBoundary from "@/components/PageErrorBoundary";
import { useSEO } from "@/hooks/useSEO";

const PATHWAYS = [
  {
    number: "01",
    name: "Neuromodulation",
    headline: "Topical Botox-Mimetic",
    body: "SNAP-8™ and Argireline® target the SNARE complex — the same molecular mechanism as botulinum toxin — to attenuate repetitive muscle contractions that cause dynamic expression lines. No needles. No downtime.",
    product: "NEUROVÉCTRIX™ Core",
    slug: "neurovectrix-core",
    stat: "5 years younger-looking skin in 5 days",
    source: "PRIMOS 3D microtopography clinical study, Argireline® Amplified at 5%",
    sourceUrl: "https://www.lubrizol.com/Personal-Care/Products/Argireline-Amplified",
  },
  {
    number: "02",
    name: "Receptor-Level Firming",
    headline: "Structural Lifting from Within",
    body: "Progeline™ remodels face contour by reducing progerin synthesis and increasing SIRT-1 and SIRT-3 longevity proteins. Kollaren™ BG stimulates collagen I & III, fibronectin, elastin, and laminin — the full extracellular matrix scaffold.",
    product: "RECEPTORLIFT™",
    slug: "receptorlift",
    stat: "Visible lifting and firming in 28 days",
    source: "Progeline™ clinical data, Lucas Meyer Cosmetics",
    sourceUrl: "https://www.lucasmeyercosmetics.com/en/products/progeline/",
  },
  {
    number: "03",
    name: "Cellular Longevity",
    headline: "Epigenetic Anti-Ageing",
    body: "Reproage targets DNA methylation age markers. Orsirtine ISR activates sirtuin pathways. GP4G SP activates DNA repair mechanisms. Nightessence™ optimises nocturnal skin repair and melatonin production. This is anti-ageing at the cellular level.",
    product: "STRESSDEFENSE™",
    slug: "stressdefense",
    stat: "78% improvement in dark eye circles in 28 days",
    source: "Nightessence™ clinical study, 36 volunteers, Alban Muller",
    sourceUrl: "https://www.albanmuller.com/en/ingredients/nightessence/",
  },
  {
    number: "04",
    name: "Barrier Renewal",
    headline: "Neuro-Soothing Repair",
    body: "Neutrazen™ prevents neurogenic inflammation by reducing vasodilation, oedema, and substance P-mediated inflammation. Rosaliss™ uses Plant Small RNA Technology (PSR™) to activate MARCKSL1 and miR-132 skin self-repair markers.",
    product: "DERMASHIELD™",
    slug: "dermashield",
    stat: "Clinically validated for sensitised and post-procedure skin",
    source: "Neutrazen™ and Rosaliss™ supplier data, Lubrizol / Ashland",
    sourceUrl: "https://www.lubrizol.com/Personal-Care/Products/Neutrazen",
  },
];

export default function SciencePage() {
  useSEO({
    title: "The Science Behind Our Anti-Ageing Serums",
    description: "Clinical-grade peptide serums built on six verified biological pathways. SNAP-8™, Progeline™, Argireline® — every active at or above its minimum effective concentration. Melbourne, Australia.",
    url: "/science",
  });

  
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF7" }}>
      <Navbar />

      {/* Header */}
      <div className="pt-28 pb-10" style={{ background: "#2D2C2C" }}>
        <div className="container max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px" style={{ background: "rgba(234,234,223,0.3)" }} />
            <span className="text-xs tracking-widest uppercase font-medium" style={{ color: "rgba(234,234,223,0.45)" }}>
              Our Science
            </span>
          </div>
          <h1 className="font-display font-light mb-4" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "#EAEADF" }}>
            Mechanism over marketing.
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(234,234,223,0.55)" }}>
            Every product in the Reni system is built around a single, verified biological mechanism. 
            No ingredient cocktails. No marketing claims without clinical data. 
            Every active is formulated at or above its minimum effective concentration.
          </p>
        </div>
      </div>

      {/* Pathways */}
      <div className="container py-20">
        <div className="space-y-20">
          {PATHWAYS.map((pw, i) => (
            <div
              key={pw.number}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
            >
              <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                <div className="flex items-center gap-4 mb-6">
                  <span
                    className="font-display text-5xl font-light"
                    style={{ color: "rgba(45,44,44,0.1)" }}
                  >
                    {pw.number}
                  </span>
                  <div>
                    <div className="text-xs tracking-widest uppercase font-medium mb-1" style={{ color: "#6B7A3E" }}>
                      {pw.name}
                    </div>
                    <h2 className="font-display text-2xl font-light" style={{ color: "#2D2C2C" }}>
                      {pw.headline}
                    </h2>
                  </div>
                </div>
                <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(45,44,44,0.65)" }}>
                  {pw.body}
                </p>
                <div className="p-4 mb-6" style={{ background: "#EAEADF", borderLeft: "3px solid #6B7A3E" }}>
                  <p className="text-xs font-medium mb-1" style={{ color: "#2D2C2C" }}>Clinical Finding</p>
                  <p className="text-sm italic" style={{ color: "rgba(45,44,44,0.7)" }}>"{pw.stat}"</p>
                  <p className="text-xs mt-1" style={{ color: "rgba(45,44,44,0.4)" }}>
                    Source:{" "}
                    <a
                      href={pw.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2 hover:opacity-70 transition-opacity"
                      style={{ color: "rgba(45,44,44,0.55)" }}
                    >
                      {pw.source}
                    </a>
                  </p>
                </div>
                <Link href={`/products/${pw.slug}`} className="btn-reni-outline text-xs">Explore {pw.product}</Link>
              </div>
              <div className={`flex items-center justify-center p-12 ${i % 2 === 1 ? "lg:order-1" : ""}`} style={{ background: "#F2F2EC" }}>
                <div className="text-center">
                  <div
                    className="font-display text-6xl font-light mb-2"
                    style={{ color: "rgba(45,44,44,0.08)" }}
                  >
                    {pw.number}
                  </div>
                  <div className="text-xs tracking-widest uppercase font-medium" style={{ color: "#6B7A3E" }}>
                    {pw.name}
                  </div>
                  <div className="font-display text-xl font-light mt-2" style={{ color: "#2D2C2C" }}>
                    {pw.product}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Philosophy */}
      <div className="py-20" style={{ background: "#2D2C2C" }}>
        <div className="container max-w-3xl text-center">
          <h2 className="font-display text-3xl font-light mb-6" style={{ color: "#EAEADF" }}>
            The One Pathway Principle
          </h2>
          <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(234,234,223,0.55)" }}>
            The skincare industry's default approach is to combine as many actives as possible into a single product. 
            The result is a cocktail of competing mechanisms, unpredictable interactions, and diluted concentrations 
            that rarely reach the minimum effective dose for any single ingredient.
          </p>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "rgba(234,234,223,0.55)" }}>
            Reni Cosmetics is built on the opposite principle. One product. One pathway. 
            Every active at or above its clinically validated concentration. 
            Sequenced to layer without interference.
          </p>
          <Link href="/shop" className="btn-reni-cream">Shop the System</Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
