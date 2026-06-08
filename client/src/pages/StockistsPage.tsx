import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageErrorBoundary from "@/components/PageErrorBoundary";
import { useSEO } from "@/hooks/useSEO";
import { MapPin, Globe, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { STOCKISTS as STATIC_STOCKISTS, COMING_SOON_REGIONS, groupStockists } from "@/data/stockists";

export default function StockistsPage() {
  const dbStockists = trpc.content.stockistsList.useQuery();
  const STOCKISTS = dbStockists.data && dbStockists.data.length ? groupStockists(dbStockists.data) : STATIC_STOCKISTS;
  useSEO({
    title: "Stockists — Reni Cosmetics",
    description: "Find Reni Cosmetics at authorised stockists across Australia. Wholesale and retail enquiries welcome.",
    url: "/stockists",
  });

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [wholesaleForm, setWholesaleForm] = useState({ business: "", name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setWholesaleForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inputStyle = {
    background: "#EAEADF",
    color: "#2D2C2C",
    border: "1px solid rgba(45,44,44,0.15)",
    outline: "none",
    width: "100%",
    padding: "12px 14px",
    fontSize: "13px",
    fontFamily: "inherit",
  };

  return (
    <PageErrorBoundary>
      <div className="min-h-screen" style={{ background: "#FAFAF7" }}>
        <Navbar />

        {/* Header — split layout with map pin accent, distinct from all other support pages */}
        <div className="pt-28 pb-0" style={{ background: "#2D2C2C" }}>
          <div className="container pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <Globe size={14} color="rgba(234,234,223,0.5)" />
                  <span className="text-[10px] tracking-[0.2em] uppercase font-medium" style={{ color: "rgba(234,234,223,0.45)" }}>Stockists</span>
                </div>
                <h1 className="font-display font-light mb-3" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "#EAEADF", letterSpacing: "-0.01em" }}>
                  Find Reni Cosmetics.
                  <br />
                  <em>Expanding in 2026.</em>
                </h1>
                <p className="text-sm max-w-lg" style={{ color: "rgba(234,234,223,0.5)" }}>
                  Reni is currently available exclusively through our online flagship store and authorised wholesale partners. Retail expansion is underway across Australia in 2026.
                </p>
              </div>
              <div className="flex flex-col gap-2 pb-1">
                {["VIC — Available Now", "NSW / QLD — Q2 2026", "SA / WA — Q3 2026", "NZ / UK — Q4 2026"].map(line => (
                  <div key={line} className="flex items-center gap-2">
                    <MapPin size={10} color="rgba(234,234,223,0.3)" />
                    <span className="text-[10px] tracking-widest uppercase" style={{ color: "rgba(234,234,223,0.4)" }}>{line}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="container py-16">
          <div className="max-w-4xl mx-auto">

            {/* Current stockists */}
            <section className="mb-16">
              <h2 className="font-display text-2xl font-light mb-8" style={{ color: "#2D2C2C" }}>
                Authorised Stockists
              </h2>

              {STOCKISTS.map(({ region, stores }) => (
                <div key={region} className="mb-10">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="reni-divider" />
                    <span className="text-xs tracking-widest uppercase font-medium" style={{ color: "rgba(45,44,44,0.4)" }}>
                      {region}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stores.map(store => (
                      <div
                        key={store.name}
                        className="p-6 flex flex-col gap-3"
                        style={{ background: "#EAEADF" }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-semibold mb-1" style={{ color: "#2D2C2C" }}>{store.name}</h3>
                            <span className="text-xs px-2 py-0.5 font-medium" style={{ background: "rgba(107,122,62,0.12)", color: "#6B7A3E" }}>
                              {store.type}
                            </span>
                          </div>
                          {store.online
                            ? <Globe size={16} style={{ color: "rgba(45,44,44,0.3)" }} />
                            : <MapPin size={16} style={{ color: "rgba(45,44,44,0.3)" }} />
                          }
                        </div>
                        <p className="text-xs" style={{ color: "rgba(45,44,44,0.5)" }}>{store.location}</p>
                        {store.url !== "#" && (
                          <a
                            href={store.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs font-medium hover:opacity-70 transition-opacity mt-auto"
                            style={{ color: "#2D2C2C" }}
                          >
                            Visit Store <ArrowRight size={12} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>

            {/* Coming soon */}
            <section className="mb-16">
              <h2 className="font-display text-2xl font-light mb-6" style={{ color: "#2D2C2C" }}>
                Expanding to New Regions
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {COMING_SOON_REGIONS.map(({ region, eta }) => (
                  <div
                    key={region}
                    className="p-5 flex flex-col gap-2"
                    style={{ background: "#EAEADF", opacity: 0.7 }}
                  >
                    <p className="text-sm font-medium" style={{ color: "#2D2C2C" }}>{region}</p>
                    <p className="text-xs" style={{ color: "rgba(45,44,44,0.45)" }}>Expected {eta}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Wholesale enquiry */}
            <section>
              <div className="p-8 md:p-10" style={{ background: "#2D2C2C" }}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div>
                    <h2 className="font-display text-2xl font-light mb-3" style={{ color: "#EAEADF" }}>
                      Wholesale &amp; Retail Enquiries
                    </h2>
                    <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(234,234,223,0.5)" }}>
                      We partner with premium beauty retailers, spas, clinics, and concept stores that align with the Reni brand ethos. If you're interested in stocking Reni Cosmetics, please complete the form and our wholesale team will be in touch within 2 business days.
                    </p>
                    <div className="flex flex-col gap-3">
                      {[
                        "Minimum opening order applies",
                        "Trade pricing and margin support",
                        "In-store training and brand assets provided",
                        "Exclusive territory options available",
                      ].map(item => (
                        <div key={item} className="flex items-center gap-3">
                          <div className="w-1 h-1 rounded-full shrink-0" style={{ background: "#6B7A3E" }} />
                          <p className="text-xs" style={{ color: "rgba(234,234,223,0.5)" }}>{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    {submitted ? (
                      <div className="flex items-center justify-center h-full py-10">
                        <div className="text-center">
                          <div className="font-display text-3xl font-light mb-2" style={{ color: "#EAEADF" }}>
                            Thank you.
                          </div>
                          <p className="text-xs" style={{ color: "rgba(234,234,223,0.45)" }}>
                            Our wholesale team will be in touch within 2 business days.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <input
                          type="text"
                          name="business"
                          value={wholesaleForm.business}
                          onChange={handleChange}
                          placeholder="Business name *"
                          required
                          style={{ ...inputStyle, background: "rgba(234,234,223,0.08)", color: "#EAEADF", border: "1px solid rgba(234,234,223,0.15)" }}
                        />
                        <input
                          type="text"
                          name="name"
                          value={wholesaleForm.name}
                          onChange={handleChange}
                          placeholder="Your name *"
                          required
                          style={{ ...inputStyle, background: "rgba(234,234,223,0.08)", color: "#EAEADF", border: "1px solid rgba(234,234,223,0.15)" }}
                        />
                        <input
                          type="email"
                          name="email"
                          value={wholesaleForm.email}
                          onChange={handleChange}
                          placeholder="Email address *"
                          required
                          style={{ ...inputStyle, background: "rgba(234,234,223,0.08)", color: "#EAEADF", border: "1px solid rgba(234,234,223,0.15)" }}
                        />
                        <textarea
                          name="message"
                          value={wholesaleForm.message}
                          onChange={handleChange}
                          placeholder="Tell us about your store and the products you're interested in stocking."
                          rows={4}
                          style={{ ...inputStyle, background: "rgba(234,234,223,0.08)", color: "#EAEADF", border: "1px solid rgba(234,234,223,0.15)", resize: "vertical" as const }}
                        />
                        <button
                          type="submit"
                          className="flex items-center justify-center gap-3 px-8 py-3 text-xs tracking-widest uppercase font-medium transition-opacity hover:opacity-80"
                          style={{ background: "#EAEADF", color: "#2D2C2C" }}
                        >
                          Submit Enquiry <ArrowRight size={14} />
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>

        <Footer />
      </div>
    </PageErrorBoundary>
  );
}
