import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Mail, Users, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminSubscribers() {
  const { data: subscribers, isLoading } = trpc.subscribers.list.useQuery();

  const exportCSV = () => {
    if (!subscribers || subscribers.length === 0) return;
    const rows = [["Email", "Source", "Date Subscribed"]];
    subscribers.forEach(s => rows.push([s.email, s.source ?? "", new Date(s.createdAt).toLocaleDateString("en-AU")]));
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "subscribers.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Subscribers</h1>
            <p className="text-sm text-gray-500 mt-1">{subscribers?.length ?? 0} active newsletter subscribers</p>
          </div>
          <Button
            onClick={exportCSV}
            disabled={!subscribers || subscribers.length === 0}
            variant="outline"
            className="border-white/15 text-gray-300 hover:text-white bg-transparent text-sm"
          >
            <Download size={14} className="mr-2" /> Export CSV
          </Button>
        </div>

        {/* Subscribers Table */}
        <div className="bg-[#1a1a1a] border border-white/8 rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/8 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
            <div className="col-span-6">Email</div>
            <div className="col-span-3">Source</div>
            <div className="col-span-3">Date</div>
          </div>

          {isLoading ? (
            <div className="px-5 py-12 text-center">
              <div className="w-6 h-6 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : !subscribers || subscribers.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <Mail size={36} className="text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No subscribers yet</p>
              <p className="text-xs text-gray-600 mt-1">Subscribers will appear here when customers sign up via the newsletter form</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {subscribers.map(sub => (
                <div key={sub.id} className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-white/2 transition-colors">
                  <div className="col-span-6 flex items-center gap-2">
                    <Mail size={12} className="text-gray-600 flex-shrink-0" />
                    <span className="text-sm text-white">{sub.email}</span>
                  </div>
                  <div className="col-span-3">
                    <span className="text-xs px-2 py-0.5 rounded bg-white/8 text-gray-400">{sub.source ?? "footer"}</span>
                  </div>
                  <div className="col-span-3">
                    <span className="text-xs text-gray-500">{new Date(sub.createdAt).toLocaleDateString("en-AU")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
