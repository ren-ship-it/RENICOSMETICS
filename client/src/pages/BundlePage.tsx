import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ShoppingBag, ArrowRight, Check } from "lucide-react";
import { PHASE1_PRODUCTS } from "@/data/products";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageErrorBoundary from "@/components/PageErrorBoundary";
import { useSEO } from "@/hooks/useSEO";

const BUNDLE_PRICE = "$499.00 AUD";
const INDIVIDUAL_TOTAL = "$593.00 AUD";
const SAVING = "$94.00 AUD";

export default function BundlePage() {
  useSEO({
    title: "The Complete System Bundle",
    description: "All four Phase 1 Reni Cosmetics products. One complete structural anti-ageing protocol. Save $94 AUD.",
    url: "/bundle",
  });

  
  const [added, setAdded] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleAddBundle = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF7" }}>
      <Navbar />

      {/* Header */}
      <div className="pt-28 pb-10" style={{ background: "#2D2C2C" }}>
        <div className="container">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px" style={{ background: "rgba(234,234,223,0.3)" }} />
            <span className="text-xs tracking-widest uppercase font-medium" style={{ color: "rgba(234,234,223,0.45)" }}>
              The Complete System
            </span>
          </div>
          <h1
            className="font-display font-light mb-4"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "#EAEADF" }}
          >
            The Reni Protocol Bundle
          </h1>
          <p className="text-sm max-w-xl leading-relaxed" style={{ color: "rgba(234,234,223,0.55)" }}>
            All four Phase 1 products. One complete AM/PM structural anti-ageing system. Formulated to work in sequence — each product targeting a distinct biological pathway.
          </p>
        </div>
      </div>

      {/* Bundle Content */}
      <section className="container py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left — Product Grid */}
          <div>
            <p className="text-xs tracking-widest uppercase font-medium mb-6" style={{ color: "rgba(45,44,44,0.45)" }}>
              Included in this bundle
            </p>
            <div className="space-y-4">
              {PHASE1_PRODUCTS.map((p, i) => (
                <div
                  key={p.id}
                  className="flex items-center gap-5 p-4"
                  style={{ background: "#EAEADF" }}
                >
                  <div
                    className="flex-shrink-0 flex items-center justify-center"
                    style={{ width: 72, height: 72, background: "#F2F2EC" }}
                  >
                    <img src={p.image} alt={p.name} className="w-full h-full object-contain p-2" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] tracking-wider uppercase font-medium mb-0.5" style={{ color: "#6B7A3E" }}>
                      Step {i + 1} · {p.pathway}
                    </div>
                    <div className="font-display text-sm font-medium" style={{ color: "#2D2C2C" }}>{p.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: "rgba(45,44,44,0.5)" }}>{p.tagline} · {p.size}</div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-xs font-semibold" style={{ color: "#2D2C2C" }}>{p.price}</div>
                    <Link href={`/products/${p.slug}`} className="text-[10px] underline underline-offset-2 mt-0.5 block" style={{ color: "rgba(45,44,44,0.4)" }}>
                      View product
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Protocol reminder */}
            <div className="mt-8 p-5" style={{ background: "#F2F2EC", borderLeft: "2px solid #6B7A3E" }}>
              <p className="text-xs font-semibold mb-2" style={{ color: "#2D2C2C" }}>The AM/PM Protocol</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] tracking-widest uppercase font-medium mb-1.5" style={{ color: "rgba(45,44,44,0.4)" }}>Morning</p>
                  {["NEUROVÉCTRIX™ Core", "RECEPTORLIFT™", "DERMASHIELD™"].map((n, i) => (
                    <div key={n} className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-medium" style={{ color: "#6B7A3E" }}>0{i+1}</span>
                      <span className="text-xs" style={{ color: "rgba(45,44,44,0.65)" }}>{n}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-[9px] tracking-widest uppercase font-medium mb-1.5" style={{ color: "rgba(45,44,44,0.4)" }}>Evening</p>
                  {["NEUROVÉCTRIX™ Core", "STRESSDEFENSE™", "DERMASHIELD™"].map((n, i) => (
                    <div key={n} className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-medium" style={{ color: "#6B7A3E" }}>0{i+1}</span>
                      <span className="text-xs" style={{ color: "rgba(45,44,44,0.65)" }}>{n}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right — Purchase Panel */}
          <div className="lg:sticky lg:top-28">
            <div className="p-8" style={{ background: "#2D2C2C" }}>
              <p className="text-xs tracking-widest uppercase font-medium mb-1" style={{ color: "rgba(234,234,223,0.45)" }}>
                The Reni Protocol Bundle
              </p>
              <h2 className="font-display text-2xl font-light mb-6" style={{ color: "#EAEADF" }}>
                Complete System
              </h2>

              {/* Pricing */}
              <div className="mb-6 pb-6" style={{ borderBottom: "1px solid rgba(234,234,223,0.1)" }}>
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="font-display text-3xl font-light" style={{ color: "#EAEADF" }}>{BUNDLE_PRICE}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs line-through" style={{ color: "rgba(234,234,223,0.35)" }}>
                    {INDIVIDUAL_TOTAL} individually
                  </span>
                  <span
                    className="text-xs font-semibold px-2 py-0.5"
                    style={{ background: "#6B7A3E", color: "#EAEADF" }}
                  >
                    Save {SAVING}
                  </span>
                </div>
              </div>

              {/* What's included */}
              <div className="mb-8 space-y-2">
                {[
                  "4 full-size Phase 1 products",
                  "Complete AM & PM protocol",
                  "Targets 4 distinct ageing pathways",
                  "Free shipping included",
                  "1 day dispatch",
                ].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <Check size={12} color="#6B7A3E" />
                    <span className="text-xs" style={{ color: "rgba(234,234,223,0.65)" }}>{item}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={handleAddBundle}
                className="w-full flex items-center justify-center gap-3 py-4 mb-3 transition-all duration-300 font-body text-xs font-medium tracking-widest uppercase"
                style={{ background: added ? "#6B7A3E" : "#EAEADF", color: added ? "#EAEADF" : "#2D2C2C" }}
              >
                <ShoppingBag size={15} />
                {added ? "Added to Cart ✓" : "Add Bundle to Cart"}
              </button>
              <button className="w-full py-4 text-xs font-medium tracking-widest uppercase transition-all" style={{ border: "1px solid rgba(234,234,223,0.25)", color: "rgba(234,234,223,0.65)", background: "transparent" }}>
                Buy it Now
              </button>

              <p className="text-[10px] text-center mt-4" style={{ color: "rgba(234,234,223,0.3)" }}>
                Free shipping on orders over $80 AUD · Minimum $150 spend
              </p>
            </div>

            {/* Trust */}
            <div className="mt-4 flex flex-wrap gap-3">
              {["Fragrance-Free", "Vegan", "No Animal Testing"].map(b => (
                <div key={b} className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#6B7A3E" }} />
                  <span className="text-xs" style={{ color: "rgba(45,44,44,0.5)" }}>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16" style={{ background: "#EAEADF" }}>
        <div className="container text-center">
          <p className="text-xs tracking-widest uppercase font-medium mb-3" style={{ color: "rgba(45,44,44,0.4)" }}>
            Not ready for the full system?
          </p>
          <h3 className="font-display text-2xl font-light mb-6" style={{ color: "#2D2C2C" }}>
            Start with one product.
          </h3>
          <Link href="/shop" className="btn-reni-dark inline-flex items-center gap-2">
            Shop Individual Products
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
