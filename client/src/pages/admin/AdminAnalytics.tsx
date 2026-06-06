import { useState, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { TrendingUp, DollarSign, ShoppingCart, Users, Package } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Button } from "@/components/ui/button";

const COLORS = ["#C9A96E", "#818cf8", "#34d399", "#f472b6", "#fb923c"];

export default function AdminAnalytics() {
  const [days, setDays] = useState(30);

  const { data: stats } = trpc.admin.stats.useQuery();
  const { data: revenueData } = trpc.admin.revenueByDay.useQuery({ days });
  const { data: topProducts } = trpc.admin.topProducts.useQuery({ limit: 5 });

  const chartData = useMemo(() => {
    if (!revenueData) return [];
    return revenueData.map(d => ({
      date: new Date(d.date).toLocaleDateString("en-AU", { month: "short", day: "numeric" }),
      revenue: Number(d.revenue ?? 0),
      orders: Number(d.orderCount ?? 0),
    }));
  }, [revenueData]);

  const pieData = useMemo(() => {
    if (!topProducts) return [];
    return topProducts.map(p => ({
      name: p.productName ?? "Unknown",
      value: Number(p.totalRevenue ?? 0),
    }));
  }, [topProducts]);

  const avgOrderValue = stats && stats.totalOrders > 0
    ? (stats.totalRevenue / stats.totalOrders).toFixed(2)
    : "0.00";

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-[#1f1f1f] border border-white/15 rounded-lg p-3 text-xs">
        <p className="text-gray-400 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
            {p.dataKey === "revenue" ? `$${Number(p.value).toFixed(2)}` : p.value} {p.name}
          </p>
        ))}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">Store performance and revenue insights</p>
          </div>
          <div className="flex gap-2">
            {[7, 30, 90].map(d => (
              <Button
                key={d}
                size="sm"
                variant={days === d ? "default" : "outline"}
                onClick={() => setDays(d)}
                className={days === d ? "bg-[#C9A96E] text-black hover:bg-[#b8955a]" : "border-white/15 text-gray-400 hover:text-white bg-transparent"}
              >
                {d}d
              </Button>
            ))}
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Revenue", value: `$${(stats?.totalRevenue ?? 0).toLocaleString("en-AU", { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "#C9A96E" },
            { label: "Total Orders", value: stats?.totalOrders ?? 0, icon: ShoppingCart, color: "#818cf8" },
            { label: "Avg Order Value", value: `$${avgOrderValue}`, icon: TrendingUp, color: "#34d399" },
            { label: "Total Customers", value: stats?.totalCustomers ?? 0, icon: Users, color: "#f472b6" },
          ].map(kpi => (
            <div key={kpi.label} className="bg-[#1a1a1a] border border-white/8 rounded-xl p-5">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: `${kpi.color}18` }}>
                <kpi.icon size={16} style={{ color: kpi.color }} />
              </div>
              <div className="text-2xl font-bold text-white">{kpi.value}</div>
              <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="bg-[#1a1a1a] border border-white/8 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-5">Revenue over {days} days</h2>
          {chartData.length === 0 ? (
            <div className="h-56 flex items-center justify-center">
              <div className="text-center">
                <TrendingUp size={36} className="text-gray-700 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No revenue data for this period</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A96E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C9A96E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#C9A96E" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Orders Chart + Product Revenue Pie */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders Bar Chart */}
          <div className="bg-[#1a1a1a] border border-white/8 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-5">Orders per day</h2>
            {chartData.length === 0 ? (
              <div className="h-48 flex items-center justify-center">
                <p className="text-sm text-gray-500">No data</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="orders" name="Orders" fill="#818cf8" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Revenue by Product */}
          <div className="bg-[#1a1a1a] border border-white/8 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-5">Revenue by product</h2>
            {pieData.length === 0 ? (
              <div className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <Package size={28} className="text-gray-700 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No sales data yet</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => [`$${Number(v).toFixed(2)}`, "Revenue"]} contentStyle={{ background: "#1f1f1f", border: "1px solid #ffffff15", borderRadius: 8, fontSize: 12 }} />
                  <Legend formatter={(value) => <span style={{ color: "#9ca3af", fontSize: 11 }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Products Table */}
        <div className="bg-[#1a1a1a] border border-white/8 rounded-xl">
          <div className="px-5 py-4 border-b border-white/8">
            <h2 className="text-sm font-semibold text-white">Top Products by Revenue</h2>
          </div>
          <div className="divide-y divide-white/5">
            {!topProducts || topProducts.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm text-gray-500">No sales data yet</p>
              </div>
            ) : (
              topProducts.map((p, i) => {
                const maxRevenue = Number(topProducts[0]?.totalRevenue ?? 1);
                const pct = (Number(p.totalRevenue ?? 0) / maxRevenue) * 100;
                return (
                  <div key={p.productSlug ?? i} className="px-5 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-[#C9A96E]/10 flex items-center justify-center text-[#C9A96E] text-xs font-bold">{i + 1}</div>
                        <span className="text-sm font-medium text-white">{p.productName}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-400">{p.totalQty} units</span>
                        <span className="font-semibold text-white">${Number(p.totalRevenue ?? 0).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#C9A96E]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
