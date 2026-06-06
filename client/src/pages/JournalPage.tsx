import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageErrorBoundary from "@/components/PageErrorBoundary";
import { useSEO } from "@/hooks/useSEO";

// Editorial images — clinical/science aesthetic, not botanical
const JOURNAL_SCIENCE_CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663375502795/fiWabj6oJEMnYrutYEZXeW/journal-science_30dd00d5.jpg";
const JOURNAL_FORMULATION_CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663375502795/fiWabj6oJEMnYrutYEZXeW/journal-formulation_0d44efc5.jpg";
const SERUM_TEXTURE_CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663375502795/fiWabj6oJEMnYrutYEZXeW/serum-texture_4f73333f.jpg";

const ARTICLES = [
  {
    id: "why-one-pathway-per-product-matters",
    category: "Science",
    title: "Why One Pathway Per Product Matters",
    excerpt: "The skincare industry defaults to ingredient cocktails. Here's why that approach dilutes efficacy — and what the science says about single-mechanism formulation.",
    date: "February 2026",
    readTime: "6 min read",
    image: JOURNAL_SCIENCE_CDN,
  },
  {
    id: "the-science-of-circadian-skincare",
    category: "Formulation",
    title: "The Science of Circadian Skincare",
    excerpt: "Skin has its own biological clock. Understanding the circadian rhythm of skin repair, barrier function, and collagen synthesis is the foundation of the Reni PM protocol.",
    date: "February 2026",
    readTime: "8 min read",
    image: JOURNAL_FORMULATION_CDN,
  },
  {
    id: "snap-8-vs-argireline",
    category: "Ingredients",
    title: "SNAP-8™ vs Argireline®: What's the Difference?",
    excerpt: "Both are neuromodulating peptides. Both target the SNARE complex. But they work at different points in the same pathway — and that's why NEUROVÉCTRIX™ Core uses both.",
    date: "January 2026",
    readTime: "5 min read",
    image: SERUM_TEXTURE_CDN,
  },
  {
    id: "how-to-layer-actives-without-conflict",
    category: "Protocol",
    title: "How to Layer Actives Without Conflict",
    excerpt: "The most common mistake in skincare routines is layering products with competing pH requirements or antagonistic mechanisms. Here's how the Reni system avoids it.",
    date: "January 2026",
    readTime: "7 min read",
    image: JOURNAL_SCIENCE_CDN,
  },
  {
    id: "inflammaging-the-hidden-driver",
    category: "Science",
    title: "Inflammaging: The Hidden Driver of Structural Aging",
    excerpt: "Chronic low-grade inflammation — inflammaging — accelerates the breakdown of collagen, elastin, and the extracellular matrix. STRESSDEFENSE™ was built to address it.",
    date: "December 2025",
    readTime: "9 min read",
    image: JOURNAL_FORMULATION_CDN,
  },
  {
    id: "plant-small-rna-technology",
    category: "Ingredients",
    title: "Plant Small RNA Technology: How Rosaliss™ Works",
    excerpt: "PSR™ technology uses plant-derived small RNA molecules to activate the skin's own repair genes. A deep dive into the science behind DERMASHIELD™'s barrier renewal complex.",
    date: "December 2025",
    readTime: "6 min read",
    image: SERUM_TEXTURE_CDN,
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Science: "#6B7A3E",
  Formulation: "#7A6B3E",
  Ingredients: "#3E6B7A",
  Protocol: "#6B3E7A",
};

export default function JournalPage() {
  useSEO({
    title: "The Reni Journal",
    description: "In-depth articles on the science of structural anti-ageing, ingredient research, and clinical skincare protocols.",
    url: "/journal",
  });

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <PageErrorBoundary pageName="Journal">
      <div className="min-h-screen" style={{ background: "#FAFAF7" }}>
        <Navbar />

        {/* Header */}
        <div className="pt-24 pb-12" style={{ background: "#FAFAF7", borderBottom: "1px solid rgba(45,44,44,0.1)" }}>
          <div className="container">
            <div className="flex items-center gap-3 mb-5">
              <div className="reni-divider" />
              <span className="reni-tag">The Journal</span>
            </div>
            <h1
              className="font-display font-light mb-3"
              style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)", color: "#2D2C2C", letterSpacing: "-0.02em" }}
            >
              Science. Formulation. Protocol.
            </h1>
            <p className="text-sm max-w-lg" style={{ color: "rgba(45,44,44,0.5)" }}>
              In-depth articles on the science behind the Reni system, the ingredients we use, and the principles that guide our formulation philosophy.
            </p>
          </div>
        </div>

        {/* Articles */}
        <div className="container py-14">

          {/* Featured article */}
          <Link href={`/journal/${ARTICLES[0].id}`} className="block mb-16 group">
            <div
              className="grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden"
              style={{ border: "1px solid rgba(45,44,44,0.12)" }}
            >
              {/* Image */}
              <div className="overflow-hidden" style={{ aspectRatio: "4/3", background: "#1C1C1C" }}>
                <img
                  src={ARTICLES[0].image}
                  alt={ARTICLES[0].title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              {/* Content */}
              <div
                className="flex flex-col justify-center p-10 md:p-14"
                style={{ background: "#2D2C2C" }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <span
                    className="text-[9px] font-semibold tracking-[0.2em] uppercase px-2.5 py-1"
                    style={{ background: CATEGORY_COLORS[ARTICLES[0].category] || "#6B7A3E", color: "#FAFAF7" }}
                  >
                    {ARTICLES[0].category}
                  </span>
                  <span className="text-[10px] tracking-widest uppercase font-medium" style={{ color: "rgba(234,234,223,0.35)" }}>
                    Featured
                  </span>
                </div>
                <h2
                  className="font-display font-light leading-snug mb-5"
                  style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", color: "#EAEADF", letterSpacing: "-0.01em" }}
                >
                  {ARTICLES[0].title}
                </h2>
                <p className="text-sm leading-relaxed mb-8" style={{ color: "rgba(234,234,223,0.55)" }}>
                  {ARTICLES[0].excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-xs" style={{ color: "rgba(234,234,223,0.35)" }}>{ARTICLES[0].date}</span>
                    <span className="text-xs" style={{ color: "rgba(234,234,223,0.2)" }}>·</span>
                    <span className="text-xs" style={{ color: "rgba(234,234,223,0.35)" }}>{ARTICLES[0].readTime}</span>
                  </div>
                  <span
                    className="flex items-center gap-2 text-[11px] tracking-[0.16em] uppercase font-medium transition-opacity group-hover:opacity-70"
                    style={{ color: "rgba(234,234,223,0.7)" }}
                  >
                    Read Article <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Article grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ARTICLES.slice(1).map((article) => (
              <Link
                key={article.id}
                href={`/journal/${article.id}`}
                className="flex flex-col group"
                style={{ border: "1px solid rgba(45,44,44,0.1)", background: "#FFFFFF" }}
              >
                {/* Article image */}
                <div className="overflow-hidden" style={{ aspectRatio: "16/9", background: "#E8E8E2" }}>
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                </div>
                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <span
                    className="inline-block text-[9px] font-semibold tracking-[0.2em] uppercase px-2.5 py-1 mb-4 self-start"
                    style={{ background: CATEGORY_COLORS[article.category] || "#6B7A3E", color: "#FAFAF7" }}
                  >
                    {article.category}
                  </span>
                  <h3
                    className="font-display text-lg font-medium mb-3 leading-snug flex-1"
                    style={{ color: "#2D2C2C" }}
                  >
                    {article.title}
                  </h3>
                  <p className="text-xs leading-relaxed mb-5" style={{ color: "rgba(45,44,44,0.55)" }}>
                    {article.excerpt}
                  </p>
                  <div
                    className="flex items-center justify-between pt-4"
                    style={{ borderTop: "1px solid rgba(45,44,44,0.1)" }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px]" style={{ color: "rgba(45,44,44,0.35)" }}>{article.date}</span>
                      <span className="text-[10px]" style={{ color: "rgba(45,44,44,0.2)" }}>·</span>
                      <span className="text-[10px]" style={{ color: "rgba(45,44,44,0.35)" }}>{article.readTime}</span>
                    </div>
                    <span
                      className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase font-medium transition-opacity group-hover:opacity-60"
                      style={{ color: "rgba(45,44,44,0.5)" }}
                    >
                      Read <ArrowRight size={10} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <Footer />
      </div>
    </PageErrorBoundary>
  );
}
