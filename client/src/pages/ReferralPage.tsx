import { useState, useEffect } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageErrorBoundary from "@/components/PageErrorBoundary";
import { useSEO } from "@/hooks/useSEO";
import { ArrowRight, Gift, Users, Star } from "lucide-react";
import { toast } from "sonner";

export default function ReferralPage() {
  useSEO({
    title: "Refer a Friend — Reni Cosmetics",
    description: "Share Reni Cosmetics with a friend and both of you receive $20 off your next order. No limits on referrals.",
    url: "/referral",
  });

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // Referral integration point — connect to your referral platform (e.g. ReferralCandy, Yotpo Loyalty)
    setSubmitted(true);
    toast.success("Your referral link has been sent to your inbox.");
  };

  const HOW_IT_WORKS = [
    {
      icon: <Gift size={20} color="#6B7A3E" />,
      title: "Share your link",
      desc: "Enter your email to receive a unique referral link. Share it with anyone who might benefit from a clinical skincare protocol.",
    },
    {
      icon: <Users size={20} color="#6B7A3E" />,
      title: "Friend places an order",
      desc: "When your friend places their first order using your link, they automatically receive $20 off at checkout.",
    },
    {
      icon: <Star size={20} color="#6B7A3E" />,
      title: "You both benefit",
      desc: "Once their order is confirmed, $20 credit is added to your account. No limits — refer as many friends as you like.",
    },
  ];

  return (
    <PageErrorBoundary pageName="Referral Program">
      <div className="min-h-screen" style={{ background: "#FAFAF7" }}>
        <Navbar />

        {/* Header */}
        <div className="pt-28 pb-16" style={{ background: "#2D2C2C" }}>
          <div className="container max-w-3xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px" style={{ background: "rgba(234,234,223,0.25)" }} />
              <span className="text-[10px] tracking-[0.22em] uppercase font-medium" style={{ color: "rgba(234,234,223,0.4)" }}>
                Refer a Friend
              </span>
            </div>
            <h1
              className="font-display font-light mb-4"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "#EAEADF", letterSpacing: "-0.01em" }}
            >
              Share the Science.
              <br />
              <em>Both of you benefit.</em>
            </h1>
            <p className="text-sm max-w-lg" style={{ color: "rgba(234,234,223,0.5)" }}>
              Refer a friend to Reni Cosmetics and you both receive $20 off your next order. No limits on referrals.
            </p>
          </div>
        </div>

        <div className="container max-w-3xl py-16">

          {/* How it works */}
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-8">
              <div className="reni-divider" />
              <span className="reni-tag">How It Works</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {HOW_IT_WORKS.map((step, i) => (
                <div key={i} className="p-5" style={{ background: "#EAEADF" }}>
                  <div className="mb-3">{step.icon}</div>
                  <p className="text-sm font-semibold mb-2" style={{ color: "#2D2C2C" }}>{step.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(45,44,44,0.6)" }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Get your link */}
          <div className="p-8" style={{ background: "#FFFFFF", border: "1px solid rgba(45,44,44,0.1)" }}>
            <h2 className="font-display text-xl font-light mb-2" style={{ color: "#2D2C2C" }}>
              Get Your Referral Link
            </h2>
            <p className="text-xs mb-6" style={{ color: "rgba(45,44,44,0.5)" }}>
              Enter the email address associated with your Reni account. Your unique referral link will be sent immediately.
            </p>

            {submitted ? (
              <div className="text-center py-6">
                <p className="font-display text-2xl font-light mb-2" style={{ color: "#2D2C2C" }}>Check your inbox.</p>
                <p className="text-xs mb-4" style={{ color: "rgba(45,44,44,0.5)" }}>
                  Your referral link has been sent to <strong>{email}</strong>.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setEmail(""); }}
                  className="text-xs tracking-widest uppercase font-medium hover:opacity-70 transition-opacity"
                  style={{ color: "#2D2C2C" }}
                >
                  Use a different email
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 text-sm p-3 outline-none"
                  style={{
                    background: "#FAFAF7",
                    border: "1px solid rgba(45,44,44,0.18)",
                    color: "#2D2C2C",
                    fontFamily: "inherit",
                  }}
                />
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 text-xs tracking-widest uppercase font-medium transition-opacity hover:opacity-80"
                  style={{ background: "#2D2C2C", color: "#EAEADF", flexShrink: 0 }}
                >
                  Get Link <ArrowRight size={13} />
                </button>
              </form>
            )}
          </div>

          {/* Terms */}
          <div className="mt-8 p-5" style={{ background: "#EAEADF" }}>
            <p className="text-[10px] font-semibold mb-2" style={{ color: "#2D2C2C" }}>Referral Program Terms</p>
            <ul className="text-[10px] leading-relaxed space-y-1" style={{ color: "rgba(45,44,44,0.55)" }}>
              <li>$20 credit is applied to both accounts once the referred friend's first order is confirmed and dispatched.</li>
              <li>Referral credit cannot be combined with other promotional codes or applied to gift cards.</li>
              <li>Minimum order value of $150 AUD applies. Credit does not reduce the minimum order threshold.</li>
              <li>Credit expires 12 months from the date of issue.</li>
              <li>Reni Cosmetics reserves the right to modify or terminate this program at any time.</li>
              <li>Fraudulent referrals will result in account suspension and forfeiture of all credits.</li>
            </ul>
          </div>

          <div className="mt-8 flex gap-4">
            <Link href="/shop" className="flex items-center gap-2 text-xs tracking-widest uppercase font-medium hover:opacity-70 transition-opacity" style={{ color: "#2D2C2C" }}>
              Shop the Collection <ArrowRight size={12} />
            </Link>
          </div>

        </div>

        <Footer />
      </div>
    </PageErrorBoundary>
  );
}
