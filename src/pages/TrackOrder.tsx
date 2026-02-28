import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Package, Truck, CheckCircle, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const STATUS_STEPS = [
  { key: "pending", label: "Order Placed", icon: Package },
  { key: "processing", label: "Processing", icon: Clock },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "out_for_delivery", label: "Out for Delivery", icon: MapPin },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

const statusIndex: Record<string, number> = {
  pending: 0, processing: 1, shipped: 2, out_for_delivery: 3, delivered: 4,
};

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get("order") || "");
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orderId.trim()) { toast.error("Please enter an order number"); return; }
    setLoading(true);

    let query = supabase.from("orders").select("*").eq("order_number", orderId.trim());
    if (user) query = query.eq("user_id", user.id);
    
    const { data, error } = await query.maybeSingle();
    if (error || !data) {
      toast.error("Order not found. Please check the order number.");
      setOrder(null);
    } else {
      setOrder(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (searchParams.get("order")) handleTrack();
  }, []);

  const currentStep = order ? (statusIndex[order.status] ?? 0) : -1;

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="font-display text-4xl font-bold mb-3">Track Your <span className="gold-text">Order</span></h1>
        <p className="text-muted-foreground">Enter your order number to see real-time shipping updates</p>
      </motion.div>

      <motion.form onSubmit={handleTrack} className="flex gap-3 mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <input
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Enter order number (e.g. ORD-ABC123)"
          className="flex-1 bg-secondary rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
        />
        <button type="submit" disabled={loading} className="gold-gradient text-background font-semibold px-6 py-3 rounded-xl flex items-center gap-2 hover:opacity-90 disabled:opacity-50">
          <Search className="w-4 h-4" /> {loading ? "..." : "Track"}
        </button>
      </motion.form>

      {order && (
        <motion.div className="glass rounded-2xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-bold">{order.order_number}</h2>
              <p className="text-sm text-muted-foreground">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
            </div>
            <span className="text-lg font-bold">${Number(order.total).toFixed(2)}</span>
          </div>

          <div className="space-y-0">
            {STATUS_STEPS.map((step, i) => {
              const done = i <= currentStep;
              const StepIcon = step.icon;
              return (
                <div key={step.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${done ? "gold-gradient" : "bg-secondary"}`}>
                      <StepIcon className={`w-5 h-5 ${done ? "text-background" : "text-muted-foreground"}`} />
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`w-0.5 h-12 ${done ? "bg-primary" : "bg-secondary"}`} />
                    )}
                  </div>
                  <div className="pb-8">
                    <p className={`font-semibold ${done ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {done && i === currentStep ? "Current status" : done ? "Completed" : "Pending"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {order.tracking_number && (
            <div className="mt-4 p-3 bg-secondary/50 rounded-xl text-sm">
              <span className="text-muted-foreground">Tracking: </span>
              <span className="font-mono font-medium">{order.tracking_number}</span>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
