import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageErrorBoundary from "@/components/PageErrorBoundary";
import { useSEO } from "@/hooks/useSEO";
import { Mail, Clock, MapPin, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const CONTACT_TOPICS = [
  "Product Question",
  "Order Enquiry",
  "Return or Exchange",
  "Stockist / Wholesale",
  "Press & Media",
  "General Enquiry",
];

export default function ContactPage() {
  useSEO({
    title: "Contact Us — Reni Cosmetics",
    description: "Get in touch with the Reni Cosmetics team. We respond to all enquiries within 1 business day.",
    url: "/contact",
  });

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState({ name: "", email: "", topic: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const saveMessage = trpc.messages.save.useMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSending(true);
    try {
      // Saved server-side (DB record + owner notification via tRPC).
      await saveMessage.mutateAsync({
        name: form.name,
        email: form.email,
        subject: form.topic || "General Enquiry",
        message: form.message,
      });
      setSubmitted(true);
      toast.success("Message received. We'll be in touch within 1 business day.");
    } catch (_) {
      toast.error("Something went wrong sending your message. Please email hello@renicosmetics.com.au.");
    } finally {
      setSending(false);
    }
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

        {/* Header */}
        <div className="pt-28 pb-12" style={{ background: "#FFFFFF", borderBottom: "3px solid #2D2C2C" }}>
          <div className="container">
            <div className="flex items-center gap-3 mb-5">
              <Mail size={14} color="rgba(45,44,44,0.4)" />
              <span className="text-[10px] tracking-[0.2em] uppercase font-medium" style={{ color: "rgba(45,44,44,0.45)" }}>Contact Us</span>
            </div>
            <h1 className="font-display font-light mb-3" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "#2D2C2C", letterSpacing: "-0.01em" }}>
              We're Here to Help.
              <br />
              <em>Let's talk.</em>
            </h1>
            <p className="text-sm max-w-lg" style={{ color: "rgba(45,44,44,0.5)" }}>
              We respond to all enquiries within 1 business day. For urgent order issues, please include your order number.
            </p>
          </div>
        </div>

        <div className="container py-16">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Contact info panel */}
            <div className="lg:col-span-1 flex flex-col gap-8">
              <div>
                <h2 className="font-display text-xl font-light mb-5" style={{ color: "#2D2C2C" }}>
                  Get in touch
                </h2>
                <div className="flex flex-col gap-5">
                  <div className="flex gap-4">
                    <Mail size={16} className="shrink-0 mt-0.5" style={{ color: "#6B7A3E" }} />
                    <div>
                      <p className="text-xs font-medium mb-0.5" style={{ color: "#2D2C2C" }}>Email</p>
                      <a href="mailto:hello@renicosmetics.com.au" className="text-xs hover:opacity-70 transition-opacity" style={{ color: "rgba(45,44,44,0.55)" }}>
                        hello@renicosmetics.com.au
                      </a>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Clock size={16} className="shrink-0 mt-0.5" style={{ color: "#6B7A3E" }} />
                    <div>
                      <p className="text-xs font-medium mb-0.5" style={{ color: "#2D2C2C" }}>Response Time</p>
                      <p className="text-xs" style={{ color: "rgba(45,44,44,0.55)" }}>Within 1 business day<br />Monday–Friday, 9 am–5 pm AEST</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <MapPin size={16} className="shrink-0 mt-0.5" style={{ color: "#6B7A3E" }} />
                    <div>
                      <p className="text-xs font-medium mb-0.5" style={{ color: "#2D2C2C" }}>Warehouse</p>
                      <p className="text-xs" style={{ color: "rgba(45,44,44,0.55)" }}>Epping, VIC 3076<br />Australia</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full h-px" style={{ background: "rgba(45,44,44,0.1)" }} />

              <div>
                <p className="text-xs tracking-widest uppercase font-medium mb-4" style={{ color: "rgba(45,44,44,0.4)" }}>
                  Quick Help
                </p>
                <div className="flex flex-col gap-3">
                  {[
                    { label: "Shipping & Returns", href: "/shipping" },
                    { label: "FAQ", href: "/faq" },
                    { label: "Find Your Protocol", href: "/quiz" },
                    { label: "Stockists", href: "/stockists" },
                  ].map(({ label, href }) => (
                    <a key={label} href={href} className="flex items-center gap-2 text-xs hover:opacity-70 transition-opacity" style={{ color: "rgba(45,44,44,0.6)" }}>
                      <ArrowRight size={12} />
                      {label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Response time guarantee */}
              <div className="p-4" style={{ background: "#EAEADF" }}>
                <p className="text-xs font-semibold mb-1" style={{ color: "#2D2C2C" }}>Our commitment</p>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(45,44,44,0.6)" }}>
                  Every enquiry is read and responded to personally. We do not use automated responses for customer queries.
                </p>
              </div>
            </div>

            {/* Contact form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="p-10 text-center" style={{ background: "#EAEADF" }}>
                  <div className="font-display text-4xl font-light mb-3" style={{ color: "#2D2C2C" }}>
                    Thank you.
                  </div>
                  <p className="text-sm mb-6" style={{ color: "rgba(45,44,44,0.55)" }}>
                    Your message has been received. We'll respond to <strong>{form.email}</strong> within 1 business day.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", topic: "", message: "" }); }}
                    className="text-xs tracking-widest uppercase font-medium hover:opacity-70 transition-opacity"
                    style={{ color: "#2D2C2C" }}
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-medium mb-2" style={{ color: "rgba(45,44,44,0.6)" }}>
                        Full Name <span style={{ color: "#6B7A3E" }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        required
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-2" style={{ color: "rgba(45,44,44,0.6)" }}>
                        Email Address <span style={{ color: "#6B7A3E" }}>*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        required
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: "rgba(45,44,44,0.6)" }}>
                      Topic
                    </label>
                    <select
                      name="topic"
                      value={form.topic}
                      onChange={handleChange}
                      style={{ ...inputStyle, appearance: "none" as const }}
                    >
                      <option value="">Select a topic</option>
                      {CONTACT_TOPICS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: "rgba(45,44,44,0.6)" }}>
                      Message <span style={{ color: "#6B7A3E" }}>*</span>
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Describe your enquiry in detail. If this is an order issue, please include your order number."
                      required
                      rows={6}
                      style={{ ...inputStyle, resize: "vertical" as const }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs" style={{ color: "rgba(45,44,44,0.35)" }}>
                      * Required fields. By submitting, you agree to our{" "}
                      <a href="/privacy" className="underline hover:opacity-70 transition-opacity">Privacy Policy</a>.
                    </p>
                    <button
                      type="submit"
                      disabled={sending}
                      className="flex items-center gap-3 px-8 py-3 text-xs tracking-widest uppercase font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
                      style={{ background: "#2D2C2C", color: "#EAEADF" }}
                    >
                      {sending ? (
                        <><Loader2 size={14} className="animate-spin" /> Sending…</>
                      ) : (
                        <>Send Message <ArrowRight size={14} /></>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>

        <Footer />
      </div>
    </PageErrorBoundary>
  );
}
