import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Search, Users, Mail, Phone, MapPin, ShoppingBag, Calendar, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-amber-500/15 text-amber-400",
  processing: "bg-blue-500/15 text-blue-400",
  shipped:    "bg-purple-500/15 text-purple-400",
  delivered:  "bg-green-500/15 text-green-400",
  cancelled:  "bg-red-500/15 text-red-400",
};

export default function AdminCustomers() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: customers, isLoading } = trpc.customers.list.useQuery({
    search: search || undefined,
    limit: 100,
  });

  const { data: customerDetail } = trpc.customers.byId.useQuery(
    { id: selectedId ?? 0 },
    { enabled: !!selectedId }
  );

  const totalSpend = (customerDetail?.orders ?? []).reduce(
    (sum: number, o: any) => sum + (o.paymentStatus === "paid" ? Number(o.total) : 0), 0
  );

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Customers</h1>
            <p className="text-sm text-gray-500 mt-1">{customers?.length ?? 0} registered customers</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="pl-9 bg-[#1a1a1a] border-white/10 text-white text-sm"
          />
        </div>

        {/* Customers Table */}
        <div className="bg-[#1a1a1a] border border-white/8 rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/8 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
            <div className="col-span-4">Customer</div>
            <div className="col-span-3">Contact</div>
            <div className="col-span-2">Location</div>
            <div className="col-span-2">Joined</div>
            <div className="col-span-1"></div>
          </div>

          {isLoading ? (
            <div className="px-5 py-12 text-center">
              <div className="w-6 h-6 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : !customers || customers.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <Users size={36} className="text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No customers yet</p>
              <p className="text-xs text-gray-600 mt-1">Customers will appear here once they place an order</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {customers.map(customer => (
                <button
                  key={customer.id}
                  onClick={() => setSelectedId(customer.id)}
                  className="w-full grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-white/3 transition-colors text-left"
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#C9A96E]/15 flex items-center justify-center text-[#C9A96E] text-sm font-bold flex-shrink-0">
                      {(customer.firstName?.[0] ?? customer.email[0]).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {customer.firstName && customer.lastName ? `${customer.firstName} ${customer.lastName}` : customer.email}
                      </div>
                      <div className="text-[11px] text-gray-500 truncate">{customer.email}</div>
                    </div>
                  </div>
                  <div className="col-span-3">
                    {customer.phone ? (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Phone size={10} />
                        {customer.phone}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-600">—</span>
                    )}
                  </div>
                  <div className="col-span-2">
                    {customer.suburb ? (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin size={10} />
                        {customer.suburb}, {customer.state}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-600">—</span>
                    )}
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-gray-400">{new Date(customer.createdAt).toLocaleDateString("en-AU")}</div>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <ChevronRight size={14} className="text-gray-600" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Customer Detail Dialog */}
      <Dialog open={!!selectedId} onOpenChange={open => !open && setSelectedId(null)}>
        <DialogContent className="bg-[#1a1a1a] border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Customer Profile</DialogTitle>
          </DialogHeader>

          {customerDetail && (
            <div className="space-y-5">
              {/* Profile */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#C9A96E]/15 flex items-center justify-center text-[#C9A96E] text-xl font-bold flex-shrink-0">
                  {(customerDetail.firstName?.[0] ?? customerDetail.email[0]).toUpperCase()}
                </div>
                <div>
                  <div className="text-lg font-semibold text-white">
                    {customerDetail.firstName && customerDetail.lastName
                      ? `${customerDetail.firstName} ${customerDetail.lastName}`
                      : customerDetail.email}
                  </div>
                  <div className="text-sm text-gray-400">{customerDetail.email}</div>
                  {customerDetail.phone && <div className="text-sm text-gray-500">{customerDetail.phone}</div>}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-white">{customerDetail.orders?.length ?? 0}</div>
                  <div className="text-[10px] text-gray-500">Orders</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-[#C9A96E]">${totalSpend.toFixed(0)}</div>
                  <div className="text-[10px] text-gray-500">Total Spent</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-white">
                    {customerDetail.acceptsMarketing ? "✓" : "✗"}
                  </div>
                  <div className="text-[10px] text-gray-500">Marketing</div>
                </div>
              </div>

              {/* Address */}
              {customerDetail.address && (
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Shipping Address</div>
                  <div className="text-sm text-white">{customerDetail.address}</div>
                  <div className="text-sm text-gray-400">
                    {[customerDetail.suburb, customerDetail.state, customerDetail.postcode].filter(Boolean).join(", ")}
                  </div>
                </div>
              )}

              {/* Order History */}
              {customerDetail.orders && customerDetail.orders.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Order History</div>
                  <div className="space-y-2">
                    {customerDetail.orders.map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3">
                        <div>
                          <div className="text-sm font-medium text-white">{order.orderNumber}</div>
                          <div className="text-[11px] text-gray-500">{new Date(order.createdAt).toLocaleDateString("en-AU")}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-white">${Number(order.total).toFixed(2)}</div>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${STATUS_COLORS[order.status] ?? "text-gray-400"}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {customerDetail.notes && (
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Notes</div>
                  <div className="text-sm text-gray-300">{customerDetail.notes}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
