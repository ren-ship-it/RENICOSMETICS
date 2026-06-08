import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3,
  MessageSquare, Mail, Settings, LogOut, Menu, X, ChevronRight,
  AlertTriangle, Bell, ExternalLink, Sparkles, FileText, Tag, ShieldCheck, Image, Wand2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const NAV_ITEMS: Array<{ label: string; href: string; icon: any; devOnly?: boolean }> = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Intelligence", href: "/admin/intelligence", icon: Sparkles },
  { label: "AI Proposals", href: "/admin/ai-proposals", icon: Wand2 },
  { label: "Content", href: "/admin/content", icon: FileText },
  { label: "Media", href: "/admin/media", icon: Image },
  { label: "Discounts", href: "/admin/discounts", icon: Tag },
  { label: "Messages", href: "/admin/messages", icon: MessageSquare },
  { label: "Subscribers", href: "/admin/subscribers", icon: Mail },
  { label: "Chat Logs", href: "/admin/chat-logs", icon: MessageSquare },
  { label: "Security", href: "/admin/security", icon: ShieldCheck },
  // Internal load-testing tool — hidden from the nav in production so it can't be
  // triggered accidentally (the route itself remains admin-gated).
  { label: "Stress Test", href: "/admin/stress-test", icon: AlertTriangle, devOnly: true },
];

const VISIBLE_NAV = NAV_ITEMS.filter(item => !item.devOnly || !import.meta.env.PROD);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: stats } = trpc.admin.stats.useQuery(undefined, { refetchInterval: 60000 });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading admin...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
        <div className="text-center max-w-sm mx-auto px-6">
          <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">Access Restricted</h1>
          <p className="text-gray-400 text-sm mb-6">This area is for Reni Cosmetics administrators only.</p>
          <Link href="/">
            <Button className="bg-[#C9A96E] hover:bg-[#b8955a] text-black">Return to Store</Button>
          </Link>
        </div>
      </div>
    );
  }

  const Sidebar = ({ mobile = false }) => (
    <aside className={`${mobile ? "w-full" : "w-64"} flex flex-col h-full bg-[#111111] border-r border-white/8`}>
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/8">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold tracking-widest text-[#C9A96E] uppercase mb-0.5">Reni Cosmetics</div>
            <div className="text-[11px] text-gray-500">Admin Dashboard</div>
          </div>
          {mobile && (
            <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Alert badges */}
      {((stats?.pendingOrders ?? 0) > 0 || (stats?.lowStockCount ?? 0) > 0) && (
        <div className="px-4 py-3 space-y-1.5 border-b border-white/8">
          {(stats?.pendingOrders ?? 0) > 0 && (
            <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-400/10 rounded px-2.5 py-1.5">
              <Bell size={11} />
              <span>{stats!.pendingOrders} pending order{stats!.pendingOrders !== 1 ? "s" : ""}</span>
            </div>
          )}
          {(stats?.lowStockCount ?? 0) > 0 && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-400/10 rounded px-2.5 py-1.5">
              <AlertTriangle size={11} />
              <span>{stats!.lowStockCount} low stock item{stats!.lowStockCount !== 1 ? "s" : ""}</span>
            </div>
          )}
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {VISIBLE_NAV.map(item => {
          const Icon = item.icon;
          const active = location === item.href || (item.href !== "/admin" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}>
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer group ${
                active
                  ? "bg-[#C9A96E]/15 text-[#C9A96E]"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}>
                <Icon size={16} className={active ? "text-[#C9A96E]" : "text-gray-500 group-hover:text-gray-300"} />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight size={12} className="text-[#C9A96E]/60" />}
                {item.label === "Orders" && (stats?.pendingOrders ?? 0) > 0 && (
                  <Badge className="bg-amber-500 text-black text-[10px] h-4 px-1.5 min-w-4">{stats!.pendingOrders}</Badge>
                )}
                {item.label === "Products" && (stats?.lowStockCount ?? 0) > 0 && (
                  <Badge className="bg-red-500 text-white text-[10px] h-4 px-1.5 min-w-4">{stats!.lowStockCount}</Badge>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom: view store + user */}
      <div className="px-3 pb-4 space-y-1 border-t border-white/8 pt-3">
        <Link href="/" target="_blank">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer transition-all">
            <ExternalLink size={16} className="text-gray-500" />
            <span>View Store</span>
          </div>
        </Link>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
          <div className="w-7 h-7 rounded-full bg-[#C9A96E]/20 flex items-center justify-center text-[#C9A96E] text-xs font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-white truncate">{user?.name ?? "Admin"}</div>
            <div className="text-[10px] text-gray-500 truncate">{user?.email ?? ""}</div>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen flex bg-[#0f0f0f]">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col w-64 flex-shrink-0 fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 flex flex-col">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-[#111111] border-b border-white/8 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white">
            <Menu size={20} />
          </button>
          <span className="text-sm font-medium text-white">Reni Admin</span>
        </div>

        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
