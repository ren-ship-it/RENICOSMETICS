import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";

const recoveryLinks = [
  { label: "Shop All Products", href: "/shop", desc: "Browse the full Reni collection" },
  { label: "The Complete Bundle", href: "/bundle", desc: "All 4 Phase 1 products · Save $94" },
  { label: "Find Your Protocol", href: "/quiz", desc: "3-question personalised recommender" },
  { label: "Our Science", href: "/science", desc: "The biology behind the system" },
];

export default function NotFound() {
  useSEO({
    title: "Page Not Found",
    description: "The page you are looking for does not exist. Return to the Reni Cosmetics homepage.",
    url: "/404",
  });

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FAFAF7" }}>
      <Navbar />

      <main className="flex-1 flex items-center">
        <div className="container py-24 max-w-2xl">
          {/* 404 number — large ghost text */}
          <div
            className="font-display font-light mb-6 select-none"
            style={{
              fontSize: "clamp(5rem, 15vw, 10rem)",
              color: "rgba(45,44,44,0.06)",
              lineHeight: 1,
              letterSpacing: "-0.04em",
            }}
          >
            404
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="reni-divider" />
            <span className="reni-tag">Page not found</span>
          </div>

          <h1
            className="font-display font-light mb-4"
            style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", color: "#2D2C2C" }}
          >
            This page doesn't exist.
          </h1>
          <p className="text-sm leading-relaxed mb-10" style={{ color: "rgba(45,44,44,0.55)" }}>
            The page you're looking for may have moved, been renamed, or no longer exists.
            Use the links below to find your way back.
          </p>

          {/* Recovery links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
            {recoveryLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between p-4 transition-all duration-150 group"
                style={{ background: "#EAEADF" }}
              >
                <div>
                  <div className="text-xs font-semibold mb-0.5" style={{ color: "#2D2C2C" }}>{link.label}</div>
                  <div className="text-xs" style={{ color: "rgba(45,44,44,0.5)" }}>{link.desc}</div>
                </div>
                <ArrowRight size={14} color="rgba(45,44,44,0.35)" className="flex-shrink-0 ml-3" />
              </Link>
            ))}
          </div>

          <Link href="/" className="btn-reni-dark inline-flex items-center gap-2">
            Return to Homepage
            <ArrowRight size={14} />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
