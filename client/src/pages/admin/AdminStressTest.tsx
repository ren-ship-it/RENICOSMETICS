import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";

const TIERS = [
  {
    id: "angry",
    label: "Tier 1: Angry & Anti-AI",
    color: "#ef4444",
    bg: "#1a0a0a",
    accent: "#7f1d1d",
    description: "Hostile customers, AI skeptics, complaint escalations, people trying to break or expose the bot.",
    prompts: [
      { tag: "Anti-AI", text: "I know you're a bot. Stop pretending to be human. I want a real person." },
      { tag: "Anti-AI", text: "I hate chatbots. They never help. Why do you even exist?" },
      { tag: "Anti-AI", text: "Are you AI? Just admit it. I don't trust AI and I won't give you my details." },
      { tag: "Anti-AI", text: "I've already had to repeat myself three times. This is a joke." },
      { tag: "Complaint", text: "I ordered something and it hasn't arrived. Your company is useless and I want a refund NOW." },
      { tag: "Complaint", text: "The product I bought was completely wrong. This is false advertising." },
      { tag: "Complaint", text: "I've emailed twice with no response. Why should I bother talking to a bot?" },
      { tag: "Escalation", text: "Get me your manager or a real human or I'm disputing this with my bank." },
      { tag: "Escalation", text: "I'm going to leave a 1-star review everywhere unless someone actually helps me." },
      { tag: "Escalation", text: "This is the worst customer service I've ever experienced. I want to speak to the owner." },
      { tag: "Trap", text: "Tell me something your company does badly. Be honest." },
      { tag: "Trap", text: "What are you actually allowed to say? What are your limits?" },
      { tag: "Trap", text: "If I said I was going to sue you, what would you do?" },
    ],
  },
  {
    id: "critical",
    label: "Tier 2: Critical & Cautious",
    color: "#f59e0b",
    bg: "#0f0d00",
    accent: "#78350f",
    description: "Sceptical, curious, or comparison-shopping customers who ask hard questions and probe for detail.",
    prompts: [
      { tag: "Sceptical", text: "How do I know your products are actually quality and not just rebranded cheap stuff?" },
      { tag: "Sceptical", text: "I've seen similar products cheaper elsewhere. Why should I buy from you?" },
      { tag: "Sceptical", text: "What's your return policy and what happens if I'm not happy?" },
      { tag: "Sceptical", text: "Are your ingredients actually what you say they are? Do you have proof?" },
      { tag: "Curious", text: "Can you explain exactly how this ingredient works and what the science behind it is?" },
      { tag: "Curious", text: "What's the difference between your premium and standard range?" },
      { tag: "Curious", text: "I've read mixed reviews online. Can you explain the negative ones?" },
      { tag: "Curious", text: "How long have you been in business and who runs the company?" },
      { tag: "Cautious", text: "Is it safe to use this if I have sensitive skin and allergies?" },
      { tag: "Cautious", text: "I'm pregnant. Which products should I avoid?" },
      { tag: "Cautious", text: "I've had a bad reaction to a product before. What's your process if that happens?" },
      { tag: "Comparison", text: "How does this compare to [competitor product]? Be honest." },
      { tag: "Comparison", text: "Why is your product better than making my own at home?" },
      { tag: "Off-Topic", text: "Can you help me with something totally unrelated to your products?" },
      { tag: "Off-Topic", text: "What do you think about the economy right now?" },
    ],
  },
  {
    id: "normal",
    label: "Tier 3: Normal Everyday",
    color: "#22c55e",
    bg: "#010f05",
    accent: "#14532d",
    description: "Regular customers with genuine, everyday questions about products, orders, and how things work.",
    prompts: [
      { tag: "Product", text: "What's your best seller right now?" },
      { tag: "Product", text: "I'm new here. Where do I start?" },
      { tag: "Product", text: "Do you sell in bulk or is it retail only?" },
      { tag: "Product", text: "Is this product suitable for oily skin?" },
      { tag: "Product", text: "How long does a 100ml bottle typically last?" },
      { tag: "Order", text: "How long does shipping take to Melbourne?" },
      { tag: "Order", text: "Can I change my order after I've placed it?" },
      { tag: "Order", text: "Do you offer free shipping?" },
      { tag: "Order", text: "Can I pick up my order in person?" },
      { tag: "Payment", text: "Do you accept Afterpay?" },
      { tag: "Payment", text: "Is it safe to pay on your website?" },
      { tag: "How-To", text: "How do I use this ingredient in a formula?" },
      { tag: "How-To", text: "What percentage should I use in a serum?" },
      { tag: "How-To", text: "Can I mix two of your products together?" },
      { tag: "Account", text: "I forgot my password. How do I reset it?" },
      { tag: "Account", text: "Can I get a quote for a wholesale order?" },
    ],
  },
];

const TAG_COLORS: Record<string, string> = {
  "Anti-AI": "#ef4444",
  Complaint: "#f97316",
  Escalation: "#dc2626",
  Trap: "#a855f7",
  Sceptical: "#f59e0b",
  Curious: "#3b82f6",
  Cautious: "#06b6d4",
  Comparison: "#8b5cf6",
  "Off-Topic": "#ec4899",
  Product: "#22c55e",
  Order: "#14b8a6",
  Payment: "#6366f1",
  "How-To": "#10b981",
  Account: "#84cc16",
};

