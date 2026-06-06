import { useEffect } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageErrorBoundary from "@/components/PageErrorBoundary";
import { useSEO } from "@/hooks/useSEO";
import { Sun, Moon, ArrowRight } from "lucide-react";

const AM_STEPS = [
  {
    order: "01",
    product: "NEUROVÉCTRIX™ Core",
    slug: "neurovectrix-core",
    type: "Neuromodulating Serum",
    why: "Applied first on clean skin — peptides require direct contact with the epidermis for maximum absorption. The SNARE-inhibiting peptides work most effectively before any occlusives or emollients.",
    texture: "Lightweight gel",
    wait: "45 seconds",
    tip: "Apply 3–4 drops to forehead, cheeks, and chin. Press gently — do not rub.",
  },
  {
    order: "02",
    product: "RECEPTORLIFT™",
    slug: "receptorlift",
    type: "Structural Firming Serum",
    why: "Applied second to allow the peptide layer to absorb fully. Progeline™ and Matrixyl™ Morphomics work at the dermal-epidermal junction — they need to penetrate past the peptide layer, not compete with it.",
    texture: "Silky fluid",
    wait: "60 seconds",
    tip: "Apply 2–3 drops, focusing on the jawline, neck, and areas of visible laxity.",
  },
  {
    order: "03",
    product: "SPF Moisturiser",
    slug: null,
    type: "Sun Protection (not Reni)",
    why: "Seal the active layers with a broad-spectrum SPF 30+ moisturiser. This is not optional — UV radiation is the primary driver of extrinsic ageing and will undermine the results of every active you apply.",
    texture: "Your choice",
    wait: null,
    tip: "Apply generously and evenly. Reapply every 2 hours if outdoors.",
  },
];

const PM_STEPS = [
  {
    order: "01",
    product: "NEUROVÉCTRIX™ Core",
    slug: "neurovectrix-core",
    type: "Neuromodulating Serum",
    why: "Repeat the AM application. Neuromodulation is a continuous process — twice-daily use maintains the SNARE complex inhibition effect. PM application also benefits from the skin's elevated repair activity overnight.",
    texture: "Lightweight gel",
    wait: "45 seconds",
    tip: "Same application as AM — 3–4 drops, press gently.",
  },
  {
    order: "02",
    product: "STRESSDEFENSE™",
    slug: "stressdefense",
    type: "Anti-Inflammaging Serum",
    why: "Inflammaging — chronic low-grade inflammation — peaks during the day and needs to be resolved at night. Applying STRESSDEFENSE™ in the PM allows Progeline™ and Ectoin® to work during the skin's peak repair window.",
    texture: "Rich serum",
    wait: "90 seconds",
    tip: "Apply 3–4 drops. Concentrate on areas of redness, sensitivity, or visible aging.",
  },
  {
    order: "03",
    product: "DERMASHIELD™",
    slug: "dermashield",
    type: "Barrier Renewal Cream",
    why: "The final step — a ceramide-rich cream that seals the active layers and supports the skin's barrier repair cycle overnight. Rosaliss™ PSR technology works at the gene level to upregulate filaggrin synthesis while you sleep.",
    texture: "Velvet cream",
    wait: null,
    tip: "Apply a pea-sized amount to the full face and neck. This is your occlusive seal — don't skip it.",
  },
];

const RULES = [
  {
    rule: "Thinnest to thickest",
    detail: "Always apply in order of texture — from the lightest, most water-based formula to the richest. This ensures each active layer can penetrate before being sealed.",
  },
  {
    rule: "Press, don't rub",
    detail: "Peptides are fragile molecules. Rubbing creates friction that can disrupt the formula and reduce absorption. Press gently with fingertips.",
  },
  {
    rule: "Wait between steps",
    detail: "Each product needs 45–90 seconds to absorb before the next is applied. This is not optional — layering too quickly dilutes each formula.",
  },
  {
    rule: "Clean skin only",
    detail: "Apply all Reni products to freshly cleansed, dry skin. Residue from previous products or makeup will reduce absorption.",
  },
  {
    rule: "Consistency over intensity",
    detail: "Results from peptide-based skincare are cumulative. Twice-daily use for 8–12 weeks produces measurably better outcomes than intermittent high-dose application.",
  },
];

