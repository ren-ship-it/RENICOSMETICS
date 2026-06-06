import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { useMemo } from "react";
import {
  DollarSign, ShoppingCart, Users, Package,
  TrendingUp, AlertTriangle, Clock, CheckCircle2,
  ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  processing: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  shipped: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  delivered: "bg-green-500/15 text-green-400 border-green-500/20",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/20",
  refunded: "bg-gray-500/15 text-gray-400 border-gray-500/20",
};

function KPICard({ title, value, icon: Icon, sub, trend, color = "#C9A96E" }: {
  title: string; value: string | number; icon: any; sub?: string; trend?: number; color?: string;
}) {
  return (
    <div className="bg-[#1a1a1a] border border-white/8 rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon size={18} style={{ color }} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? "text-green-400" : "text-red-400"}`}>
            {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-gray-500">{title}</div>
      {sub && <div className="text-[11px] text-gray-600 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function AdminOverview() {
  const { data: stats, isLoading: statsLoading } = trpc.admin.stats.useQuery();
  const { data: revenueData } = trpc.admin.revenueByDay.useQuery({ days: 30 });
  const { data: recentOrders } = trpc.admin.recentOrders.useQuery({ limit: 8 });
  const { data: topProducts } = trpc.admin.topProducts.useQuery({ limit: 5 });
  const { data: lowStock } = trpc.products.lowStock.useQuery();

  const chartData = useMemo(() => {
    if (!revenueData) return [];
    return revenueData.map(d => ({
      date: new Date(d.date).toLocaleDateString("en-AU", { month: "short", day: "numeric" }),
      revenue: Number(d.revenue ?? 0),
      orders: d.orderCount,
    }));
  }, [revenueData]);

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back. Here's what's happening with Reni Cosmetics.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Revenue"
            value={statsLoading ? "..." : `$${(stats?.totalRevenue ?? 0).toLocaleString("en-AU", { minimumFractionDigits: 0 })}`}
            icon={DollarSign}
            sub="All time, paid orders"
            color="#C9A96E"
          />
          <KPICard
            title="Total Orders"
            value={statsLoading ? "..." : stats?.totalOrders ?? 0}
            icon={ShoppingCart}
            sub={`${stats?.pendingOrders ?? 0} pending`}
            color="#818cf8"
          />
          <KPICard
            title="Customers"
            value={statsLoading ? "..." : stats?.totalCustomers ?? 0}
            icon={Users}
            sub="Registered accounts"
            color="#34d399"
          />
          <KPICard
            title="Products"
            value={statsLoading ? "..." : stats?.totalProducts ?? 0}
            icon={Package}
            sub={`${stats?.lowStockCount ?? 0} low stock`}
            color="#f472b6"
          />
        </div>

        {/* Revenue Chart + Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-[#1a1a1a] border border-white/8 rounded-xl p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-semibold text-white">Revenue (30 days)</h2>
                <p className="text-xs text-gray-500 mt-0.5">Paid orders only</p>
              </div>
              <TrendingUp size={16} className="text-[#C9A96E]" />
            </div>
            {chartData.length === 0 ? (
              <div className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp size={32} className="text-gray-700 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No revenue data yet</p>
                  <p className="text-[11px] text-gray-600 mt-1">Revenue will appear here once orders are placed</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9A96E" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C9A96E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip
                    contentStyle={{ background: "#1f1f1f", border: "1px solid #ffffff15", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: "#9ca3af" }}
                    formatter={(v: any) => [`$${Number(v).toFixed(2)}`, "Revenue"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#C9A96E" strokeWidth={2} fill="url(#revenueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top Products */}
          <div className="bg-[#1a1a1a] border border-white/8 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Top Products</h2>
            {!topProducts || topProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <Package size={28} className="text-gray-700 mb-2" />
                <p className="text-xs text-gray-500">No sales data yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div key={p.productSlug ?? i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-[#C9A96E]/10 flex items-center justify-center text-[#C9A96E] text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-white truncate">{p.productName}</div>
                      <div className="text-[10px] text-gray-500">{p.totalQty} units sold</div>
                    </div>
                    <div className="text-xs font-semibold text-[#C9A96E]">${Number(p.totalRevenue ?? 0).toFixed(0)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders + Low Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-[#1a1a1a] border border-white/8 rounded-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <h2 className="text-sm font-semibold text-white">Recent Orders</h2>
              <Link href="/admin/orders">
                <span className="text-xs text-[#C9A96E] hover:text-[#b8955a] cursor-pointer">View all</span>
              </Link>
            </div>
            <div className="divide-y divide-white/5">
              {!recentOrders || recentOrders.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <ShoppingCart size={28} className="text-gray-700 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No orders yet</p>
                  <p className="text-[11px] text-gray-600 mt-1">Orders will appear here once customers purchase</p>
                </div>
              ) : (
                recentOrders.map(order => (
                  <Link key={order.id} href={`/admin/orders/${order.id}`}>
                    <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/3 cursor-pointer transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">{order.orderNumber}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${STATUS_COLORS[order.status] ?? ""}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5 truncate">{order.customerName ?? order.customerEmail}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-semibold text-white">${Number(order.total).toFixed(2)}</div>
                        <div className="text-[10px] text-gray-600">{new Date(order.createdAt).toLocaleDateString("en-AU")}</div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Low Stock */}
          <div className="bg-[#1a1a1a] border border-white/8 rounded-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <h2 className="text-sm font-semibold text-white">Stock Alerts</h2>
              <Link href="/admin/products">
                <span className="text-xs text-[#C9A96E] hover:text-[#b8955a] cursor-pointer">Manage</span>
              </Link>
            </div>
            <div className="divide-y divide-white/5">
              {!lowStock || lowStock.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <CheckCircle2 size={28} className="text-green-500/50 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">All products well-stocked</p>
                </div>
              ) : (
                lowStock.map(p => (
                  <Link key={p.id} href={`/admin/products/${p.id}`}>
                    <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/3 cursor-pointer transition-colors">
                      <AlertTriangle size={14} className={p.stockQty === 0 ? "text-red-400" : "text-amber-400"} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-white truncate">{p.name}</div>
                        <div className={`text-[10px] font-semibold ${p.stockQty === 0 ? "text-red-400" : "text-amber-400"}`}>
                          {p.stockQty === 0 ? "Out of stock" : `${p.stockQty} remaining`}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
