import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Search, ShoppingCart, ChevronRight, Package, Truck, CheckCircle2, XCircle, Clock, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending:    { label: "Pending",    color: "bg-amber-500/15 text-amber-400 border-amber-500/20",   icon: Clock },
  processing: { label: "Processing", color: "bg-blue-500/15 text-blue-400 border-blue-500/20",     icon: RefreshCw },
  shipped:    { label: "Shipped",    color: "bg-purple-500/15 text-purple-400 border-purple-500/20", icon: Truck },
  delivered:  { label: "Delivered",  color: "bg-green-500/15 text-green-400 border-green-500/20",   icon: CheckCircle2 },
  cancelled:  { label: "Cancelled",  color: "bg-red-500/15 text-red-400 border-red-500/20",         icon: XCircle },
  refunded:   { label: "Refunded",   color: "bg-gray-500/15 text-gray-400 border-gray-500/20",      icon: RefreshCw },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border ${cfg.color}`}>
      <Icon size={9} />
      {cfg.label}
    </span>
  );
}

export default function AdminOrders() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");

  const utils = trpc.useUtils();
  const { data: orders, isLoading } = trpc.orders.list.useQuery({
    search: search || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    limit: 100,
  });

  const { data: orderDetail } = trpc.orders.byId.useQuery(
    { id: selectedOrder?.id ?? 0 },
    { enabled: !!selectedOrder }
  );

  const updateStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Order status updated");
      setSelectedOrder(null);
      utils.orders.list.invalidate();
      utils.admin.stats.invalidate();
      utils.admin.recentOrders.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const refundMutation = trpc.orders.refund.useMutation({
    onSuccess: () => {
      toast.success("Refund processed");
      setSelectedOrder(null);
      utils.orders.list.invalidate();
      utils.admin.stats.invalidate();
      utils.admin.recentOrders.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const totalRevenue = orders?.reduce((sum, o) => sum + (o.paymentStatus === "paid" ? Number(o.total) : 0), 0) ?? 0;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Orders</h1>
            <p className="text-sm text-gray-500 mt-1">
              {orders?.length ?? 0} orders · ${totalRevenue.toLocaleString("en-AU", { minimumFractionDigits: 2 })} revenue
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by order number, name, or email..."
              className="pl-9 bg-[#1a1a1a] border-white/10 text-white text-sm"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-[#1a1a1a] border-white/10 text-white text-sm">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-white/10">
              <SelectItem value="all" className="text-white text-sm">All statuses</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <SelectItem key={k} value={k} className="text-white text-sm">{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status tabs */}
        <div className="flex gap-1 flex-wrap">
          {[{ key: "all", label: "All" }, ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({ key: k, label: v.label }))].map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === tab.key ? "bg-[#C9A96E]/20 text-[#C9A96E]" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"}`}
            >
              {tab.label}
              {tab.key !== "all" && orders && (
                <span className="ml-1.5 text-[10px] opacity-60">
                  {orders.filter(o => o.status === tab.key).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-[#1a1a1a] border border-white/8 rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/8 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
            <div className="col-span-3">Order</div>
            <div className="col-span-3">Customer</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Total</div>
            <div className="col-span-2">Status</div>
          </div>

          {isLoading ? (
            <div className="px-5 py-12 text-center">
              <div className="w-6 h-6 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <ShoppingCart size={36} className="text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No orders yet</p>
              <p className="text-xs text-gray-600 mt-1">Orders will appear here once customers purchase</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {orders.map(order => (
                <button
                  key={order.id}
                  onClick={() => { setSelectedOrder(order); setNewStatus(order.status); setTrackingNumber(order.trackingNumber ?? ""); setTrackingUrl(order.trackingUrl ?? ""); }}
                  className="w-full grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-white/3 transition-colors text-left"
                >
                  <div className="col-span-3">
                    <div className="text-sm font-semibold text-white">{order.orderNumber}</div>
                    <div className="text-[11px] text-gray-500">{(order as any).items?.length ?? "—"} items</div>
                  </div>
                  <div className="col-span-3 min-w-0">
                    <div className="text-sm text-white truncate">{order.customerName ?? "—"}</div>
                    <div className="text-[11px] text-gray-500 truncate">{order.customerEmail}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString("en-AU")}</div>
                    <div className="text-[11px] text-gray-600">{new Date(order.createdAt).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm font-semibold text-white">${Number(order.total).toFixed(2)}</div>
                    <div className={`text-[10px] font-medium ${order.paymentStatus === "paid" ? "text-green-400" : "text-amber-400"}`}>
                      {order.paymentStatus}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <StatusBadge status={order.status} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Detail / Status Update Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={open => !open && setSelectedOrder(null)}>
        <DialogContent className="bg-[#1a1a1a] border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Package size={16} className="text-[#C9A96E]" />
              {selectedOrder?.orderNumber}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-5">
              {/* Customer */}
              <div className="bg-white/5 rounded-lg p-4 space-y-1.5">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Customer</div>
                <div className="text-sm text-white">{selectedOrder.customerName}</div>
                <div className="text-xs text-gray-400">{selectedOrder.customerEmail}</div>
                {selectedOrder.customerPhone && <div className="text-xs text-gray-400">{selectedOrder.customerPhone}</div>}
                {selectedOrder.shippingAddress && (
                  <div className="text-xs text-gray-500 mt-1">{selectedOrder.shippingAddress}</div>
                )}
              </div>

              {/* Order Items */}
              {orderDetail?.items && orderDetail.items.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Items</div>
                  <div className="space-y-2">
                    {orderDetail.items.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-white">{item.productName}</div>
                          <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                        </div>
                        <div className="text-sm font-semibold text-white">${Number(item.lineTotal).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/10 mt-3 pt-3 flex justify-between">
                    <span className="text-sm text-gray-400">Total</span>
                    <span className="text-sm font-bold text-white">${Number(selectedOrder.total).toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Update Status */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Update Status</div>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="bg-[#222] border-white/10 text-white text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#222] border-white/10">
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                      <SelectItem key={k} value={k} className="text-white text-sm">{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(newStatus === "shipped" || newStatus === "delivered") && (
                  <>
                    <Input
                      value={trackingNumber}
                      onChange={e => setTrackingNumber(e.target.value)}
                      placeholder="Tracking number (optional)"
                      className="bg-[#222] border-white/10 text-white text-sm"
                    />
                    <Input
                      value={trackingUrl}
                      onChange={e => setTrackingUrl(e.target.value)}
                      placeholder="Tracking URL (optional)"
                      className="bg-[#222] border-white/10 text-white text-sm"
                    />
                  </>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-between">
            {selectedOrder?.paymentStatus === "paid" ? (
              <Button
                variant="ghost"
                onClick={() => {
                  if (selectedOrder && window.confirm(`Refund $${Number(selectedOrder.total).toFixed(2)} for ${selectedOrder.orderNumber} and restock items?`)) {
                    refundMutation.mutate({ id: selectedOrder.id, restock: true });
                  }
                }}
                disabled={refundMutation.isPending}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                {refundMutation.isPending ? "Refunding..." : "Refund Order"}
              </Button>
            ) : <span />}
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setSelectedOrder(null)} className="text-gray-400">Cancel</Button>
              <Button
                onClick={() => selectedOrder && updateStatusMutation.mutate({ id: selectedOrder.id, status: newStatus as any, trackingNumber: trackingNumber || undefined, trackingUrl: trackingUrl || undefined })}
                disabled={updateStatusMutation.isPending || newStatus === selectedOrder?.status}
                className="bg-[#C9A96E] hover:bg-[#b8955a] text-black font-semibold"
              >
                {updateStatusMutation.isPending ? "Saving..." : "Update Order"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
