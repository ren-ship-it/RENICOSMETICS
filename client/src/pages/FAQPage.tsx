import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageErrorBoundary from "@/components/PageErrorBoundary";
import { useSEO } from "@/hooks/useSEO";
import { ChevronDown } from "lucide-react";
import { Link } from "wouter";

const FAQ_CATEGORIES = [
  {
    category: "Products & Formulation",
    questions: [
      {
        q: "What makes Reni Cosmetics different from other skincare brands?",
        a: "Reni is built on a single-mechanism formulation philosophy — each product targets one biological pathway with clinical precision, rather than combining multiple actives that may compete or dilute each other. Every formula is backed by peer-reviewed ingredient research and uses pharmaceutical-grade raw materials.",
      },
      {
        q: "Are your products suitable for sensitive skin?",
        a: "Yes. All Reni formulas are fragrance-free, essential oil-free, and pH-optimised to minimise irritation. STRESSDEFENSE™ and DERMASHIELD™ are specifically designed for compromised or reactive skin. If you have a known allergy to any listed ingredient, please consult a dermatologist before use.",
      },
      {
        q: "Are Reni products vegan and cruelty-free?",
        a: "All Reni Cosmetics products are 100% vegan and cruelty-free. We do not use animal-derived ingredients and do not conduct or commission animal testing at any stage of development.",
      },
      {
        q: "Can I use multiple Reni products together?",
        a: "Yes — the Reni system is designed as a complete AM/PM protocol. Each product targets a distinct pathway, so there is no mechanism conflict when layered correctly. The recommended application order is: NEUROVÉCTRIX™ Core → RECEPTORLIFT™ → STRESSDEFENSE™ → DERMASHIELD™ (AM), and NEUROVÉCTRIX™ Eye-Lift + LIPOVÉCTRIX™ (PM). See The System page for full protocol guidance.",
      },
      {
        q: "What percentage of active ingredients do your products contain?",
        a: "We publish the concentration of all hero actives on each product page. For example, NEUROVÉCTRIX™ Core contains SNAP-8™ at 10 ppm and Argireline® Amplified at 10%. We believe in full ingredient transparency — no proprietary blends that obscure what you're actually applying.",
      },
      {
        q: "Do your products contain parabens, sulphates, or silicones?",
        a: "No. All Reni formulas are free from parabens, sulphates, synthetic fragrances, mineral oils, and silicones. We use only cosmetic-grade, safety-assessed preservative systems.",
      },
    ],
  },
  {
    category: "Orders & Payments",
    questions: [
      {
        q: "What is the minimum order value?",
        a: "The minimum order value is $150 AUD. This ensures we can maintain the quality of our fulfilment process and dispatch your order within 1 business day.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit and debit cards (Visa, Mastercard, Amex), PayPal, and Afterpay. All transactions are processed securely via Stripe.",
      },
      {
        q: "Can I modify or cancel my order after placing it?",
        a: "Orders can be modified or cancelled within 2 hours of placement, provided they have not yet been dispatched. Please contact us immediately at hello@renicosmetics.com.au with your order number.",
      },
      {
        q: "Will I receive a confirmation email?",
        a: "Yes. A confirmation email with your order summary and tracking details is sent automatically once your order is dispatched. Please check your spam folder if you do not receive it within 1 hour.",
      },
    ],
  },
  {
    category: "Shipping & Delivery",
    questions: [
      {
        q: "How quickly will my order be dispatched?",
        a: "Orders placed before 12 pm AEST Monday–Friday are dispatched the same business day. Orders placed after 12 pm or on weekends are dispatched the following business day.",
      },
      {
        q: "Do you offer free shipping?",
        a: "Yes — free standard shipping on all Australian orders over $80 AUD. Express shipping options are available at checkout for an additional fee.",
      },
      {
        q: "Do you ship internationally?",
        a: "Reni Cosmetics currently ships within Australia only. International shipping to New Zealand, the UK, and the US is planned for Q3 2026. Join our newsletter to be notified when it launches.",
      },
      {
        q: "How do I track my order?",
        a: "A tracking number is included in your dispatch confirmation email. You can track your parcel directly on the AusPost or Sendle website using that number.",
      },
    ],
  },
  {
    category: "Skin Concerns & Protocol",
    questions: [
      {
        q: "Which product should I start with?",
        a: "If you're new to Reni, we recommend starting with NEUROVÉCTRIX™ Core (AM) and DERMASHIELD™ (PM) as your foundation protocol. Use our Protocol Recommender quiz for a personalised recommendation based on your primary skin concern.",
      },
      {
        q: "How long before I see results?",
        a: "Neuromodulating peptides such as SNAP-8™ and Argireline® typically show visible expression-line softening within 4–8 weeks of consistent twice-daily use. Structural improvements to skin density and elasticity (via RECEPTORLIFT™) are generally measurable at the 8–12 week mark.",
      },
      {
        q: "Can I use Reni products while pregnant or breastfeeding?",
        a: "We recommend consulting your GP or dermatologist before introducing any new active skincare products during pregnancy or breastfeeding. While all Reni formulas use cosmetic-grade ingredients, individual medical circumstances vary.",
      },
      {
        q: "Are Reni products suitable for all skin types?",
        a: "Yes. All four Phase 1 products are formulated to be suitable for normal, dry, combination, oily, and sensitive skin types. DERMASHIELD™ is particularly suited to dry or compromised barrier skin. NEUROVÉCTRIX™ Core's lightweight gel texture is ideal for oily and combination skin. If you have a specific skin condition (rosacea, eczema, active acne), we recommend a patch test and consulting a dermatologist before use.",
      },
    ],
  },
  {
    category: "Returns & Refunds",
    questions: [
      {
        q: "What is your return policy?",
        a: "We offer a 30-day return guarantee on all unopened, sealed products. If you change your mind or your order arrives damaged, contact us at hello@renicosmetics.com.au within 30 days of delivery with your order number and reason for return. We will provide a prepaid return label for damaged or incorrect items. For change-of-mind returns, return postage is at the customer's expense.",
      },
      {
        q: "What if the product doesn't work for me?",
        a: "Skincare actives require consistent use over 4–12 weeks to show measurable results — this is the nature of how peptides and biological pathway modulators work. If you have used a product consistently for the full recommended period and have not seen any improvement, please contact us. We will review your protocol and, where appropriate, offer a partial credit or exchange. We cannot offer refunds on opened products due to hygiene and safety requirements under Australian Consumer Law.",
      },
      {
        q: "My order arrived damaged. What do I do?",
        a: "Please photograph the damaged item and packaging immediately and email the photos to hello@renicosmetics.com.au with your order number. We will arrange a replacement or full refund within 2 business days of receiving your report. Damaged goods claims must be lodged within 7 days of delivery.",
      },
      {
        q: "Are Reni products worth the price?",
        a: "Every Reni product is formulated with pharmaceutical-grade actives at or above their clinically studied minimum effective concentrations — the same ingredient grades used in clinical dermatology research. The price reflects the cost of sourcing SNAP-8™, Progeline™, and Argireline® at meaningful concentrations, not marketing. We publish every active and its concentration so you can verify this independently against supplier clinical data. We believe in earning trust through transparency, not claims.",
      },
    ],
  },
];

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="py-5 cursor-pointer"
      style={{ borderBottom: "1px solid rgba(45,44,44,0.1)" }}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-sm font-medium leading-snug pr-4" style={{ color: "#2D2C2C" }}>{q}</h3>
        <ChevronDown
          size={16}
          className="shrink-0 mt-0.5 transition-transform duration-200"
          style={{ color: "rgba(45,44,44,0.4)", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </div>
      {open && (
        <p className="text-sm leading-relaxed mt-3" style={{ color: "rgba(45,44,44,0.6)" }}>
          {a}
        </p>
      )}
    </div>
  );
}

