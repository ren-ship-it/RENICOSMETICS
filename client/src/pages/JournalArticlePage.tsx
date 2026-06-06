import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageErrorBoundary from "@/components/PageErrorBoundary";
import { useSEO } from "@/hooks/useSEO";
import { PRODUCTS } from "@/data/products";

const JOURNAL_SCIENCE_CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663375502795/fiWabj6oJEMnYrutYEZXeW/journal-science_30dd00d5.jpg";
const JOURNAL_FORMULATION_CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663375502795/fiWabj6oJEMnYrutYEZXeW/journal-formulation_0d44efc5.jpg";
const SERUM_TEXTURE_CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663375502795/fiWabj6oJEMnYrutYEZXeW/serum-texture_4f73333f.jpg";

const CATEGORY_COLORS: Record<string, string> = {
  Science: "#6B7A3E",
  Formulation: "#7A6B3E",
  Ingredients: "#3E6B7A",
  Protocol: "#6B3E7A",
};

interface Article {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  image: string;
  body: string[];
  relatedProductIds: string[];
}

const ARTICLES: Article[] = [
  {
    id: "why-one-pathway-per-product-matters",
    category: "Science",
    title: "Why One Pathway Per Product Matters",
    excerpt: "The skincare industry defaults to ingredient cocktails. Here's why that approach dilutes efficacy — and what the science says about single-mechanism formulation.",
    date: "February 2026",
    readTime: "6 min read",
    image: JOURNAL_SCIENCE_CDN,
    relatedProductIds: ["neurovectrix-core", "stressdefense"],
    body: [
      "Walk into any pharmacy and pick up a serum at random. Flip it over. You'll find a list of 20, 30, sometimes 40 active ingredients — each one backed by its own clinical study, each one promising a different result. Retinol for cell turnover. Niacinamide for barrier function. Vitamin C for brightening. Peptides for collagen. Hyaluronic acid for hydration. All in one bottle.",
      "The logic seems sound: more actives, more benefits. But this is where cosmetic marketing diverges from cosmetic chemistry.",
      "**The concentration problem.** Every clinically validated active ingredient has a minimum effective concentration — the lowest dose at which it produces a measurable biological response. For SNAP-8™, that's 3–10%. For Argireline®, it's 2–10%. For Matrixyl™ 3000, it's 3–8%. These are not arbitrary numbers. They come from the same in vitro and in vivo studies that the brands use to justify their marketing claims.",
      "When you formulate 30 actives into a single product, you face a mathematical reality: a 30ml serum cannot contain 30 actives at their validated concentrations. The percentages don't add up. Something has to give. What gives is almost always the concentration of each active — reduced to a level that satisfies the ingredient list without delivering the clinical result.",
      "**The mechanism conflict problem.** The second issue is less discussed but equally important. Many actives work through competing or antagonistic mechanisms. Retinoids and AHAs both accelerate cell turnover — layering them doesn't double the effect, it risks over-exfoliation and barrier disruption. Vitamin C (ascorbic acid) is pH-sensitive and can be destabilised by alkaline actives in the same formula. Niacinamide and vitamin C have historically been reported to interact (though the evidence is contested).",
      "The point is not that these combinations are always harmful. The point is that formulating multiple actives into a single product requires compromises — in concentration, in pH, in stability, in delivery — that the marketing never mentions.",
      "**The Reni approach.** NEUROVÉCTRIX™ Core contains two neuromodulating peptides — SNAP-8™ and Argireline® Amplified — both working through the same SNARE complex pathway, at their validated concentrations, in a vehicle optimised for peptide delivery. That's it. No competing mechanisms. No diluted cocktails. One pathway, addressed completely.",
      "This is not minimalism. It's precision. And precision is what produces results that are reproducible, predictable, and clinically defensible.",
    ],
  },
  {
    id: "the-science-of-circadian-skincare",
    category: "Formulation",
    title: "The Science of Circadian Skincare",
    excerpt: "Skin has its own biological clock. Understanding the circadian rhythm of skin repair, barrier function, and collagen synthesis is the foundation of the Reni PM protocol.",
    date: "February 2026",
    readTime: "8 min read",
    image: JOURNAL_FORMULATION_CDN,
    relatedProductIds: ["stressdefense", "dermashield"],
    body: [
      "The skin is not a passive barrier. It is a metabolically active organ with its own circadian clock — a 24-hour biological rhythm that governs when it repairs, when it defends, and when it renews.",
      "Understanding this rhythm is not an academic exercise. It has direct implications for when you apply your skincare, which actives you use at which time of day, and why the Reni system is structured as a distinct AM and PM protocol.",
      "**What happens to skin at night.** Between approximately 11pm and 4am, skin enters its peak repair phase. Cell proliferation accelerates. DNA repair enzymes are most active. Collagen synthesis increases. The skin's natural desquamation (shedding) cycle peaks in the early hours of the morning. Transepidermal water loss (TEWL) also increases at night — meaning the skin loses more moisture while you sleep, which is why barrier support in the PM is critical.",
      "**What happens to skin during the day.** In the morning and through the day, the skin shifts from repair mode to defence mode. Antioxidant enzyme activity peaks. The skin's barrier function is at its strongest. Sebum production increases. The skin is primed to protect against UV radiation, pollution, and environmental stressors.",
      "**The formulation implication.** A skincare routine that ignores this rhythm is leaving results on the table. Applying a collagen-stimulating peptide in the morning — when the skin is in defence mode — is less effective than applying it at night, when the skin's repair machinery is already activated and receptive.",
      "The Reni PM protocol is built around this biology. STRESSDEFENSE™ addresses inflammaging and oxidative stress — both of which accumulate during the day and need to be resolved at night for the skin's repair cycle to proceed unimpeded. NEUROVÉCTRIX™ Core is used in both AM and PM because neuromodulation of expression lines is a continuous process, but its synergy with the PM repair cycle is particularly valuable.",
      "**A note on chronobiology research.** The field of skin chronobiology is relatively young — most of the foundational research has been published in the last 15 years. The circadian regulation of skin barrier function, collagen synthesis, and immune response is now well-established in peer-reviewed literature. We cite the primary sources on our Science page.",
    ],
  },
  {
    id: "snap-8-vs-argireline",
    category: "Ingredients",
    title: "SNAP-8™ vs Argireline®: What's the Difference?",
    excerpt: "Both are neuromodulating peptides. Both target the SNARE complex. But they work at different points in the same pathway — and that's why NEUROVÉCTRIX™ Core uses both.",
    date: "January 2026",
    readTime: "5 min read",
    image: SERUM_TEXTURE_CDN,
    relatedProductIds: ["neurovectrix-core"],
    body: [
      "If you've spent any time researching peptide serums, you've encountered both SNAP-8™ and Argireline® (acetyl hexapeptide-3). They're often described interchangeably — both are 'botox alternatives,' both are 'neuromodulating peptides,' both 'relax expression lines.' The marketing language is nearly identical.",
      "But they are not the same molecule, and they do not work through exactly the same mechanism. Understanding the difference explains why NEUROVÉCTRIX™ Core uses both — and why using both together produces a more complete result than either alone.",
      "**The SNARE complex — a brief primer.** Muscle contraction at the neuromuscular junction depends on the release of acetylcholine from nerve terminals. This release is controlled by the SNARE complex — a protein assembly that includes SNAP-25, Syntaxin 1A, and VAMP. When the SNARE complex forms, acetylcholine is released, the muscle contracts, and the skin folds into an expression line.",
      "**How Argireline® works.** Argireline® (acetyl hexapeptide-3) is a hexapeptide that mimics the N-terminal end of SNAP-25. It competes with SNAP-25 for binding to Syntaxin 1A — one of the key SNARE complex proteins. By occupying this binding site, Argireline® partially inhibits SNARE complex formation, reducing acetylcholine release and attenuating muscle contraction.",
      "**How SNAP-8™ works.** SNAP-8™ (acetyl octapeptide-3) is an octapeptide — two amino acids longer than Argireline®. It also mimics SNAP-25, but at a different region of the protein. Where Argireline® targets the N-terminal end, SNAP-8™ targets a broader segment of SNAP-25, providing a more complete competitive inhibition of SNARE complex formation.",
      "In clinical studies, SNAP-8™ at 10% has been shown to reduce the depth of expression wrinkles by up to 63% after 28 days. Argireline® at 10% has been shown to reduce wrinkle depth by approximately 30% over the same period. These are not directly comparable figures — the studies used different methodologies — but they suggest that SNAP-8™ may provide a more potent effect at equivalent concentrations.",
      "**Why use both.** The two peptides target different binding sites on the same SNARE complex pathway. Using both provides a more complete inhibition of the pathway than either alone — similar to how combination therapy in pharmacology often produces superior results to monotherapy. NEUROVÉCTRIX™ Core formulates SNAP-8™ at 10% and Argireline® Amplified at 2%, in a vehicle optimised for peptide penetration.",
    ],
  },
  {
    id: "how-to-layer-actives-without-conflict",
    category: "Protocol",
    title: "How to Layer Actives Without Conflict",
    excerpt: "The most common mistake in skincare routines is layering products with competing pH requirements or antagonistic mechanisms. Here's how the Reni system avoids it.",
    date: "January 2026",
    readTime: "7 min read",
    image: JOURNAL_SCIENCE_CDN,
    relatedProductIds: ["neurovectrix-core", "receptorlift", "stressdefense", "dermashield"],
    body: [
      "The question we hear most often from people transitioning to the Reni system is: 'Can I use this with my existing products?' It's a reasonable question. And the honest answer is: it depends entirely on what those products contain.",
      "Layering skincare actives is not as simple as applying them in order of texture (thinnest to thickest). The chemistry matters. pH matters. Mechanism matters. And when you get it wrong, you don't just lose efficacy — you can actively compromise your barrier or cause irritation.",
      "**The pH problem.** Many actives are pH-sensitive. Vitamin C (L-ascorbic acid) requires a pH below 3.5 to remain stable and penetrate the skin effectively. AHAs (glycolic, lactic, mandelic) work best at pH 3–4. Retinoids are most stable at pH 5–6. Peptides — including all the actives in the Reni system — are typically formulated at pH 5–7, close to the skin's natural pH.",
      "Applying a low-pH AHA immediately before a peptide serum can temporarily acidify the skin surface, potentially affecting peptide stability and penetration. The solution is simple: wait 20–30 minutes between applications, or use pH-sensitive actives at different times of day.",
      "**The mechanism conflict problem.** Some actives work through mechanisms that directly interfere with each other. Retinoids accelerate cell turnover by binding to nuclear receptors and upregulating gene expression. AHAs accelerate cell turnover by dissolving the bonds between dead skin cells. Using both simultaneously doesn't double the turnover rate — it increases the risk of over-exfoliation, barrier disruption, and sensitisation.",
      "**How the Reni system is designed.** Every product in the Reni system is formulated to work with the others. The pH ranges are compatible. The mechanisms are complementary, not competing. NEUROVÉCTRIX™ Core addresses neuromodulation. RECEPTORLIFT™ addresses receptor-mediated lifting. STRESSDEFENSE™ addresses inflammaging. DERMASHIELD™ addresses barrier renewal. Four products. Four pathways. Zero mechanism conflicts.",
      "If you're integrating Reni products with products from other brands, the general rule is: apply Reni products first (after cleansing and toning), allow 2–3 minutes for absorption, then apply any additional products. Avoid using AHAs, BHAs, or retinoids in the same step as Reni serums. If you use vitamin C in the morning, apply it before NEUROVÉCTRIX™ Core and allow it to absorb fully first.",
    ],
  },
  {
    id: "inflammaging-the-hidden-driver",
    category: "Science",
    title: "Inflammaging: The Hidden Driver of Structural Aging",
    excerpt: "Chronic low-grade inflammation — inflammaging — accelerates the breakdown of collagen, elastin, and the extracellular matrix. STRESSDEFENSE™ was built to address it.",
    date: "December 2025",
    readTime: "9 min read",
    image: JOURNAL_FORMULATION_CDN,
    relatedProductIds: ["stressdefense"],
    body: [
      "In 2000, immunologist Claudio Franceschi coined the term 'inflammaging' to describe a phenomenon that had been accumulating in the scientific literature for decades: the observation that aging is accompanied by a chronic, low-grade, systemic inflammatory state — even in the absence of acute infection or injury.",
      "This is not the inflammation you feel when you cut your finger. It's quieter, slower, and far more damaging over time. And in the skin, it is one of the primary drivers of structural aging.",
      "**How inflammaging damages skin.** Chronic low-grade inflammation activates matrix metalloproteinases (MMPs) — enzymes that break down collagen and elastin in the extracellular matrix (ECM). It upregulates pro-inflammatory cytokines including IL-1β, IL-6, and TNF-α, which further accelerate ECM degradation. It impairs fibroblast function, reducing the skin's capacity to synthesise new collagen. And it disrupts the skin barrier, increasing transepidermal water loss and sensitising the skin to environmental stressors.",
      "The result is the structural collapse that characterises aged skin: loss of volume, deepening of lines and folds, reduced elasticity, and a compromised barrier that struggles to retain moisture and resist irritants.",
      "**What drives inflammaging in skin.** UV radiation is the most significant exogenous driver — it activates NF-κB, the master regulator of inflammation, and triggers a cascade of pro-inflammatory signalling. Pollution, particularly particulate matter, activates the same pathway through oxidative stress. Glycation — the non-enzymatic reaction between glucose and proteins — produces advanced glycation end-products (AGEs) that cross-link collagen and trigger inflammatory responses. And the skin's own aging process — the accumulation of senescent cells that secrete pro-inflammatory factors — contributes to a self-reinforcing cycle.",
      "**STRESSDEFENSE™ and the anti-inflammaging approach.** STRESSDEFENSE™ was formulated specifically to interrupt this cycle. Neutrazen™ (palmitoyl tripeptide-8) reduces neurogenic inflammation by inhibiting substance P-mediated vasodilation and oedema — addressing one of the key upstream triggers of the inflammaging cascade. Lipochroman™-6 is a potent lipophilic antioxidant that neutralises reactive oxygen species before they can activate NF-κB. Chronoboost™ supports circadian regulation of skin repair, ensuring the skin's anti-inflammatory mechanisms are active at the right time of day.",
      "This is not a 'calming' serum in the conventional sense. It is a targeted intervention in the biological pathway that drives structural aging — formulated at concentrations that produce measurable results, not just a pleasant texture.",
    ],
  },
  {
    id: "plant-small-rna-technology",
    category: "Ingredients",
    title: "Plant Small RNA Technology: How Rosaliss™ Works",
    excerpt: "PSR™ technology uses plant-derived small RNA molecules to activate the skin's own repair genes. A deep dive into the science behind DERMASHIELD™'s barrier renewal complex.",
    date: "December 2025",
    readTime: "6 min read",
    image: SERUM_TEXTURE_CDN,
    relatedProductIds: ["dermashield"],
    body: [
      "Gene expression in skin cells is regulated by a complex network of signalling molecules — growth factors, cytokines, transcription factors. But one class of regulators has attracted significant research attention in recent years: small RNA molecules, specifically microRNAs (miRNAs), which act as post-transcriptional regulators of gene expression.",
      "Rosaliss™ is a plant-derived active that uses PSR™ (Plant Small RNA) technology — a delivery system that introduces plant-origin small RNA molecules into skin cells to modulate the expression of genes involved in barrier function and repair.",
      "**The science of small RNA.** MicroRNAs are short, non-coding RNA molecules (approximately 22 nucleotides) that bind to complementary sequences in messenger RNA (mRNA), preventing translation or triggering mRNA degradation. In this way, they act as molecular switches — turning specific genes on or off without altering the underlying DNA sequence.",
      "In skin, miRNAs regulate a wide range of processes: keratinocyte differentiation, barrier protein synthesis (including filaggrin, loricrin, and involucrin), inflammatory signalling, and wound healing. Dysregulation of skin miRNAs has been associated with barrier dysfunction, inflammatory skin conditions, and accelerated aging.",
      "**How Rosaliss™ works.** Rosaliss™ is derived from Rosa canina (rosehip) and contains a specific profile of plant-derived small RNA molecules that have been shown to upregulate the expression of barrier proteins — particularly filaggrin, the key structural protein of the stratum corneum — in human keratinocytes.",
      "In clinical studies, Rosaliss™ at 1% has been shown to increase filaggrin expression by up to 47% after 28 days of twice-daily application, with corresponding improvements in skin hydration, barrier integrity (measured by TEWL), and skin smoothness.",
      "**The delivery challenge.** Small RNA molecules are inherently unstable — they are rapidly degraded by RNases present on the skin surface and in the stratum corneum. Rosaliss™ addresses this through encapsulation technology that protects the active RNA molecules during penetration and releases them in the viable epidermis, where they can interact with keratinocyte gene expression machinery.",
      "DERMASHIELD™ formulates Rosaliss™ at 1% alongside Ceramide NP, Ceramide AP, and Ceramide EOP — three of the six ceramide species found in the natural stratum corneum — to provide both gene-level barrier repair and direct lipid replenishment.",
    ],
  },
];

