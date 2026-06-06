import { useEffect, useRef, useState } from "react";

const protocol = {
  AM: [
    {
      step: "01",
      product: "NEUROVÉCTRIX™ Core",
      descriptor: "Expression Line Modulator",
      instruction: "Apply to forehead, crow's feet, and nasolabial folds using the roll-on applicator. Allow 60 seconds to absorb.",
    },
    {
      step: "02",
      product: "RECEPTORLIFT™",
      descriptor: "Receptor-Level Firming",
      instruction: "Two pumps. Press into cheeks, jawline, and neck. Do not rub — press and hold for 5 seconds per zone.",
    },
    {
      step: "03",
      product: "DERMASHIELD™ + SPF",
      descriptor: "Barrier Seal & Protection",
      instruction: "Finish with DERMASHIELD™ followed by a broad-spectrum SPF 50+. The barrier seal locks in the peptide actives.",
    },
  ],
  PM: [
    {
      step: "01",
      product: "NEUROVÉCTRIX™ Core",
      descriptor: "Expression Line Modulator (if tolerated)",
      instruction: "Optional second application for accelerated results. Reduce to AM-only if any sensitivity occurs.",
    },
    {
      step: "02",
      product: "STRESSDEFENSE™",
      descriptor: "Night Longevity Serum",
      instruction: "5–6 drops. Press into full face and neck. The circadian-active complex works in alignment with the skin's natural repair cycle.",
    },
    {
      step: "03",
      product: "DERMASHIELD™",
      descriptor: "Barrier Renewal",
      instruction: "Final step. Creates an occlusive barrier that amplifies overnight peptide activity and prevents transepidermal water loss.",
    },
  ],
};

export default function ProtocolSection() {
  const [activeTab, setActiveTab] = useState<"AM" | "PM">("AM");
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) headingRef.current?.classList.add("visible");
      },
      { threshold: 0, rootMargin: "0px 0px -40px 0px" }
    );
    if (headingRef.current) observer.observe(headingRef.current);
    return () => observer.disconnect();
  }, []);

  const steps = protocol[activeTab];

  return (
    <section id="protocol" className="bg-alabaster py-32" ref={sectionRef}>
      <div className="container">
        {/* Section header */}
        <div ref={headingRef} className="reveal mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="gold-rule" />
            <span className="section-label text-obsidian">Protocol Framework</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <h2
              className="font-display text-obsidian font-semibold leading-tight"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", maxWidth: "600px" }}
            >
              The Reni Structural
              <br />
              <span className="text-cerulean italic">Anti-Ageing System</span>
            </h2>
            <div className="max-w-sm">
              <p className="text-obsidian/60 font-light leading-relaxed text-base mb-3">
                A four-step, peptide-dense, fragrance-free protocol targeting expression lines,
                structural firmness, stress-accelerated aging, and barrier resilience.
              </p>
              <p className="font-mono-reni text-obsidian/40 text-xs tracking-wider">
                Expected results: 8–12 weeks
              </p>
            </div>
          </div>
        </div>

        {/* AM/PM Toggle */}
        <div className="flex items-center gap-0 mb-12 border-b border-obsidian/10">
          {(["AM", "PM"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-10 py-4 font-display text-2xl font-semibold transition-colors duration-300 ${
                activeTab === tab
                  ? "text-obsidian"
                  : "text-obsidian/30 hover:text-obsidian/60"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
              )}
            </button>
          ))}
          <div className="ml-8 font-mono-reni text-obsidian/30 text-xs tracking-widest">
            {activeTab === "AM" ? "MORNING RITUAL" : "EVENING RITUAL"}
          </div>
        </div>

        {/* Protocol Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={`${activeTab}-${step.step}`}
              className="border-t-2 border-cerulean pt-8 pb-6"
              style={{
                animation: `fadeSlideIn 0.5s ease-out ${index * 0.1}s both`,
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono-reni text-cerulean text-xs opacity-60">
                  STEP {step.step}
                </span>
              </div>
              <h3 className="font-display text-obsidian text-xl font-semibold leading-tight mb-1">
                {step.product}
              </h3>
              <p className="text-obsidian/50 text-sm font-light tracking-wide mb-6">
                {step.descriptor}
              </p>
              <p className="text-obsidian/70 text-sm font-light leading-relaxed">
                {step.instruction}
              </p>
            </div>
          ))}
        </div>

        {/* Clinical Timeline */}
        <div className="mt-20 pt-12 border-t border-obsidian/10">
          <div className="section-label text-obsidian/40 mb-8">Clinical Timeline</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { week: "Week 1–2", outcome: "Skin texture improvement. Reduced surface roughness." },
              { week: "Week 3–4", outcome: "Visible reduction in expression line depth." },
              { week: "Week 6–8", outcome: "Measurable improvement in skin firmness and contour." },
              { week: "Week 10–12", outcome: "Full structural anti-ageing protocol results visible." },
            ].map((item) => (
              <div key={item.week} className="border-l-2 border-gold pl-4">
                <div className="font-mono-reni text-gold text-xs tracking-wider mb-2">
                  {item.week}
                </div>
                <p className="text-obsidian/60 text-sm font-light leading-relaxed">
                  {item.outcome}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
