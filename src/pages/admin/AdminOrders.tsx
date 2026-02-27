import { sampleOrders } from "@/data/products";

export default function AdminOrders() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Orders</h1>
      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-muted-foreground"><th className="py-3 px-4 text-left">Order ID</th><th className="py-3 px-4 text-left">Date</th><th className="py-3 px-4 text-left">Status</th><th className="py-3 px-4 text-left">Address</th><th className="py-3 px-4 text-right">Total</th></tr></thead>
          <tbody>
            {sampleOrders.map((o) => (
              <tr key={o.id} className="border-b border-border/50 hover:bg-secondary/30">
                <td className="py-3 px-4 font-medium">{o.id}</td>
                <td className="py-3 px-4 text-muted-foreground">{o.createdAt}</td>
                <td className="py-3 px-4"><span className="px-2 py-1 rounded-full text-xs capitalize bg-primary/10 text-primary">{o.status}</span></td>
                <td className="py-3 px-4 text-muted-foreground text-xs">{o.shippingAddress}</td>
                <td className="py-3 px-4 text-right font-bold">${o.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
