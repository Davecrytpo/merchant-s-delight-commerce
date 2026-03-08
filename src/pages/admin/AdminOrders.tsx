import { useState } from "react";
import { useAdminOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import { Loader2, Search } from "lucide-react";
import { format } from "date-fns";

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

export default function AdminOrders() {
  const { data: orders, isLoading } = useAdminOrders();
  const updateStatus = useUpdateOrderStatus();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = orders?.filter((o: any) => {
    const matchesTab = activeTab === "all" || o.status === activeTab;
    const matchesSearch = !search || o.order_number?.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/10 text-yellow-400";
      case "processing": return "bg-blue-500/10 text-blue-400";
      case "shipped": return "bg-purple-500/10 text-purple-400";
      case "delivered": return "bg-green-500/10 text-green-400";
      case "cancelled": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const tabCounts = STATUS_TABS.map(t => ({
    ...t,
    count: t.key === "all" ? (orders?.length || 0) : (orders?.filter((o: any) => o.status === t.key).length || 0),
  }));

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="font-display text-xl md:text-2xl font-bold">Orders</h1>

      {/* Status Tabs - horizontally scrollable */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
        {tabCounts.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === t.key
                ? "gold-gradient text-background shadow-lg shadow-primary/20"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label} <span className="ml-0.5 opacity-70">({t.count})</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-secondary rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
          placeholder="Search by order number..."
        />
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
        ) : !filtered.length ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No {activeTab !== "all" ? activeTab : ""} orders found</div>
        ) : (
          filtered.map((o: any) => (
            <div key={o.id} className="glass rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">{o.order_number}</p>
                  <p className="text-[10px] text-muted-foreground">{format(new Date(o.created_at), "MMM d, yyyy")}</p>
                </div>
                <p className="font-bold text-sm">${Number(o.total).toFixed(2)}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{(o as any).profiles?.full_name || "Guest"}</p>
                <select
                  value={o.status}
                  onChange={(e) => updateStatus.mutate({ id: o.id, status: e.target.value })}
                  className={`rounded-lg px-2 py-1 text-xs outline-none font-medium ${getStatusColor(o.status)} border-0`}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block glass rounded-2xl overflow-hidden overflow-x-auto">
        {isLoading ? (
          <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
        ) : !filtered.length ? (
          <div className="p-8 text-center text-muted-foreground">No {activeTab !== "all" ? activeTab : ""} orders found</div>
        ) : (
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-[10px] uppercase tracking-wider">
                <th className="py-3 px-4 text-left">Order #</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Customer</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o: any) => (
                <tr key={o.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-4 font-medium text-xs">{o.order_number}</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">{format(new Date(o.created_at), "MMM d, yyyy")}</td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-xs">{(o as any).profiles?.full_name || "Guest"}</p>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus.mutate({ id: o.id, status: e.target.value })}
                      className={`rounded-lg px-2 py-1 text-xs outline-none font-medium ${getStatusColor(o.status)} bg-opacity-20 border-0`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-xs">${Number(o.total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
