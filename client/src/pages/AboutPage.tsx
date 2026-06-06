import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageErrorBoundary from "@/components/PageErrorBoundary";
import { useSEO } from "@/hooks/useSEO";

const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663375502795/fiWabj6oJEMnYrutYEZXeW/hero-bg-1-ULGymt7HCUPHFYzKDWeuAb.png";

const VALUES = [
  {
    label: "Radical Transparency",
    desc: "Every active ingredient is disclosed at its exact concentration. No proprietary blends. No hidden dilution. Every percentage is published on every product page — because you have the right to know exactly what you're applying to your skin.",
  },
  {
    label: "One Pathway Per Product",
    desc: "We don't formulate ingredient cocktails. Each product addresses a single biological pathway at the validated minimum effective concentration — so nothing competes, nothing dilutes, and nothing is wasted.",
  },
  {
    label: "Scientific Integrity",
    desc: "Every hero active in the Reni system is backed by peer-reviewed clinical research. We cite our sources. We don't make therapeutic claims. We let the science speak — and we hold ourselves to the same standard we apply to the research.",
  },
  {
    label: "Australian Made & Dispatched",
    desc: "Formulated and dispatched from Melbourne, Victoria. Every order is fulfilled within 1–3 business days, Australia-wide. No third-party fulfilment. No compromises on freshness or handling.",
  },
];

const AIMS = [
  {
    num: "01",
    title: "Redefine what clinical skincare means",
    body: "The word 'clinical' has been borrowed by marketing departments for decades. We are building a brand where that word means something specific: actives at validated concentrations, mechanisms that are peer-reviewed, and claims that can be independently verified.",
  },
  {
    num: "02",
    title: "Make precision skincare accessible",
    body: "Effective anti-ageing skincare should not require a dermatologist's appointment or a prescription. Our aim is to bring the same active ingredients used in clinical settings into a daily protocol that anyone can follow — without confusion, without guesswork.",
  },
  {
    num: "03",
    title: "Build a system, not a shelf",
    body: "We are not building a range of standalone products. We are building a complete structural anti-ageing system — where each product targets a different biological pathway and every SKU is designed to work in sequence with the others. Phase 1 is four products. The system is not finished.",
  },
  {
    num: "04",
    title: "Earn trust through evidence",
    body: "We do not ask customers to trust us because our packaging looks expensive. We ask them to read the science, check the concentrations, and verify the mechanisms. Every claim on this website has a source. Every source is cited. That is the standard we hold ourselves to.",
  },
];

