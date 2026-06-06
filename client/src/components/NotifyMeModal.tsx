import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";

interface Props {
  productName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function NotifyMeModal({ productName, isOpen, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Reset state when modal opens for a different product
  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      setEmail("");
      setError("");
    }
  }, [isOpen, productName]);

  const validate = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);

    // Send waitlist notification via EmailJS
    // Replace SERVICE_ID, TEMPLATE_ID, and PUBLIC_KEY with your EmailJS credentials
    // Template should include {{user_email}}, {{product_name}}, and {{signup_date}} variables
    try {
      const emailjs = await import("@emailjs/browser");
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID ?? "YOUR_SERVICE_ID",
        import.meta.env.VITE_EMAILJS_WAITLIST_TEMPLATE_ID ?? "YOUR_WAITLIST_TEMPLATE_ID",
        {
          user_email: email,
          product_name: productName,
          signup_date: new Date().toLocaleDateString("en-AU"),
          to_email: "hello@renicosmetics.com.au",
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY ?? "YOUR_PUBLIC_KEY"
      );
    } catch (err) {
      console.warn("EmailJS waitlist send failed:", err);
    }

    // Always store locally as a fallback
    try {
      const existing = JSON.parse(localStorage.getItem("reni_waitlist") ?? "[]");
      existing.push({ email, product: productName, date: new Date().toISOString() });
      localStorage.setItem("reni_waitlist", JSON.stringify(existing));
    } catch { /* ignore */ }

    setLoading(false);
    setSubmitted(true);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center"
      style={{ background: "rgba(28,28,30,0.75)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-md"
        style={{ background: "#FAFAF7" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 hover:opacity-60 transition-opacity"
          aria-label="Close"
        >
          <X size={16} color="rgba(45,44,44,0.6)" />
        </button>

        <div className="p-8 sm:p-10">
          {!submitted ? (
            <>
              {/* Header */}
              <div className="mb-6">
                <span
                  className="text-[9px] tracking-widest uppercase font-medium px-2 py-1 inline-block mb-4"
                  style={{ background: "#EAEADF", color: "#6B7A3E" }}
                >
                  Phase 2 · Coming Soon
                </span>
                <h3
                  className="font-display text-2xl font-light mb-2"
                  style={{ color: "#2D2C2C" }}
                >
                  Be first to know.
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(45,44,44,0.55)" }}>
                  <strong style={{ color: "#2D2C2C" }}>{productName}</strong> is launching in Phase 2.
                  Join the waitlist and we'll notify you the moment it's available — with early access pricing.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(""); }}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 text-sm outline-none transition-all"
                    style={{
                      background: "#EAEADF",
                      color: "#2D2C2C",
                      border: error ? "1px solid #C0392B" : "1px solid transparent",
                    }}
                    autoFocus
                  />
                  {error && (
                    <p className="text-xs mt-1.5" style={{ color: "#C0392B" }}>{error}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 text-xs font-medium tracking-widest uppercase transition-all duration-200"
                  style={{
                    background: loading ? "rgba(45,44,44,0.5)" : "#2D2C2C",
                    color: "#EAEADF",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Joining Waitlist…" : "Notify Me"}
                </button>
              </form>

              <p className="text-[10px] text-center mt-4" style={{ color: "rgba(45,44,44,0.35)" }}>
                No spam. One email when it launches. Unsubscribe anytime.
              </p>
            </>
          ) : (
            /* Success state */
            <div className="text-center py-4">
              <div
                className="w-12 h-12 flex items-center justify-center mx-auto mb-6"
                style={{ background: "#EAEADF" }}
              >
                <Check size={20} color="#6B7A3E" />
              </div>
              <h3 className="font-display text-2xl font-light mb-3" style={{ color: "#2D2C2C" }}>
                You're on the list.
              </h3>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(45,44,44,0.55)" }}>
                We'll email <strong style={{ color: "#2D2C2C" }}>{email}</strong> the moment{" "}
                <strong style={{ color: "#2D2C2C" }}>{productName}</strong> is available — with early access pricing.
              </p>
              <button
                onClick={onClose}
                className="btn-reni-outline w-full"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
