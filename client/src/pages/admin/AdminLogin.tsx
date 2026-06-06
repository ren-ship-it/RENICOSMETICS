import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Loader2, Lock } from "lucide-react";

/**
 * Brand-owned admin login (first-party email + password). Runs in parallel to
 * Manus OAuth, which remains available via the secondary link.
 */
export default function AdminLogin() {
  const [, navigate] = useLocation();
  const { user, loading, refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const login = trpc.adminAuth.login.useMutation();

  // If already authenticated as admin, go straight to the dashboard.
  useEffect(() => {
    if (!loading && user?.role === "admin") navigate("/admin");
  }, [loading, user, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    login.mutate(
      { email, password },
      {
        onSuccess: async () => {
          await refresh();
          navigate("/admin");
        },
        onError: err => setError(err.message),
      },
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#0f0f0f" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-xs font-semibold tracking-[0.22em] text-[#C9A96E] uppercase mb-1">Reni Cosmetics</div>
          <div className="text-[11px] text-gray-500">Admin Dashboard</div>
        </div>

        <div className="bg-[#1a1a1a] border border-white/8 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Lock size={15} className="text-[#C9A96E]" />
            <h1 className="text-sm font-semibold text-white">Sign in</h1>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1.5">Email</label>
              <input id="email" type="email" required autoComplete="username" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#111] border border-white/10 rounded-md px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#C9A96E]/50" />
            </div>
            <div>
              <label htmlFor="password" className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1.5">Password</label>
              <input id="password" type="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#111] border border-white/10 rounded-md px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#C9A96E]/50" />
            </div>
            {error && <p role="alert" className="text-xs text-red-400">{error}</p>}
            <button type="submit" disabled={login.isPending}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 text-[11px] tracking-widest uppercase font-semibold bg-[#C9A96E] text-black rounded-md hover:bg-[#b8955a] transition-colors disabled:opacity-50">
              {login.isPending && <Loader2 size={13} className="animate-spin" />} Sign In
            </button>
          </form>
        </div>

        <div className="text-center mt-5">
          <a href={getLoginUrl()} className="text-[11px] text-gray-500 hover:text-gray-300 underline">
            Sign in with Manus OAuth
          </a>
        </div>
      </div>
    </div>
  );
}
