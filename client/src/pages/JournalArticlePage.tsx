import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageErrorBoundary from "@/components/PageErrorBoundary";
import { useSEO } from "@/hooks/useSEO";
import { PRODUCTS } from "@/data/products";
import { trpc } from "@/lib/trpc";
import { ARTICLES, CATEGORY_COLORS, articleFromDb, type Article } from "@/data/journal";

// Journal articles now live in @/data/journal (DB-backed with fallback).

export default function JournalArticlePage() {
  const params = useParams<{ slug: string }>();
  // Prefer the DB-backed (admin-managed) post; fall back to the static article.
  const dbPost = trpc.content.journalBySlug.useQuery({ slug: params.slug });
  const dbList = trpc.content.journalList.useQuery();
  const article = dbPost.data ? articleFromDb(dbPost.data) : ARTICLES.find(a => a.id === params.slug);

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
  const allArticles = dbList.data && dbList.data.length ? dbList.data.map(articleFromDb) : ARTICLES;
  const otherArticles = allArticles.filter(a => a.id !== article.id).slice(0, 3);

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
