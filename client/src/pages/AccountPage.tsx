import { useEffect, useState } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageErrorBoundary from "@/components/PageErrorBoundary";
import { useSEO } from "@/hooks/useSEO";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { trpc } from "@/lib/trpc";
import { LogOut, Package, User, Mail, ShieldCheck, Loader2, CheckCircle2, Download, Trash2 } from "lucide-react";

const OBSIDIAN = "#2D2C2C";
const ALABASTER = "#FAFAF7";
const SAGE = "#6B7A3E";

const inputCls =
  "w-full px-3.5 py-2.5 text-sm bg-white border rounded-md focus:outline-none focus:ring-2 transition-shadow";
const inputStyle = { borderColor: "rgba(45,44,44,0.18)", color: OBSIDIAN } as const;

function Field({ label, children, htmlFor }: { label: string; children: React.ReactNode; htmlFor?: string }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-[11px] font-medium uppercase tracking-wider mb-1.5" style={{ color: "rgba(45,44,44,0.55)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function PrimaryButton({ children, disabled, type = "button", onClick }: { children: React.ReactNode; disabled?: boolean; type?: "button" | "submit"; onClick?: () => void }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="w-full px-5 py-3 text-[11px] tracking-widest uppercase font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
      style={{ background: OBSIDIAN, color: ALABASTER }}
    >
      {children}
    </button>
  );
}

// ── Auth (signed-out) ───────────────────────────────────────────────────────
function AuthPanel({ onAuthed }: { onAuthed: () => void }) {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [acceptsMarketing, setAcceptsMarketing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const login = trpc.customerAuth.login.useMutation();
  const signup = trpc.customerAuth.signup.useMutation();
  const forgot = trpc.customerAuth.requestPasswordReset.useMutation();
  const busy = login.isPending || signup.isPending || forgot.isPending;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (mode === "login") {
      login.mutate({ email, password }, { onSuccess: onAuthed, onError: err => setError(err.message) });
    } else if (mode === "signup") {
      signup.mutate(
        { email, password, firstName: firstName || undefined, acceptsMarketing },
        { onSuccess: onAuthed, onError: err => setError(err.message) },
      );
    } else {
      forgot.mutate(
        { email },
        {
          onSuccess: res => {
            setNotice("If an account exists for that email, a reset link is on its way.");
            // Dev convenience until transactional email is live.
            if (res.devToken) setNotice(`Reset link (dev): /reset-password?token=${res.devToken}`);
          },
          onError: () => setNotice("If an account exists for that email, a reset link is on its way."),
        },
      );
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="flex gap-1 mb-8 p-1 rounded-lg" style={{ background: "rgba(45,44,44,0.06)" }}>
        {(["login", "signup"] as const).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setError(null); setNotice(null); }}
            className="flex-1 py-2 text-[11px] tracking-widest uppercase font-semibold rounded-md transition-all"
            style={{ background: mode === m ? OBSIDIAN : "transparent", color: mode === m ? ALABASTER : "rgba(45,44,44,0.5)" }}
          >
            {m === "login" ? "Sign In" : "Create Account"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-4">
        {mode === "signup" && (
          <Field label="First name" htmlFor="firstName">
            <input id="firstName" className={inputCls} style={inputStyle} value={firstName} onChange={e => setFirstName(e.target.value)} autoComplete="given-name" />
          </Field>
        )}
        <Field label="Email" htmlFor="email">
          <input id="email" type="email" required className={inputCls} style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
        </Field>
        {mode !== "forgot" && (
          <Field label="Password" htmlFor="password">
            <input id="password" type="password" required minLength={8} className={inputCls} style={inputStyle} value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} />
            {mode === "signup" && <p className="text-[10px] mt-1" style={{ color: "rgba(45,44,44,0.4)" }}>At least 8 characters, with a letter and a number.</p>}
          </Field>
        )}
        {mode === "signup" && (
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input type="checkbox" checked={acceptsMarketing} onChange={e => setAcceptsMarketing(e.target.checked)} className="mt-0.5" style={{ accentColor: SAGE }} />
            <span className="text-[11px] leading-relaxed" style={{ color: "rgba(45,44,44,0.6)" }}>
              Email me skincare guidance and offers. You can unsubscribe anytime.
            </span>
          </label>
        )}

        {error && <p role="alert" className="text-xs" style={{ color: "#b3261e" }}>{error}</p>}
        {notice && <p className="text-xs break-words" style={{ color: SAGE }}>{notice}</p>}

        <PrimaryButton type="submit" disabled={busy}>
          {busy && <Loader2 size={13} className="animate-spin" />}
          {mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
        </PrimaryButton>
      </form>

      <div className="mt-5 text-center">
        {mode === "forgot" ? (
          <button onClick={() => { setMode("login"); setNotice(null); }} className="text-[11px] underline" style={{ color: "rgba(45,44,44,0.5)" }}>
            Back to sign in
          </button>
        ) : (
          <button onClick={() => { setMode("forgot"); setError(null); }} className="text-[11px] underline" style={{ color: "rgba(45,44,44,0.5)" }}>
            Forgot your password?
          </button>
        )}
      </div>
    </div>
  );
}

// ── Dashboard (signed-in) ───────────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
  pending: "#b58900", processing: "#268bd2", shipped: "#6c71c4",
  delivered: SAGE, cancelled: "#b3261e", refunded: "#888",
};