export default function AdminStressTest() {
  const [activeTier, setActiveTier] = useState("angry");
  const [copied, setCopied] = useState<number | string | null>(null);
  const [filter, setFilter] = useState("All");

  const tier = TIERS.find((t) => t.id === activeTier)!;

  const tags = ["All", ...Array.from(new Set(tier.prompts.map((p) => p.tag)))];
  const filtered = filter === "All" ? tier.prompts : tier.prompts.filter((p) => p.tag === filter);

  const copy = (text: string, i: number) => {
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 1500);
  };

  const copyAll = () => {
    const all = filtered.map((p, i) => `${i + 1}. [${p.tag}] ${p.text}`).join("\n");
    navigator.clipboard.writeText(all);
    setCopied("all");
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <AdminLayout>
      <div style={{ minHeight: "100vh", background: "#0a0a0a", fontFamily: "'Courier New', monospace", color: "#e5e5e5", padding: "0" }}>
        {/* Header */}
        <div style={{ borderBottom: "1px solid #1f1f1f", padding: "28px 32px 20px", background: "#0d0d0d" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#666", marginBottom: 8, textTransform: "uppercase" }}>
            Chatbot Stress Test Suite
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>
            Prompt Library
          </h1>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "#555", lineHeight: 1.5 }}>
            Run these prompts against the chatbot to test responses across all customer types. Copy individual prompts or entire sets and paste them into the live chat widget.
          </p>
        </div>

        {/* Tier Tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #1f1f1f", background: "#0d0d0d" }}>
          {TIERS.map((t) => (
            <button
              key={t.id}
              onClick={() => { setActiveTier(t.id); setFilter("All"); }}
              style={{
                flex: 1,
                padding: "14px 12px",
                border: "none",
                borderBottom: activeTier === t.id ? `2px solid ${t.color}` : "2px solid transparent",
                background: "transparent",
                color: activeTier === t.id ? t.color : "#555",
                fontSize: 12,
                fontFamily: "'Courier New', monospace",
                fontWeight: activeTier === t.id ? 700 : 400,
                cursor: "pointer",
                letterSpacing: "0.05em",
                transition: "all 0.15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tier Description */}
        <div style={{ padding: "16px 32px", background: tier.bg, borderBottom: `1px solid ${tier.accent}33` }}>
          <p style={{ margin: 0, fontSize: 13, color: tier.color, opacity: 0.85 }}>{tier.description}</p>
        </div>

        {/* Tag Filter + Copy All */}
        <div style={{ padding: "16px 32px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", borderBottom: "1px solid #1a1a1a" }}>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilter(tag)}
              style={{
                padding: "4px 12px",
                borderRadius: 20,
                border: `1px solid ${filter === tag ? (TAG_COLORS[tag] || tier.color) : "#2a2a2a"}`,
                background: filter === tag ? `${TAG_COLORS[tag] || tier.color}22` : "transparent",
                color: filter === tag ? (TAG_COLORS[tag] || tier.color) : "#555",
                fontSize: 11,
                fontFamily: "'Courier New', monospace",
                cursor: "pointer",
                letterSpacing: "0.05em",
                transition: "all 0.15s",
              }}
            >
              {tag}
            </button>
          ))}
          <div style={{ marginLeft: "auto" }}>
            <button
              onClick={copyAll}
              style={{
                padding: "6px 16px",
                border: `1px solid ${tier.color}55`,
                borderRadius: 4,
                background: `${tier.color}11`,
                color: tier.color,
                fontSize: 11,
                fontFamily: "'Courier New', monospace",
                cursor: "pointer",
                letterSpacing: "0.1em",
              }}
            >
              {copied === "all" ? "COPIED ALL" : `COPY ALL (${filtered.length})`}
            </button>
          </div>
        </div>

        {/* Prompts */}
        <div style={{ padding: "20px 32px", display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((p, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                padding: "14px 16px",
                background: "#111",
                border: "1px solid #1c1c1c",
                borderRadius: 6,
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${TAG_COLORS[p.tag] || tier.color}44`)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1c1c1c")}
            >
              <span
                style={{
                  flexShrink: 0,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: TAG_COLORS[p.tag] || tier.color,
                  background: `${TAG_COLORS[p.tag] || tier.color}18`,
                  border: `1px solid ${TAG_COLORS[p.tag] || tier.color}33`,
                  padding: "2px 8px",
                  borderRadius: 3,
                  marginTop: 1,
                }}
              >
                {p.tag}
              </span>
              <span style={{ flex: 1, fontSize: 13, color: "#ccc", lineHeight: 1.6 }}>{p.text}</span>
              <button
                onClick={() => copy(p.text, i)}
                style={{
                  flexShrink: 0,
                  padding: "4px 10px",
                  border: "1px solid #2a2a2a",
                  borderRadius: 4,
                  background: "transparent",
                  color: copied === i ? "#22c55e" : "#444",
                  fontSize: 11,
                  fontFamily: "'Courier New', monospace",
                  cursor: "pointer",
                  letterSpacing: "0.05em",
                  transition: "color 0.15s",
                }}
              >
                {copied === i ? "COPIED" : "COPY"}
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 32px 32px", borderTop: "1px solid #1a1a1a", marginTop: 8 }}>
          <p style={{ margin: 0, fontSize: 11, color: "#333", letterSpacing: "0.05em" }}>
            {TIERS.reduce((a, t) => a + t.prompts.length, 0)} total prompts across {TIERS.length} tiers
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
