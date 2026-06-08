import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Sparkles, Loader2, Check, X, Wand2 } from "lucide-react";

const STATUS_COLOR: Record<string, string> = {
  pending: "text-amber-400", approved: "text-blue-400", applied: "text-green-400",
  rejected: "text-gray-500", failed: "text-red-400",
};

export default function AdminAiProposals() {
  const utils = trpc.useUtils();
  const [status, setStatus] = useState<"pending" | "applied" | "rejected" | "failed" | "all">("pending");
  const list = trpc.aiEdits.list.useQuery({ status });
  const propose = trpc.aiEdits.propose.useMutation({ onSuccess: () => { utils.aiEdits.list.invalidate(); setInstruction(""); setError(null); } });
  const approve = trpc.aiEdits.approve.useMutation({ onSuccess: () => utils.aiEdits.list.invalidate() });
  const reject = trpc.aiEdits.reject.useMutation({ onSuccess: () => utils.aiEdits.list.invalidate() });

  const [instruction, setInstruction] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2"><Wand2 size={18} className="text-[#C9A96E]" /> AI Edit Proposals</h1>
        <p className="text-sm text-gray-500 mb-6">Describe a change. The AI drafts a structured proposal; nothing is applied until you approve it.</p>

        <div className="bg-[#1a1a1a] border border-white/8 rounded-xl p-5 mb-6">
          <textarea
            value={instruction}
            onChange={e => setInstruction(e.target.value)}
            rows={3}
            placeholder="e.g. Write a short draft journal post about peptide stability, or update DERMASHIELD's meta description for SEO."
            className="w-full bg-[#111] border border-white/10 rounded-md px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A96E]/50"
          />
          {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
          <div className="flex justify-end mt-3">
            <button
              onClick={() => { setError(null); propose.mutate({ instruction }, { onError: e => setError(e.message) }); }}
              disabled={propose.isPending || instruction.trim().length < 4}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-[#C9A96E] text-black hover:bg-[#b8955a] disabled:opacity-50"
            >
              {propose.isPending ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />} Draft Proposal
            </button>
          </div>
        </div>

        <div className="flex gap-1 mb-4">
          {(["pending", "applied", "rejected", "failed", "all"] as const).map(s => (
            <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 text-[11px] rounded-md capitalize ${status === s ? "bg-[#C9A96E]/20 text-[#C9A96E]" : "text-gray-500 hover:text-gray-300"}`}>{s}</button>
          ))}
        </div>

        {list.isLoading ? <p className="text-sm text-gray-500">Loading…</p> : (list.data?.length ?? 0) === 0 ? (
          <p className="text-sm text-gray-500 py-8 text-center">No {status === "all" ? "" : status} proposals.</p>
        ) : (
          <div className="space-y-2">
            {list.data!.map(pr => (
              <div key={pr.id} className="bg-[#1a1a1a] border border-white/8 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">{pr.type} · <span className={STATUS_COLOR[pr.status] ?? "text-gray-400"}>{pr.status}</span></span>
                  {pr.status === "pending" && (
                    <div className="flex gap-1">
                      <button onClick={() => approve.mutate({ id: pr.id })} disabled={approve.isPending} className="flex items-center gap-1 px-2 py-1 text-[11px] rounded bg-green-500/15 text-green-400 hover:bg-green-500/25"><Check size={12} /> Approve & apply</button>
                      <button onClick={() => reject.mutate({ id: pr.id })} className="flex items-center gap-1 px-2 py-1 text-[11px] rounded text-gray-400 hover:text-red-400"><X size={12} /> Reject</button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-white">{pr.summary}</p>
                {pr.resultNote && <p className="text-[11px] text-gray-500 mt-1">{pr.resultNote}</p>}
                <details className="mt-2">
                  <summary className="text-[11px] text-gray-500 cursor-pointer">View payload</summary>
                  <pre className="text-[10px] text-gray-400 bg-[#111] rounded p-2 mt-1 overflow-x-auto">{JSON.stringify(pr.payload, null, 2)}</pre>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
