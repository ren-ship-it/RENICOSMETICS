import { useEffect } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageErrorBoundary from "@/components/PageErrorBoundary";
import { useSEO } from "@/hooks/useSEO";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function OrderConfirmationPage() {
  useSEO({
    title: "Order Confirmed — Reni Cosmetics",
    description: "Your Reni Cosmetics order has been placed successfully.",
    url: "/order-confirmation",
    noindex: true,
  });

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Generate a mock order number for display
  const orderNumber = `RC-${Date.now().toString().slice(-6)}`;

  return (
    <PageErrorBoundary pageName="Order Confirmation">
      <div className="min-h-screen" style={{ background: "#FAFAF7" }}>
        <Navbar />

        <div className="container pt-28 pb-24">
          <div className="max-w-2xl mx-auto text-center py-16">

            <CheckCircle size={48} color="#6B7A3E" className="mx-auto mb-6" />

            <h1
              className="font-display font-light mb-3"
              style={{ fontSize: "clamp(2rem, 5vw, 3rem)", color: "#2D2C2C", letterSpacing: "-0.01em" }}
            >
              Order Confirmed.
            </h1>
            <p className="text-sm mb-2" style={{ color: "rgba(45,44,44,0.55)" }}>
              Thank you for your order. A confirmation email has been sent to your inbox.
            </p>
            <p className="text-xs font-medium mb-10" style={{ color: "rgba(45,44,44,0.35)" }}>
              Order reference: <span style={{ color: "#2D2C2C" }}>{orderNumber}</span>
            </p>

            {/* What happens next */}
            <div className="text-left p-6 mb-10" style={{ background: "#EAEADF" }}>
              <h2 className="font-display text-base font-medium mb-4" style={{ color: "#2D2C2C" }}>
                What happens next
              </h2>
              <div className="space-y-4">
                {[
                  { step: "01", title: "Order Processing", desc: "Your order is being prepared. We'll dispatch within 1 business day." },
                  { step: "02", title: "Dispatch Confirmation", desc: "You'll receive a dispatch email with your tracking number." },
                  { step: "03", title: "Delivery", desc: "Standard delivery takes 2–5 business days to most Australian addresses." },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="flex items-start gap-4">
                    <span
                      className="font-display font-light flex-shrink-0"
                      style={{ fontSize: "1.2rem", color: "rgba(45,44,44,0.2)", lineHeight: 1 }}
                    >
                      {step}
                    </span>
                    <div>
                      <p className="text-xs font-semibold mb-0.5" style={{ color: "#2D2C2C" }}>{title}</p>
                      <p className="text-xs" style={{ color: "rgba(45,44,44,0.55)" }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Protocol start guide */}
            <div className="text-left p-6 mb-10" style={{ border: "1px solid rgba(45,44,44,0.1)" }}>
              <h2 className="font-display text-base font-medium mb-3" style={{ color: "#2D2C2C" }}>
                Start your protocol
              </h2>
              <p className="text-xs mb-4" style={{ color: "rgba(45,44,44,0.55)" }}>
                While you wait, read our layering guide to get the most from your Reni products from day one.
              </p>
              <Link
                href="/system"
                className="flex items-center gap-2 text-xs font-medium tracking-widest uppercase hover:opacity-70 transition-opacity"
                style={{ color: "#2D2C2C" }}
              >
                View The System <ArrowRight size={12} />
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/shop">
                <button className="btn-reni-dark flex items-center gap-2">
                  Continue Shopping <ArrowRight size={13} />
                </button>
              </Link>
              <Link href="/journal">
                <button className="btn-reni-outline">Read the Journal</button>
              </Link>
            </div>

          </div>
        </div>

        <Footer />
      </div>
    </PageErrorBoundary>
  );
}
