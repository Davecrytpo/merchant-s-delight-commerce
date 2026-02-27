import { motion } from "framer-motion";
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, ArrowUpRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { sampleOrders } from "@/data/products";

const stats = [
  { label: "Revenue", value: "$24,580", change: "+12.5%", icon: DollarSign },
  { label: "Orders", value: "156", change: "+8.2%", icon: ShoppingCart },
  { label: "Customers", value: "1,245", change: "+15.3%", icon: Users },
  { label: "Products", value: "12", change: "+2", icon: Package },
];

const chartData = [
  { name: "Mon", revenue: 4000, orders: 24 },
  { name: "Tue", revenue: 3200, orders: 18 },
  { name: "Wed", revenue: 5800, orders: 35 },
  { name: "Thu", revenue: 4500, orders: 28 },
  { name: "Fri", revenue: 6200, orders: 42 },
  { name: "Sat", revenue: 7800, orders: 55 },
  { name: "Sun", revenue: 5400, orders: 38 },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={i} className="glass rounded-2xl p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div className="flex justify-between items-start mb-3">
              <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center"><s.icon className="w-5 h-5 text-background" /></div>
              <span className="text-xs text-green-400 flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" />{s.change}</span>
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-5">
          <h2 className="font-semibold mb-4">Revenue This Week</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8 }} />
              <Bar dataKey="revenue" fill="hsl(42, 100%, 50%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass rounded-2xl p-5">
          <h2 className="font-semibold mb-4">Orders This Week</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <XAxis dataKey="name" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8 }} />
              <Line type="monotone" dataKey="orders" stroke="hsl(42, 100%, 50%)" strokeWidth={2} dot={{ fill: "hsl(42, 100%, 50%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <h2 className="font-semibold mb-4">Recent Orders</h2>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-muted-foreground"><th className="py-2 text-left">Order</th><th className="py-2 text-left">Date</th><th className="py-2 text-left">Status</th><th className="py-2 text-right">Total</th></tr></thead>
          <tbody>
            {sampleOrders.map((o) => (
              <tr key={o.id} className="border-b border-border/50"><td className="py-3 font-medium">{o.id}</td><td className="py-3 text-muted-foreground">{o.createdAt}</td><td className="py-3"><span className="px-2 py-1 rounded-full text-xs capitalize bg-primary/10 text-primary">{o.status}</span></td><td className="py-3 text-right font-bold">${o.total}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
