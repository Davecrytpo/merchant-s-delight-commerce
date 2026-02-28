import { useAdminOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import { useAdmin } from "@/hooks/useAdmin";
import { Navigate } from "react-router-dom";
import { Loader2, ExternalLink } from "lucide-react";
import { format } from "date-fns";

export default function AdminOrders() {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { data: orders, isLoading } = useAdminOrders();
  const updateStatus = useUpdateOrderStatus();

  if (adminLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  if (isAdmin === false) return <Navigate to="/" />;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Orders</h1>
      <div className="glass rounded-2xl overflow-hidden">
        {isLoading ? <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-3 px-4 text-left">Order ID</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Customer</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders?.map((o: any) => (
                <tr key={o.id} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="py-3 px-4 font-medium text-[10px]">{o.order_number}</td>
                  <td className="py-3 px-4 text-muted-foreground">{format(new Date(o.created_at), "MMM d, yyyy")}</td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-xs">{(o as any).profiles?.full_name || "Guest"}</p>
                    <p className="text-[10px] text-muted-foreground">{(o as any).profiles?.email}</p>
                  </td>
                  <td className="py-3 px-4">
                    <select 
                      value={o.status}
                      onChange={(e) => updateStatus.mutate({ id: o.id, status: e.target.value })}
                      className="bg-secondary rounded-lg px-2 py-1 text-xs outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right font-bold">${o.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
