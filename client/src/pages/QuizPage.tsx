import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, ArrowLeft, Check, ShoppingBag } from "lucide-react";
import { type Product } from "@/data/products";
import { useStorefrontProducts } from "@/hooks/useStorefrontProducts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageErrorBoundary from "@/components/PageErrorBoundary";
import { useSEO } from "@/hooks/useSEO";
import { useCart } from "@/contexts/CartContext";

const questions = [
  {
    id: "concern",
    question: "What is your primary skin concern?",
    subtitle: "Choose the one that matters most to you right now.",
    options: [
      { value: "expression", label: "Expression lines & wrinkles", icon: "〰" },
      { value: "firmness", label: "Loss of firmness & elasticity", icon: "◎" },
      { value: "stress", label: "Dullness, stress & fatigue", icon: "☽" },
      { value: "barrier", label: "Dryness & compromised barrier", icon: "◇" },
    ],
  },
  {
    id: "age",
    question: "What is your age range?",
    subtitle: "This helps us calibrate the right active concentration.",
    options: [
      { value: "20s", label: "20s — Prevention focus", icon: "◌" },
      { value: "30s", label: "30s — Early intervention", icon: "◑" },
      { value: "40s", label: "40s — Active correction", icon: "◕" },
      { value: "50plus", label: "50+ — Intensive repair", icon: "●" },
    ],
  },
  {
    id: "routine",
    question: "How would you describe your current routine?",
    subtitle: "We'll match the complexity to your lifestyle.",
    options: [
      { value: "minimal", label: "Minimal — 1 to 2 steps", icon: "—" },
      { value: "moderate", label: "Moderate — 3 to 4 steps", icon: "\u2261" },
      { value: "full", label: "Full protocol — 5+ steps", icon: "\u2263" },
      { value: "building", label: "Building from scratch", icon: "+" },
    ],
  },
];

// Recommendation logic — maps answers to product slugs
function getRecommendations(answers: Record<string, string>): string[] {
  const { concern, routine } = answers;
  const base: string[] = [];

  // Always include NEUROVÉCTRIX Core as the foundation
  base.push("neurovectrix-core");

  if (concern === "expression") {
    base.push("neurovectrix-core");
  }
  if (concern === "firmness") {
    base.push("receptorlift");
  }
  if (concern === "stress") {
    base.push("stressdefense");
  }
  if (concern === "barrier") {
    base.push("dermashield");
  }

  // Add DERMASHIELD for full routines
  if (routine === "full" || routine === "moderate") {
    if (!base.includes("dermashield")) base.push("dermashield");
    if (!base.includes("receptorlift")) base.push("receptorlift");
  }

  // Deduplicate and limit to 3
  const unique = Array.from(new Set(base)).slice(0, 3);
  return unique;
}

