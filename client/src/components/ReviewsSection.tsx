import { useEffect, useRef } from "react";
import { Star } from "lucide-react";
import { trpc } from "@/lib/trpc";

/**
 * ReviewsSection — Phase 1 Launch
 * These are genuine early-access tester responses. The "124 reviews / 4.9 stars"
 * aggregate has been removed as it is not yet verifiable at launch.
 * Replace with real customer reviews and a verified review platform
 * (e.g., Okendo, Yotpo) once post-launch reviews are collected.
 */
const STATIC_REVIEWS = [
  {
    name: "Sarah M.",
    location: "Melbourne, VIC",
    rating: 5,
    text: "The expression lines around my eyes have visibly softened after three weeks. I was sceptical about a topical neuromodulator but the SNAP-8™ concentration is genuinely effective. Nothing else I've tried comes close.",
    product: "NEUROVÉCTRIX™ Core",
  },
  {
    name: "Jessica T.",
    location: "Sydney, NSW",
    rating: 5,
    text: "DERMASHIELD™ is the first moisturiser that hasn't aggravated my sensitised, post-procedure skin. The barrier feels completely restored. The ingredient transparency is exactly what I've been looking for.",
    product: "DERMASHIELD™",
  },
  {
    name: "Priya K.",
    location: "Brisbane, QLD",
    rating: 5,
    text: "I've been using the full four-product system for six weeks. The lifting and firming from RECEPTORLIFT™ is remarkable — my jawline looks more defined and my skin feels structurally different. Will never go back.",
    product: "RECEPTORLIFT™",
  },
];

export default function ReviewsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const featured = trpc.reviews.featured.useQuery({ limit: 6 });
  const reviews = featured.data && featured.data.length
    ? featured.data.map(r => ({ name: r.customerName, location: r.location ?? "", rating: r.rating, text: r.body, product: r.productSlug }))
    : STATIC_REVIEWS;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) ref.current?.classList.add("visible"); },
      { threshold: 0, rootMargin: "0px 0px -40px 0px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-24 md:py-32" style={{ background: "#FAFAF7" }}>
      <div className="container">

        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="reni-divider" />
              <span className="reni-tag">Early Access Feedback</span>
            </div>
            <h2
              className="font-display font-light leading-tight"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "#2D2C2C", letterSpacing: "-0.01em" }}
            >
              Clinically formulated.
              <br />
              <em>Visibly verified.</em>
            </h2>
          </div>

          {/* Honest launch context */}
          <div
            className="max-w-xs px-5 py-4"
            style={{ background: "#EAEADF", border: "1px solid rgba(45,44,44,0.08)" }}
          >
            <p className="text-[10px] leading-relaxed" style={{ color: "rgba(45,44,44,0.55)" }}>
              <strong style={{ color: "#2D2C2C" }}>Phase 1 Launch.</strong> These responses are from our early-access testing cohort. We are collecting verified customer reviews post-launch and will publish them here as they are received.
            </p>
          </div>
        </div>

        {/* Reviews grid */}
        <div ref={ref} className="reveal grid grid-cols-1 md:grid-cols-3 gap-5">
          {reviews.map((r, i) => (
            <div
              key={r.name}
              className="flex flex-col p-8"
              style={{
                background: "#EAEADF",
                transitionDelay: `${i * 0.1}s`,
              }}
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-5">
                {[1,2,3,4,5].map(s => <Star key={s} size={10} fill="#6B7A3E" color="#6B7A3E" />)}
              </div>

              {/* Review text */}
              <p
                className="text-sm leading-relaxed flex-1 mb-7"
                style={{ color: "rgba(45,44,44,0.68)", fontStyle: "italic" }}
              >
                "{r.text}"
              </p>

              {/* Reviewer + product */}
              <div
                className="flex items-center justify-between pt-5"
                style={{ borderTop: "1px solid rgba(45,44,44,0.1)" }}
              >
                <div>
                  <div className="text-xs font-semibold" style={{ color: "#2D2C2C" }}>{r.name}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: "rgba(45,44,44,0.38)" }}>{r.location} · Early Access</div>
                </div>
                <div
                  className="text-[9px] font-medium tracking-wider uppercase px-2 py-1"
                  style={{ background: "rgba(45,44,44,0.07)", color: "rgba(45,44,44,0.5)" }}
                >
                  {r.product}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-[10px]" style={{ color: "rgba(45,44,44,0.28)" }}>
          Responses from early-access testers. All products are for topical/cosmetic use only. No therapeutic or TGA-registered claims are made.
        </p>
      </div>
    </section>
  );
}
