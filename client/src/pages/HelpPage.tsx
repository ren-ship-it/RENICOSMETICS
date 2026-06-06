import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageErrorBoundary from "@/components/PageErrorBoundary";
import { useSEO } from "@/hooks/useSEO";
import { Truck, HelpCircle, Mail, MapPin, ArrowRight, MessageCircle } from "lucide-react";
import { Link } from "wouter";

const HELP_SECTIONS = [
  {
    icon: <Truck size={22} />,
    title: "Shipping & Returns",
    description: "Delivery timeframes, free shipping thresholds, return eligibility, and how to initiate a refund.",
    href: "/shipping",
    cta: "View Shipping Policy",
  },
  {
    icon: <HelpCircle size={22} />,
    title: "FAQ",
    description: "Answers to the most common questions about our products, formulations, protocols, and orders.",
    href: "/faq",
    cta: "Browse FAQs",
  },
  {
    icon: <Mail size={22} />,
    title: "Contact Us",
    description: "Send a direct message to our team. We respond to all enquiries within 1 business day.",
    href: "/contact",
    cta: "Get in Touch",
  },
  {
    icon: <MapPin size={22} />,
    title: "Stockists",
    description: "Find authorised Reni Cosmetics retailers and wholesale partners near you, or apply to become one.",
    href: "/stockists",
    cta: "Find a Stockist",
  },
];

const QUICK_ANSWERS = [
  { q: "What is the minimum order value?", a: "$150 AUD." },
  { q: "How quickly do you dispatch?", a: "Within 1 business day for orders placed before 12 pm AEST." },
  { q: "Do you offer free shipping?", a: "Yes — free standard shipping on Australian orders over $80 AUD." },
  { q: "Can I return an opened product?", a: "No. Only unopened, sealed products are eligible for return within 30 days." },
  { q: "Are your products vegan?", a: "Yes. All Reni formulas are 100% vegan and cruelty-free." },
  { q: "Do you ship internationally?", a: "Australia only currently. International shipping launches Q3 2026." },
];

export default function HelpPage() {
  useSEO({
    title: "Help Centre — Reni Cosmetics",
    description: "Get support from the Reni Cosmetics team. Find answers about shipping, returns, products, and more.",
    url: "/help",
  });

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <PageErrorBoundary>
      <div className="min-h-screen" style={{ background: "#FAFAF7" }}>
        <Navbar />

        {/* Header — sage green accent top bar + white body, distinct from all other support pages */}
        <div>
          <div style={{ background: "#6B7A3E", height: "4px" }} />
          <div className="pt-24 pb-12" style={{ background: "#FAFAF7", borderBottom: "1px solid rgba(45,44,44,0.1)" }}>
            <div className="container">
              <div className="flex items-center gap-3 mb-5">
                <MessageCircle size={14} color="#6B7A3E" />
                <span className="text-[10px] tracking-[0.2em] uppercase font-medium" style={{ color: "#6B7A3E" }}>Help Centre</span>
              </div>
              <h1 className="font-display font-light mb-3" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "#2D2C2C", letterSpacing: "-0.01em" }}>
                How can we help?
              </h1>
              <p className="text-sm max-w-lg" style={{ color: "rgba(45,44,44,0.5)" }}>
                Browse the topics below, or contact our team directly. We respond to all enquiries within 1 business day.
              </p>
            </div>
          </div>
        </div>

        <div className="container py-16">
          <div className="max-w-4xl mx-auto">

            {/* Help sections grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              {HELP_SECTIONS.map(({ icon, title, description, href, cta }) => (
                <Link key={title} href={href}>
                  <div
                    className="p-7 flex flex-col gap-4 cursor-pointer group transition-all duration-200"
                    style={{ background: "#EAEADF" }}
                  >
                    <div style={{ color: "#6B7A3E" }}>{icon}</div>
                    <div>
                      <h2 className="font-display text-xl font-medium mb-2" style={{ color: "#2D2C2C" }}>{title}</h2>
                      <p className="text-xs leading-relaxed" style={{ color: "rgba(45,44,44,0.6)" }}>{description}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium mt-auto group-hover:gap-3 transition-all duration-200" style={{ color: "#2D2C2C" }}>
                      {cta} <ArrowRight size={13} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Quick answers */}
            <section className="mb-16">
              <h2 className="font-display text-2xl font-light mb-6" style={{ color: "#2D2C2C" }}>
                Quick Answers
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {QUICK_ANSWERS.map(({ q, a }) => (
                  <div key={q} className="p-5" style={{ background: "#EAEADF", borderLeft: "2px solid #6B7A3E" }}>
                    <p className="text-xs font-semibold mb-1.5" style={{ color: "#2D2C2C" }}>{q}</p>
                    <p className="text-xs" style={{ color: "rgba(45,44,44,0.6)" }}>{a}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 text-center">
                <Link href="/faq">
                  <span className="text-xs font-medium hover:opacity-70 transition-opacity cursor-pointer" style={{ color: "rgba(45,44,44,0.5)" }}>
                    View all FAQs →
                  </span>
                </Link>
              </div>
            </section>

            {/* Contact CTA */}
            <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-6" style={{ background: "#2D2C2C" }}>
              <div className="flex items-center gap-4">
                <MessageCircle size={20} style={{ color: "rgba(234,234,223,0.4)" }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: "#EAEADF" }}>Still need help?</p>
                  <p className="text-xs" style={{ color: "rgba(234,234,223,0.4)" }}>Our team responds within 1 business day, Monday–Friday.</p>
                </div>
              </div>
              <Link href="/contact">
                <button
                  className="shrink-0 flex items-center gap-3 px-8 py-3 text-xs tracking-widest uppercase font-medium transition-opacity hover:opacity-80"
                  style={{ background: "#EAEADF", color: "#2D2C2C" }}
                >
                  Contact Us <ArrowRight size={13} />
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
