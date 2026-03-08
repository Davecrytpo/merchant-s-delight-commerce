import { motion } from "framer-motion";
import { DollarSign, ShoppingCart, Users, Package, ArrowUpRight, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAdminOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: orders, isLoading: ordersLoading } = useAdminOrders();
  const { data: products } = useProducts();

  const totalRevenue = orders?.reduce((acc: number, o: any) => acc + o.total, 0) || 0;
  const totalOrders = orders?.length || 0;
  const totalProducts = products?.length || 0;
  const uniqueCustomers = new Set(orders?.map((o: any) => o.user_id)).size || 0;

  const stats = [
    { label: "Revenue", value: `$${totalRevenue.toFixed(2)}`, change: "+12.5%", icon: DollarSign },
    { label: "Orders", value: totalOrders.toString(), change: "+8.2%", icon: ShoppingCart },
    { label: "Customers", value: uniqueCustomers.toString(), change: "+15.3%", icon: Users },
    { label: "Products", value: totalProducts.toString(), change: "+2", icon: Package },
  ];

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return format(d, "EEE");
  }).reverse();

  const chartData = last7Days.map(day => {
    const dailyOrders = orders?.filter((o: any) => format(new Date(o.created_at), "EEE") === day) || [];
    const revenue = dailyOrders.reduce((acc: number, o: any) => acc + o.total, 0);
    return { name: day, revenue, orders: dailyOrders.length };
  });

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="font-display text-xl md:text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={i} className="glass rounded-xl md:rounded-2xl p-3 md:p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div className="flex justify-between items-start mb-2 md:mb-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl gold-gradient flex items-center justify-center"><s.icon className="w-4 h-4 md:w-5 md:h-5 text-background" /></div>
              <span className="text-[10px] md:text-xs text-green-400 flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" />{s.change}</span>
            </div>
            <p className="text-lg md:text-2xl font-bold truncate">{s.value}</p>
            <p className="text-xs md:text-sm text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="glass rounded-xl md:rounded-2xl p-3 md:p-5">
        <h2 className="font-semibold text-sm md:text-base mb-3 md:mb-4">Revenue This Week</h2>
        <div className="h-[180px] md:h-[250px] w-full">
          {ordersLoading ? <div className="h-full flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div> : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} width={35} />
                <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, fontSize: 12 }} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
                <Bar dataKey="revenue" fill="hsl(42, 100%, 50%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="glass rounded-xl md:rounded-2xl p-3 md:p-5">
        <h2 className="font-semibold text-sm md:text-base mb-3 md:mb-4">Recent Orders</h2>
        
        {/* Mobile card view */}
        <div className="md:hidden space-y-3">
          {ordersLoading ? <div className="py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div> : 
            orders?.slice(0, 5).map((o: any) => (
              <div key={o.id} className="bg-secondary/30 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-xs">{o.order_number}</p>
                  <p className="text-[10px] text-muted-foreground">{format(new Date(o.created_at), "MMM d, yyyy")}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xs">${o.total.toFixed(2)}</p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] capitalize bg-primary/10 text-primary">{o.status}</span>
                </div>
              </div>
            ))
          }
        </div>

        {/* Desktop table view */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-[10px] uppercase tracking-wider">
                <th className="py-2 text-left">Order #</th>
                <th className="py-2 text-left">Date</th>
                <th className="py-2 text-left">Status</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {ordersLoading ? <tr><td colSpan={4} className="py-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr> : 
                orders?.slice(0, 5).map((o: any) => (
                  <tr key={o.id} className="border-b border-border/50">
                    <td className="py-3 font-medium text-xs">{o.order_number}</td>
                    <td className="py-3 text-muted-foreground text-xs">{format(new Date(o.created_at), "MMM d, yyyy")}</td>
                    <td className="py-3"><span className="px-2 py-1 rounded-full text-xs capitalize bg-primary/10 text-primary">{o.status}</span></td>
                    <td className="py-3 text-right font-bold text-xs">${o.total.toFixed(2)}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
