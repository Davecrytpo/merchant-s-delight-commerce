import { useMemo } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { useAdminOrders } from "@/hooks/useOrders";
import { Navigate } from "react-router-dom";
import { Loader2, Users } from "lucide-react";

export default function AdminCustomers() {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { data: orders, isLoading } = useAdminOrders();

  const customers = useMemo(() => {
    if (!orders) return [];
    const map = new Map<string, { name: string; email: string; orders: number; spent: number }>();
    orders.forEach((o: any) => {
      const uid = o.user_id || "guest";
      const existing = map.get(uid);
      if (existing) {
        existing.orders += 1;
        existing.spent += Number(o.total);
      } else {
        map.set(uid, {
          name: o.profiles?.full_name || "Guest",
          email: o.profiles?.email || "—",
          orders: 1,
          spent: Number(o.total),
        });
      }
    });
    return Array.from(map.entries()).map(([id, data]) => ({ id, ...data }));
  }, [orders]);

  if (adminLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  if (isAdmin === false) return <Navigate to="/" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-2xl font-bold">Customers</h1>
        <span className="text-sm text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{customers.length}</span>
      </div>
      <div className="glass rounded-2xl overflow-hidden overflow-x-auto">
        {isLoading ? (
          <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
        ) : !customers.length ? (
          <div className="p-8 text-center text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No customers yet. Orders will populate this list.</p>
          </div>
        ) : (
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-[10px] uppercase tracking-wider">
                <th className="py-3 px-4 text-left">Customer</th>
                <th className="py-3 px-4 text-left">Orders</th>
                <th className="py-3 px-4 text-right">Total Spent</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-medium text-sm">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                  </td>
                  <td className="py-3 px-4 font-medium">{c.orders}</td>
                  <td className="py-3 px-4 text-right font-bold">${c.spent.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
