import AdminLayout from "@/components/admin/AdminLayout";
import { products, orders } from "@/data/products";
import { DollarSign, ShoppingCart, Package, TrendingUp } from "lucide-react";

const stats = [
  {
    label: "Revenue",
    value: `$${orders.reduce((s, o) => s + o.total, 0).toFixed(2)}`,
    icon: DollarSign,
    change: "+12.5%",
  },
  {
    label: "Orders",
    value: orders.length.toString(),
    icon: ShoppingCart,
    change: "+3",
  },
  {
    label: "Products",
    value: products.filter((p) => p.status === "published").length.toString(),
    icon: Package,
    change: "5 published",
  },
  {
    label: "Avg Order",
    value: `$${(orders.reduce((s, o) => s + o.total, 0) / orders.length).toFixed(2)}`,
    icon: TrendingUp,
    change: "+5.2%",
  },
];

export default function Dashboard() {
  const recentOrders = orders.slice(0, 5);

  const statusColor: Record<string, string> = {
    pending: "bg-accent/20 text-accent",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-green-100 text-green-700",
    delivered: "bg-muted text-muted-foreground",
  };

  return (
    <AdminLayout>
      <h1 className="font-heading text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.change}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg">
        <div className="p-5 border-b border-border">
          <h2 className="font-heading text-lg font-semibold">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 font-medium text-muted-foreground">Order</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Customer</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Total</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="px-5 py-3 font-medium">{o.id}</td>
                  <td className="px-5 py-3">{o.customerName}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium">${o.total.toFixed(2)}</td>
                  <td className="px-5 py-3 text-muted-foreground">{o.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
