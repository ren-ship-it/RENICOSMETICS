import { useEffect, useRef } from "react";

const stats = [
  { value: "6", unit: "SKUs", label: "Focused Launch Range" },
  { value: "4", unit: "Pathways", label: "Phase 1 Protocol" },
  { value: "10%", unit: "SNAP-8™", label: "Highest Concentration" },
  { value: "pH 5.0", unit: "± 0.3", label: "Clinically Calibrated" },
  { value: "0", unit: "Fragrance", label: "Sensitivity-Safe" },
];

export default function StatsBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) barRef.current?.classList.add("visible");
      },
      { threshold: 0, rootMargin: "0px 0px -40px 0px" }
    );
    if (barRef.current) observer.observe(barRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={barRef}
      className="reveal bg-obsidian-mid border-y border-gold-dim py-10"
    >
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="flex flex-col items-start border-l border-gold-dim pl-6"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="font-display text-gold text-3xl font-semibold leading-none">
                  {stat.value}
                </span>
                <span className="font-mono-reni text-gold/50 text-xs tracking-wider">
                  {stat.unit}
                </span>
              </div>
              <span className="text-alabaster/30 text-xs font-light tracking-wide">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
