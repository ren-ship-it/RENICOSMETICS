// MarqueeTicker — horizontal scrolling brand proof strip
// Adds motion and energy between the hero and trust strip

const items = [
  "Clinically Referenced Actives",
  "One Pathway Per Product",
  "No Proprietary Blends. No Hidden Actives.",
  "Cosmetic-Grade Actives",
  "No Animal Testing",
  "Vegan & Cruelty-Free",
  "Australian Owned & Formulated",
  "Dispatched Within 1 Business Day",
  "Free Shipping Over $80 AUD",
  "Clinically Referenced Actives",
  "One Pathway Per Product",
  "No Proprietary Blends. No Hidden Actives.",
  "Cosmetic-Grade Actives",
  "No Animal Testing",
  "Vegan & Cruelty-Free",
  "Australian Owned & Formulated",
  "Dispatched Within 1 Business Day",
  "Free Shipping Over $80 AUD",
];

export default function MarqueeTicker() {
  return (
    <div
      className="overflow-hidden py-4 border-y"
      style={{ background: "#2D2C2C", borderColor: "rgba(234,234,223,0.08)" }}
    >
      <div
        className="flex gap-0 whitespace-nowrap"
        style={{ animation: "marqueeScroll 38s linear infinite" }}
      >
        {items.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-0 text-[10px] font-medium tracking-[0.22em] uppercase flex-shrink-0"
            style={{ color: "rgba(234,234,223,0.65)" }}
          >
            <span className="px-8">{item}</span>
            <span style={{ color: "rgba(234,234,223,0.2)", fontSize: "6px" }}>◆</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