function OrderDetailModal({ id, onClose }: { id: number; onClose: () => void }) {
  const order = trpc.customerAuth.orderDetail.useQuery({ id });
  const o = order.data;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(28,28,30,0.6)" }} onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold" style={{ color: OBSIDIAN }}>{o ? o.orderNumber : "Order"}</h3>
          <button onClick={onClose} aria-label="Close" className="text-[rgba(45,44,44,0.5)] hover:opacity-70">✕</button>
        </div>
        {order.isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin" style={{ color: OBSIDIAN }} /></div>
        ) : !o ? (
          <p className="text-sm" style={{ color: "rgba(45,44,44,0.6)" }}>Order not found.</p>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px]" style={{ color: "rgba(45,44,44,0.45)" }}>{new Date(o.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: STATUS_COLOR[o.status] ?? "#888" }}>{o.status}</span>
            </div>
            <div className="space-y-2 mb-4">
              {o.items.map(it => (
                <div key={it.id} className="flex justify-between text-sm">
                  <span style={{ color: "rgba(45,44,44,0.75)" }}>{it.quantity}× {it.productName}</span>
                  <span style={{ color: OBSIDIAN }}>${Number(it.lineTotal).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 space-y-1 text-sm" style={{ borderColor: "rgba(45,44,44,0.1)" }}>
              <div className="flex justify-between" style={{ color: "rgba(45,44,44,0.6)" }}><span>Subtotal</span><span>${Number(o.subtotal).toFixed(2)}</span></div>
              <div className="flex justify-between" style={{ color: "rgba(45,44,44,0.6)" }}><span>Shipping</span><span>{Number(o.shippingCost) === 0 ? "Free" : `$${Number(o.shippingCost).toFixed(2)}`}</span></div>
              <div className="flex justify-between font-semibold" style={{ color: OBSIDIAN }}><span>Total</span><span>${Number(o.total).toFixed(2)} {o.currency}</span></div>
            </div>
            {o.trackingNumber && (
              <p className="text-[11px] mt-3" style={{ color: "rgba(45,44,44,0.55)" }}>
                Tracking: {o.trackingUrl ? <a href={o.trackingUrl} target="_blank" rel="noreferrer" className="underline">{o.trackingNumber}</a> : o.trackingNumber}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Dashboard({ onSignedOut }: { onSignedOut: () => void }) {
  const { customer } = useCustomerAuth();
  const utils = trpc.useUtils();
  const orders = trpc.customerAuth.myOrders.useQuery();
  const logout = trpc.customerAuth.logout.useMutation({ onSuccess: () => { utils.customerAuth.me.invalidate(); onSignedOut(); } });
  const updateProfile = trpc.customerAuth.updateProfile.useMutation({ onSuccess: () => utils.customerAuth.me.invalidate() });
  const updateConsent = trpc.customerAuth.updateMarketingConsent.useMutation({ onSuccess: () => utils.customerAuth.me.invalidate() });

  const [firstName, setFirstName] = useState(customer?.firstName ?? "");
  const [lastName, setLastName] = useState(customer?.lastName ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [saved, setSaved] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deletionDone, setDeletionDone] = useState(false);
  const [openOrderId, setOpenOrderId] = useState<number | null>(null);
  const deletion = trpc.customerAuth.requestAccountDeletion.useMutation();

  const exportData = async () => {
    setExporting(true);
    try {
      const data = await utils.customerAuth.exportMyData.fetch();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reni-cosmetics-my-data-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const requestDeletion = () => {
    if (deletionDone) return;
    if (!window.confirm("Request deletion of your account? We'll action this within 30 days. Order records are retained as required by law.")) return;
    deletion.mutate({}, { onSuccess: () => setDeletionDone(true) });
  };

  useEffect(() => {
    setFirstName(customer?.firstName ?? "");
    setLastName(customer?.lastName ?? "");
    setPhone(customer?.phone ?? "");
  }, [customer?.firstName, customer?.lastName, customer?.phone]);

  if (!customer) return null;

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    updateProfile.mutate(
      { firstName, lastName, phone },
      { onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2500); } },
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-[11px] tracking-widest uppercase" style={{ color: "rgba(45,44,44,0.4)" }}>Your account</p>
          <h2 className="font-display text-2xl" style={{ color: OBSIDIAN }}>
            {customer.firstName ? `Hello, ${customer.firstName}` : customer.email}
          </h2>
        </div>
        <button onClick={() => logout.mutate()} disabled={logout.isPending} className="flex items-center gap-2 text-[11px] tracking-widest uppercase font-medium hover:opacity-70 disabled:opacity-50" style={{ color: "rgba(45,44,44,0.6)" }}>
          <LogOut size={13} /> Sign Out
        </button>
      </div>

      {/* Profile */}
      <section>
        <div className="flex items-center gap-2 mb-4"><User size={15} style={{ color: SAGE }} /><h3 className="text-sm font-semibold" style={{ color: OBSIDIAN }}>Profile</h3></div>
        <form onSubmit={saveProfile} className="grid sm:grid-cols-2 gap-4">
          <Field label="First name"><input className={inputCls} style={inputStyle} value={firstName} onChange={e => setFirstName(e.target.value)} /></Field>
          <Field label="Last name"><input className={inputCls} style={inputStyle} value={lastName} onChange={e => setLastName(e.target.value)} /></Field>
          <Field label="Phone"><input className={inputCls} style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} /></Field>
          <Field label="Email"><input className={inputCls} style={{ ...inputStyle, opacity: 0.6 }} value={customer.email} disabled /></Field>
          <div className="sm:col-span-2 flex items-center gap-3">
            <button type="submit" disabled={updateProfile.isPending} className="px-6 py-2.5 text-[11px] tracking-widest uppercase font-semibold transition-opacity hover:opacity-90 disabled:opacity-50" style={{ background: OBSIDIAN, color: ALABASTER }}>
              {updateProfile.isPending ? "Saving..." : "Save Changes"}
            </button>
            {saved && <span className="flex items-center gap-1 text-xs" style={{ color: SAGE }}><CheckCircle2 size={13} /> Saved</span>}
          </div>
        </form>
      </section>

      {/* Orders */}
      <section>
        <div className="flex items-center gap-2 mb-4"><Package size={15} style={{ color: SAGE }} /><h3 className="text-sm font-semibold" style={{ color: OBSIDIAN }}>Order History</h3></div>
        {orders.isLoading ? (
          <p className="text-sm" style={{ color: "rgba(45,44,44,0.5)" }}>Loading orders…</p>
        ) : (orders.data?.length ?? 0) === 0 ? (
          <div className="text-center py-10 rounded-lg" style={{ background: "rgba(45,44,44,0.04)" }}>
            <p className="text-sm mb-3" style={{ color: "rgba(45,44,44,0.55)" }}>You have no orders yet.</p>
            <Link href="/shop"><span className="text-[11px] tracking-widest uppercase font-semibold underline cursor-pointer" style={{ color: OBSIDIAN }}>Browse the range</span></Link>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.data!.map(o => (
              <button key={o.id} onClick={() => setOpenOrderId(o.id)} className="w-full flex items-center justify-between p-4 rounded-lg border text-left transition-colors hover:bg-[rgba(45,44,44,0.03)]" style={{ borderColor: "rgba(45,44,44,0.1)" }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: OBSIDIAN }}>{o.orderNumber}</p>
                  <p className="text-[11px]" style={{ color: "rgba(45,44,44,0.45)" }}>{new Date(o.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium" style={{ color: OBSIDIAN }}>${Number(o.total).toFixed(2)}</p>
                  <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: STATUS_COLOR[o.status] ?? "#888" }}>{o.status}</span>
                </div>
              </button>
            ))}
          </div>
        )}
        {openOrderId !== null && <OrderDetailModal id={openOrderId} onClose={() => setOpenOrderId(null)} />}
      </section>

      {/* Communication preferences */}
      <section>
        <div className="flex items-center gap-2 mb-4"><Mail size={15} style={{ color: SAGE }} /><h3 className="text-sm font-semibold" style={{ color: OBSIDIAN }}>Communication Preferences</h3></div>
        <label className="flex items-center justify-between p-4 rounded-lg border cursor-pointer" style={{ borderColor: "rgba(45,44,44,0.1)" }}>
          <span className="text-sm" style={{ color: "rgba(45,44,44,0.7)" }}>Receive skincare guidance and offers by email</span>
          <input
            type="checkbox"
            checked={!!customer.acceptsMarketing}
            disabled={updateConsent.isPending}
            onChange={e => updateConsent.mutate({ acceptsMarketing: e.target.checked })}
            style={{ accentColor: SAGE, width: 18, height: 18 }}
          />
        </label>
        <p className="text-[10px] mt-2" style={{ color: "rgba(45,44,44,0.4)" }}>We honour your choice in line with the Spam Act 2003. You can change this anytime.</p>
      </section>

      {/* Data & privacy (DSAR) */}
      <section>
        <div className="flex items-center gap-2 mb-4"><ShieldCheck size={15} style={{ color: SAGE }} /><h3 className="text-sm font-semibold" style={{ color: OBSIDIAN }}>Your Data & Privacy</h3></div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={exportData} disabled={exporting} className="flex items-center justify-center gap-2 px-4 py-2.5 text-[11px] tracking-widest uppercase font-medium border rounded-md hover:opacity-80 disabled:opacity-50" style={{ borderColor: "rgba(45,44,44,0.2)", color: OBSIDIAN }}>
            <Download size={13} /> {exporting ? "Preparing…" : "Download my data"}
          </button>
          <button onClick={requestDeletion} disabled={deletion.isPending || deletionDone} className="flex items-center justify-center gap-2 px-4 py-2.5 text-[11px] tracking-widest uppercase font-medium border rounded-md hover:opacity-80 disabled:opacity-50" style={{ borderColor: "rgba(179,38,30,0.4)", color: "#b3261e" }}>
            <Trash2 size={13} /> {deletionDone ? "Request received" : "Request account deletion"}
          </button>
        </div>
        <p className="text-[10px] mt-2" style={{ color: "rgba(45,44,44,0.4)" }}>
          Access and deletion requests are handled per the{" "}
          <Link href="/privacy"><span className="underline cursor-pointer">Privacy Policy</span></Link> (APP 12/13). Order records are retained for 7 years to meet Australian tax law.
        </p>
      </section>
    </div>
  );
}

export default function AccountPage() {
  useSEO({ title: "My Account | Reni Cosmetics", description: "Sign in to manage your Reni Cosmetics orders, details and preferences.", url: "/account" });
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const { isAuthenticated, isLoading, refetch } = useCustomerAuth();

  return (
    <PageErrorBoundary pageName="Account">
      <div className="min-h-screen" style={{ background: ALABASTER }}>
        <Navbar />
        <div className="pt-36 pb-16" style={{ background: OBSIDIAN }}>
          <div className="container max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px" style={{ background: "rgba(234,234,223,0.25)" }} />
              <span className="text-[10px] tracking-[0.22em] uppercase font-medium" style={{ color: "rgba(234,234,223,0.4)" }}>Account</span>
            </div>
            <h1 className="font-display font-light" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", color: "#EAEADF" }}>
              {isAuthenticated ? "Your Account" : "Sign In"}
            </h1>
          </div>
        </div>

        <div className="container max-w-3xl py-16">
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="animate-spin" style={{ color: OBSIDIAN }} /></div>
          ) : isAuthenticated ? (
            <Dashboard onSignedOut={() => refetch()} />
          ) : (
            <AuthPanel onAuthed={() => refetch()} />
          )}
        </div>
        <Footer />
      </div>
    </PageErrorBoundary>
  );
}