function QuizProductCard({ product, index }: { product: Product; index: number }) {
  const { addItem, isInCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
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

  return (
    <div
      className="flex items-center gap-5 p-4"
      style={{ background: "#EAEADF" }}
    >
      <div
        className="flex-shrink-0 flex items-center justify-center text-xs font-semibold"
        style={{ width: 28, height: 28, background: "#2D2C2C", color: "#EAEADF" }}
      >
        0{index + 1}
      </div>
      <div
        className="flex-shrink-0 flex items-center justify-center"
        style={{ width: 56, height: 56, background: "#F2F2EC" }}
      >
        <img src={product.image} alt={product.name} className="w-full h-full object-contain p-1" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-display text-sm font-medium" style={{ color: "#2D2C2C" }}>{product.name}</div>
        <div className="text-xs mt-0.5" style={{ color: "rgba(45,44,44,0.5)" }}>{product.tagline}</div>
        <div
          className="text-[9px] tracking-wider uppercase font-medium mt-1 inline-block px-2 py-0.5"
          style={{ background: "rgba(107,122,62,0.12)", color: "#6B7A3E" }}
        >
          {product.pathway}
        </div>
      </div>
      <div className="flex-shrink-0 flex flex-col items-end gap-2">
        <div className="text-sm font-semibold" style={{ color: "#2D2C2C" }}>{product.price}</div>
        {product.available && (
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] tracking-[0.12em] uppercase font-semibold transition-all"
            style={{
              background: added ? "#6B7A3E" : "#2D2C2C",
              color: "#EAEADF",
            }}
          >
            <ShoppingBag size={10} />
            {added ? "Added ✓" : isInCart(product.id) ? "Add Again" : "Add"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function QuizPage() {
  useSEO({
    title: "Find Your Protocol",
    description: "Answer 3 questions and discover the Reni Cosmetics products formulated for your specific skin concern, age range, and lifestyle.",
    url: "/quiz",
  });

  const { addItem } = useCart();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [complete, setComplete] = useState(false);
  const [allAdded, setAllAdded] = useState(false);

  const current = questions[step];

  const handleSelect = (value: string) => {
    const newAnswers = { ...answers, [current.id]: value };
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setTimeout(() => setStep(s => s + 1), 180);
    } else {
      setTimeout(() => setComplete(true), 180);
    }
  };

  const { products } = useStorefrontProducts();
  const recommendations = complete ? getRecommendations(answers) : [];
  const recommendedProducts = recommendations
    .map(slug => products.find(p => p.slug === slug))
    .filter(Boolean) as Product[];

  const handleAddAll = () => {
    recommendedProducts.filter(p => p.available).forEach(p => {
      addItem({
        id: p.id,
        name: p.name,
        price: p.price,
        priceNum: parseFloat(p.price.replace(/[^0-9.]/g, "")),
        image: p.image,
        size: p.size,
        slug: p.slug,
      });
    });
    setAllAdded(true);
    setTimeout(() => setAllAdded(false), 2500);
  };

  const progress = complete ? 100 : ((step) / questions.length) * 100;

  return (
    <PageErrorBoundary pageName="Quiz">
      <div className="min-h-screen" style={{ background: "#FAFAF7" }}>
        <Navbar />

        <div className="container pt-28 pb-24 max-w-2xl">
          {/* Progress bar */}
          <div className="pt-10 pb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs tracking-widest uppercase font-medium" style={{ color: "rgba(45,44,44,0.4)" }}>
                {complete ? "Your Protocol" : `Step ${step + 1} of ${questions.length}`}
              </span>
              {!complete && step > 0 && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="flex items-center gap-1.5 text-xs hover:opacity-60 transition-opacity"
                  style={{ color: "rgba(45,44,44,0.5)" }}
                >
                  <ArrowLeft size={12} />
                  Back
                </button>
              )}
            </div>
            <div className="w-full h-px" style={{ background: "rgba(45,44,44,0.1)" }}>
              <div
                className="h-full transition-all duration-500"
                style={{ width: `${progress}%`, background: "#6B7A3E" }}
              />
            </div>
          </div>

          {!complete ? (
            /* Question */
            <div
              key={step}
              style={{ animation: "fadeSlideIn 220ms ease both" }}
            >
              <h2
                className="font-display font-light mb-2"
                style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", color: "#2D2C2C" }}
              >
                {current.question}
              </h2>
              <p className="text-sm mb-10" style={{ color: "rgba(45,44,44,0.5)" }}>
                {current.subtitle}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {current.options.map(opt => {
                  const selected = answers[current.id] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleSelect(opt.value)}
                      className="flex items-center gap-4 p-5 text-left transition-all duration-150"
                      style={{
                        background: selected ? "#2D2C2C" : "#EAEADF",
                        border: selected ? "1px solid #2D2C2C" : "1px solid transparent",
                      }}
                    >
                      <span
                        className="flex-shrink-0 text-lg"
                        style={{ color: selected ? "#EAEADF" : "rgba(45,44,44,0.4)" }}
                      >
                        {opt.icon}
                      </span>
                      <span
                        className="text-sm font-medium"
                        style={{ color: selected ? "#EAEADF" : "#2D2C2C" }}
                      >
                        {opt.label}
                      </span>
                      {selected && (
                        <Check size={14} color="#EAEADF" className="ml-auto flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Results */
            <div style={{ animation: "fadeSlideIn 280ms ease both" }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="reni-divider" />
                <span className="reni-tag">Your Personalised Protocol</span>
              </div>
              <h2
                className="font-display font-light mb-3"
                style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", color: "#2D2C2C" }}
              >
                We've built your system.
              </h2>
              <p className="text-sm mb-10 leading-relaxed" style={{ color: "rgba(45,44,44,0.55)" }}>
                Based on your answers, these are the Reni products formulated for your specific concern, age range, and routine.
              </p>

              <div className="space-y-4 mb-6">
                {recommendedProducts.map((p, i) => (
                  <QuizProductCard key={p.id} product={p} index={i} />
                ))}
              </div>

              {/* Add all to cart */}
              {recommendedProducts.some(p => p.available) && (
                <button
                  onClick={handleAddAll}
                  className="w-full flex items-center justify-center gap-2.5 py-4 mb-6 text-[11px] tracking-[0.18em] uppercase font-semibold transition-all"
                  style={{ background: allAdded ? "#6B7A3E" : "#2D2C2C", color: "#EAEADF" }}
                >
                  <ShoppingBag size={14} />
                  {allAdded ? "All Added to Cart ✓" : "Add Full Protocol to Cart"}
                </button>
              )}

              {/* Secondary CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/cart"
                  className="btn-reni-outline flex items-center justify-center gap-2 flex-1"
                >
                  View Cart
                  <ArrowRight size={14} />
                </Link>
                <Link href="/shop" className="btn-reni-outline flex-1 text-center">
                  Browse All Products
                </Link>
              </div>

              {/* Restart */}
              <button
                onClick={() => { setStep(0); setAnswers({}); setComplete(false); setAllAdded(false); }}
                className="mt-6 text-xs underline underline-offset-2 hover:opacity-60 transition-opacity"
                style={{ color: "rgba(45,44,44,0.4)" }}
              >
                Retake the quiz
              </button>
            </div>
          )}
        </div>

        <style>{`
          @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        <Footer />
      </div>
    </PageErrorBoundary>
  );
}
