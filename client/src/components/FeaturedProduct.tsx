import { useEffect, useRef, useState } from "react";
import { ShoppingBag, Star, ChevronDown, ChevronUp } from "lucide-react";

import { ASSETS } from "@/data/assets";
const PRODUCT_IMG = ASSETS.featuredProduct;
const LABEL_DARK = ASSETS.featuredLabelDark;
const LABEL_LIGHT = ASSETS.featuredLabelLight;

const activeIngredients = [
  { name: "Niacinamide", pct: "10%", benefit: "Improves skin tone, reduces pores, strengthens barrier" },
  { name: "Vitamin C", pct: "5%", benefit: "Eliminates free radicals, prevents premature aging" },
  { name: "Hyaluronic Acid", pct: "—", benefit: "Deep hydration, plumps and smooths" },
  { name: "Squalane", pct: "—", benefit: "Lightweight moisture lock, non-comedogenic" },
];

export default function FeaturedProduct() {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const [activeImg, setActiveImg] = useState(0);
  const [expandIngredients, setExpandIngredients] = useState(false);
  const [added, setAdded] = useState(false);

  const images = [PRODUCT_IMG, LABEL_DARK, LABEL_LIGHT];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) (e.target as HTMLElement).classList.add("visible"); }),
      { threshold: 0, rootMargin: "0px 0px -40px 0px" }
    );
    if (leftRef.current) observer.observe(leftRef.current);
    if (rightRef.current) observer.observe(rightRef.current);
    return () => observer.disconnect();
  }, []);

  const handleAddToCart = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <section id="product" className="py-20 md:py-32" style={{ background: "#FAFAF7" }}>
      <div className="container">
        {/* Section label */}
        <div className="flex items-center gap-3 mb-12">
          <div className="reni-divider" />
          <span className="reni-tag">Featured Product</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left — Product Images */}
          <div ref={leftRef} className="reveal">
            {/* Main image */}
            <div className="relative overflow-hidden bg-[#F0F0E8] mb-4" style={{ aspectRatio: "3/4" }}>
              <img
                src={images[activeImg]}
                alt="Reni Cosmetics VitaFusion Serum"
                className="w-full h-full object-contain p-8 transition-all duration-500"
              />
              {/* Badge */}
              <div
                className="absolute top-5 left-5 px-3 py-1.5 text-[10px] font-medium tracking-widest uppercase"
                style={{ background: "#2D2C2C", color: "#EAEADF" }}
              >
                New
              </div>
            </div>
            {/* Thumbnail strip */}
            <div className="flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className="flex-1 overflow-hidden transition-all duration-200"
                  style={{
                    aspectRatio: "1",
                    background: "#F0F0E8",
                    border: activeImg === i ? "2px solid #2D2C2C" : "2px solid transparent",
                  }}
                >
                  <img src={img} alt="" className="w-full h-full object-contain p-2" />
                </button>
              ))}
            </div>
          </div>

          {/* Right — Product Info */}
          <div ref={rightRef} className="reveal reveal-delay-2">
            {/* Brand */}
            <p className="text-xs tracking-[0.2em] uppercase font-medium mb-2" style={{ color: "#6B7A3E" }}>
              Reni Cosmetics
            </p>

            {/* Product name */}
            <h2 className="font-display font-light leading-tight mb-3" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "#2D2C2C" }}>
              VitaFusion Serum
            </h2>

            {/* Tagline */}
            <p className="font-body text-sm mb-4" style={{ color: "rgba(45,44,44,0.55)" }}>
              Essential vitamins and hyaluronic acid for skin radiance.
            </p>

            {/* Stars */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={12} fill="#6B7A3E" color="#6B7A3E" />
                ))}
              </div>
              <span className="text-xs" style={{ color: "rgba(45,44,44,0.45)" }}>4.9 (124 reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-8">
              <span className="reni-price">$68.00 AUD</span>
              <span className="text-xs" style={{ color: "rgba(45,44,44,0.4)" }}>30mL / 1 oz</span>
            </div>

            {/* Active ingredients highlight */}
            <div className="mb-8 p-5" style={{ background: "#EAEADF" }}>
              <p className="text-xs tracking-[0.15em] uppercase font-medium mb-4" style={{ color: "#2D2C2C" }}>
                Active Ingredients
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-display text-2xl font-semibold" style={{ color: "#2D2C2C" }}>10%</div>
                  <div className="text-xs font-medium" style={{ color: "#6B7A3E" }}>Niacinamide</div>
                  <div className="text-xs mt-1" style={{ color: "rgba(45,44,44,0.5)" }}>Pore refinement & barrier</div>
                </div>
                <div>
                  <div className="font-display text-2xl font-semibold" style={{ color: "#2D2C2C" }}>5%</div>
                  <div className="text-xs font-medium" style={{ color: "#6B7A3E" }}>Vitamin C</div>
                  <div className="text-xs mt-1" style={{ color: "rgba(45,44,44,0.5)" }}>Antioxidant protection</div>
                </div>
              </div>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-3 py-4 mb-4 transition-all duration-300 font-body text-sm font-medium tracking-widest uppercase"
              style={{
                background: added ? "#6B7A3E" : "#2D2C2C",
                color: "#EAEADF",
              }}
            >
              <ShoppingBag size={16} />
              {added ? "Added to Cart ✓" : "Add to Cart"}
            </button>
            <button className="w-full btn-reni-outline py-4 text-sm">
              Buy it Now
            </button>

            {/* Ingredient accordion */}
            <div className="mt-8 border-t pt-6" style={{ borderColor: "rgba(45,44,44,0.1)" }}>
              <button
                onClick={() => setExpandIngredients(!expandIngredients)}
                className="w-full flex items-center justify-between text-xs tracking-widest uppercase font-medium"
                style={{ color: "#2D2C2C" }}
              >
                <span>Full Ingredient List</span>
                {expandIngredients ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {expandIngredients && (
                <div className="mt-4">
                  <div className="grid grid-cols-1 gap-3 mb-4">
                    {activeIngredients.map(ing => (
                      <div key={ing.name} className="flex items-start gap-3">
                        <div className="font-display text-lg font-semibold w-12 flex-shrink-0" style={{ color: "#6B7A3E" }}>
                          {ing.pct}
                        </div>
                        <div>
                          <div className="text-xs font-medium" style={{ color: "#2D2C2C" }}>{ing.name}</div>
                          <div className="text-xs" style={{ color: "rgba(45,44,44,0.5)" }}>{ing.benefit}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(45,44,44,0.5)" }}>
                    <strong>Full INCI:</strong> Aqua (Water), Glycerin, Niacinamide, Hyaluronic Acid, Vitamin C (Ascorbic Acid), Squalane, Aloe Barbadensis Leaf Juice, Camellia Sinensis (Green Tea) Extract, Tocopherol (Vitamin E), Panthenol (Provitamin B5), Retinyl Palmitate (Vitamin A), Allantoin, Jojoba Seed Oil, Shea Butter, Chamomile Flower Extract, Fragrance, Phenoxyethanol, Ethylhexylglycerin.
                  </p>
                </div>
              )}
            </div>

            {/* How to use */}
            <div className="mt-4 border-t pt-6" style={{ borderColor: "rgba(45,44,44,0.1)" }}>
              <p className="text-xs tracking-widest uppercase font-medium mb-3" style={{ color: "#2D2C2C" }}>How to Use</p>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(45,44,44,0.6)" }}>
                After cleansing, use toner to improve serum absorption. Apply 2–3 drops, warm between fingers, and gently press onto face avoiding the eye area. Allow to absorb for one minute before moisturiser. Use sunscreen in the morning.
              </p>
            </div>

            {/* Trust badges */}
            <div className="mt-8 flex flex-wrap gap-4">
              {["Fragrance-Free", "Vegan", "Cruelty-Free", "Dermatologist Tested"].map(badge => (
                <div key={badge} className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#6B7A3E" }} />
                  <span className="text-xs" style={{ color: "rgba(45,44,44,0.5)" }}>{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
