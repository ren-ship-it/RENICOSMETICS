import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { PRODUCTS } from "@/data/products";
import { ArrowRight } from "lucide-react";

// Sensory descriptors per product slug
const SENSORY: Record<string, string> = {
  "neurovectrix-core": "Weightless gel · absorbs in 45 sec · no residue",
  "receptorlift": "Silky fluid · fast-absorbing · leaves a lifted finish",
  "stressdefense": "Rich serum · slow-release overnight · no occlusion",
  "dermashield": "Velvet cream · non-greasy · immediate comfort",
};

// Protocol position per product slug
const PROTOCOL_STEP: Record<string, string> = {
  "neurovectrix-core": "Step 01 · AM + PM",
  "receptorlift": "Step 02 · AM + PM",
  "stressdefense": "Step 03 · PM only",
  "dermashield": "Step 04 · AM + PM",
};

export default function ShopGrid() {
  const headRef = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) (e.target as HTMLElement).classList.add("visible"); }),
      { threshold: 0, rootMargin: "0px 0px -40px 0px" }
    );
    if (headRef.current) observer.observe(headRef.current);
    if (statementRef.current) observer.observe(statementRef.current);
    cardsRef.current.forEach(c => c && observer.observe(c));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="shop" style={{ background: "#FAFAF7" }}>
      {/* Oversized editorial statement */}
      <div
        ref={statementRef}
        className="reveal container"
        style={{ paddingTop: "5rem", paddingBottom: "3rem", borderBottom: "1px solid rgba(45,44,44,0.08)" }}
      >
        <p className="luxury-statement">
          One pathway.<br />
          <em style={{ fontStyle: "italic", color: "rgba(45,44,44,0.35)" }}>One product.</em><br />
          No compromise.
        </p>
      </div>

      <div className="container" style={{ paddingTop: "4rem", paddingBottom: "5rem" }}>
        {/* Header */}
        <div ref={headRef} className="reveal flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="reni-divider" />
              <span className="reni-tag">The Collection</span>
            </div>
            <h2
              className="font-display font-light leading-tight"
              style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", color: "#2D2C2C", letterSpacing: "-0.02em" }}
            >
              The Reni System
            </h2>
            <p className="mt-2.5 max-w-md" style={{ fontSize: "0.9375rem", color: "rgba(45,44,44,0.48)" }}>
              Six products. Six pathways. One complete structural anti-ageing protocol.
            </p>
          </div>
          <Link href="/shop">
            <button
              className="flex items-center gap-2.5 px-6 py-3 text-[11px] tracking-[0.16em] uppercase font-medium transition-opacity hover:opacity-60 self-start md:self-auto"
              style={{ background: "transparent", color: "rgba(45,44,44,0.65)", border: "1px solid rgba(45,44,44,0.2)" }}
            >
              View All <ArrowRight size={12} />
            </button>
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.map((product, i) => (
            <div
              key={product.id}
              ref={el => { cardsRef.current[i] = el; }}
              className={`reveal reveal-delay-${(i % 3) + 1} product-card group`}
              style={{
                background: product.available ? "#FFFFFF" : "#F5F5F0",
                border: "1px solid rgba(45,44,44,0.1)",
                opacity: product.available ? 1 : 0.72,
              }}
            >
              <Link href={`/products/${product.slug}`} className="block">
                {/* Image with hover swap */}
                <div
                  className="relative overflow-hidden"
                  style={{ aspectRatio: "3/4", background: "#F0F0EA" }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-contain p-7 transition-all duration-700"
                    style={{ filter: product.available ? "none" : "grayscale(30%)" }}
                  />
                  {product.hoverImage && product.available && (
                    <img
                      src={product.hoverImage}
                      alt={`${product.name} texture`}
                      className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
                      style={{ opacity: 0 }}
                      onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.opacity = "1"; (e.currentTarget.previousElementSibling as HTMLElement).style.opacity = "0"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; (e.currentTarget.previousElementSibling as HTMLElement).style.opacity = "1"; }}
                    />
                  )}
                  {/* Badge top-left */}
                  {product.badge && product.available && (
                    <div
                      className="absolute top-4 left-4 px-2.5 py-1 text-[9px] font-medium tracking-widest uppercase z-10"
                      style={{ background: "#2D2C2C", color: "#EAEADF" }}
                    >
                      {product.badge}
                    </div>
                  )}
                  {/* Protocol step top-right */}
                  {product.available && PROTOCOL_STEP[product.slug] && (
                    <div
                      className="absolute top-4 right-4 px-2 py-1 text-[9px] font-medium tracking-wider uppercase z-10"
                      style={{ background: "rgba(250,250,247,0.9)", color: "rgba(45,44,44,0.55)" }}
                    >
                      {PROTOCOL_STEP[product.slug]}
                    </div>
                  )}
                  {/* Coming soon overlay */}
                  {!product.available && (
                    <div
                      className="absolute inset-0 flex items-center justify-center z-10"
                      style={{ background: "rgba(250,250,247,0.55)" }}
                    >
                      <span
                        className="text-[10px] font-semibold tracking-[0.2em] uppercase px-4 py-2"
                        style={{ background: "#2D2C2C", color: "#EAEADF" }}
                      >
                        Coming Soon
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="pt-5 pb-5 px-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3
                        className="font-display text-base font-medium leading-tight"
                        style={{ color: "#2D2C2C", letterSpacing: "-0.01em" }}
                      >
                        {product.name}
                      </h3>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(45,44,44,0.48)" }}>
                        {product.tagline}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-display text-sm font-semibold" style={{ color: "#2D2C2C" }}>
                        {product.price}
                      </div>
                      <div className="text-[10px] mt-0.5" style={{ color: "rgba(45,44,44,0.38)" }}>
                        {product.size}
                      </div>
                    </div>
                  </div>

                  {/* Sensory descriptor */}
                  {product.available && SENSORY[product.slug] && (
                    <p
                      className="text-[11px] italic mb-3"
                      style={{ color: "rgba(45,44,44,0.38)", letterSpacing: "0.01em" }}
                    >
                      {SENSORY[product.slug]}
                    </p>
                  )}

                  {/* Pathway + packaging tags */}
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <span
                      className="inline-block text-[9px] font-medium tracking-wider uppercase px-2 py-1"
                      style={{ background: "rgba(107,122,62,0.1)", color: "#6B7A3E" }}
                    >
                      {product.pathway}
                    </span>
                    <span
                      className="inline-block text-[9px] font-medium tracking-wider uppercase px-2 py-1"
                      style={{ background: "rgba(45,44,44,0.05)", color: "rgba(45,44,44,0.5)" }}
                    >
                      {product.format}
                    </span>
                  </div>

                  {/* CTA */}
                  <div
                    className="w-full py-3 text-[11px] font-medium tracking-[0.14em] uppercase text-center transition-all duration-200 group-hover:opacity-80"
                    style={{
                      background: product.available ? "#2D2C2C" : "transparent",
                      color: product.available ? "#EAEADF" : "rgba(45,44,44,0.4)",
                      border: product.available ? "none" : "1px solid rgba(45,44,44,0.2)",
                    }}
                  >
                    {product.available ? "View Product" : "Notify Me"}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Bundle CTA */}
        <div
          className="mt-14 p-8 md:p-12 flex flex-col md:flex-row md:items-center gap-6 justify-between"
          style={{ background: "#2D2C2C" }}
        >
          <div>
            <p
              className="text-[10px] tracking-[0.2em] uppercase font-medium mb-3"
              style={{ color: "rgba(234,234,223,0.38)" }}
            >
              Complete Protocol
            </p>
            <p
              className="font-display font-light mb-1.5"
              style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", color: "#EAEADF", letterSpacing: "-0.02em" }}
            >
              The Complete Protocol Bundle
            </p>
            <p style={{ fontSize: "0.8125rem", color: "rgba(234,234,223,0.42)" }}>
              All four Phase 1 serums · $499 AUD · Save $94
            </p>
          </div>
          <Link href="/bundle">
            <button
              className="flex items-center gap-2.5 px-8 py-3.5 text-[11px] tracking-[0.16em] uppercase font-medium transition-opacity hover:opacity-80 flex-shrink-0"
              style={{ background: "#EAEADF", color: "#2D2C2C" }}
            >
              Shop the Bundle <ArrowRight size={12} />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
