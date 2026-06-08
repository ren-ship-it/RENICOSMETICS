import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Plus, Loader2, Tag, Power } from "lucide-react";

export default function AdminDiscounts() {
  const utils = trpc.useUtils();
  const list = trpc.discounts.list.useQuery(undefined, { retry: false });
  const create = trpc.discounts.create.useMutation({
    onSuccess: () => { utils.discounts.list.invalidate(); setForm({ code: "", kind: "percent", value: "", maxRedemptions: "", expiresAt: "" }); setError(null); },
    onError: e => setError(e.message),
  });
  const setActive = trpc.discounts.setActive.useMutation({ onSuccess: () => utils.discounts.list.invalidate() });

  const [form, setForm] = useState({ code: "", kind: "percent", value: "", maxRedemptions: "", expiresAt: "" });
  const [error, setError] = useState<string | null>(null);

  const field = "w-full bg-[#111] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C9A96E]/50";
  const label = "block text-[11px] uppercase tracking-wider text-gray-500 mb-1";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const value = parseFloat(form.value);
    if (!form.code || Number.isNaN(value)) { setError("Code and a numeric value are required."); return; }
    create.mutate({
      code: form.code,
      ...(form.kind === "percent" ? { percentOff: value } : { amountOff: value }),
      ...(form.maxRedemptions ? { maxRedemptions: parseInt(form.maxRedemptions) } : {}),
      ...(form.expiresAt ? { expiresAt: form.expiresAt } : {}),
    });
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2"><Tag size={18} className="text-[#C9A96E]" /> Discount Codes</h1>
        <p className="text-sm text-gray-500 mb-6">Codes are created in Stripe and redeemed via the promo-code field at checkout.</p>

        {/* Create form */}
        <form onSubmit={submit} className="bg-[#1a1a1a] border border-white/8 rounded-xl p-5 mb-6 grid sm:grid-cols-5 gap-3 items-end">
          <div className="sm:col-span-2"><label className={label}>Code</label><input className={field} value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="WELCOME10" /></div>
          <div><label className={label}>Type</label>
            <select className={field} value={form.kind} onChange={e => setForm({ ...form, kind: e.target.value })}>
              <option value="percent">% off</option><option value="amount">$ off</option>
            </select>
          </div>
          <div><label className={label}>{form.kind === "percent" ? "Percent" : "Amount (AUD)"}</label><input className={field} value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} placeholder={form.kind === "percent" ? "10" : "15"} /></div>
          <button type="submit" disabled={create.isPending} className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-[#C9A96E] text-black hover:bg-[#b8955a] disabled:opacity-50 h-[38px]">
            {create.isPending ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Create
          </button>
          <div className="sm:col-span-2"><label className={label}>Max redemptions (optional)</label><input className={field} value={form.maxRedemptions} onChange={e => setForm({ ...form, maxRedemptions: e.target.value })} placeholder="100" /></div>
          <div className="sm:col-span-2"><label className={label}>Expires (optional)</label><input type="date" className={field} value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} /></div>
          {error && <p className="sm:col-span-5 text-xs text-red-400">{error}</p>}
        </form>

        {/* List */}
        {list.isLoading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : list.isError ? (
          <p className="text-sm text-amber-400">Could not load codes. Ensure Stripe is configured (STRIPE_SECRET_KEY).</p>
        ) : (list.data?.length ?? 0) === 0 ? (
          <p className="text-sm text-gray-500 py-8 text-center">No discount codes yet.</p>
        ) : (
          <div className="space-y-2">
            {list.data!.map(d => (
              <div key={d.id} className="flex items-center justify-between bg-[#1a1a1a] border border-white/8 rounded-lg p-3">
                <div>
                  <p className="text-sm font-medium text-white">{d.code} <span className="text-gray-400 font-normal">· {d.percentOff != null ? `${d.percentOff}% off` : `$${d.amountOff} ${d.currency} off`}</span></p>
                  <p className="text-[11px] text-gray-500">
                    {d.timesRedeemed} used{d.maxRedemptions ? ` / ${d.maxRedemptions}` : ""}
                    {d.expiresAt ? ` · expires ${new Date(d.expiresAt).toLocaleDateString("en-AU")}` : ""}
                    {" · "}<span className={d.active ? "text-green-400" : "text-gray-500"}>{d.active ? "active" : "inactive"}</span>
                  </p>
                </div>
                <button onClick={() => setActive.mutate({ id: d.id, active: !d.active })} disabled={setActive.isPending} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-md border border-white/10 text-gray-300 hover:bg-white/5">
                  <Power size={12} /> {d.active ? "Deactivate" : "Activate"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
