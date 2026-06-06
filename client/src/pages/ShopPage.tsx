import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ShoppingBag, ArrowRight, MapPin } from "lucide-react";
import { PRODUCTS } from "@/data/products";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageErrorBoundary from "@/components/PageErrorBoundary";
import ImageSkeleton from "@/components/ImageSkeleton";
import NotifyMeModal from "@/components/NotifyMeModal";
import { useCart } from "@/contexts/CartContext";
import { useSEO } from "@/hooks/useSEO";

const FILTERS = ["All", "Phase 1 — Available Now", "Phase 2 — Coming Soon"];

export default function ShopPage() {
  const [filter, setFilter] = useState("All");
  const [notifyProduct, setNotifyProduct] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);
  const { addItem, isInCart } = useCart();

  useSEO({
    title: "Shop Clinical Peptide Serums | Anti-Ageing Skincare Australia",
    description: "Shop Reni Cosmetics — clinical-grade peptide serums and anti-ageing skincare. SNAP-8™, Progeline™, Argireline® at verified concentrations. Free shipping over $80. Dispatched from Melbourne in 1 business day.",
    url: "/shop",
  });

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const filtered = PRODUCTS.filter(p => {
    if (filter === "Phase 1 — Available Now") return p.phase === 1;
    if (filter === "Phase 2 — Coming Soon") return p.phase === 2;
    return true;
  });

  const handleAddToCart = (e: React.MouseEvent, product: typeof PRODUCTS[0]) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.available) {
      setNotifyProduct(product.name);
      return;
    }
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      priceNum: parseFloat(product.price.replace(/[^0-9.]/g, "")),
      image: product.image,
      size: product.size,
      slug: product.slug,
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  return (
    <PageErrorBoundary pageName="Shop">
      <div className="min-h-screen" style={{ background: "#FAFAF7" }}>
        <Navbar />

        {/* Page header */}
        <div className="pt-28 pb-10" style={{ background: "#EAEADF" }}>
          <div className="container">
            <div className="flex items-center gap-3 mb-4">
              <div className="reni-divider" />
              <span className="reni-tag">The Collection</span>
            </div>
            <h1 className="font-display font-light" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "#2D2C2C" }}>
              Shop All Products
            </h1>
            <p className="text-sm mt-2 max-w-lg" style={{ color: "rgba(45,44,44,0.5)" }}>
              Six products. Six pathways. One complete structural anti-ageing protocol built on verified science.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="container py-8">
          <div className="flex flex-wrap gap-3">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-4 py-2 text-xs tracking-widest uppercase font-medium transition-all duration-200"
                style={{
                  background: filter === f ? "#2D2C2C" : "transparent",
                  color: filter === f ? "#EAEADF" : "rgba(45,44,44,0.55)",
                  border: `1px solid ${filter === f ? "#2D2C2C" : "rgba(45,44,44,0.2)"}`,
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="container pb-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(product => (
              <div key={product.id} className="product-card group">
                <Link href={`/products/${product.slug}`} className="block">
                  <div className="relative overflow-hidden" style={{ aspectRatio: "3/4", background: "#F2F2EC" }}>
                    {/* Primary product image */}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-contain p-8 transition-all duration-700"
                    />
                    {/* Hover lifestyle image */}
                    {product.hoverImage && product.available && (
                      <img
                        src={product.hoverImage}
                        alt={`${product.name} application`}
                        className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
                        style={{ opacity: 0 }}
                        onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.opacity = "1"; (e.currentTarget.previousElementSibling as HTMLElement).style.opacity = "0"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; (e.currentTarget.previousElementSibling as HTMLElement).style.opacity = "1"; }}
                      />
                    )}
                    {product.badge && (
                      <div
                        className="absolute top-4 left-4 px-2.5 py-1 text-[9px] font-medium tracking-widest uppercase z-10"
                        style={{ background: product.badge === "Hero Product" ? "#2D2C2C" : "rgba(45,44,44,0.45)", color: "#EAEADF" }}
                      >
                        {product.badge}
                      </div>
                    )}
                    {product.phase === 2 && !product.badge && (
                      <div
                        className="absolute top-4 left-4 px-2.5 py-1 text-[9px] font-medium tracking-widest uppercase z-10"
                        style={{ background: "rgba(45,44,44,0.4)", color: "#EAEADF" }}
                      >
                        Coming Soon
                      </div>
                    )}
                  </div>

                  <div className="p-5" style={{ background: "#FAFAF7" }}>
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="font-display text-base font-medium" style={{ color: "#2D2C2C" }}>{product.name}</h3>
                        <p className="text-xs mt-0.5" style={{ color: "rgba(45,44,44,0.5)" }}>{product.tagline}</p>
                      </div>
                      <div className="text-right ml-3 flex-shrink-0">
                        <div className="font-display text-sm font-semibold" style={{ color: "#2D2C2C" }}>{product.price}</div>
                        <div className="text-xs" style={{ color: "rgba(45,44,44,0.4)" }}>{product.size}</div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="text-[9px] font-medium tracking-wider uppercase px-2 py-1" style={{ background: "#EAEADF", color: "#6B7A3E" }}>
                        {product.pathway}
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Add to cart / Notify Me — outside the Link to avoid nested anchor */}
                <div className="px-5 pb-5" style={{ background: "#FAFAF7" }}>
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    className="w-full flex items-center justify-center gap-2 py-3 text-xs font-medium tracking-widest uppercase transition-all duration-200"
                    style={{
                      background: addedId === product.id
                        ? "#6B7A3E"
                        : product.available ? "#2D2C2C" : "transparent",
                      color: product.available ? "#EAEADF" : "rgba(45,44,44,0.5)",
                      border: product.available ? "none" : "1px solid rgba(45,44,44,0.2)",
                    }}
                  >
                    {product.available && <ShoppingBag size={12} />}
                    {addedId === product.id
                      ? "Added ✓"
                      : product.available
                        ? (isInCart(product.id) ? "Add Another" : "Add to Cart")
                        : "Notify Me"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quiz CTA */}
          <div className="mt-16 p-8 text-center" style={{ background: "#EAEADF" }}>
            <p className="font-display text-xl font-light mb-2" style={{ color: "#2D2C2C" }}>Not sure where to start?</p>
            <p className="text-sm mb-5" style={{ color: "rgba(45,44,44,0.55)" }}>
              Answer 3 questions and get a personalised protocol recommendation.
            </p>
            <Link href="/quiz" className="btn-reni-dark">Find Your Protocol</Link>
          </div>
        </div>

        {/* Become a Stockist banner */}
        <div style={{ background: "#2D2C2C" }}>
          <div className="container py-14">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-start gap-5">
                <div className="shrink-0 mt-1" style={{ color: "rgba(234,234,223,0.3)" }}>
                  <MapPin size={22} />
                </div>
                <div>
                  <p className="text-xs tracking-widest uppercase font-medium mb-2" style={{ color: "rgba(234,234,223,0.35)" }}>
                    Trade &amp; Retail Enquiries
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl font-light mb-2" style={{ color: "#EAEADF" }}>
                    Become a Stockist
                  </h2>
                  <p className="text-sm max-w-md" style={{ color: "rgba(234,234,223,0.45)" }}>
                    Stock Reni Cosmetics in your clinic, spa, or retail store. Trade pricing, co-branded marketing support, and dedicated account management included.
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex flex-col sm:flex-row gap-4">
                <Link href="/stockists">
                  <button
                    className="flex items-center gap-3 px-8 py-3 text-xs tracking-widest uppercase font-medium transition-opacity hover:opacity-80"
                    style={{ background: "#EAEADF", color: "#2D2C2C" }}
                  >
                    Apply Now <ArrowRight size={13} />
                  </button>
                </Link>
                <Link href="/contact">
                  <button
                    className="flex items-center gap-3 px-8 py-3 text-xs tracking-widest uppercase font-medium transition-opacity hover:opacity-60"
                    style={{ background: "transparent", color: "rgba(234,234,223,0.6)", border: "1px solid rgba(234,234,223,0.2)" }}
                  >
                    Enquire
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Why Reni — comparison section for cautious buyers */}
        <section className="py-16 md:py-24" style={{ background: "#FAFAF7" }}>
          <div className="container">
            <div className="flex items-center gap-3 mb-10">
              <div className="reni-divider" />
              <span className="reni-tag">Why Reni</span>
            </div>
            <h2
              className="font-display font-light mb-12"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: "#2D2C2C", letterSpacing: "-0.01em" }}
            >
              What separates clinical formulation<br />
              <em>from cosmetic marketing.</em>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th className="text-left py-3 pr-6 font-medium text-xs tracking-widest uppercase" style={{ color: "rgba(45,44,44,0.4)", borderBottom: "2px solid rgba(45,44,44,0.12)", width: "40%" }}>Standard</th>
                    <th className="text-center py-3 px-4 font-medium text-xs tracking-widest uppercase" style={{ color: "rgba(45,44,44,0.4)", borderBottom: "2px solid rgba(45,44,44,0.12)" }}>Most Brands</th>
                    <th className="text-center py-3 px-4 font-semibold text-xs tracking-widest uppercase" style={{ color: "#6B7A3E", borderBottom: "2px solid #6B7A3E" }}>Reni Cosmetics</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Active ingredient concentrations published", "✗ Hidden in proprietary blends", "✓ Every active disclosed"],
                    ["Active at minimum effective concentration", "✗ Often below clinical threshold", "✓ At or above MEC"],
                    ["Pharmaceutical-grade raw materials", "✗ Cosmetic grade only", "✓ Pharma-grade actives"],
                    ["Single mechanism per product", "✗ Mixed actives that compete", "✓ One pathway per formula"],
                    ["Full INCI list published", "✓ Required by law", "✓ Published with explanations"],
                    ["Clinical data linked to supplier source", "✗ Generic claims", "✓ Sourced and cited"],
                    ["Fragrance-free formulation", "✗ Often fragrance-masked", "✓ 100% fragrance-free"],
                    ["30-day return guarantee", "✗ Final sale common", "✓ Unopened products"],
                  ].map(([standard, others, reni], i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "rgba(45,44,44,0.025)" }}>
                      <td className="py-4 pr-6 font-medium" style={{ color: "#2D2C2C", borderBottom: "1px solid rgba(45,44,44,0.07)" }}>{standard}</td>
                      <td className="py-4 px-4 text-center" style={{ color: "rgba(45,44,44,0.4)", borderBottom: "1px solid rgba(45,44,44,0.07)" }}>{others}</td>
                      <td className="py-4 px-4 text-center font-medium" style={{ color: "#6B7A3E", borderBottom: "1px solid rgba(45,44,44,0.07)" }}>{reni}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-6 text-[10px]" style={{ color: "rgba(45,44,44,0.3)" }}>
              Comparisons reflect general industry practices. Individual brand formulations vary. Verify independently using each brand's published INCI list.
            </p>
          </div>
        </section>

        <Footer />

        {/* Notify Me modal */}
        <NotifyMeModal
          productName={notifyProduct ?? ""}
          isOpen={!!notifyProduct}
          onClose={() => setNotifyProduct(null)}
        />
      </div>
    </PageErrorBoundary>
  );
}
