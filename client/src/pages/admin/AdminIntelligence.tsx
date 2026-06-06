import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { useState, useRef, useEffect } from "react";
import {
  Sparkles, AlertTriangle, TrendingUp, Users, Package, Search as SearchIcon,
  MessageSquare, ShieldCheck, Send, RefreshCw, Activity, Filter,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const SEVERITY_STYLE: Record<string, string> = {
  critical: "border-red-500/40 bg-red-500/10 text-red-300",
  high: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  medium: "border-blue-500/40 bg-blue-500/10 text-blue-300",
  low: "border-white/10 bg-white/5 text-gray-300",
};

interface ChatMsg { role: "user" | "assistant"; content: string }

function Section({ title, icon: Icon, children, action }: { title: string; icon: any; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-[#1a1a1a] border border-white/8 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-[#C9A96E]" />
          <h2 className="text-sm font-semibold text-white">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function AdminIntelligence() {
  const [windowDays] = useState(30);
  const snapshot = trpc.analytics.snapshot.useQuery({ windowDays });
  const alerts = trpc.analytics.alerts.useQuery({ windowDays });
  const config = trpc.analytics.config.useQuery();
  const utils = trpc.useUtils();
  const setModule = trpc.analytics.setModuleEnabled.useMutation({
    onSuccess: () => utils.analytics.config.invalidate(),
  });
  const recompute = trpc.analytics.recomputeInsights.useMutation({
    onSuccess: () => { snapshot.refetch(); },
  });

  // ── Ask AI ────────────────────────────────────────────────────────────
  const ask = trpc.analytics.ask.useMutation();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, ask.isPending]);

  const send = () => {
    const q = input.trim();
    if (!q || ask.isPending) return;
    const history = messages.slice(-8);
    setMessages(m => [...m, { role: "user", content: q }]);
    setInput("");
    ask.mutate(
      { message: q, history, windowDays },
      {
        onSuccess: r => setMessages(m => [...m, { role: "assistant", content: r.reply }]),
        onError: () => setMessages(m => [...m, { role: "assistant", content: "The assistant is temporarily unavailable. Please try again." }]),
      },
    );
  };

  const SUGGESTED = [
    "What products are performing best?",
    "Where are customers dropping off?",
    "What is the biggest risk right now?",
    "What should I improve first?",
  ];

  const s = snapshot.data;
  const funnelData = s?.funnel?.stages.map(st => ({ step: st.step, visitors: st.visitors })) ?? [];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles size={20} className="text-[#C9A96E]" /> Reni Intelligence
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Private business analyst. Answers are grounded in live data, last {windowDays} days. The AI does not invent figures.
            </p>
          </div>
          <button
            onClick={() => recompute.mutate()}
            disabled={recompute.isPending}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={recompute.isPending ? "animate-spin" : ""} />
            {recompute.isPending ? "Recomputing..." : "Recompute ML insights"}
          </button>
        </div>

        {/* Ask AI */}
        <Section title="Ask AI" icon={MessageSquare}>
          <div ref={scrollRef} className="max-h-80 overflow-y-auto space-y-3 mb-3 pr-1">
            {messages.length === 0 && (
              <div className="text-center py-6">
                <p className="text-xs text-gray-500 mb-3">Ask anything about your business. Examples:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {SUGGESTED.map(q => (
                    <button key={q} onClick={() => setInput(q)} className="text-[11px] px-3 py-1.5 rounded-full bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-lg px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap ${m.role === "user" ? "bg-[#C9A96E] text-black" : "bg-[#222] text-gray-200 border border-white/8"}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {ask.isPending && (
              <div className="flex justify-start">
                <div className="bg-[#222] border border-white/8 rounded-lg px-3.5 py-2.5 text-[13px] text-gray-400">Analysing live data…</div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Ask about sales, products, funnel, stock, customers…"
              className="flex-1 bg-[#111] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A96E]/50"
            />
            <button onClick={send} disabled={ask.isPending || !input.trim()} className="px-4 rounded-lg bg-[#C9A96E] text-black disabled:opacity-40 hover:bg-[#b8955a] transition-colors">
              <Send size={15} />
            </button>
          </div>
        </Section>

        {/* Alerts */}
        <Section title="Proactive Alerts" icon={AlertTriangle} action={
          <span className="text-[11px] text-gray-500">{alerts.data?.length ?? 0} active</span>
        }>
          {alerts.isLoading ? (
            <p className="text-xs text-gray-500">Loading alerts…</p>
          ) : (alerts.data?.length ?? 0) === 0 ? (
            <div className="text-center py-6">
              <ShieldCheck size={22} className="text-green-400 mx-auto mb-2" />
              <p className="text-xs text-gray-400">No alerts. Nothing needs attention right now.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.data!.map(a => (
                <div key={a.id} className={`border rounded-lg p-3 ${SEVERITY_STYLE[a.severity]}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold">{a.title}</span>
                    <span className="text-[10px] uppercase tracking-wider font-bold opacity-70">{a.severity}</span>
                  </div>
                  <p className="text-[11px] opacity-90">{a.whatHappened}</p>
                  <p className="text-[11px] opacity-70 mt-1"><b>Why:</b> {a.whyItMatters}</p>
                  <p className="text-[11px] opacity-70"><b>Evidence:</b> {a.evidence}</p>
                  <p className="text-[11px] opacity-90 mt-1"><b>Do:</b> {a.recommendedAction}</p>
                </div>
              ))}
            </div>
          )}
        </Section>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Funnel */}
          <Section title="Conversion Funnel" icon={TrendingUp}>
            {funnelData.length && funnelData.some(d => d.visitors > 0) ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={funnelData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                    <XAxis type="number" stroke="#666" fontSize={11} />
                    <YAxis type="category" dataKey="step" stroke="#666" fontSize={10} width={90} />
                    <Tooltip contentStyle={{ background: "#111", border: "1px solid #ffffff20", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="visitors" radius={[0, 4, 4, 0]}>
                      {funnelData.map((_, i) => <Cell key={i} fill="#C9A96E" />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                {s?.funnel && (
                  <p className="text-[11px] text-gray-500 mt-2">
                    Overall view→purchase: <b className="text-gray-300">{s.funnel.rates.overall}%</b> · cart abandonment: <b className="text-gray-300">{s.cart.abandonmentRate}%</b>
                  </p>
                )}
              </>
            ) : (
              <p className="text-xs text-gray-500 py-6 text-center">No funnel data yet. Funnel populates once visitors browse with analytics consent.</p>
            )}
          </Section>

          {/* Customer segments */}
          <Section title="Customer Segments & Churn" icon={Users}>
            {(s?.segmentation.totalCustomers ?? 0) > 0 ? (
              <>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2.5 text-center">
                    <div className="text-lg font-bold text-green-400">{s!.churn.distribution.low}</div>
                    <div className="text-[10px] text-gray-500">Low risk</div>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 text-center">
                    <div className="text-lg font-bold text-amber-400">{s!.churn.distribution.medium}</div>
                    <div className="text-[10px] text-gray-500">Medium</div>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2.5 text-center">
                    <div className="text-lg font-bold text-red-400">{s!.churn.distribution.high}</div>
                    <div className="text-[10px] text-gray-500">High risk</div>
                  </div>
                </div>
                <div className="space-y-1">
                  {s!.segmentation.distribution.slice(0, 6).map(d => (
                    <div key={d.segment} className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-400">{d.segment}</span>
                      <span className="text-gray-300 font-medium">{d.count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-gray-500 py-6 text-center">No customer order data yet. Segments compute from paid orders.</p>
            )}
          </Section>

          {/* Stock warnings */}
          <Section title="Stock Warnings (Forecast)" icon={Package}>
            {s?.forecast.filter(f => f.reorderSuggested).length ? (
              <div className="space-y-2">
                {s.forecast.filter(f => f.reorderSuggested).slice(0, 6).map(f => (
                  <div key={f.productSlug} className="flex items-center justify-between text-[11px] border-b border-white/5 pb-1.5">
                    <span className="text-gray-300">{f.productSlug}</span>
                    <span className="text-gray-500">{f.daysOfCover}d cover · reorder <b className="text-[#C9A96E]">{f.reorderQty}</b></span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 py-6 text-center">No reorder warnings. Stock cover looks healthy (or no sales history yet).</p>
            )}
          </Section>

          {/* Search & support */}
          <Section title="Search & Support Trends" icon={SearchIcon}>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-1">Top searches</p>
                {s?.search.top.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {s.search.top.slice(0, 8).map(t => (
                      <span key={t.query} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-400">{t.query} ({t.total})</span>
                    ))}
                  </div>
                ) : <p className="text-[11px] text-gray-600">No search data yet.</p>}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-1">Support themes (90d)</p>
                {s?.support.themes.filter(t => t.frequency > 0).length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {s.support.themes.filter(t => t.frequency > 0).slice(0, 8).map(t => (
                      <span key={t.theme} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-400">{t.theme} ({t.frequency})</span>
                    ))}
                  </div>
                ) : <p className="text-[11px] text-gray-600">No support data yet.</p>}
              </div>
            </div>
          </Section>
        </div>

        {/* Data collection config */}
        <Section title="Data Collection Modules" icon={Filter} action={
          <span className="text-[11px] text-gray-500">Toggle collection without redeploying</span>
        }>
          <p className="text-[11px] text-gray-500 mb-3">
            Each module is consent-gated and classified. Disabling a module stops collection immediately. This is the configurable, modular core of the analytics layer.
          </p>
          <div className="grid md:grid-cols-2 gap-2">
            {config.data?.modules.map(m => (
              <div key={m.id} className="flex items-start justify-between gap-3 border border-white/8 rounded-lg p-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white">{m.label}</p>
                  <p className="text-[10px] text-gray-500 truncate">{m.description}</p>
                  <div className="flex gap-1.5 mt-1">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400">{m.classification}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400">consent: {m.consent}</span>
                    {m.automatedDecisioning && <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300">ADM</span>}
                  </div>
                </div>
                <button
                  onClick={() => setModule.mutate({ moduleId: m.id, enabled: !m.enabled })}
                  className="w-9 h-5 rounded-full flex items-center px-1 transition-colors flex-shrink-0 mt-0.5"
                  style={{ background: m.enabled ? "#6B7A3E" : "rgba(255,255,255,0.15)" }}
                  aria-pressed={m.enabled}
                  aria-label={`Toggle ${m.label}`}
                >
                  <div className="w-3 h-3 rounded-full bg-white transition-all" style={{ marginLeft: m.enabled ? "auto" : "0" }} />
                </button>
              </div>
            ))}
          </div>
        </Section>

        {/* Data availability / honesty footer */}
        {s && (
          <div className="flex items-center gap-2 text-[11px] text-gray-600">
            <Activity size={12} />
            <span>
              Data sources present:{" "}
              {Object.entries(s.dataAvailability).filter(([, v]) => v).map(([k]) => k).join(", ") || "none yet"}.
              Insights are computed from real records only.
            </span>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
