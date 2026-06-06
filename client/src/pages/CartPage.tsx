import { useEffect } from "react";
import { Link } from "wouter";
import { ShoppingBag, Minus, Plus, X, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageErrorBoundary from "@/components/PageErrorBoundary";
import ImageSkeleton from "@/components/ImageSkeleton";
import { useCart } from "@/contexts/CartContext";
import { useSEO } from "@/hooks/useSEO";
import { PHASE1_PRODUCTS } from "@/data/products";
import { FREE_SHIPPING_THRESHOLD, MINIMUM_ORDER_VALUE, STANDARD_SHIPPING_COST } from "@shared/shipping";

export default function CartPage() {
  const { items, count, total, removeItem, updateQty, clearCart, addItem } = useCart();
  const totalNum = items.reduce((s, i) => s + i.priceNum * i.quantity, 0);
  const meetsMinSpend = totalNum >= MINIMUM_ORDER_VALUE;
  const freeShipping = totalNum >= FREE_SHIPPING_THRESHOLD;

  useSEO({
    title: "Your Cart",
    description: "Review your Reni Cosmetics cart and proceed to checkout.",
    url: "/cart",
  });

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <PageErrorBoundary pageName="Cart">
      <div className="min-h-screen" style={{ background: "#FAFAF7" }}>
        <Navbar />

        <div className="container pt-28 pb-24">
          <div className="pt-8 pb-6 flex items-center justify-between">
            <h1 className="font-display text-3xl font-light" style={{ color: "#2D2C2C" }}>
              Your Cart {count > 0 && <span className="text-lg" style={{ color: "rgba(45,44,44,0.35)" }}>({count})</span>}
            </h1>
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs hover:opacity-60 transition-opacity"
                style={{ color: "rgba(45,44,44,0.4)" }}
              >
                Clear cart
              </button>
            )}
          </div>

          {items.length === 0 ? (
            /* Empty state — editorial, premium */
            <div className="py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="reni-divider" />
                  <span className="reni-tag">Your Cart</span>
                </div>
                <h2
                  className="font-display font-light leading-tight mb-4"
                  style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "#2D2C2C", letterSpacing: "-0.01em" }}
                >
                  Nothing here yet.
                  <br />
                  <em>Start your protocol.</em>
                </h2>
                <p className="text-sm mb-8 max-w-sm" style={{ color: "rgba(45,44,44,0.5)" }}>
                  Not sure where to begin? Take the 60-second skin assessment to find the right products for your biology.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/quiz">
                    <button className="btn-reni-dark flex items-center gap-2">
                      Find Your Protocol <ArrowRight size={13} />
                    </button>
                  </Link>
                  <Link href="/shop">
                    <button className="btn-reni-outline">Shop the Collection</button>
                  </Link>
                </div>
              </div>
              <div
                className="hidden md:flex items-center justify-center"
                style={{ background: "#EAEADF", aspectRatio: "1", maxWidth: "360px" }}
              >
                <div className="text-center p-12">
                  <ShoppingBag size={48} color="rgba(45,44,44,0.12)" className="mx-auto mb-4" />
                  <p className="text-xs tracking-widest uppercase" style={{ color: "rgba(45,44,44,0.3)" }}>Cart Empty</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">

              {/* Cart items */}
              <div className="lg:col-span-2 space-y-0">
                {/* Free shipping progress */}
                <div className="mb-6 p-4" style={{ background: "#EAEADF" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs" style={{ color: "rgba(45,44,44,0.6)" }}>
                      {freeShipping
                        ? "✓ You qualify for free shipping"
                        : `Add $${(FREE_SHIPPING_THRESHOLD - totalNum).toFixed(2)} more for free shipping`}
                    </span>
                    <span className="text-xs font-medium" style={{ color: "#6B7A3E" }}>
                      ${totalNum.toFixed(2)} / ${FREE_SHIPPING_THRESHOLD}
                    </span>
                  </div>
                  <div className="w-full h-0.5" style={{ background: "rgba(45,44,44,0.15)" }}>
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${Math.min((totalNum / FREE_SHIPPING_THRESHOLD) * 100, 100)}%`,
                        background: "#6B7A3E",
                      }}
                    />
                  </div>
                </div>

                {/* Upsell — Complete Your Protocol */}
                {(() => {
                  const cartIds = new Set(items.map(i => i.id));
                  const missing = PHASE1_PRODUCTS.filter(p => p.available && !cartIds.has(p.id));
                  if (missing.length === 0) return null;
                  return (
                    <div className="mb-6 p-4" style={{ background: "#F2F2EC", border: "1px solid rgba(45,44,44,0.08)" }}>
                      <p className="text-[10px] tracking-[0.18em] uppercase font-semibold mb-3" style={{ color: "rgba(45,44,44,0.45)" }}>
                        Complete Your Protocol
                      </p>
                      <div className="space-y-3">
                        {missing.map(p => (
                          <div key={p.id} className="flex items-center gap-3">
                            <div style={{ width: 48, height: 48, background: "#EAEADF", flexShrink: 0 }}>
                              <img src={p.image} alt={p.name} className="w-full h-full object-contain p-1" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-display text-xs font-medium truncate" style={{ color: "#2D2C2C" }}>{p.name}</div>
                              <div className="text-[10px]" style={{ color: "rgba(45,44,44,0.45)" }}>{p.price} · {p.size}</div>
                            </div>
                            <button
                              onClick={() => addItem({
                                id: p.id,
                                name: p.name,
                                price: p.price,
                                priceNum: parseFloat(p.price.replace(/[^0-9.]/g, "")),
                                image: p.image,
                                size: p.size,
                                slug: p.slug,
                              })}
                              className="flex-shrink-0 text-[10px] font-medium tracking-widest uppercase px-3 py-2 transition-opacity hover:opacity-75"
                              style={{ background: "#2D2C2C", color: "#EAEADF" }}
                            >
                              Add
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

              {/* Line items */}
                {items.map(item => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 py-5"
                    style={{ borderBottom: "1px solid rgba(45,44,44,0.08)" }}
                  >
                    {/* Image */}
                    <Link href={`/products/${item.slug}`} className="flex-shrink-0">
                      <ImageSkeleton
                        src={item.image}
                        alt={item.name}
                        containerStyle={{ width: 80, height: 80, background: "#F2F2EC" }}
                        objectFit="contain"
                        padding="0.5rem"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link href={`/products/${item.slug}`}>
                            <span className="font-display text-sm font-medium" style={{ color: "#2D2C2C" }}>
                              {item.name}
                            </span>
                          </Link>
                          <p className="text-xs mt-0.5" style={{ color: "rgba(45,44,44,0.45)" }}>{item.size}</p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="flex-shrink-0 hover:opacity-60 transition-opacity"
                          aria-label="Remove item"
                        >
                          <X size={14} color="rgba(45,44,44,0.4)" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {/* Qty controls */}
                        <div
                          className="flex items-center"
                          style={{ border: "1px solid rgba(45,44,44,0.15)" }}
                        >
                          <button
                            onClick={() => updateQty(item.id, item.quantity - 1)}
                            className="flex items-center justify-center w-8 h-8 hover:opacity-60 transition-opacity"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={11} color="#2D2C2C" />
                          </button>
                          <span
                            className="w-8 text-center text-xs font-medium"
                            style={{ color: "#2D2C2C" }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQty(item.id, item.quantity + 1)}
                            className="flex items-center justify-center w-8 h-8 hover:opacity-60 transition-opacity"
                            aria-label="Increase quantity"
                          >
                            <Plus size={11} color="#2D2C2C" />
                          </button>
                        </div>

                        {/* Line total */}
                        <span className="text-sm font-semibold" style={{ color: "#2D2C2C" }}>
                          ${(item.priceNum * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order summary */}
              <div className="lg:col-span-1">
                <div className="p-6" style={{ background: "#EAEADF", position: "sticky", top: "100px" }}>
                  <h2
                    className="font-display text-lg font-light mb-5"
                    style={{ color: "#2D2C2C" }}
                  >
                    Order Summary
                  </h2>

                  <div className="space-y-3 mb-5">
                    <div className="flex justify-between">
                      <span className="text-xs" style={{ color: "rgba(45,44,44,0.6)" }}>Subtotal</span>
                      <span className="text-xs font-medium" style={{ color: "#2D2C2C" }}>
                        ${totalNum.toFixed(2)} AUD
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs" style={{ color: "rgba(45,44,44,0.6)" }}>Shipping</span>
                      <span className="text-xs font-medium" style={{ color: freeShipping ? "#6B7A3E" : "#2D2C2C" }}>
                        {freeShipping ? "Free" : `$${STANDARD_SHIPPING_COST.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="w-full h-px" style={{ background: "rgba(45,44,44,0.12)" }} />
                    <div className="flex justify-between">
                      <span className="text-sm font-semibold" style={{ color: "#2D2C2C" }}>Total</span>
                      <div className="text-right">
                        <div className="text-sm font-semibold" style={{ color: "#2D2C2C" }}>${totalNum.toFixed(2)} AUD</div>
                        <div className="text-[10px]" style={{ color: "rgba(45,44,44,0.45)" }}>GST included</div>
                      </div>
                    </div>
                  </div>

                  {/* Gift note */}
                  <div className="mb-4">
                    <label className="block text-[10px] tracking-[0.15em] uppercase font-medium mb-1.5" style={{ color: "rgba(45,44,44,0.5)" }}>
                      Gift Note (optional)
                    </label>
                    <textarea
                      placeholder="Add a personal message…"
                      rows={2}
                      className="w-full text-xs p-2.5 resize-none"
                      style={{ background: "rgba(45,44,44,0.06)", border: "1px solid rgba(45,44,44,0.12)", color: "#2D2C2C", fontFamily: "inherit", outline: "none" }}
                    />
                  </div>

                  <Link href={meetsMinSpend ? "/checkout" : "#"}>
                    <button
                      disabled={!meetsMinSpend}
                      className="w-full flex items-center justify-center gap-2 py-4 text-xs font-medium tracking-widest uppercase transition-all duration-200"
                      style={{
                        background: meetsMinSpend ? "#2D2C2C" : "rgba(45,44,44,0.25)",
                        color: "#EAEADF",
                        cursor: meetsMinSpend ? "pointer" : "not-allowed",
                      }}
                    >
                      Proceed to Checkout
                      <ArrowRight size={13} />
                    </button>
                  </Link>

                  <Link href="/shop" className="block text-center text-xs mt-4 hover:opacity-60 transition-opacity" style={{ color: "rgba(45,44,44,0.45)" }}>
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </PageErrorBoundary>
  );
}
