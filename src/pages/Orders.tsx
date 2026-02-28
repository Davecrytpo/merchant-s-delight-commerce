import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Package, Truck, CheckCircle, Clock, XCircle, ShoppingBag } from "lucide-react";

interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  total: number;
  items: any[];
  created_at: string;
  tracking_number: string | null;
}

const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
  pending: { icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  processing: { icon: Package, color: "text-blue-400", bg: "bg-blue-400/10" },
  shipped: { icon: Truck, color: "text-primary", bg: "bg-primary/10" },
  delivered: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-400/10" },
  cancelled: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
};

export default function Orders() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const fetchOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (data) setOrders(data as OrderRow[]);
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center">
        <div>
          <h1 className="font-display text-3xl font-bold mb-3">Sign In to View Orders</h1>
          <Link to="/account" className="gold-gradient text-background font-semibold px-8 py-3 rounded-xl inline-block">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl font-bold">My <span className="gold-text">Orders</span></h1>
        <p className="text-muted-foreground mt-1">Track and manage your orders</p>
      </motion.div>

      {orders.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
          <Link to="/shop" className="gold-gradient text-background font-semibold px-8 py-3 rounded-xl inline-block">
            Browse Shoes
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => {
            const config = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            const itemCount = Array.isArray(order.items) ? order.items.length : 0;
            return (
              <motion.div
                key={order.id}
                className="glass rounded-2xl p-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{order.order_number}</h3>
                    <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()} · {itemCount} item{itemCount !== 1 ? "s" : ""}</p>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg}`}>
                    <StatusIcon className={`w-4 h-4 ${config.color}`} />
                    <span className={`text-sm font-medium capitalize ${config.color}`}>{order.status}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    Total: <span className="text-foreground font-bold">${Number(order.total).toFixed(2)}</span>
                  </div>
                  {order.tracking_number && (
                    <Link to={`/track-order?order=${order.order_number}`} className="text-sm text-primary hover:underline flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" /> Track
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