export default function AboutPage() {
  useSEO({
    title: "About Reni Cosmetics — Science-Driven Clinical Skincare",
    description: "Reni Cosmetics is a clinical anti-ageing skincare brand built on six verified biological pathways. One product. One pathway. No compromise. Formulated in Melbourne, Australia.",
    url: "/about",
  });

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <PageErrorBoundary pageName="About">
      <div className="min-h-screen" style={{ background: "#FAFAF7" }}>
        <Navbar />

        {/* Hero header */}
        <div
          className="relative flex items-end"
          style={{ minHeight: "55vh", background: "#1E1D1D" }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${HERO_IMG})` }}
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 30%, #1E1D1D 100%)" }} />
          <div className="relative z-10 container pb-16 pt-36">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px" style={{ background: "rgba(234,234,223,0.25)" }} />
              <span className="text-[10px] tracking-[0.22em] uppercase font-medium" style={{ color: "rgba(234,234,223,0.4)" }}>
                Our Story
              </span>
            </div>
            <h1
              className="font-display font-light leading-tight"
              style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)", color: "#EAEADF", letterSpacing: "-0.02em", maxWidth: "700px" }}
            >
              Built on science.
              <br />
              <em>Driven by precision.</em>
            </h1>
          </div>
        </div>

        {/* Mission statement */}
        <section className="py-20 md:py-28" style={{ background: "#FAFAF7" }}>
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="reni-divider" />
                  <span className="reni-tag">The Mission</span>
                </div>
                <h2
                  className="font-display font-light leading-tight mb-8"
                  style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: "#2D2C2C", letterSpacing: "-0.01em" }}
                >
                  Skincare that doesn't hide behind complexity.
                </h2>
                <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(45,44,44,0.62)" }}>
                  Reni Cosmetics was built on a single observation: the skincare industry had become expert at sounding scientific while delivering very little of it. Formulas packed with 30 actives at sub-threshold concentrations. Proprietary blends that obscure what's actually inside. Marketing language borrowed from pharmaceutical research, applied to products that couldn't survive peer review.
                </p>
                <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(45,44,44,0.62)" }}>
                  We built Reni Cosmetics to be the opposite. Each product in the system addresses one biological pathway. Each active is formulated at or above its clinically validated minimum effective concentration. Every percentage is disclosed. Every mechanism is cited.
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(45,44,44,0.62)" }}>
                  This is not minimalism for its own sake. It is precision. And precision is what produces results.
                </p>
              </div>
              <div>
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { val: "6", label: "Targeted Pathways" },
                    { val: "4", label: "Phase 1 Products" },
                    { val: "100%", label: "Disclosed Ingredients" },
                    { val: "0", label: "Proprietary Blends" },
                  ].map(({ val, label }) => (
                    <div
                      key={label}
                      className="p-6"
                      style={{ background: "#EAEADF" }}
                    >
                      <div
                        className="font-display font-light leading-none mb-2"
                        style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "#2D2C2C" }}
                      >
                        {val}
                      </div>
                      <div className="text-[10px] tracking-[0.16em] uppercase font-medium" style={{ color: "rgba(45,44,44,0.45)" }}>
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  className="p-5 flex items-start gap-3"
                  style={{ background: "rgba(45,44,44,0.04)", border: "1px solid rgba(45,44,44,0.08)" }}
                >
                  <div className="w-0.5 min-h-full flex-shrink-0 self-stretch" style={{ background: "#6B7A3E" }} />
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(45,44,44,0.55)" }}>
                    All products are for topical and cosmetic use only. Reni Cosmetics does not make therapeutic or TGA-registered claims. Melbourne, Victoria, Australia.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 md:py-28" style={{ background: "#EAEADF" }}>
          <div className="container">
            <div className="flex items-center gap-3 mb-12">
              <div className="reni-divider" />
              <span className="reni-tag">What We Stand For</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {VALUES.map(({ label, desc }, i) => (
                <div key={label} className="flex gap-5">
                  <div
                    className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-[10px] font-semibold"
                    style={{ background: "#2D2C2C", color: "#EAEADF" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="font-display text-base font-medium mb-2" style={{ color: "#2D2C2C" }}>
                      {label}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(45,44,44,0.58)" }}>
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What We Aim to Do */}
        <section className="py-20 md:py-28" style={{ background: "#2D2C2C" }}>
          <div className="container">
            <div className="flex items-center gap-3 mb-14">
              <div className="w-8 h-px" style={{ background: "rgba(234,234,223,0.2)" }} />
              <span className="text-[10px] tracking-[0.22em] uppercase font-medium" style={{ color: "rgba(234,234,223,0.38)" }}>
                What We Aim to Do
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {AIMS.map(({ num, title, body }) => (
                <div key={num} className="flex gap-6 items-start">
                  <div
                    className="flex-shrink-0 font-display font-light leading-none"
                    style={{ fontSize: "clamp(2rem, 3.5vw, 2.8rem)", color: "rgba(234,234,223,0.12)", letterSpacing: "-0.02em", minWidth: "3rem" }}
                  >
                    {num}
                  </div>
                  <div>
                    <h3
                      className="font-display font-light leading-snug mb-3"
                      style={{ fontSize: "clamp(1rem, 1.8vw, 1.25rem)", color: "#EAEADF" }}
                    >
                      {title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(234,234,223,0.48)" }}>
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Company facts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16">
              {[
                { label: "Headquarters", value: "Epping, Victoria, Australia" },
                { label: "Dispatch", value: "1–3 business days · Australia-wide" },
                { label: "Compliance", value: "Cosmetic use only · No TGA claims · Vegan · No Animal Testing" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="p-5"
                  style={{ background: "rgba(234,234,223,0.05)", border: "1px solid rgba(234,234,223,0.1)" }}
                >
                  <div className="text-xs font-semibold tracking-wide mb-1" style={{ color: "#EAEADF" }}>{label}</div>
                  <div className="text-xs leading-relaxed" style={{ color: "rgba(234,234,223,0.45)" }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 md:py-24" style={{ background: "#FAFAF7" }}>
          <div className="container text-center">
            <h2
              className="font-display font-light mb-5"
              style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "#2D2C2C" }}
            >
              Ready to start your protocol?
            </h2>
            <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "rgba(45,44,44,0.52)" }}>
              Take the 2-minute quiz and we'll build a personalised system based on your skin concerns, age, and routine.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/quiz">
                <button
                  className="flex items-center gap-2.5 px-8 py-4 text-[11px] tracking-[0.18em] uppercase font-semibold transition-opacity hover:opacity-85"
                  style={{ background: "#2D2C2C", color: "#EAEADF" }}
                >
                  Find Your Protocol <ArrowRight size={13} />
                </button>
              </Link>
              <Link href="/science">
                <button
                  className="flex items-center gap-2.5 px-8 py-4 text-[11px] tracking-[0.18em] uppercase font-medium transition-opacity hover:opacity-70"
                  style={{ background: "transparent", color: "rgba(45,44,44,0.7)", border: "1px solid rgba(45,44,44,0.25)" }}
                >
                  Read the Science
                </button>
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageErrorBoundary>
  );
}