export default function JournalArticlePage() {
  const params = useParams<{ slug: string }>();
  const article = ARTICLES.find(a => a.id === params.slug);

  useSEO({
    title: article ? `${article.title} — Reni Journal` : "Article Not Found",
    description: article?.excerpt || "",
    url: `/journal/${params.slug}`,
    type: "article",
    image: article?.image,
    structuredData: article ? {
      type: "article" as const,
      headline: article.title,
      description: article.excerpt,
      datePublished: article.date,
      image: article.image,
      author: "Reni Cosmetics Editorial",
    } : undefined,
  });

  useEffect(() => { window.scrollTo(0, 0); }, [params.slug]);

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAF7" }}>
        <div className="text-center">
          <p className="font-display text-2xl mb-4" style={{ color: "#2D2C2C" }}>Article not found.</p>
          <Link href="/journal" className="btn-reni-dark">Back to Journal</Link>
        </div>
      </div>
    );
  }

  const relatedProducts = PRODUCTS.filter(p => article.relatedProductIds.includes(p.slug) && p.available);
  const otherArticles = ARTICLES.filter(a => a.id !== article.id).slice(0, 3);

  return (
    <PageErrorBoundary pageName={`Journal — ${article.title}`}>
      <div className="min-h-screen" style={{ background: "#FAFAF7" }}>
        <Navbar />

        {/* Hero */}
        <div
          className="relative"
          style={{ minHeight: "52vh", background: "#1E1D1D" }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center opacity-35"
            style={{ backgroundImage: `url(${article.image})` }}
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 20%, #1E1D1D 100%)" }} />
          <div className="relative z-10 container pb-14 pt-36">
            <Link href="/journal" className="flex items-center gap-2 text-xs mb-8 hover:opacity-70 transition-opacity" style={{ color: "rgba(234,234,223,0.45)" }}>
              <ArrowLeft size={12} />
              Back to Journal
            </Link>
            <div className="flex items-center gap-3 mb-5">
              <span
                className="text-[9px] font-semibold tracking-[0.2em] uppercase px-2.5 py-1"
                style={{ background: CATEGORY_COLORS[article.category] || "#6B7A3E", color: "#FAFAF7" }}
              >
                {article.category}
              </span>
              <span className="text-[10px]" style={{ color: "rgba(234,234,223,0.35)" }}>{article.date}</span>
              <span style={{ color: "rgba(234,234,223,0.2)" }}>·</span>
              <span className="text-[10px]" style={{ color: "rgba(234,234,223,0.35)" }}>{article.readTime}</span>
            </div>
            <h1
              className="font-display font-light leading-tight"
              style={{ fontSize: "clamp(1.8rem, 4.5vw, 3.2rem)", color: "#EAEADF", letterSpacing: "-0.02em", maxWidth: "760px" }}
            >
              {article.title}
            </h1>
          </div>
        </div>

        {/* Article body */}
        <section className="py-16 md:py-24" style={{ background: "#FAFAF7" }}>
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              {/* Main content */}
              <div className="lg:col-span-2">
                <p
                  className="text-base leading-relaxed mb-8 font-light"
                  style={{ color: "rgba(45,44,44,0.75)", fontSize: "1.05rem" }}
                >
                  {article.excerpt}
                </p>
                <div className="w-12 h-px mb-8" style={{ background: "rgba(45,44,44,0.15)" }} />
                <div className="space-y-6">
                  {article.body.map((para, i) => {
                    // Handle **bold** markdown-style headings
                    if (para.startsWith("**") && para.includes("**")) {
                      const parts = para.split(/\*\*(.*?)\*\*/g);
                      return (
                        <p key={i} className="text-sm leading-relaxed" style={{ color: "rgba(45,44,44,0.68)" }}>
                          {parts.map((part, j) =>
                            j % 2 === 1
                              ? <strong key={j} style={{ color: "#2D2C2C", fontWeight: 600 }}>{part}</strong>
                              : part
                          )}
                        </p>
                      );
                    }
                    return (
                      <p key={i} className="text-sm leading-relaxed" style={{ color: "rgba(45,44,44,0.68)" }}>
                        {para}
                      </p>
                    );
                  })}
                </div>

                {/* Disclaimer */}
                <div
                  className="mt-12 p-4 flex items-start gap-3"
                  style={{ background: "rgba(45,44,44,0.04)", border: "1px solid rgba(45,44,44,0.08)" }}
                >
                  <div className="w-0.5 self-stretch flex-shrink-0" style={{ background: "#6B7A3E" }} />
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(45,44,44,0.45)" }}>
                    All content in the Reni Journal is for informational purposes only. Products are for topical and cosmetic use only. No therapeutic or TGA-registered claims are made. Melbourne, Victoria, Australia.
                  </p>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                {/* Related products */}
                {relatedProducts.length > 0 && (
                  <div className="mb-10">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="reni-divider" />
                      <span className="reni-tag">Referenced Products</span>
                    </div>
                    <div className="space-y-3">
                      {relatedProducts.map(p => (
                        <Link key={p.id} href={`/products/${p.slug}`} className="flex items-center gap-4 p-3 group transition-opacity hover:opacity-80" style={{ background: "#EAEADF" }}>
                          <div className="flex-shrink-0" style={{ width: 52, height: 52, background: "#F2F2EC" }}>
                            <img src={p.image} alt={p.name} className="w-full h-full object-contain p-1" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-display text-xs font-medium truncate" style={{ color: "#2D2C2C" }}>{p.name}</div>
                            <div className="text-[10px] mt-0.5 truncate" style={{ color: "rgba(45,44,44,0.5)" }}>{p.tagline}</div>
                            <div className="text-xs font-semibold mt-1" style={{ color: "#2D2C2C" }}>{p.price}</div>
                          </div>
                          <ArrowRight size={12} color="rgba(45,44,44,0.35)" className="flex-shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* More articles */}
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="reni-divider" />
                    <span className="reni-tag">More Articles</span>
                  </div>
                  <div className="space-y-4">
                    {otherArticles.map(a => (
                      <Link key={a.id} href={`/journal/${a.id}`} className="block group">
                        <div
                          className="p-4 transition-opacity hover:opacity-80"
                          style={{ border: "1px solid rgba(45,44,44,0.1)" }}
                        >
                          <span
                            className="inline-block text-[9px] font-semibold tracking-[0.2em] uppercase px-2 py-0.5 mb-2"
                            style={{ background: CATEGORY_COLORS[a.category] || "#6B7A3E", color: "#FAFAF7" }}
                          >
                            {a.category}
                          </span>
                          <p className="text-xs font-medium leading-snug mb-1" style={{ color: "#2D2C2C" }}>{a.title}</p>
                          <p className="text-[10px]" style={{ color: "rgba(45,44,44,0.4)" }}>{a.readTime}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageErrorBoundary>
  );
}
