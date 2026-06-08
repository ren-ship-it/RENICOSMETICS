import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Upload, Loader2, Copy, Check, Trash2, ImageIcon } from "lucide-react";

export default function AdminMedia() {
  const utils = trpc.useUtils();
  const list = trpc.media.list.useQuery();
  const upload = trpc.media.upload.useMutation({ onSuccess: () => utils.media.list.invalidate() });
  const remove = trpc.media.remove.useMutation({ onSuccess: () => utils.media.list.invalidate() });

  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const onFile = async (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) { setError("Please choose an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Image exceeds 5MB. Optimise it first."); return; }
    const dataBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    upload.mutate({ filename: file.name, contentType: file.type, dataBase64 }, { onError: e => setError(e.message) });
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2"><ImageIcon size={18} className="text-[#C9A96E]" /> Media Library</h1>
        <p className="text-sm text-gray-500 mb-6">Upload images, then copy a URL into a product or journal post.</p>

        <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-white/15 rounded-xl py-10 cursor-pointer hover:border-[#C9A96E]/40 transition-colors mb-6">
          {upload.isPending ? <Loader2 size={22} className="animate-spin text-[#C9A96E]" /> : <Upload size={22} className="text-gray-400" />}
          <span className="text-sm text-gray-400">{upload.isPending ? "Uploading…" : "Click to upload an image (max 5MB)"}</span>
          <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
        </label>
        {error && <p className="text-xs text-red-400 mb-4">{error}</p>}

        {list.isLoading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : (list.data?.length ?? 0) === 0 ? (
          <p className="text-sm text-gray-500 py-8 text-center">No media yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {list.data!.map(m => (
              <div key={m.id} className="bg-[#1a1a1a] border border-white/8 rounded-lg overflow-hidden group">
                <div className="aspect-square bg-[#111] flex items-center justify-center overflow-hidden">
                  <img src={m.url} alt={m.filename ?? "media"} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="p-2 flex items-center justify-between gap-1">
                  <button
                    onClick={() => { navigator.clipboard.writeText(m.url); setCopiedId(m.id); setTimeout(() => setCopiedId(null), 1500); }}
                    className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-white truncate"
                    title={m.url}
                  >
                    {copiedId === m.id ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                    {copiedId === m.id ? "Copied" : "Copy URL"}
                  </button>
                  <button onClick={() => { if (confirm("Remove from library?")) remove.mutate({ id: m.id }); }} className="text-gray-500 hover:text-red-400" aria-label="Remove"><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
