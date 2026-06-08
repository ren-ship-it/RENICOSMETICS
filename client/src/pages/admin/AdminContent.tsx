import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Plus, Trash2, Pencil, X, FileText, MapPin, Loader2 } from "lucide-react";

type Tab = "journal" | "stockists";

const field = "w-full bg-[#111] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C9A96E]/50";
const label = "block text-[11px] uppercase tracking-wider text-gray-500 mb-1";

// ── Journal editor ───────────────────────────────────────────────────────────
function JournalManager() {
  const utils = trpc.useUtils();
  const list = trpc.content.journalAdminList.useQuery();
  const save = trpc.content.journalSave.useMutation({ onSuccess: () => { utils.content.journalAdminList.invalidate(); setEditing(null); } });
  const del = trpc.content.journalDelete.useMutation({ onSuccess: () => utils.content.journalAdminList.invalidate() });
  const [editing, setEditing] = useState<any | null>(null);

  const blank = { slug: "", title: "", category: "Science", excerpt: "", content: "", image: "", author: "", readTime: "", status: "published" as const };

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button onClick={() => setEditing({ ...blank })} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-[#C9A96E] text-black hover:bg-[#b8955a]">
          <Plus size={13} /> New Post
        </button>
      </div>

      {list.isLoading ? <p className="text-sm text-gray-500">Loading…</p> : (list.data?.length ?? 0) === 0 ? (
        <p className="text-sm text-gray-500 py-8 text-center">No posts yet. Run <code>pnpm seed:content</code> or create one.</p>
      ) : (
        <div className="space-y-2">
          {list.data!.map(p => (
            <div key={p.id} className="flex items-center justify-between bg-[#1a1a1a] border border-white/8 rounded-lg p-3">
              <div className="min-w-0">
                <p className="text-sm text-white truncate">{p.title}</p>
                <p className="text-[11px] text-gray-500">/{p.slug} · {p.category} · <span className={p.status === "published" ? "text-green-400" : "text-amber-400"}>{p.status}</span></p>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <button onClick={() => setEditing({ ...p, relatedProductSlugs: undefined })} className="p-2 text-gray-400 hover:text-white" aria-label="Edit"><Pencil size={14} /></button>
                <button onClick={() => { if (confirm(`Delete "${p.title}"?`)) del.mutate({ id: p.id }); }} className="p-2 text-gray-400 hover:text-red-400" aria-label="Delete"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setEditing(null)}>
          <div className="bg-[#161616] border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">{editing.id ? "Edit Post" : "New Post"}</h3>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-white"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={label}>Title</label><input className={field} value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} /></div>
              <div><label className={label}>Slug</label><input className={field} value={editing.slug} onChange={e => setEditing({ ...editing, slug: e.target.value })} /></div>
              <div><label className={label}>Category</label><input className={field} value={editing.category ?? ""} onChange={e => setEditing({ ...editing, category: e.target.value })} /></div>
              <div><label className={label}>Read time</label><input className={field} value={editing.readTime ?? ""} onChange={e => setEditing({ ...editing, readTime: e.target.value })} /></div>
              <div className="col-span-2"><label className={label}>Image URL</label><input className={field} value={editing.image ?? ""} onChange={e => setEditing({ ...editing, image: e.target.value })} /></div>
              <div className="col-span-2"><label className={label}>Excerpt</label><textarea className={field} rows={2} value={editing.excerpt ?? ""} onChange={e => setEditing({ ...editing, excerpt: e.target.value })} /></div>
              <div className="col-span-2"><label className={label}>Content (blank line between paragraphs)</label><textarea className={field} rows={10} value={editing.content ?? ""} onChange={e => setEditing({ ...editing, content: e.target.value })} /></div>
              <div><label className={label}>Status</label>
                <select className={field} value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value })}>
                  <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-xs text-gray-400 hover:text-white">Cancel</button>
              <button
                onClick={() => save.mutate({ id: editing.id, slug: editing.slug, title: editing.title, category: editing.category, excerpt: editing.excerpt, content: editing.content, image: editing.image, author: editing.author, readTime: editing.readTime, status: editing.status })}
                disabled={save.isPending || !editing.slug || !editing.title}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-[#C9A96E] text-black hover:bg-[#b8955a] disabled:opacity-50"
              >
                {save.isPending && <Loader2 size={12} className="animate-spin" />} Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Stockists editor ─────────────────────────────────────────────────────────
function StockistManager() {
  const utils = trpc.useUtils();
  const list = trpc.content.stockistAdminList.useQuery();
  const save = trpc.content.stockistSave.useMutation({ onSuccess: () => { utils.content.stockistAdminList.invalidate(); setEditing(null); } });
  const del = trpc.content.stockistDelete.useMutation({ onSuccess: () => utils.content.stockistAdminList.invalidate() });
  const [editing, setEditing] = useState<any | null>(null);
  const blank = { name: "", type: "", region: "", location: "", url: "", online: true, active: true, sortOrder: 0 };

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button onClick={() => setEditing({ ...blank })} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-[#C9A96E] text-black hover:bg-[#b8955a]">
          <Plus size={13} /> New Stockist
        </button>
      </div>
      {list.isLoading ? <p className="text-sm text-gray-500">Loading…</p> : (list.data?.length ?? 0) === 0 ? (
        <p className="text-sm text-gray-500 py-8 text-center">No stockists yet. Run <code>pnpm seed:content</code> or add one.</p>
      ) : (
        <div className="space-y-2">
          {list.data!.map(s => (
            <div key={s.id} className="flex items-center justify-between bg-[#1a1a1a] border border-white/8 rounded-lg p-3">
              <div className="min-w-0">
                <p className="text-sm text-white truncate">{s.name} {!s.active && <span className="text-[10px] text-gray-500">(hidden)</span>}</p>
                <p className="text-[11px] text-gray-500">{s.region} · {s.location}</p>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <button onClick={() => setEditing({ ...s })} className="p-2 text-gray-400 hover:text-white" aria-label="Edit"><Pencil size={14} /></button>
                <button onClick={() => { if (confirm(`Delete "${s.name}"?`)) del.mutate({ id: s.id }); }} className="p-2 text-gray-400 hover:text-red-400" aria-label="Delete"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setEditing(null)}>
          <div className="bg-[#161616] border border-white/10 rounded-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">{editing.id ? "Edit Stockist" : "New Stockist"}</h3>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-white"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className={label}>Name</label><input className={field} value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} /></div>
              <div><label className={label}>Region</label><input className={field} value={editing.region ?? ""} onChange={e => setEditing({ ...editing, region: e.target.value })} /></div>
              <div><label className={label}>Type</label><input className={field} value={editing.type ?? ""} onChange={e => setEditing({ ...editing, type: e.target.value })} /></div>
              <div><label className={label}>Location</label><input className={field} value={editing.location ?? ""} onChange={e => setEditing({ ...editing, location: e.target.value })} /></div>
              <div><label className={label}>Sort order</label><input type="number" className={field} value={editing.sortOrder ?? 0} onChange={e => setEditing({ ...editing, sortOrder: Number(e.target.value) })} /></div>
              <div className="col-span-2"><label className={label}>URL</label><input className={field} value={editing.url ?? ""} onChange={e => setEditing({ ...editing, url: e.target.value })} /></div>
              <label className="flex items-center gap-2 text-xs text-gray-300"><input type="checkbox" checked={editing.online} onChange={e => setEditing({ ...editing, online: e.target.checked })} /> Online store</label>
              <label className="flex items-center gap-2 text-xs text-gray-300"><input type="checkbox" checked={editing.active} onChange={e => setEditing({ ...editing, active: e.target.checked })} /> Visible</label>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-xs text-gray-400 hover:text-white">Cancel</button>
              <button
                onClick={() => save.mutate({ id: editing.id, name: editing.name, type: editing.type, region: editing.region, location: editing.location, url: editing.url, online: !!editing.online, active: !!editing.active, sortOrder: Number(editing.sortOrder) || 0 })}
                disabled={save.isPending || !editing.name}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-[#C9A96E] text-black hover:bg-[#b8955a] disabled:opacity-50"
              >
                {save.isPending && <Loader2 size={12} className="animate-spin" />} Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminContent() {
  const [tab, setTab] = useState<Tab>("journal");
  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-1">Content</h1>
        <p className="text-sm text-gray-500 mb-6">Manage the Journal and Stockists shown on the storefront.</p>
        <div className="flex gap-1 mb-6 p-1 rounded-lg bg-white/5 w-fit">
          <button onClick={() => setTab("journal")} className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-md ${tab === "journal" ? "bg-[#C9A96E] text-black" : "text-gray-400"}`}><FileText size={13} /> Journal</button>
          <button onClick={() => setTab("stockists")} className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-md ${tab === "stockists" ? "bg-[#C9A96E] text-black" : "text-gray-400"}`}><MapPin size={13} /> Stockists</button>
        </div>
        {tab === "journal" ? <JournalManager /> : <StockistManager />}
      </div>
    </AdminLayout>
  );
}
