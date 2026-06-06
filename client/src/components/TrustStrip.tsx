// TrustStrip — Premium editorial brand proof strip
// Large Cormorant display numerals with short statements
// Inspired by Augustinus Bader / La Mer stat-row treatment

const stats = [
  {
    value: "6",
    unit: "Targeted Pathways",
    statement: "One mechanism per product. No competing actives.",
  },
  {
    value: "100%",
    unit: "Disclosed",
    statement: "Every active named. Every concentration published.",
  },
  {
    value: "0",
    unit: "Proprietary Blends",
    statement: "No hidden formulas. No undisclosed percentages.",
  },
  {
    value: "2–3",
    unit: "Day Dispatch",
    statement: "Formulated and dispatched from Melbourne, Australia.",
  },
];

export default function TrustStrip() {
  return (
    <div style={{ background: "#1E1D1D" }}>
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {stats.map(({ value, unit, statement }, i) => (
            <div
              key={unit}
              className="py-12 px-6 flex flex-col"
              style={{
                borderRight: i < 3 ? "1px solid rgba(234,234,223,0.07)" : "none",
              }}
            >
              {/* Large display numeral */}
              <span
                className="font-display font-light leading-none block"
                style={{
                  fontSize: "clamp(2.6rem, 4.5vw, 4rem)",
                  color: "#EAEADF",
                  letterSpacing: "-0.02em",
                }}
              >
                {value}
              </span>
              <span
                className="text-[9px] tracking-[0.2em] uppercase font-semibold mt-2 mb-5 block"
                style={{ color: "rgba(234,234,223,0.32)" }}
              >
                {unit}
              </span>

              {/* Thin rule */}
              <div
                className="w-8 mb-5"
                style={{ height: "1px", background: "rgba(234,234,223,0.14)" }}
              />

              {/* Statement */}
              <p
                className="text-xs leading-relaxed"
                style={{ color: "rgba(234,234,223,0.38)" }}
              >
                {statement}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
