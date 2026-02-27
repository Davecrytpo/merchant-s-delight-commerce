import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Package, Truck, CheckCircle, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [tracking, setTracking] = useState<null | { status: string; steps: any[] }>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) { toast.error("Please enter an order number"); return; }
    setTracking({
      status: "shipped",
      steps: [
        { label: "Order Placed", date: "Feb 24, 2026 - 10:30 AM", done: true, icon: Package },
        { label: "Processing", date: "Feb 24, 2026 - 2:00 PM", done: true, icon: CheckCircle },
        { label: "Shipped", date: "Feb 25, 2026 - 9:15 AM", done: true, icon: Truck },
        { label: "Out for Delivery", date: "Estimated Feb 27", done: false, icon: MapPin },
        { label: "Delivered", date: "Estimated Feb 28", done: false, icon: CheckCircle },
      ],
    });
  };

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
          placeholder="Enter order number (e.g. ORD-2026-001)"
          className="flex-1 bg-secondary rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
        />
        <button type="submit" className="gold-gradient text-background font-semibold px-6 py-3 rounded-xl flex items-center gap-2 hover:opacity-90">
          <Search className="w-4 h-4" /> Track
        </button>
      </motion.form>

      {tracking && (
        <motion.div className="glass rounded-2xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="font-display text-xl font-bold mb-6">Order: {orderId}</h2>
          <div className="space-y-0">
            {tracking.steps.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step.done ? "gold-gradient" : "bg-secondary"}`}>
                    <step.icon className={`w-5 h-5 ${step.done ? "text-background" : "text-muted-foreground"}`} />
                  </div>
                  {i < tracking.steps.length - 1 && (
                    <div className={`w-0.5 h-12 ${step.done ? "bg-primary" : "bg-secondary"}`} />
                  )}
                </div>
                <div className="pb-8">
                  <p className={`font-semibold ${step.done ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                  <p className="text-sm text-muted-foreground">{step.date}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
