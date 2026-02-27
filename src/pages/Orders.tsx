import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { sampleOrders } from "@/data/products";
import { Package, Truck, CheckCircle, Clock, XCircle, ChevronRight, Eye } from "lucide-react";

const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
  pending: { icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  processing: { icon: Package, color: "text-blue-400", bg: "bg-blue-400/10" },
  shipped: { icon: Truck, color: "text-primary", bg: "bg-primary/10" },
  delivered: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-400/10" },
  cancelled: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
};

export default function Orders() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl font-bold">My <span className="gold-text">Orders</span></h1>
        <p className="text-muted-foreground mt-1">Track and manage your orders</p>
      </motion.div>

      <div className="space-y-4">
        {sampleOrders.map((order, i) => {
          const config = statusConfig[order.status];
          const StatusIcon = config.icon;
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
                  <h3 className="font-semibold">{order.id}</h3>
                  <p className="text-sm text-muted-foreground">{order.createdAt}</p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg}`}>
                  <StatusIcon className={`w-4 h-4 ${config.color}`} />
                  <span className={`text-sm font-medium capitalize ${config.color}`}>{order.status}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Total: <span className="text-foreground font-bold">${order.total.toFixed(2)}</span>
                </div>
                <div className="flex gap-2">
                  {order.trackingNumber && (
                    <Link to="/track-order" className="text-sm text-primary hover:underline flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" /> Track
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