export default function LayeringGuidePage() {
  useSEO({
    title: "Layering Guide — How to Use Reni Cosmetics",
    description: "The complete Reni Cosmetics layering guide. Step-by-step AM and PM protocol, application order, and expert tips for maximum efficacy.",
    url: "/layering-guide",
    structuredData: {
      type: "faq" as const,
      questions: [
        { question: "What order should I apply Reni Cosmetics products?", answer: "Apply in order of texture — thinnest to thickest. AM: NEUROVÉCTRIX™ Core → RECEPTORLIFT™ → SPF. PM: NEUROVÉCTRIX™ Core → STRESSDEFENSE™ → DERMASHIELD™." },
        { question: "How long should I wait between applying each product?", answer: "Wait 45–90 seconds between each product to allow full absorption before applying the next layer." },
        { question: "Can I use all Reni products together?", answer: "Yes — the Reni system is designed as a complete AM/PM protocol. Each product targets a distinct biological pathway, so there is no mechanism conflict when layered correctly." },
      ],
    },
  });

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <PageErrorBoundary pageName="Layering Guide">
      <div className="min-h-screen" style={{ background: "#FAFAF7" }}>
        <Navbar />

        {/* Header */}
        <div className="pt-28 pb-16" style={{ background: "#2D2C2C" }}>
          <div className="container">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px" style={{ background: "rgba(234,234,223,0.25)" }} />
              <span className="text-[10px] tracking-[0.22em] uppercase font-medium" style={{ color: "rgba(234,234,223,0.4)" }}>
                Protocol
              </span>
            </div>
            <h1
              className="font-display font-light mb-4"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "#EAEADF", letterSpacing: "-0.01em" }}
            >
              The Layering Guide
            </h1>
            <p className="text-sm max-w-xl" style={{ color: "rgba(234,234,223,0.5)" }}>
              Application order is not arbitrary. The sequence below is based on the chemistry of each formula and the biology of how skin absorbs actives. Follow it exactly for maximum efficacy.
            </p>
          </div>
        </div>

        <div className="container py-16 max-w-4xl">

          {/* Rules */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="reni-divider" />
              <span className="reni-tag">The Five Rules</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {RULES.map((r, i) => (
                <div key={i} className="flex items-start gap-4 p-5" style={{ background: "#EAEADF" }}>
                  <span
                    className="font-display font-light flex-shrink-0"
                    style={{ fontSize: "1.5rem", color: "rgba(45,44,44,0.15)", lineHeight: 1 }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-xs font-semibold mb-1" style={{ color: "#2D2C2C" }}>{r.rule}</p>
                    <p className="text-xs leading-relaxed" style={{ color: "rgba(45,44,44,0.6)" }}>{r.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AM Protocol */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <Sun size={16} color="#6B7A3E" />
              <h2 className="font-display text-2xl font-light" style={{ color: "#2D2C2C" }}>
                Morning Protocol (AM)
              </h2>
            </div>
            <div className="space-y-6">
              {AM_STEPS.map((step) => (
                <div key={step.order} className="grid grid-cols-1 md:grid-cols-12 gap-0">
                  <div className="md:col-span-1 flex items-start pt-5 pb-5 md:pb-0 md:pr-4">
                    <span
                      className="font-display font-light"
                      style={{ fontSize: "2rem", color: "rgba(45,44,44,0.12)", lineHeight: 1 }}
                    >
                      {step.order}
                    </span>
                  </div>
                  <div
                    className="md:col-span-11 p-5"
                    style={{ background: "#FFFFFF", borderLeft: "3px solid #6B7A3E" }}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="font-display text-base font-medium" style={{ color: "#2D2C2C" }}>
                          {step.product}
                        </p>
                        <p className="text-[10px] tracking-widest uppercase" style={{ color: "rgba(45,44,44,0.4)" }}>
                          {step.type}
                        </p>
                      </div>
                      <div className="flex gap-3 flex-shrink-0">
                        <div className="text-center">
                          <p className="text-[9px] tracking-widest uppercase mb-0.5" style={{ color: "rgba(45,44,44,0.35)" }}>Texture</p>
                          <p className="text-xs font-medium" style={{ color: "#2D2C2C" }}>{step.texture}</p>
                        </div>
                        {step.wait && (
                          <div className="text-center">
                            <p className="text-[9px] tracking-widest uppercase mb-0.5" style={{ color: "rgba(45,44,44,0.35)" }}>Wait</p>
                            <p className="text-xs font-medium" style={{ color: "#2D2C2C" }}>{step.wait}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed mb-3" style={{ color: "rgba(45,44,44,0.6)" }}>
                      <strong style={{ color: "#2D2C2C" }}>Why this order:</strong> {step.why}
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: "rgba(45,44,44,0.55)", borderTop: "1px solid rgba(45,44,44,0.08)", paddingTop: "10px" }}>
                      <strong style={{ color: "#6B7A3E" }}>Application tip:</strong> {step.tip}
                    </p>
                    {step.slug && (
                      <Link
                        href={`/products/${step.slug}`}
                        className="inline-flex items-center gap-1.5 mt-3 text-[10px] tracking-widest uppercase font-medium hover:opacity-70 transition-opacity"
                        style={{ color: "rgba(45,44,44,0.5)" }}
                      >
                        View Product <ArrowRight size={10} />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PM Protocol */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <Moon size={16} color="#6B7A3E" />
              <h2 className="font-display text-2xl font-light" style={{ color: "#2D2C2C" }}>
                Evening Protocol (PM)
              </h2>
            </div>
            <div className="space-y-6">
              {PM_STEPS.map((step) => (
                <div key={step.order} className="grid grid-cols-1 md:grid-cols-12 gap-0">
                  <div className="md:col-span-1 flex items-start pt-5 pb-5 md:pb-0 md:pr-4">
                    <span
                      className="font-display font-light"
                      style={{ fontSize: "2rem", color: "rgba(45,44,44,0.12)", lineHeight: 1 }}
                    >
                      {step.order}
                    </span>
                  </div>
                  <div
                    className="md:col-span-11 p-5"
                    style={{ background: "#FFFFFF", borderLeft: "3px solid #2D2C2C" }}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="font-display text-base font-medium" style={{ color: "#2D2C2C" }}>
                          {step.product}
                        </p>
                        <p className="text-[10px] tracking-widest uppercase" style={{ color: "rgba(45,44,44,0.4)" }}>
                          {step.type}
                        </p>
                      </div>
                      <div className="flex gap-3 flex-shrink-0">
                        <div className="text-center">
                          <p className="text-[9px] tracking-widest uppercase mb-0.5" style={{ color: "rgba(45,44,44,0.35)" }}>Texture</p>
                          <p className="text-xs font-medium" style={{ color: "#2D2C2C" }}>{step.texture}</p>
                        </div>
                        {step.wait && (
                          <div className="text-center">
                            <p className="text-[9px] tracking-widest uppercase mb-0.5" style={{ color: "rgba(45,44,44,0.35)" }}>Wait</p>
                            <p className="text-xs font-medium" style={{ color: "#2D2C2C" }}>{step.wait}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed mb-3" style={{ color: "rgba(45,44,44,0.6)" }}>
                      <strong style={{ color: "#2D2C2C" }}>Why this order:</strong> {step.why}
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: "rgba(45,44,44,0.55)", borderTop: "1px solid rgba(45,44,44,0.08)", paddingTop: "10px" }}>
                      <strong style={{ color: "#6B7A3E" }}>Application tip:</strong> {step.tip}
                    </p>
                    {step.slug && (
                      <Link
                        href={`/products/${step.slug}`}
                        className="inline-flex items-center gap-1.5 mt-3 text-[10px] tracking-widest uppercase font-medium hover:opacity-70 transition-opacity"
                        style={{ color: "rgba(45,44,44,0.5)" }}
                      >
                        View Product <ArrowRight size={10} />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="p-8 text-center" style={{ background: "#2D2C2C" }}>
            <p className="font-display text-xl font-light mb-2" style={{ color: "#EAEADF" }}>
              Ready to start your protocol?
            </p>
            <p className="text-xs mb-6" style={{ color: "rgba(234,234,223,0.5)" }}>
              Not sure which products are right for your skin? Take the 60-second assessment.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/quiz">
                <button className="px-8 py-3 text-xs tracking-widest uppercase font-medium" style={{ background: "#EAEADF", color: "#2D2C2C" }}>
                  Find My Protocol
                </button>
              </Link>
              <Link href="/shop">
                <button className="px-8 py-3 text-xs tracking-widest uppercase font-medium" style={{ background: "transparent", color: "#EAEADF", border: "1px solid rgba(234,234,223,0.3)" }}>
                  Shop the Collection
                </button>
              </Link>
            </div>
          </div>

        </div>

        <Footer />
      </div>
    </PageErrorBoundary>
  );
}
