/**
 * CredibilityStrip — replaces the fake press section.
 * Every claim here is factual and verifiable. No fabricated press quotes.
 * When Reni earns real press coverage, add it to the `pressMentions` array.
 */
export default function PressStrip() {
  const credentials = [
    {
      stat: "100%",
      label: "Ingredient Disclosure",
      detail: "Every active named. Every concentration published.",
    },
    {
      stat: "0",
      label: "Proprietary Blends",
      detail: "No hidden formulas. No undisclosed percentages.",
    },
    {
      stat: "6",
      label: "Biological Pathways",
      detail: "One mechanism per product. No competing actives.",
    },
    {
      stat: "≥MEC",
      label: "Active Concentrations",
      detail: "Every active at or above its minimum effective concentration.",
    },
  ];

  return (
    <section
      className="py-14 overflow-hidden"
      style={{ background: "#2D2C2C" }}
    >
      <div className="container">
        <p
          className="text-[9px] tracking-[0.25em] uppercase font-semibold text-center mb-10"
          style={{ color: "rgba(234,234,223,0.4)" }}
        >
          The Reni Standard
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {credentials.map((c) => (
            <div key={c.stat} className="text-center">
              <p
                className="font-display font-light mb-1"
                style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", color: "#EAEADF", letterSpacing: "-0.01em" }}
              >
                {c.stat}
              </p>
              <p
                className="text-[10px] font-semibold tracking-[0.14em] uppercase mb-2"
                style={{ color: "rgba(234,234,223,0.55)" }}
              >
                {c.label}
              </p>
              <p
                className="text-[10px] leading-relaxed"
                style={{ color: "rgba(234,234,223,0.35)" }}
              >
                {c.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Ingredient supplier credibility — verifiable */}
        <div
          className="mt-12 pt-10 text-center"
          style={{ borderTop: "1px solid rgba(234,234,223,0.1)" }}
        >
          <p
            className="text-[9px] tracking-[0.25em] uppercase font-semibold mb-6"
            style={{ color: "rgba(234,234,223,0.3)" }}
          >
            Active Ingredients Sourced From
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            {[
              "Sederma (SNAP-8™, Matrixyl™ 3000)",
              "Lucas Meyer Cosmetics (Progeline™)",
              "Lipotec / Lubrizol (Argireline®, Neutrazen™)",
              "Alban Muller (Nightessence™)",
              "Ashland (Kollaren™ BG, Rosaliss™)",
              "Hyalogy (HyaMatrix™ VII+)",
            ].map((supplier) => (
              <span
                key={supplier}
                className="text-[10px]"
                style={{ color: "rgba(234,234,223,0.3)" }}
              >
                {supplier}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
