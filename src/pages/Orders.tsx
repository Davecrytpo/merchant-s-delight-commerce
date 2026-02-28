import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Package, Truck, CheckCircle, Clock, ChevronRight, Loader2, ArrowLeft } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

export default function Orders() {
  const { user } = useAuth();
  const { data: orders, isLoading } = useOrders(user?.id);

  if (!user) return <div className="min-h-screen flex items-center justify-center">Please login to view your orders.</div>;

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-10">
          <Link to="/account" className="w-10 h-10 rounded-full glass flex items-center justify-center hover:text-primary transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="font-display text-4xl font-bold">Your <span className="gold-text">Orders</span></h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : !orders || orders.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center space-y-6">
            <div className="w-20 h-20 rounded-full gold-gradient flex items-center justify-center mx-auto opacity-50"><Package className="w-10 h-10 text-background" /></div>
            <h2 className="text-2xl font-bold">No orders yet</h2>
            <p className="text-muted-foreground">You haven't placed any orders yet. Start shopping to see your history here!</p>
            <Link to="/shop" className="gold-gradient text-background font-bold px-8 py-3 rounded-xl inline-block">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any, i) => (
              <motion.div key={order.id} className="glass rounded-3xl overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Order #{order.order_number}</p>
                    <p className="text-sm">Placed on {format(new Date(order.created_at), "MMMM d, yyyy")}</p>
                    <div className="flex items-center gap-2 mt-4">
                      {order.status === "delivered" ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Clock className="w-4 h-4 text-primary" />}
                      <span className={`text-xs font-bold uppercase tracking-tighter ${order.status === "delivered" ? "text-green-400" : "text-primary"}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Total</p>
                      <p className="text-2xl font-bold gold-text">${order.total.toFixed(2)}</p>
                    </div>
                    <Link to={`/track-order?id=${order.order_number}`} className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all">
                      <ChevronRight className="w-6 h-6" />
                    </Link>
                  </div>
                </div>
                <div className="bg-secondary/30 px-6 py-4 border-t border-border/50">
                  <div className="flex -space-x-4">
                    {order.items?.map((item: any, idx: number) => (
                      <div key={idx} className="w-12 h-12 rounded-lg bg-card border border-border overflow-hidden ring-2 ring-background">
                         <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">SHOE</div>
                      </div>
                    ))}
                    {order.items?.length > 4 && (
                      <div className="w-12 h-12 rounded-lg glass flex items-center justify-center text-xs font-bold ring-2 ring-background">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
