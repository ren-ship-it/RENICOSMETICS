import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Lock, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import PageErrorBoundary from "@/components/PageErrorBoundary";
import ImageSkeleton from "@/components/ImageSkeleton";
import { useCart } from "@/contexts/CartContext";
import { useSEO } from "@/hooks/useSEO";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { computeShipping } from "@shared/shipping";

const STATES = ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"];

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  phone: string;
  giftNote: string;
  newsletter: boolean;
}

const EMPTY_FORM: FormData = {
  email: "",
  firstName: "",
  lastName: "",
  address: "",
  suburb: "",
  state: "VIC",
  postcode: "",
  phone: "",
  giftNote: "",
  newsletter: false,
};

export default function CheckoutPage() {
  useSEO({
    title: "Checkout — Reni Cosmetics",
    description: "Secure checkout for Reni Cosmetics orders.",
    url: "/checkout",
    noindex: true,
  });

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const { items } = useCart();
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<"details" | "payment">("details");

  const totalNum = items.reduce((s, i) => s + i.priceNum * i.quantity, 0);
  const shipping = computeShipping(totalNum);
  const orderTotal = totalNum + shipping;

  const createSession = trpc.checkout.createSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.success("Redirecting to secure payment...");
        window.open(data.url, "_blank");
      }
      setProcessing(false);
    },
    onError: (err) => {
      console.error("Stripe session error:", err);
      toast.error("Payment could not be initiated. Please try again.");
      setProcessing(false);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.firstName || !form.lastName || !form.address || !form.suburb || !form.postcode) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setStep("payment");
    window.scrollTo(0, 0);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    createSession.mutate({
      items: items.map(item => ({
        name: item.name,
        priceAud: item.priceNum,
        quantity: item.quantity,
        productSlug: item.id,
      })),
      customerEmail: form.email,
      customerName: `${form.firstName} ${form.lastName}`,
      shippingAddress: {
        address: form.address,
        suburb: form.suburb,
        state: form.state,
        postcode: form.postcode,
        phone: form.phone || undefined,
      },
      giftNote: form.giftNote || undefined,
      acceptsMarketing: form.newsletter,
      origin: window.location.origin,
    });
  };

  const inputClass = "w-full text-sm p-3 outline-none transition-colors";
  const inputStyle = {
    background: "#FAFAF7",
    border: "1px solid rgba(45,44,44,0.18)",
    color: "#2D2C2C",
    fontFamily: "inherit",
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAF7" }}>
        <div className="text-center">
          <p className="font-display text-2xl mb-4" style={{ color: "#2D2C2C" }}>Your cart is empty.</p>
          <Link href="/shop" className="btn-reni-dark">Back to Shop</Link>
        </div>
      </div>
    );
  }

  return (
    <PageErrorBoundary pageName="Checkout">
      <div className="min-h-screen" style={{ background: "#FAFAF7" }}>
        <Navbar />

        <div className="container pt-28 pb-24">
          <div className="pt-6 pb-4 flex items-center gap-4 mb-8">
            <Link href="/cart" className="flex items-center gap-2 text-xs hover:opacity-60 transition-opacity" style={{ color: "rgba(45,44,44,0.45)" }}>
              <ArrowLeft size={12} />
              Back to Cart
            </Link>
            <div className="flex items-center gap-2 ml-auto">
              <Lock size={12} color="#6B7A3E" />
              <span className="text-xs" style={{ color: "rgba(45,44,44,0.45)" }}>Secure Checkout</span>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-10">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold"
                style={{ background: "#2D2C2C", color: "#EAEADF" }}
              >
                {step === "payment" ? "✓" : "1"}
              </div>
              <span className="text-xs font-medium" style={{ color: step === "details" ? "#2D2C2C" : "rgba(45,44,44,0.4)" }}>
                Delivery Details
              </span>
            </div>
            <div className="w-8 h-px" style={{ background: "rgba(45,44,44,0.2)" }} />
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold"
                style={{ background: step === "payment" ? "#2D2C2C" : "rgba(45,44,44,0.15)", color: step === "payment" ? "#EAEADF" : "rgba(45,44,44,0.4)" }}
              >
                2
              </div>
              <span className="text-xs font-medium" style={{ color: step === "payment" ? "#2D2C2C" : "rgba(45,44,44,0.4)" }}>
                Payment
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">

            {/* Left — Form */}
            <div className="lg:col-span-2">

              {step === "details" && (
                <form onSubmit={handleDetailsSubmit} className="space-y-5">
                  <h2 className="font-display text-xl font-light mb-6" style={{ color: "#2D2C2C" }}>
                    Delivery Details
                  </h2>

                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(45,44,44,0.6)" }}>
                      Email Address <span style={{ color: "#6B7A3E" }}>*</span>
                    </label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} required
                      placeholder="your@email.com" className={inputClass} style={inputStyle} />
                    <div className="flex items-center gap-2 mt-2">
                      <input type="checkbox" id="newsletter" name="newsletter" checked={form.newsletter} onChange={handleChange}
                        className="w-3.5 h-3.5" />
                      <label htmlFor="newsletter" className="text-xs" style={{ color: "rgba(45,44,44,0.5)" }}>
                        Subscribe to Reni updates and early access offers
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(45,44,44,0.6)" }}>
                        First Name <span style={{ color: "#6B7A3E" }}>*</span>
                      </label>
                      <input type="text" name="firstName" value={form.firstName} onChange={handleChange} required
                        placeholder="First name" className={inputClass} style={inputStyle} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(45,44,44,0.6)" }}>
                        Last Name <span style={{ color: "#6B7A3E" }}>*</span>
                      </label>
                      <input type="text" name="lastName" value={form.lastName} onChange={handleChange} required
                        placeholder="Last name" className={inputClass} style={inputStyle} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(45,44,44,0.6)" }}>
                      Street Address <span style={{ color: "#6B7A3E" }}>*</span>
                    </label>
                    <input type="text" name="address" value={form.address} onChange={handleChange} required
                      placeholder="Street address" className={inputClass} style={inputStyle} />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(45,44,44,0.6)" }}>
                        Suburb <span style={{ color: "#6B7A3E" }}>*</span>
                      </label>
                      <input type="text" name="suburb" value={form.suburb} onChange={handleChange} required
                        placeholder="Suburb" className={inputClass} style={inputStyle} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(45,44,44,0.6)" }}>
                        Postcode <span style={{ color: "#6B7A3E" }}>*</span>
                      </label>
                      <input type="text" name="postcode" value={form.postcode} onChange={handleChange} required
                        placeholder="3000" maxLength={4} className={inputClass} style={inputStyle} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(45,44,44,0.6)" }}>
                        State <span style={{ color: "#6B7A3E" }}>*</span>
                      </label>
                      <select name="state" value={form.state} onChange={handleChange}
                        className={inputClass} style={{ ...inputStyle, appearance: "none" as const }}>
                        {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(45,44,44,0.6)" }}>
                        Phone (optional)
                      </label>
                      <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                        placeholder="04xx xxx xxx" className={inputClass} style={inputStyle} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(45,44,44,0.6)" }}>
                      Gift Note (optional)
                    </label>
                    <textarea name="giftNote" value={form.giftNote} onChange={handleChange}
                      placeholder="Add a personal message for the recipient..." rows={3}
                      className={`${inputClass} resize-none`} style={inputStyle} />
                  </div>

                  <div
                    className="p-4 text-xs leading-relaxed"
                    style={{ background: "#EAEADF", color: "rgba(45,44,44,0.6)" }}
                  >
                    We ship to Australian addresses only. Orders are dispatched within 1 business day. By placing an order, you agree to our{" "}
                    <Link href="/terms" className="underline hover:opacity-70 transition-opacity" style={{ color: "#2D2C2C" }}>Terms & Conditions</Link>.
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-4 text-xs font-medium tracking-widest uppercase transition-opacity hover:opacity-80"
                    style={{ background: "#2D2C2C", color: "#EAEADF" }}
                  >
                    Continue to Payment <ArrowRight size={13} />
                  </button>
                </form>
              )}

              {step === "payment" && (
                <form onSubmit={handlePayment} className="space-y-5">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-xl font-light" style={{ color: "#2D2C2C" }}>
                      Payment
                    </h2>
                    <button
                      type="button"
                      onClick={() => setStep("details")}
                      className="text-xs hover:opacity-60 transition-opacity"
                      style={{ color: "rgba(45,44,44,0.45)" }}
                    >
                      ← Edit details
                    </button>
                  </div>

                  {/* Delivery summary */}
                  <div className="p-4 text-xs" style={{ background: "#EAEADF" }}>
                    <p className="font-medium mb-1" style={{ color: "#2D2C2C" }}>Delivering to:</p>
                    <p style={{ color: "rgba(45,44,44,0.6)" }}>
                      {form.firstName} {form.lastName} · {form.address}, {form.suburb} {form.state} {form.postcode}
                    </p>
                    <p style={{ color: "rgba(45,44,44,0.6)" }}>{form.email}</p>
                  </div>

                  {/* Security badges row */}
                  <div className="flex flex-wrap items-center gap-3 py-3" style={{ borderTop: "1px solid rgba(45,44,44,0.08)", borderBottom: "1px solid rgba(45,44,44,0.08)" }}>
                    <div className="flex items-center gap-1.5">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6B7A3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      <span className="text-[10px] font-medium" style={{ color: "rgba(45,44,44,0.55)" }}>SSL Encrypted</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6B7A3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      <span className="text-[10px] font-medium" style={{ color: "rgba(45,44,44,0.55)" }}>Secured by Stripe</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6B7A3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      <span className="text-[10px] font-medium" style={{ color: "rgba(45,44,44,0.55)" }}>30-Day Return Guarantee</span>
                    </div>
                  </div>

                  {/* Stripe Checkout info block */}
                  <div
                    className="p-6 text-center"
                    style={{ background: "rgba(107,122,62,0.05)", border: "1px solid rgba(107,122,62,0.2)" }}
                  >
                    <Lock size={20} color="#6B7A3E" className="mx-auto mb-3" />
                    <p className="text-sm font-medium mb-1" style={{ color: "#2D2C2C" }}>You'll be redirected to Stripe</p>
                    <p className="text-xs leading-relaxed" style={{ color: "rgba(45,44,44,0.55)" }}>
                      Clicking "Place Order" opens Stripe's secure hosted checkout in a new tab. Your card details are processed directly by Stripe and never touch our servers.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      {["Visa", "Mastercard", "Amex", "Apple Pay", "Google Pay"].map(m => (
                        <span key={m} className="text-[9px] font-semibold px-2 py-1"
                          style={{ background: "rgba(45,44,44,0.06)", color: "rgba(45,44,44,0.5)", border: "1px solid rgba(45,44,44,0.1)" }}>
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full flex items-center justify-center gap-2 py-4 text-xs font-medium tracking-widest uppercase transition-opacity hover:opacity-80 disabled:opacity-50"
                    style={{ background: "#2D2C2C", color: "#EAEADF" }}
                  >
                    {processing ? (
                      <><Loader2 size={14} className="animate-spin" /> Preparing Checkout…</>
                    ) : (
                      <><Lock size={13} /> Place Order — ${orderTotal.toFixed(2)} AUD</>
                    )}
                  </button>

                  <p className="text-[10px] text-center" style={{ color: "rgba(45,44,44,0.35)" }}>
                    Your payment is processed securely by Stripe. We never store your card details. GST included.
                  </p>
                </form>
              )}
            </div>

            {/* Right — Order summary */}
            <div className="lg:col-span-1">
              <div className="p-5" style={{ background: "#EAEADF", position: "sticky", top: "100px" }}>
                <h3 className="font-display text-base font-medium mb-4" style={{ color: "#2D2C2C" }}>
                  Order Summary
                </h3>
                <div className="space-y-3 mb-4">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <ImageSkeleton
                          src={item.image}
                          alt={item.name}
                          containerStyle={{ width: 52, height: 52, background: "#F2F2EC" }}
                          objectFit="contain"
                          padding="0.25rem"
                        />
                        <span
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                          style={{ background: "#2D2C2C", color: "#EAEADF" }}
                        >
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate" style={{ color: "#2D2C2C" }}>{item.name}</p>
                        <p className="text-[10px]" style={{ color: "rgba(45,44,44,0.45)" }}>{item.size}</p>
                      </div>
                      <span className="text-xs font-medium flex-shrink-0" style={{ color: "#2D2C2C" }}>
                        ${(item.priceNum * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 space-y-2" style={{ borderColor: "rgba(45,44,44,0.12)" }}>
                  <div className="flex justify-between text-xs" style={{ color: "rgba(45,44,44,0.6)" }}>
                    <span>Subtotal</span>
                    <span>${totalNum.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs" style={{ color: "rgba(45,44,44,0.6)" }}>
                    <span>Shipping</span>
                    <span style={{ color: shipping === 0 ? "#6B7A3E" : "#2D2C2C" }}>
                      {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs" style={{ color: "rgba(45,44,44,0.6)" }}>
                    <span>GST (incl. 10%)</span>
                    <span>${(orderTotal / 11).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold pt-1 border-t" style={{ borderColor: "rgba(45,44,44,0.12)", color: "#2D2C2C" }}>
                    <span>Total</span>
                    <div className="text-right">
                      <div>${orderTotal.toFixed(2)} AUD</div>
                      <div className="text-[10px] font-normal" style={{ color: "rgba(45,44,44,0.45)" }}>GST included</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </PageErrorBoundary>
  );
}
