import { useState } from "react";
import { Star, Loader2, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

const OBSIDIAN = "#2D2C2C";
const SAGE = "#6B7A3E";

function Stars({ value, onSelect, size = 14 }: { value: number; onSelect?: (n: number) => void; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type={onSelect ? "button" : undefined}
          onClick={onSelect ? () => onSelect(i) : undefined}
          className={onSelect ? "cursor-pointer" : "cursor-default"}
          aria-label={onSelect ? `${i} star${i > 1 ? "s" : ""}` : undefined}
          tabIndex={onSelect ? 0 : -1}
        >
          <Star size={size} fill={i <= value ? SAGE : "transparent"} color={SAGE} />
        </button>
      ))}
    </div>
  );
}

export default function ProductReviews({ productSlug, productName }: { productSlug: string; productName: string }) {
  const summary = trpc.reviews.summary.useQuery({ productSlug });
  const list = trpc.reviews.listForProduct.useQuery({ productSlug });
  const utils = trpc.useUtils();
  const submit = trpc.reviews.submit.useMutation({
    onSuccess: () => { setDone(true); utils.reviews.listForProduct.invalidate({ productSlug }); },
  });

  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ customerName: "", location: "", rating: 5, title: "", body: "" });
  const [error, setError] = useState<string | null>(null);

  const inputCls = "w-full px-3.5 py-2.5 text-sm bg-white border rounded-md focus:outline-none focus:ring-2";
  const inputStyle = { borderColor: "rgba(45,44,44,0.18)", color: OBSIDIAN } as const;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.customerName.trim() || form.body.trim().length < 4) { setError("Please add your name and a short review."); return; }
    submit.mutate({ productSlug, customerName: form.customerName, location: form.location || undefined, rating: form.rating, title: form.title || undefined, body: form.body });
  };

  const count = summary.data?.count ?? 0;
  const avg = summary.data?.average ?? 0;

  return (
    <section className="border-t pt-12 mt-4" style={{ borderColor: "rgba(45,44,44,0.1)" }} aria-label="Customer reviews">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h2 className="font-display font-medium" style={{ fontSize: "clamp(1.2rem,3vw,1.6rem)", color: OBSIDIAN }}>Reviews</h2>
          {count > 0 ? (
            <div className="flex items-center gap-2 mt-1">
              <Stars value={Math.round(avg)} />
              <span className="text-sm" style={{ color: "rgba(45,44,44,0.6)" }}>{avg} · {count} review{count !== 1 ? "s" : ""}</span>
            </div>
          ) : (
            <p className="text-sm mt-1" style={{ color: "rgba(45,44,44,0.5)" }}>Be the first to review {productName}.</p>
          )}
        </div>
        <button onClick={() => { setOpen(o => !o); setDone(false); }} className="px-5 py-2.5 text-[11px] tracking-widest uppercase font-semibold" style={{ background: OBSIDIAN, color: "#FAFAF7" }}>
          Write a Review
        </button>
      </div>

      {open && (
        <div className="mb-8 p-5 rounded-lg" style={{ background: "#EAEADF" }}>
          {done ? (
            <div className="text-center py-4">
              <CheckCircle2 size={28} style={{ color: SAGE }} className="mx-auto mb-2" />
              <p className="text-sm" style={{ color: OBSIDIAN }}>Thank you. Your review has been submitted and will appear once approved.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-[11px] uppercase tracking-wider" style={{ color: "rgba(45,44,44,0.55)" }}>Your rating</span>
                <Stars value={form.rating} onSelect={n => setForm({ ...form, rating: n })} size={18} />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <input className={inputCls} style={inputStyle} placeholder="Your name" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} />
                <input className={inputCls} style={inputStyle} placeholder="Location (optional)" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
              </div>
              <input className={inputCls} style={inputStyle} placeholder="Title (optional)" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <textarea className={inputCls} style={inputStyle} rows={4} placeholder={`What did you think of ${productName}?`} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} />
              {error && <p className="text-xs" style={{ color: "#b3261e" }}>{error}</p>}
              <button type="submit" disabled={submit.isPending} className="flex items-center justify-center gap-2 px-6 py-2.5 text-[11px] tracking-widest uppercase font-semibold disabled:opacity-50" style={{ background: OBSIDIAN, color: "#FAFAF7" }}>
                {submit.isPending && <Loader2 size={13} className="animate-spin" />} Submit Review
              </button>
            </form>
          )}
        </div>
      )}

      {(list.data?.length ?? 0) > 0 && (
        <div className="space-y-5">
          {list.data!.map(r => (
            <div key={r.id} className="border-b pb-5" style={{ borderColor: "rgba(45,44,44,0.08)" }}>
              <div className="flex items-center justify-between mb-1">
                <Stars value={r.rating} />
                {r.verified && <span className="text-[10px] uppercase tracking-wider" style={{ color: SAGE }}>Verified buyer</span>}
              </div>
              {r.title && <p className="text-sm font-semibold" style={{ color: OBSIDIAN }}>{r.title}</p>}
              <p className="text-sm mt-1" style={{ color: "rgba(45,44,44,0.7)" }}>{r.body}</p>
              <p className="text-[11px] mt-2" style={{ color: "rgba(45,44,44,0.45)" }}>
                {r.customerName}{r.location ? ` · ${r.location}` : ""} · {new Date(r.createdAt).toLocaleDateString("en-AU", { month: "short", year: "numeric" })}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
