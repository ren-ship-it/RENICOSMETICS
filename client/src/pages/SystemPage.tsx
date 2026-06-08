import { useEffect } from "react";
import { Link } from "wouter";
import { useStorefrontProducts } from "@/hooks/useStorefrontProducts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageErrorBoundary from "@/components/PageErrorBoundary";
import { useSEO } from "@/hooks/useSEO";

const PROTOCOL = {
  am: [
    { step: 1, product: "neurovectrix-core", note: "Apply to expression lines. Allow 60 seconds to absorb." },
    { step: 2, product: "receptorlift", note: "1–2 pumps to face and neck. Press in with upward strokes." },
    { step: 3, product: "dermashield", note: "Final step. Seal and protect. Follow with SPF." },
  ],
  pm: [
    { step: 1, product: "neurovectrix-core", note: "Apply to expression lines. Allow 60 seconds to absorb." },
    { step: 2, product: "stressdefense", note: "3–4 drops. Press into face and neck. PM only." },
    { step: 3, product: "dermashield", note: "Final step. Lock in overnight repair." },
  ],
};

export default function SystemPage() {
  useSEO({
    title: "The Reni System",
    description: "The AM/PM structural anti-ageing protocol. Four products. Two routines. One complete system.",
    url: "/system",
  });

  
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const { products } = useStorefrontProducts();
  const getProduct = (id: string) => products.find(p => p.id === id);

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF7" }}>
      <Navbar />

      {/* Header */}
      <div className="pt-28 pb-10" style={{ background: "#2D2C2C" }}>
        <div className="container">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px" style={{ background: "rgba(234,234,223,0.3)" }} />
            <span className="text-xs tracking-widest uppercase font-medium" style={{ color: "rgba(234,234,223,0.45)" }}>
              The Protocol
            </span>
          </div>
          <h1 className="font-display font-light mb-4" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "#EAEADF" }}>
            The Reni Structural<br />Anti-Ageing System
          </h1>
          <p className="text-sm max-w-xl leading-relaxed" style={{ color: "rgba(234,234,223,0.55)" }}>
            One pathway per product. No ingredient overlap. No competing mechanisms. 
            A complete AM/PM protocol engineered for structural results.
          </p>
        </div>
      </div>

      {/* Principle cards */}
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {[
            { title: "One Pathway Per Product", body: "Each SKU targets a single biological mechanism. No ingredient cocktails that dilute efficacy or create unpredictable interactions." },
            { title: "Verified Concentrations", body: "Every active is formulated at or above its clinically validated minimum effective concentration, as specified in supplier data." },
            { title: "Designed to Layer", body: "The four products are sequenced to work synergistically — each step prepares the skin for the next, maximising absorption and effect." },
          ].map(c => (
            <div key={c.title} className="p-6" style={{ background: "#EAEADF" }}>
              <h3 className="font-display text-lg font-medium mb-3" style={{ color: "#2D2C2C" }}>{c.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(45,44,44,0.6)" }}>{c.body}</p>
            </div>
          ))}
        </div>

        {/* AM Protocol */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 flex items-center justify-center" style={{ background: "#EAEADF" }}>
              <span className="text-xs font-medium tracking-widest uppercase" style={{ color: "#2D2C2C" }}>AM</span>
            </div>
            <h2 className="font-display text-2xl font-light" style={{ color: "#2D2C2C" }}>Morning Routine</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PROTOCOL.am.map(({ step, product: pid, note }) => {
              const p = getProduct(pid);
              if (!p) return null;
              return (
                <div key={pid + "am"} className="flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-7 h-7 flex items-center justify-center text-xs font-medium"
                      style={{ background: "#2D2C2C", color: "#EAEADF" }}
                    >
                      {step}
                    </div>
                    <div className="h-px flex-1" style={{ background: "rgba(45,44,44,0.12)" }} />
                  </div>
                  <Link href={`/products/${p.slug}`} className="block product-card group">
                      <div className="overflow-hidden" style={{ aspectRatio: "1", background: "#F2F2EC" }}>
                        <img src={p.image} alt={p.name} className="product-card-img w-full h-full object-contain p-6" />
                      </div>
                      <div className="p-4" style={{ background: "#FAFAF7" }}>
                        <div className="font-display text-sm font-medium" style={{ color: "#2D2C2C" }}>{p.name}</div>
                        <div className="text-xs mt-0.5 mb-2" style={{ color: "rgba(45,44,44,0.5)" }}>{p.tagline}</div>
                        <p className="text-xs italic" style={{ color: "rgba(45,44,44,0.45)" }}>{note}</p>
                      </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* PM Protocol */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 flex items-center justify-center" style={{ background: "#2D2C2C" }}>
              <span className="text-xs font-medium tracking-widest uppercase" style={{ color: "#EAEADF" }}>PM</span>
            </div>
            <h2 className="font-display text-2xl font-light" style={{ color: "#2D2C2C" }}>Evening Routine</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PROTOCOL.pm.map(({ step, product: pid, note }) => {
              const p = getProduct(pid);
              if (!p) return null;
              return (
                <div key={pid + "pm"} className="flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-7 h-7 flex items-center justify-center text-xs font-medium"
                      style={{ background: "#2D2C2C", color: "#EAEADF" }}
                    >
                      {step}
                    </div>
                    <div className="h-px flex-1" style={{ background: "rgba(45,44,44,0.12)" }} />
                  </div>
                  <Link href={`/products/${p.slug}`} className="block product-card group">
                      <div className="overflow-hidden" style={{ aspectRatio: "1", background: "#F2F2EC" }}>
                        <img src={p.image} alt={p.name} className="product-card-img w-full h-full object-contain p-6" />
                      </div>
                      <div className="p-4" style={{ background: "#FAFAF7" }}>
                        <div className="font-display text-sm font-medium" style={{ color: "#2D2C2C" }}>{p.name}</div>
                        <div className="text-xs mt-0.5 mb-2" style={{ color: "rgba(45,44,44,0.5)" }}>{p.tagline}</div>
                        <p className="text-xs italic" style={{ color: "rgba(45,44,44,0.45)" }}>{note}</p>
                      </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6" style={{ background: "#2D2C2C" }}>
          <div>
            <h3 className="font-display text-xl font-light mb-2" style={{ color: "#EAEADF" }}>
              Start the System
            </h3>
            <p className="text-xs" style={{ color: "rgba(234,234,223,0.5)" }}>
              All four Phase 1 products are available now.
            </p>
          </div>
          <Link href="/shop" className="btn-reni-cream flex-shrink-0">Shop the System</Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
