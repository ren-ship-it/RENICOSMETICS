import { useEffect, useRef } from "react";

const PRODUCT_IMG = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663375502795/mGILbKUCGqEqLspJ.jpg";

export default function BrandStorySection() {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("visible");
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -40px 0px" }
    );
    if (leftRef.current) observer.observe(leftRef.current);
    if (rightRef.current) observer.observe(rightRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="brand-story" className="bg-obsidian py-32 overflow-hidden">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left — Image */}
          <div ref={leftRef} className="reveal">
            <div className="relative">
              <img
                src={PRODUCT_IMG}
                alt="Reni Cosmetics — STRESSDEFENSE™ Frosted Glass Dropper"
                className="w-full object-contain"
                style={{ maxHeight: "600px", objectPosition: "center" }}
              />
              {/* Gold accent frame */}
              <div
                className="absolute -bottom-4 -right-4 border border-gold-dim"
                style={{ width: "60%", height: "60%", pointerEvents: "none" }}
              />
            </div>
          </div>

          {/* Right — Story */}
          <div ref={rightRef} className="reveal reveal-delay-2">
            <div className="flex items-center gap-4 mb-8">
              <div className="gold-rule" />
              <span className="section-label">Brand Story</span>
            </div>

            <h2
              className="font-display text-alabaster font-semibold leading-tight mb-8"
              style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)" }}
            >
              The Discipline
              <br />
              <span className="text-gold italic">Is the Brand.</span>
            </h2>

            <div className="space-y-6 text-alabaster/60 font-light leading-relaxed text-base">
              <p>
                Reni Cosmetics was built on a single conviction: that the skincare industry
                had confused complexity with efficacy. The more ingredients in a formula,
                the more the mechanisms compete. The more claims on a label, the less any
                single one can be verified.
              </p>
              <p>
                We chose a different architecture. Each product in the Reni system addresses
                one biological pathway, at a concentration that is clinically meaningful,
                with evidence that is verifiable and sourced.
              </p>
              <p>
                The result is a range that is prescribable by clinicians, trusted by
                formulators, and understood by the consumers who use it. Not because we
                simplified — but because we were disciplined.
              </p>
            </div>

            {/* Mission / Vision */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="border-t border-gold pt-6">
                <div className="section-label text-[9px] mb-3">Mission</div>
                <p className="font-display italic text-alabaster/80 text-base leading-relaxed">
                  To make clinical anti-ageing science accessible through a luxury experience
                  that never compromises on mechanism.
                </p>
              </div>
              <div className="border-t border-gold pt-6">
                <div className="section-label text-[9px] mb-3">Vision</div>
                <p className="font-display italic text-alabaster/80 text-base leading-relaxed">
                  To be the reference standard for peptide-first, fragrance-free luxury
                  skincare in the clinical and consumer market.
                </p>
              </div>
            </div>

            {/* Credentials */}
            <div className="mt-12 flex flex-wrap gap-8">
              {[
                { label: "Fragrance-Free", sub: "All SKUs" },
                { label: "Vegan & Cruelty-Free", sub: "All SKUs" },
                { label: "pH 5.0 ± 0.3", sub: "Clinically calibrated" },
                { label: "No Essential Oils", sub: "Sensitivity-safe" },
              ].map((cred) => (
                <div key={cred.label}>
                  <div className="font-mono-reni text-gold text-xs tracking-wider mb-1">
                    {cred.label}
                  </div>
                  <div className="text-alabaster/30 text-xs">{cred.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
