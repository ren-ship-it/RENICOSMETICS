import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { ShieldCheck, Loader2, Copy, Check } from "lucide-react";

export default function AdminSecurity() {
  const utils = trpc.useUtils();
  const status = trpc.adminAuth.mfaStatus.useQuery();
  const begin = trpc.adminAuth.mfaBeginEnroll.useMutation();
  const confirm = trpc.adminAuth.mfaConfirm.useMutation({ onSuccess: () => { utils.adminAuth.mfaStatus.invalidate(); setEnroll(null); setCode(""); } });
  const disable = trpc.adminAuth.mfaDisable.useMutation({ onSuccess: () => { utils.adminAuth.mfaStatus.invalidate(); setCode(""); } });

  const [enroll, setEnroll] = useState<{ secret: string; otpauthUri: string } | null>(null);
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const field = "w-full bg-[#111] border border-white/10 rounded-md px-3 py-2 text-sm text-white tracking-[0.3em] text-center focus:outline-none focus:border-[#C9A96E]/50";

  return (
    <AdminLayout>
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2"><ShieldCheck size={18} className="text-[#C9A96E]" /> Security</h1>
        <p className="text-sm text-gray-500 mb-6">Protect your admin account with two-factor authentication (TOTP).</p>

        <div className="bg-[#1a1a1a] border border-white/8 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-white">Two-factor authentication</span>
            <span className={`text-xs font-medium ${status.data?.enabled ? "text-green-400" : "text-gray-500"}`}>
              {status.isLoading ? "…" : status.data?.enabled ? "Enabled" : "Disabled"}
            </span>
          </div>

          {status.data?.enabled ? (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">Enter a current code from your authenticator to turn MFA off.</p>
              <input className={field} placeholder="000000" inputMode="numeric" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ""))} />
              {error && <p className="text-xs text-red-400">{error}</p>}
              <button
                onClick={() => { setError(null); disable.mutate({ code }, { onError: e => setError(e.message) }); }}
                disabled={disable.isPending || code.length !== 6}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium rounded-lg border border-red-500/40 text-red-300 hover:bg-red-500/10 disabled:opacity-50"
              >
                {disable.isPending && <Loader2 size={13} className="animate-spin" />} Disable MFA
              </button>
            </div>
          ) : enroll ? (
            <div className="space-y-3">
              <p className="text-xs text-gray-400">1. Add this secret to your authenticator app (Google Authenticator, 1Password, Authy):</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-[#111] border border-white/10 rounded-md px-3 py-2 text-xs text-[#C9A96E] break-all">{enroll.secret}</code>
                <button onClick={() => { navigator.clipboard.writeText(enroll.secret); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="p-2 text-gray-400 hover:text-white" aria-label="Copy secret">
                  {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
              </div>
              <p className="text-[11px] text-gray-600 break-all">Or use this URI: {enroll.otpauthUri}</p>
              <p className="text-xs text-gray-400">2. Enter the current 6-digit code to confirm:</p>
              <input className={field} placeholder="000000" inputMode="numeric" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ""))} />
              {error && <p className="text-xs text-red-400">{error}</p>}
              <button
                onClick={() => { setError(null); confirm.mutate({ code }, { onError: e => setError(e.message) }); }}
                disabled={confirm.isPending || code.length !== 6}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-[#C9A96E] text-black hover:bg-[#b8955a] disabled:opacity-50"
              >
                {confirm.isPending && <Loader2 size={13} className="animate-spin" />} Confirm & Enable
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setError(null); begin.mutate(undefined, { onSuccess: d => setEnroll(d), onError: e => setError(e.message) }); }}
              disabled={begin.isPending}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-[#C9A96E] text-black hover:bg-[#b8955a] disabled:opacity-50"
            >
              {begin.isPending && <Loader2 size={13} className="animate-spin" />} Set up MFA
            </button>
          )}
          {error && !enroll && !status.data?.enabled && <p className="text-xs text-red-400 mt-2">{error}</p>}
        </div>
      </div>
    </AdminLayout>
  );
}
