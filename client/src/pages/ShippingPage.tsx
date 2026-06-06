import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageErrorBoundary from "@/components/PageErrorBoundary";
import { useSEO } from "@/hooks/useSEO";
import { Truck, RefreshCw, Package, AlertCircle } from "lucide-react";

const SHIPPING_ZONES = [
  { zone: "Melbourne Metro", carrier: "Sendle / AusPost", time: "1–2 business days", cost: "From $9.95" },
  { zone: "Victoria Regional", carrier: "AusPost", time: "2–3 business days", cost: "From $9.95" },
  { zone: "NSW / QLD / SA / WA / TAS", carrier: "AusPost Express", time: "2–4 business days", cost: "From $14.95" },
  { zone: "NT / Remote Areas", carrier: "AusPost", time: "4–7 business days", cost: "From $19.95" },
];

export default function ShippingPage() {
  useSEO({
    title: "Shipping & Returns — Reni Cosmetics",
    description: "Free standard shipping on Australian orders over $80 AUD. 1-day dispatch from our Melbourne warehouse. 30-day return policy for unopened products.",
    url: "/shipping",
  });

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <PageErrorBoundary>
      <div className="min-h-screen" style={{ background: "#FAFAF7" }}>
        <Navbar />

        {/* Header — warm cream with left accent border for differentiation */}
        <div className="pt-28 pb-12" style={{ background: "#F2F2EC", borderBottom: "1px solid rgba(45,44,44,0.12)" }}>
          <div className="container">
            <div className="flex items-center gap-3 mb-5">
              <Truck size={14} color="rgba(45,44,44,0.4)" />
              <span className="text-[10px] tracking-[0.2em] uppercase font-medium" style={{ color: "rgba(45,44,44,0.45)" }}>Shipping & Returns</span>
            </div>
            <h1 className="font-display font-light mb-3" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "#2D2C2C", letterSpacing: "-0.01em" }}>
              Dispatched Within 1 Business Day. Reliable Delivery.
              <br />
              <em>Hassle-free returns.</em>
            </h1>
            <p className="text-sm max-w-lg" style={{ color: "rgba(45,44,44,0.5)" }}>
              We dispatch from our Melbourne warehouse within 1 business day. Free standard shipping on Australian orders over $80 AUD.
            </p>
          </div>
        </div>

        <div className="container py-16">
          <div className="max-w-4xl mx-auto">

            {/* Key shipping facts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {[
                { icon: <Truck size={20} />, title: "Free Shipping", body: "On all Australian orders over $80 AUD. Minimum order value $150 AUD." },
                { icon: <Package size={20} />, title: "1-Day Dispatch", body: "Orders placed before 12 pm AEST Monday–Friday are dispatched the same business day." },
                { icon: <RefreshCw size={20} />, title: "30-Day Returns", body: "Unopened, sealed products may be returned within 30 days of delivery for a full refund." },
              ].map(({ icon, title, body }) => (
                <div key={title} className="p-6" style={{ background: "#EAEADF" }}>
                  <div className="mb-3" style={{ color: "#6B7A3E" }}>{icon}</div>
                  <h3 className="font-display text-lg font-medium mb-2" style={{ color: "#2D2C2C" }}>{title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(45,44,44,0.6)" }}>{body}</p>
                </div>
              ))}
            </div>

            {/* Shipping zones table */}
            <section className="mb-14">
              <h2 className="font-display text-2xl font-light mb-6" style={{ color: "#2D2C2C" }}>
                Domestic Shipping Rates
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#2D2C2C" }}>
                      {["Zone", "Carrier", "Estimated Delivery", "Cost"].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-xs tracking-widest uppercase font-medium" style={{ color: "rgba(234,234,223,0.7)" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SHIPPING_ZONES.map((row, i) => (
                      <tr key={row.zone} style={{ background: i % 2 === 0 ? "#EAEADF" : "#F4F4EE" }}>
                        <td className="px-5 py-3 text-xs font-medium" style={{ color: "#2D2C2C" }}>{row.zone}</td>
                        <td className="px-5 py-3 text-xs" style={{ color: "rgba(45,44,44,0.65)" }}>{row.carrier}</td>
                        <td className="px-5 py-3 text-xs" style={{ color: "rgba(45,44,44,0.65)" }}>{row.time}</td>
                        <td className="px-5 py-3 text-xs font-medium" style={{ color: "#2D2C2C" }}>{row.cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs mt-3" style={{ color: "rgba(45,44,44,0.4)" }}>
                * Delivery estimates are indicative only and subject to carrier delays. Express options available at checkout.
              </p>
            </section>

            {/* International */}
            <section className="mb-14 p-6" style={{ background: "#2D2C2C" }}>
              <h2 className="font-display text-xl font-light mb-3" style={{ color: "#EAEADF" }}>
                International Shipping
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(234,234,223,0.55)" }}>
                Reni Cosmetics currently ships to Australia only. International shipping to New Zealand, the United Kingdom, and the United States is planned for Q3 2026. Join our waitlist to be notified when international delivery launches.
              </p>
            </section>

            {/* Returns policy */}
            <section className="mb-14">
              <h2 className="font-display text-2xl font-light mb-6" style={{ color: "#2D2C2C" }}>
                Returns Policy
              </h2>
              <div className="flex flex-col gap-5">
                {[
                  {
                    heading: "Eligible Returns",
                    body: "Unopened, sealed products in their original packaging may be returned within 30 days of the delivery date. Products must be unused and in a resalable condition.",
                  },
                  {
                    heading: "How to Initiate a Return",
                    body: "Email hello@renicosmetics.com.au with your order number and reason for return. Our team will issue a return authorisation and prepaid label within 2 business days.",
                  },
                  {
                    heading: "Refund Processing",
                    body: "Once your return is received and inspected, a full refund to your original payment method will be processed within 5–7 business days.",
                  },
                  {
                    heading: "Non-Returnable Items",
                    body: "Opened or used products, gift cards, and items purchased during final-sale promotions are not eligible for return. This does not affect your statutory rights under Australian Consumer Law.",
                  },
                  {
                    heading: "Damaged or Incorrect Orders",
                    body: "If your order arrives damaged or contains incorrect items, please contact us within 48 hours of delivery with photographic evidence. We will arrange a replacement or full refund at no cost to you.",
                  },
                ].map(({ heading, body }) => (
                  <div key={heading} className="py-5" style={{ borderBottom: "1px solid rgba(45,44,44,0.1)" }}>
                    <h3 className="text-sm font-semibold mb-2" style={{ color: "#2D2C2C" }}>{heading}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(45,44,44,0.6)" }}>{body}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ACL notice */}
            <div className="flex gap-4 p-5" style={{ background: "#EAEADF", border: "1px solid rgba(45,44,44,0.1)" }}>
              <AlertCircle size={18} className="shrink-0 mt-0.5" style={{ color: "#6B7A3E" }} />
              <p className="text-xs leading-relaxed" style={{ color: "rgba(45,44,44,0.65)" }}>
                Nothing in this policy limits or excludes your rights under the Australian Consumer Law. If a product has a major fault, you are entitled to a replacement, repair, or refund regardless of this policy.
              </p>
            </div>

          </div>
        </div>

        <Footer />
      </div>
    </PageErrorBoundary>
  );
}
