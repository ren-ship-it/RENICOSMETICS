import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import { ShoppingBag, ChevronDown, ChevronUp, ArrowLeft, Star } from "lucide-react";
import { PRODUCTS } from "@/data/products";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageErrorBoundary from "@/components/PageErrorBoundary";
import StickyCartBar from "@/components/StickyCartBar";
import ImageLightbox, { ZoomTrigger } from "@/components/ImageLightbox";
import ImageSkeleton from "@/components/ImageSkeleton";
import NotifyMeModal from "@/components/NotifyMeModal";
import { useCart } from "@/contexts/CartContext";
import { useSEO } from "@/hooks/useSEO";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = PRODUCTS.find(p => p.slug === slug);
  const { addItem, isInCart } = useCart();

  const [expandInci, setExpandInci] = useState(true);
  const [expandHow, setExpandHow] = useState(true);
  const [added, setAdded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Ref for the main Add to Cart button — used by StickyCartBar to know when to appear
  const addToCartRef = useRef<HTMLDivElement>(null);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  useSEO({
    title: product ? `${product.name} — ${product.tagline}` : "Product Not Found",
    description: product
      ? `${product.description.slice(0, 155)}…`
      : "This product could not be found.",
    image: product?.image,
    url: `/products/${slug}`,
    type: "product",
    structuredData: product ? {
      type: "product" as const,
      name: product.name,
      description: product.description,
      price: product.price.replace(/[^0-9.]/g, ""),
      currency: "AUD",
      availability: product.available ? "InStock" : "PreOrder",
      sku: product.id,
      brand: "Reni Cosmetics",
      image: product.image,
    } : undefined,
  });

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAF7" }}>
        <div className="text-center">
          <p className="font-display text-2xl mb-4" style={{ color: "#2D2C2C" }}>Product not found.</p>
          <Link href="/shop" className="btn-reni-dark">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = (qty = quantity) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      priceNum: parseFloat(product.price.replace(/[^0-9.]/g, "")),
      image: product.image,
      size: product.size,
      slug: product.slug,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const relatedProducts = PRODUCTS.filter(p => p.id !== product.id && p.available).slice(0, 3);
  const heroActives = product.heroActives.filter(a => a.isHero);
  const supportingActives = product.heroActives.filter(a => !a.isHero);

  return (
    <PageErrorBoundary pageName={`Product — ${product.name}`}>
      <div className="min-h-screen" style={{ background: "#FAFAF7" }}>
        <Navbar />

        {/* Breadcrumb */}
        <div className="container pt-28 pb-4">
          <Link href="/shop" className="flex items-center gap-2 text-xs" style={{ color: "rgba(45,44,44,0.45)" }}>
            <ArrowLeft size={12} />
            Back to Shop
          </Link>
        </div>

        {/* Main product section */}
        <section className="container py-8 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

            {/* Left — Image + Video */}
            <div>
              {/* Main product image with zoom */}
              <div className="relative" style={{ aspectRatio: "3/4", background: "#F2F2EC" }}>
                <ImageSkeleton
                  src={product.image}
                  alt={product.name}
                  aspectRatio="3/4"
                  containerStyle={{ background: "#F2F2EC" }}
                  objectFit="contain"
                  padding="2.5rem"
                  className="cursor-zoom-in"
                  onClick={() => setLightboxOpen(true)}
                />
                <ZoomTrigger onClick={() => setLightboxOpen(true)} />
              </div>

              {/* Product video */}
              {product.video && (
                <div className="mt-4 overflow-hidden" style={{ aspectRatio: "16/9", background: "#1C1C1E" }}>
                  <video
                    src={product.video}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Format info — simplified, no pH */}
              <div className="mt-4 flex gap-4">
                {[
                  { label: "Format", value: product.format },
                  { label: "Size", value: product.size },
                ].map(item => (
                  <div key={item.label} className="flex-1 p-3 text-center" style={{ background: "#EAEADF" }}>
                    <div className="text-xs font-medium" style={{ color: "#2D2C2C" }}>{item.value}</div>
                    <div className="text-xs mt-0.5" style={{ color: "rgba(45,44,44,0.45)" }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Info */}
            <div>
              <span
                className="text-[9px] font-medium tracking-wider uppercase px-2 py-1 mb-4 inline-block"
                style={{ background: "#EAEADF", color: "#6B7A3E" }}
              >
                {product.pathway}
              </span>

              <h1
                className="font-display font-light leading-tight mb-2"
                style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "#2D2C2C" }}
              >
                {product.name}
              </h1>
              <p className="text-sm mb-4" style={{ color: "rgba(45,44,44,0.5)" }}>{product.tagline}</p>

              <div className="flex items-center gap-2 mb-6">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} size={11} fill="#6B7A3E" color="#6B7A3E" />)}
                </div>
                <span className="text-xs" style={{ color: "rgba(45,44,44,0.4)" }}>Early Access · Phase 1 Launch</span>
              </div>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="reni-price">{product.price}</span>
                <span className="text-xs" style={{ color: "rgba(45,44,44,0.4)" }}>{product.size}</span>
              </div>

              <p className="text-sm leading-relaxed mb-8" style={{ color: "rgba(45,44,44,0.65)" }}>
                {product.description}
              </p>

              {/* Hero Actives — with % */}
              <div className="mb-6">
                <p className="text-xs tracking-widest uppercase font-medium mb-3" style={{ color: "#2D2C2C" }}>
                  Key Actives
                </p>
                <div className="space-y-3">
                  {heroActives.map(a => (
                    <div key={a.name} className="flex items-start gap-4 py-3" style={{ borderBottom: "1px solid rgba(45,44,44,0.07)" }}>
                      <div className="flex-shrink-0 text-right" style={{ minWidth: "48px" }}>
                        <span className="font-display text-base font-semibold" style={{ color: "#6B7A3E" }}>{a.pct}</span>
                      </div>
                      <div>
                        <div className="text-xs font-semibold mb-0.5" style={{ color: "#2D2C2C" }}>{a.name}</div>
                        <div className="text-xs leading-relaxed" style={{ color: "rgba(45,44,44,0.5)" }}>{a.mechanism}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Supporting Actives — no % */}
              {supportingActives.length > 0 && (
                <div className="mb-8">
                  <p className="text-xs tracking-widest uppercase font-medium mb-3" style={{ color: "rgba(45,44,44,0.4)" }}>
                    Supporting Complex
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {supportingActives.map(a => (
                      <span
                        key={a.name}
                        className="text-xs px-2.5 py-1"
                        style={{ background: "#EAEADF", color: "rgba(45,44,44,0.6)" }}
                      >
                        {a.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to Cart — ref'd for StickyCartBar */}
              <div ref={addToCartRef}>
                {product.available ? (
                  <>
                    {/* Quantity selector */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[10px] tracking-[0.16em] uppercase font-medium" style={{ color: "rgba(45,44,44,0.45)" }}>Qty</span>
                      <div className="flex items-center" style={{ border: "1px solid rgba(45,44,44,0.18)" }}>
                        <button
                          onClick={() => setQuantity(q => Math.max(1, q - 1))}
                          className="w-9 h-9 flex items-center justify-center text-sm font-light transition-colors hover:bg-gray-100"
                          style={{ color: "#2D2C2C" }}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-xs font-medium" style={{ color: "#2D2C2C" }}>{quantity}</span>
                        <button
                          onClick={() => setQuantity(q => Math.min(10, q + 1))}
                          className="w-9 h-9 flex items-center justify-center text-sm font-light transition-colors hover:bg-gray-100"
                          style={{ color: "#2D2C2C" }}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddToCart(quantity)}
                      className="w-full flex items-center justify-center gap-3 py-4 mb-3 transition-all duration-300 font-body text-xs font-medium tracking-widest uppercase"
                      style={{ background: added ? "#6B7A3E" : "#2D2C2C", color: "#EAEADF" }}
                    >
                      <ShoppingBag size={15} />
                      {added ? "Added to Cart \u2713" : isInCart(product.id) ? "Add Another" : "Add to Cart"}
                    </button>
                    <Link href="/cart">
                      <button
                        onClick={() => handleAddToCart(quantity)}
                        className="w-full btn-reni-outline py-4 text-xs"
                      >
                        Buy it Now — Go to Cart
                      </button>
                    </Link>

                    {/* Risk reversal + trust row — shown immediately after CTA */}
                    <div
                      className="mt-4 flex items-center justify-center gap-2 py-3 px-4"
                      style={{ background: "rgba(107,122,62,0.06)", border: "1px solid rgba(107,122,62,0.15)" }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6B7A3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      <span className="text-[11px] font-medium" style={{ color: "#6B7A3E" }}>30-Day Return Guarantee</span>
                      <span className="text-[10px]" style={{ color: "rgba(45,44,44,0.4)" }}>· Unopened &amp; sealed</span>
                    </div>

                    {/* Results timeline */}
                    {product.slug === "neurovectrix-core" && (
                      <div className="mt-3 flex items-start gap-3 px-3 py-3" style={{ background: "rgba(45,44,44,0.03)", border: "1px solid rgba(45,44,44,0.07)" }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(45,44,44,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 1, flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        <p className="text-[11px] leading-relaxed" style={{ color: "rgba(45,44,44,0.55)" }}>
                          <strong style={{ color: "#2D2C2C" }}>Results timeline:</strong> Clinical data shows a measurable effect in 5 days. Most users report visible softening of expression lines within 2–4 weeks of consistent twice-daily use.
                        </p>
                      </div>
                    )}
                    {product.slug === "receptorlift" && (
                      <div className="mt-3 flex items-start gap-3 px-3 py-3" style={{ background: "rgba(45,44,44,0.03)", border: "1px solid rgba(45,44,44,0.07)" }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(45,44,44,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 1, flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        <p className="text-[11px] leading-relaxed" style={{ color: "rgba(45,44,44,0.55)" }}>
                          <strong style={{ color: "#2D2C2C" }}>Results timeline:</strong> Progeline™ clinical data: visible lifting and firming in 28 days. Full structural remodelling continues over 8–12 weeks of consistent use.
                        </p>
                      </div>
                    )}
                    {product.slug === "stressdefense" && (
                      <div className="mt-3 flex items-start gap-3 px-3 py-3" style={{ background: "rgba(45,44,44,0.03)", border: "1px solid rgba(45,44,44,0.07)" }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(45,44,44,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 1, flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        <p className="text-[11px] leading-relaxed" style={{ color: "rgba(45,44,44,0.55)" }}>
                          <strong style={{ color: "#2D2C2C" }}>Results timeline:</strong> Nightessence™ clinical study: 78% improvement in dark eye circles in 28 days. Epigenetic effects build progressively over 8–12 weeks.
                        </p>
                      </div>
                    )}
                    {product.slug === "dermashield" && (
                      <div className="mt-3 flex items-start gap-3 px-3 py-3" style={{ background: "rgba(45,44,44,0.03)", border: "1px solid rgba(45,44,44,0.07)" }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(45,44,44,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 1, flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        <p className="text-[11px] leading-relaxed" style={{ color: "rgba(45,44,44,0.55)" }}>
                          <strong style={{ color: "#2D2C2C" }}>Results timeline:</strong> Immediate comfort on first application. Barrier function improvement is measurable within 2 weeks. Optimal results at 4–6 weeks of daily use.
                        </p>
                      </div>
                    )}

                    {/* Payment method icons */}
                    <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
                      <span className="text-[9px] tracking-wider uppercase" style={{ color: "rgba(45,44,44,0.3)" }}>Secure payment via</span>
                      {["Visa", "Mastercard", "Amex", "PayPal", "Apple Pay"].map(method => (
                        <span
                          key={method}
                          className="text-[9px] font-semibold px-2 py-1"
                          style={{ background: "rgba(45,44,44,0.06)", color: "rgba(45,44,44,0.45)", border: "1px solid rgba(45,44,44,0.1)" }}
                        >
                          {method}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center" style={{ background: "#EAEADF" }}>
                    <p className="text-xs font-medium mb-2" style={{ color: "#2D2C2C" }}>Launching Phase 2 · Months 6–9</p>
                    <button
                      onClick={() => setNotifyOpen(true)}
                      className="btn-reni-dark text-xs py-3 w-full"
                    >
                      Notify Me
                    </button>
                  </div>
                )}
              </div>

              {/* Accordions */}
              <div className="mt-8 space-y-0">
                <div className="border-t" style={{ borderColor: "rgba(45,44,44,0.1)" }}>
                  <button
                    onClick={() => setExpandHow(!expandHow)}
                    className="w-full flex items-center justify-between py-4 text-xs tracking-widest uppercase font-medium"
                    style={{ color: "#2D2C2C" }}
                  >
                    <span>How to Use</span>
                    {expandHow ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                  {expandHow && (
                    <p className="pb-5 text-xs leading-relaxed" style={{ color: "rgba(45,44,44,0.6)" }}>
                      {product.howToUse}
                    </p>
                  )}
                </div>

                <div className="border-t border-b" style={{ borderColor: "rgba(45,44,44,0.1)" }}>
                  <button
                    onClick={() => setExpandInci(!expandInci)}
                    className="w-full flex items-center justify-between py-4 text-xs tracking-widest uppercase font-medium"
                    style={{ color: "#2D2C2C" }}
                  >
                    <span>Full Ingredient List (INCI)</span>
                    {expandInci ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                  {expandInci && (
                    <p className="pb-5 text-xs leading-relaxed" style={{ color: "rgba(45,44,44,0.55)" }}>
                      {product.fullInci}
                    </p>
                  )}
                </div>
              </div>

              {/* Sensory + packaging descriptor */}
              {product.available && (
                <div
                  className="mt-6 mb-2 py-4"
                  style={{ borderTop: "1px solid rgba(45,44,44,0.08)", borderBottom: "1px solid rgba(45,44,44,0.08)" }}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] tracking-[0.18em] uppercase font-semibold mb-1.5" style={{ color: "rgba(45,44,44,0.35)" }}>Texture &amp; Finish</p>
                      <p className="text-xs italic leading-relaxed" style={{ color: "rgba(45,44,44,0.6)" }}>
                        {product.slug === "neurovectrix-core" && "Lightweight gel — absorbs in under 45 seconds, no residue"}
                        {product.slug === "receptorlift" && "Silky fluid — fast-absorbing, leaves a lifted, firm finish"}
                        {product.slug === "stressdefense" && "Rich serum — slow-release overnight, no occlusion"}
                        {product.slug === "dermashield" && "Velvet cream — non-greasy, immediate comfort on contact"}
                        {!["neurovectrix-core","receptorlift","stressdefense","dermashield"].includes(product.slug) && "Lightweight, fast-absorbing formula"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] tracking-[0.18em] uppercase font-semibold mb-1.5" style={{ color: "rgba(45,44,44,0.35)" }}>Packaging</p>
                      <p className="text-xs italic leading-relaxed" style={{ color: "rgba(45,44,44,0.6)" }}>Airless pump · UV-protective glass · tamper-evident seal</p>
                    </div>
                  </div>
                </div>
              )}
              {/* Scarcity signal */}
              {product.available && (
                <div
                  className="mt-4 mb-2 flex items-center gap-2.5 px-3 py-2.5"
                  style={{ background: "rgba(107,122,62,0.07)", border: "1px solid rgba(107,122,62,0.18)" }}
                >
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#6B7A3E" }} />
                  <p className="text-[11px]" style={{ color: "rgba(45,44,44,0.65)" }}>
                    <strong style={{ color: "#6B7A3E" }}>Phase 1 Launch</strong> — Limited initial production run · 2–3 day dispatch from Melbourne
                  </p>
                </div>
              )}
              {/* Trust badges */}
              <div className="mt-6 flex flex-wrap gap-4">
                {["Fragrance-Free", "Vegan", "No Animal Testing"].map(badge => (
                  <div key={badge} className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#6B7A3E" }} />
                    <span className="text-xs" style={{ color: "rgba(45,44,44,0.5)" }}>{badge}</span>
                  </div>
                ))}
              </div>
              {/* Allergen + patch test note */}
              <div
                className="mt-5 p-4 flex items-start gap-3"
                style={{ background: "rgba(45,44,44,0.04)", border: "1px solid rgba(45,44,44,0.08)" }}
              >
                <div className="w-0.5 self-stretch flex-shrink-0" style={{ background: "#6B7A3E", minHeight: "2rem" }} />
                <div>
                  <p className="text-xs leading-relaxed mb-1.5" style={{ color: "rgba(45,44,44,0.6)" }}>
                    <strong style={{ color: "#2D2C2C" }}>Patch test before first use.</strong> Apply a small amount to the inner forearm and wait 24 hours before first use. Discontinue if irritation occurs. For external use only. Keep out of reach of children. Avoid direct eye contact.
                  </p>
                  <p className="text-xs" style={{ color: "rgba(45,44,44,0.4)" }}>
                    For returns and refunds, see our{" "}
                    <Link href="/shipping" className="underline underline-offset-2 hover:opacity-60 transition-opacity" style={{ color: "rgba(45,44,44,0.55)" }}>Shipping &amp; Returns policy</Link>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="py-16 md:py-24" style={{ background: "#EAEADF" }}>
            <div className="container">
              <div className="flex items-center gap-3 mb-10">
                <div className="reni-divider" />
                <span className="reni-tag">Complete Your Protocol</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {relatedProducts.map(p => (
                  <Link key={p.id} href={`/products/${p.slug}`} className="block product-card group">
                    <ImageSkeleton
                      src={p.image}
                      alt={p.name}
                      aspectRatio="1"
                      containerStyle={{ background: "#F2F2EC" }}
                      objectFit="contain"
                      padding="1.5rem"
                      containerClassName="product-card-img"
                    />
                    <div className="p-4" style={{ background: "#FAFAF7" }}>
                      <div className="font-display text-sm font-medium" style={{ color: "#2D2C2C" }}>{p.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: "rgba(45,44,44,0.5)" }}>{p.tagline}</div>
                      <div className="text-xs font-semibold mt-2" style={{ color: "#2D2C2C" }}>{p.price}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <Footer />

        {/* Sticky mobile Add to Cart bar */}
        <StickyCartBar
          product={{
            id: product.id,
            name: product.name,
            price: product.price,
            priceNum: parseFloat(product.price.replace(/[^0-9.]/g, "")),
            image: product.image,
            size: product.size,
            slug: product.slug,
          }}
          available={product.available}
          triggerRef={addToCartRef}
        />

        {/* Image lightbox */}
        <ImageLightbox
          src={product.image}
          alt={product.name}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />

        {/* Notify Me modal */}
        <NotifyMeModal
          productName={product.name}
          isOpen={notifyOpen}
          onClose={() => setNotifyOpen(false)}
        />
      </div>
    </PageErrorBoundary>
  );
}