export default function FAQPage() {
  const allQuestions = FAQ_CATEGORIES.flatMap(c => c.questions.map(q => ({ question: q.q, answer: q.a })));

  useSEO({
    title: "FAQ — Reni Cosmetics",
    description: "Frequently asked questions about Reni Cosmetics products, formulations, shipping, returns, and skincare protocols.",
    url: "/faq",
    structuredData: {
      type: "faq" as const,
      questions: allQuestions,
    },
  });

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <PageErrorBoundary>
      <div className="min-h-screen" style={{ background: "#FAFAF7" }}>
        <Navbar />

        {/* Header — dark charcoal to differentiate from other support pages */}
        <div className="pt-28 pb-12" style={{ background: "#2D2C2C" }}>
          <div className="container">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px" style={{ background: "rgba(234,234,223,0.3)" }} />
              <span className="text-[10px] tracking-[0.2em] uppercase font-medium" style={{ color: "rgba(234,234,223,0.45)" }}>Support</span>
            </div>
            <h1 className="font-display font-light mb-3" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "#EAEADF", letterSpacing: "-0.01em" }}>
              Frequently Asked Questions
            </h1>
            <p className="text-sm max-w-lg" style={{ color: "rgba(234,234,223,0.5)" }}>
              Answers to the most common questions about our products, protocols, and orders. Can't find an answer? Contact our team directly.
            </p>
          </div>
        </div>

        <div className="container py-16">
          <div className="max-w-3xl mx-auto">

            {FAQ_CATEGORIES.map(({ category, questions }) => (
              <section key={category} className="mb-14">
                <div className="flex items-center gap-3 mb-6">
                  <div className="reni-divider" />
                  <h2 className="text-xs tracking-widest uppercase font-medium" style={{ color: "rgba(45,44,44,0.45)" }}>
                    {category}
                  </h2>
                </div>
                <div>
                  {questions.map(({ q, a }) => (
                    <AccordionItem key={q} q={q} a={a} />
                  ))}
                </div>
              </section>
            ))}

            {/* CTA */}
            <div className="mt-10 p-8 text-center" style={{ background: "#2D2C2C" }}>
              <h3 className="font-display text-xl font-light mb-2" style={{ color: "#EAEADF" }}>
                Still have questions?
              </h3>
              <p className="text-xs mb-6" style={{ color: "rgba(234,234,223,0.45)" }}>
                Our team typically responds within 1 business day.
              </p>
              <Link href="/contact">
                <button
                  className="px-8 py-3 text-xs tracking-widest uppercase font-medium transition-opacity hover:opacity-80"
                  style={{ background: "#EAEADF", color: "#2D2C2C" }}
                >
                  Contact Us
                </button>
              </Link>
            </div>

          </div>
        </div>

        <Footer />
      </div>
    </PageErrorBoundary>
  );
}
