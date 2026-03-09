import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "shipped", label: "Shipped" },
  { key: "completed", label: "Completed" },
  { key: "rejected", label: "Rejected" },
];

export default function AdminReturns() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const { data: returns, isLoading } = useQuery({
    queryKey: ["admin-returns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("return_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("return_requests")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-returns"] });
      toast.success("Return status updated");
    },
  });

  const filtered = returns?.filter((r: any) => {
    const matchesTab = activeTab === "all" || r.status === activeTab;
    const matchesSearch = !search ||
      r.return_request_id?.toLowerCase().includes(search.toLowerCase()) ||
      r.order_number?.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/10 text-yellow-400";
      case "approved": return "bg-blue-500/10 text-blue-400";
      case "shipped": return "bg-purple-500/10 text-purple-400";
      case "completed": return "bg-green-500/10 text-green-400";
      case "rejected": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const tabCounts = STATUS_TABS.map(t => ({
    ...t,
    count: t.key === "all" ? (returns?.length || 0) : (returns?.filter((r: any) => r.status === t.key).length || 0),
  }));

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-3">
        <RotateCcw className="w-6 h-6 text-primary" />
        <h1 className="font-display text-xl md:text-2xl font-bold">Returns</h1>
      </div>

      {/* Status Tabs */}
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
          placeholder="Search by return ID or order number..."
        />
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
        ) : !filtered.length ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No returns found</div>
        ) : (
          filtered.map((r: any) => (
            <div key={r.id} className="glass rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">{r.return_request_id}</p>
                  <p className="text-[10px] text-muted-foreground">Order: {r.order_number}</p>
                </div>
                <p className="text-[10px] text-muted-foreground">{format(new Date(r.created_at), "MMM d, yyyy")}</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground capitalize">Reason: {r.reason?.replace(/_/g, " ")}</p>
                  <p className="text-xs text-muted-foreground capitalize">Resolution: {r.resolution}</p>
                </div>
                <select
                  value={r.status}
                  onChange={(e) => updateStatus.mutate({ id: r.id, status: e.target.value })}
                  className={`rounded-lg px-2 py-1 text-xs outline-none font-medium ${getStatusColor(r.status)} border-0`}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="shipped">Shipped</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block glass rounded-2xl overflow-hidden overflow-x-auto">
        {isLoading ? (
          <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
        ) : !filtered.length ? (
          <div className="p-8 text-center text-muted-foreground">No returns found</div>
        ) : (
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-[10px] uppercase tracking-wider">
                <th className="py-3 px-4 text-left">Return ID</th>
                <th className="py-3 px-4 text-left">Order #</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Reason</th>
                <th className="py-3 px-4 text-left">Resolution</th>
                <th className="py-3 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r: any) => (
                <tr key={r.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-4 font-medium text-xs">{r.return_request_id}</td>
                  <td className="py-3 px-4 text-xs">{r.order_number}</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">{format(new Date(r.created_at), "MMM d, yyyy")}</td>
                  <td className="py-3 px-4 text-xs capitalize">{r.reason?.replace(/_/g, " ")}</td>
                  <td className="py-3 px-4 text-xs capitalize">{r.resolution}</td>
                  <td className="py-3 px-4">
                    <select
                      value={r.status}
                      onChange={(e) => updateStatus.mutate({ id: r.id, status: e.target.value })}
                      className={`rounded-lg px-2 py-1 text-xs outline-none font-medium ${getStatusColor(r.status)} border-0`}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="shipped">Shipped</option>
                      <option value="completed">Completed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
