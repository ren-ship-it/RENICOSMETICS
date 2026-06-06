import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageErrorBoundary from "@/components/PageErrorBoundary";
import { useSEO } from "@/hooks/useSEO";
import { trpc } from "@/lib/trpc";
import { Loader2, CheckCircle2 } from "lucide-react";

const OBSIDIAN = "#2D2C2C";
const ALABASTER = "#FAFAF7";
const SAGE = "#6B7A3E";

export default function ResetPasswordPage() {
  useSEO({ title: "Reset Password | Reni Cosmetics", description: "Reset your Reni Cosmetics account password.", url: "/reset-password" });
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const [, navigate] = useLocation();

  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const reset = trpc.customerAuth.resetPassword.useMutation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token") ?? "");
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError("Passwords do not match."); return; }
    reset.mutate({ token, password }, { onError: err => setError(err.message) });
  };

  const done = reset.isSuccess;

  return (
    <PageErrorBoundary pageName="Reset Password">
      <div className="min-h-screen" style={{ background: ALABASTER }}>
        <Navbar />
        <div className="pt-36 pb-16" style={{ background: OBSIDIAN }}>
          <div className="container max-w-3xl">
            <span className="text-[10px] tracking-[0.22em] uppercase font-medium" style={{ color: "rgba(234,234,223,0.4)" }}>Account</span>
            <h1 className="font-display font-light mt-3" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", color: "#EAEADF" }}>Reset Password</h1>
          </div>
        </div>

        <div className="container max-w-md py-16">
          {done ? (
            <div className="text-center">
              <CheckCircle2 size={36} style={{ color: SAGE }} className="mx-auto mb-4" />
              <p className="text-sm mb-6" style={{ color: "rgba(45,44,44,0.7)" }}>Your password has been reset.</p>
              <button onClick={() => navigate("/account")} className="px-6 py-3 text-[11px] tracking-widest uppercase font-semibold" style={{ background: OBSIDIAN, color: ALABASTER }}>Go to Sign In</button>
            </div>
          ) : !token ? (
            <div className="text-center">
              <p className="text-sm mb-4" style={{ color: "rgba(45,44,44,0.7)" }}>This reset link is missing or invalid.</p>
              <Link href="/account"><span className="text-[11px] tracking-widest uppercase underline cursor-pointer" style={{ color: OBSIDIAN }}>Request a new link</span></Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label htmlFor="pw" className="block text-[11px] font-medium uppercase tracking-wider mb-1.5" style={{ color: "rgba(45,44,44,0.55)" }}>New password</label>
                <input id="pw" type="password" required minLength={8} className="w-full px-3.5 py-2.5 text-sm bg-white border rounded-md focus:outline-none focus:ring-2" style={{ borderColor: "rgba(45,44,44,0.18)", color: OBSIDIAN }} value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" />
                <p className="text-[10px] mt-1" style={{ color: "rgba(45,44,44,0.4)" }}>At least 8 characters, with a letter and a number.</p>
              </div>
              <div>
                <label htmlFor="cpw" className="block text-[11px] font-medium uppercase tracking-wider mb-1.5" style={{ color: "rgba(45,44,44,0.55)" }}>Confirm password</label>
                <input id="cpw" type="password" required minLength={8} className="w-full px-3.5 py-2.5 text-sm bg-white border rounded-md focus:outline-none focus:ring-2" style={{ borderColor: "rgba(45,44,44,0.18)", color: OBSIDIAN }} value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" />
              </div>
              {error && <p role="alert" className="text-xs" style={{ color: "#b3261e" }}>{error}</p>}
              <button type="submit" disabled={reset.isPending} className="w-full px-5 py-3 text-[11px] tracking-widest uppercase font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: OBSIDIAN, color: ALABASTER }}>
                {reset.isPending && <Loader2 size={13} className="animate-spin" />} Reset Password
              </button>
            </form>
          )}
        </div>
        <Footer />
      </div>
    </PageErrorBoundary>
  );
}
