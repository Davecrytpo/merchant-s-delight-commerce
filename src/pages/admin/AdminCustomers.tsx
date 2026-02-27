export default function AdminCustomers() {
  const customers = [
    { id: 1, name: "Alex Morgan", email: "alex@email.com", orders: 5, spent: "$1,245" },
    { id: 2, name: "Sarah Kim", email: "sarah@email.com", orders: 3, spent: "$687" },
    { id: 3, name: "David Lee", email: "david@email.com", orders: 8, spent: "$2,340" },
    { id: 4, name: "Emma Wilson", email: "emma@email.com", orders: 2, spent: "$318" },
  ];
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Customers</h1>
      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-muted-foreground"><th className="py-3 px-4 text-left">Name</th><th className="py-3 px-4 text-left">Email</th><th className="py-3 px-4 text-left">Orders</th><th className="py-3 px-4 text-right">Total Spent</th></tr></thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/30">
                <td className="py-3 px-4 font-medium">{c.name}</td>
                <td className="py-3 px-4 text-muted-foreground">{c.email}</td>
                <td className="py-3 px-4">{c.orders}</td>
                <td className="py-3 px-4 text-right font-bold">{c.spent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
