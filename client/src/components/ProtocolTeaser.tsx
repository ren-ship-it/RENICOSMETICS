import { Link } from "wouter";
import { PRODUCTS } from "@/data/products";
import { ArrowRight, Sun, Moon } from "lucide-react";

const PHASE1 = PRODUCTS.filter(p => p.phase === 1);

const PROTOCOL_STEPS = [
  {
    label: "Morning Routine",
    icon: Sun,
    time: "AM",
    protocol: "NEUROVÉCTRIX™ Core → RECEPTORLIFT™ → DERMASHIELD™ + SPF",
    note: "Neuromodulate · Lift · Protect",
  },
  {
    label: "Evening Routine",
    icon: Moon,
    time: "PM",
    protocol: "NEUROVÉCTRIX™ Core → STRESSDEFENSE™ → DERMASHIELD™",
    note: "Repair · Restore · Regenerate",
  },
];

export default function ProtocolTeaser() {
  return (
    <section className="py-24 md:py-36" style={{ background: "#1E1D1D" }}>
      <div className="container">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px" style={{ background: "rgba(234,234,223,0.2)" }} />
              <span
                className="text-[10px] tracking-[0.2em] uppercase font-medium"
                style={{ color: "rgba(234,234,223,0.38)" }}
              >
                The System
              </span>
            </div>
            <h2
              className="font-display font-light leading-tight"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)", color: "#EAEADF", letterSpacing: "-0.01em" }}
            >
              Four products.
              <br />
              <em>One complete protocol.</em>
            </h2>
          </div>
          <Link href="/system">
            <button
              className="flex items-center gap-2.5 px-6 py-3 text-[11px] tracking-[0.16em] uppercase font-medium transition-opacity hover:opacity-70 self-start md:self-auto"
              style={{
                background: "transparent",
                color: "rgba(234,234,223,0.55)",
                border: "1px solid rgba(234,234,223,0.18)",
              }}
            >
              View the Full System <ArrowRight size={12} />
            </button>
          </Link>
        </div>

        {/* Product row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {PHASE1.map((product, i) => (
            <Link key={product.id} href={`/products/${product.slug}`} className="block group">
              {/* Step number */}
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-6 h-6 flex items-center justify-center text-[9px] font-semibold tracking-wider"
                  style={{ background: "rgba(234,234,223,0.07)", color: "rgba(234,234,223,0.4)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="h-px flex-1" style={{ background: "rgba(234,234,223,0.07)" }} />
              </div>

              {/* Image */}
              <div
                className="overflow-hidden mb-4"
                style={{ aspectRatio: "3/4", background: "rgba(234,234,223,0.03)" }}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain p-5 transition-transform duration-600 group-hover:scale-[1.04]"
                />
              </div>

              {/* Info */}
              <div>
                <div
                  className="font-display text-sm font-medium mb-1 leading-tight"
                  style={{ color: "#EAEADF" }}
                >
                  {product.name}
                </div>
                <div className="text-[11px] mb-2.5 leading-snug" style={{ color: "rgba(234,234,223,0.38)" }}>
                  {product.tagline}
                </div>
                <div
                  className="text-[10px] tracking-wider uppercase font-medium"
                  style={{ color: "rgba(107,122,62,0.8)" }}
                >
                  {product.pathway}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* AM/PM protocol strip — improved legibility */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROTOCOL_STEPS.map(({ label, icon: Icon, time, protocol, note }) => (
            <div
              key={time}
              className="p-6"
              style={{
                background: "rgba(234,234,223,0.05)",
                border: "1px solid rgba(234,234,223,0.1)",
              }}
            >
              {/* Label row */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(234,234,223,0.1)", border: "1px solid rgba(234,234,223,0.15)" }}
                >
                  <Icon size={14} color="rgba(234,234,223,0.7)" />
                </div>
                <div>
                  <div
                    className="text-[11px] font-semibold tracking-[0.18em] uppercase"
                    style={{ color: "#EAEADF" }}
                  >
                    {label}
                  </div>
                  <div
                    className="text-[10px] tracking-wider uppercase"
                    style={{ color: "rgba(107,122,62,0.75)" }}
                  >
                    {note}
                  </div>
                </div>
              </div>
              {/* Steps */}
              <p
                className="text-xs leading-relaxed font-mono"
                style={{ color: "rgba(234,234,223,0.5)", letterSpacing: "0.02em" }}
              >
                {protocol}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
