import AdminLayout from "@/components/admin/AdminLayout";
import { orders } from "@/data/products";

export default function AdminOrders() {
  const statusColor: Record<string, string> = {
    pending: "bg-accent/20 text-accent",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-green-100 text-green-700",
    delivered: "bg-muted text-muted-foreground",
  };

  return (
    <AdminLayout>
      <h1 className="font-heading text-2xl font-bold mb-6">Orders</h1>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 font-medium text-muted-foreground">Order</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Customer</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Items</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Total</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Date</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Shipping</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer">
                  <td className="px-5 py-3 font-medium">{o.id}</td>
                  <td className="px-5 py-3">
                    <div>
                      <span>{o.customerName}</span>
                      <p className="text-xs text-muted-foreground">{o.customerEmail}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {o.items.map((i, idx) => (
                      <div key={idx} className="text-xs">
                        {i.quantity}x {i.productName} ({i.variant})
                      </div>
                    ))}
                  </td>
                  <td className="px-5 py-3 font-medium">${o.total.toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{o.createdAt}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{o.shippingAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
