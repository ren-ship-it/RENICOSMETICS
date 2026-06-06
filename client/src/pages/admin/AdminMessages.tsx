import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { MessageSquare, Mail, Clock, CheckCircle2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AdminMessages() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);

  const utils = trpc.useUtils();
  const { data: messages, isLoading } = trpc.messages.list.useQuery({ unreadOnly });

  const markReadMutation = trpc.messages.markRead.useMutation({
    onSuccess: () => utils.messages.list.invalidate(),
  });

  const filtered = messages?.filter(m =>
    !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase()) || m.message.toLowerCase().includes(search.toLowerCase())
  );

  const unreadCount = messages?.filter(m => !m.read).length ?? 0;

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Messages</h1>
            <p className="text-sm text-gray-500 mt-1">
              {messages?.length ?? 0} total · {unreadCount} unread
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search messages..."
              className="pl-9 bg-[#1a1a1a] border-white/10 text-white text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={unreadOnly} onCheckedChange={setUnreadOnly} id="unread" />
            <Label htmlFor="unread" className="text-sm text-gray-400 cursor-pointer whitespace-nowrap">Unread only</Label>
          </div>
        </div>

        {/* Messages List */}
        <div className="bg-[#1a1a1a] border border-white/8 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="px-5 py-12 text-center">
              <div className="w-6 h-6 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : !filtered || filtered.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <MessageSquare size={36} className="text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-400">{unreadOnly ? "No unread messages" : "No messages yet"}</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filtered.map(msg => (
                <button
                  key={msg.id}
                  onClick={() => {
                    setSelected(msg);
                    if (!msg.read) markReadMutation.mutate({ id: msg.id });
                  }}
                  className={`w-full flex items-start gap-4 px-5 py-4 hover:bg-white/3 transition-colors text-left ${!msg.read ? "bg-[#C9A96E]/3" : ""}`}
                >
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!msg.read ? "bg-[#C9A96E]" : "bg-transparent"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-medium ${!msg.read ? "text-white" : "text-gray-300"}`}>{msg.name}</span>
                      <span className="text-xs text-gray-500">{msg.email}</span>
                      {msg.subject && <span className="text-xs text-gray-600">· {msg.subject}</span>}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{msg.message}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {msg.read ? (
                      <CheckCircle2 size={13} className="text-gray-600" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]" />
                    )}
                    <span className="text-[11px] text-gray-600">{new Date(msg.createdAt).toLocaleDateString("en-AU")}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Message Detail */}
      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent className="bg-[#1a1a1a] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Mail size={16} className="text-[#C9A96E]" />
              Message from {selected?.name}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400">From:</span>
                  <span className="text-white font-medium">{selected.name}</span>
                  <span className="text-gray-500">&lt;{selected.email}&gt;</span>
                </div>
                {selected.subject && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">Subject:</span>
                    <span className="text-white">{selected.subject}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={12} className="text-gray-500" />
                  <span className="text-gray-500">{new Date(selected.createdAt).toLocaleString("en-AU")}</span>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>
              <a
                href={`mailto:${selected.email}?subject=Re: ${selected.subject ?? "Your enquiry"}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#C9A96E] hover:bg-[#b8955a] text-black font-semibold text-sm rounded-lg transition-colors"
              >
                <Mail size={14} />
                Reply via Email
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
