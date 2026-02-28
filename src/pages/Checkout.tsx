import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Check, CreditCard, Lock, Truck, MapPin, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useShippingMethods } from "@/hooks/useShipping";

const STEPS = ["Shipping", "Carrier", "Payment", "Review"];

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, profile } = useAuth();
  const { data: shippingMethods, isLoading: shippingLoading } = useShippingMethods();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: profile?.full_name?.split(" ")[0] || "",
    lastName: profile?.full_name?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
    phone: profile?.phone || "",
    address: profile?.address_line1 || "",
    city: profile?.city || "",
    state: profile?.state || "",
    zip: profile?.zip_code || "",
    country: "US",
    cardNumber: "", cardExpiry: "", cardCvc: "", cardName: "",
  });

  const selectedMethod = useMemo(() => 
    shippingMethods?.find(m => m.id === selectedMethodId) || shippingMethods?.[0]
  , [shippingMethods, selectedMethodId]);

  const shippingCost = useMemo(() => {
    if (!selectedMethod) return 0;
    if (selectedMethod.min_order_amount && totalPrice >= selectedMethod.min_order_amount) return 0;
    return Number(selectedMethod.price);
  }, [selectedMethod, totalPrice]);

  const tax = totalPrice * 0.08;
  const total = totalPrice + shippingCost + tax;

  const update = (key: string, value: string) => setFormData((prev) => ({ ...prev, [key]: value }));

  const validateStep = (s: number): boolean => {
    if (s === 0) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.address || !formData.city || !formData.state || !formData.zip) { 
        toast.error("Please fill in all shipping fields");
        return false;
      }
    }
    if (s === 1 && !selectedMethod) {
      toast.error("Please select a shipping method");
      return false;
    }
    if (s === 2) {
      if (!formData.cardName || !formData.cardNumber || !formData.cardExpiry || !formData.cardCvc) {
        toast.error("Please fill in all payment fields");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to place an order");
      navigate("/account");
      return;
    }
    setSubmitting(true);
    const orderNum = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const orderItems = items.map((i) => ({
      product_id: i.product.id,
      product_name: i.product.name,
      variant_size: i.variant.size,
      variant_color: i.variant.color,
      quantity: i.quantity,
      price: i.variant.price,
    }));

    const { error } = await supabase.from("orders").insert({
      user_id: user.id,
      order_number: orderNum,
      status: "pending",
      items: orderItems,
      subtotal: totalPrice,
      shipping: shippingCost,
      tax,
      total,
      shipping_address: {
        name: `${formData.firstName} ${formData.lastName}`,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        country: formData.country,
        carrier: selectedMethod?.carrier,
        method: selectedMethod?.name
      },
      payment_method: "card",
    });

    if (error) {
      toast.error("Failed to place order. Please try again.");
    } else {
      setOrderNumber(orderNum);
      setOrderPlaced(true);
      clearCart();
      toast.success("Order placed successfully! 🎊");
    }
    setSubmitting(false);
  };

  if (orderPlaced) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-20 h-20 rounded-full gold-gradient flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-background" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-3">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-2">Thank you for your purchase</p>
          <p className="text-primary font-semibold mb-6">Order: {orderNumber}</p>
          <div className="flex gap-3 justify-center">
            <Link to="/orders" className="gold-gradient text-background font-semibold px-6 py-3 rounded-xl inline-block">
              View Orders
            </Link>
            <Link to="/shop" className="bg-secondary text-foreground font-semibold px-6 py-3 rounded-xl inline-block">
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const inputClass = "w-full bg-secondary rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>

      <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-4">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              i <= step ? "gold-gradient text-background" : "bg-secondary text-muted-foreground"
            }`}>
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-sm font-medium ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`w-8 md:w-12 h-0.5 ${i < step ? "bg-primary" : "bg-secondary"}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-6">
            {step === 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4"><MapPin className="w-5 h-5 text-primary" /><h2 className="font-display text-xl font-bold">Shipping Address</h2></div>
                <div className="grid grid-cols-2 gap-4">
                  <input className={inputClass} placeholder="First Name" value={formData.firstName} onChange={(e) => update("firstName", e.target.value)} />
                  <input className={inputClass} placeholder="Last Name" value={formData.lastName} onChange={(e) => update("lastName", e.target.value)} />
                </div>
                <input className={inputClass} placeholder="Email" type="email" value={formData.email} onChange={(e) => update("email", e.target.value)} />
                <input className={inputClass} placeholder="Phone" value={formData.phone} onChange={(e) => update("phone", e.target.value)} />        
                <input className={inputClass} placeholder="Address" value={formData.address} onChange={(e) => update("address", e.target.value)} />  
                <div className="grid grid-cols-3 gap-4">
                  <input className={inputClass} placeholder="City" value={formData.city} onChange={(e) => update("city", e.target.value)} />
                  <input className={inputClass} placeholder="State" value={formData.state} onChange={(e) => update("state", e.target.value)} />      
                  <input className={inputClass} placeholder="ZIP" value={formData.zip} onChange={(e) => update("zip", e.target.value)} />
                </div>
                <button onClick={() => validateStep(0) && setStep(1)} className="gold-gradient text-background font-semibold w-full py-4 rounded-xl hover:opacity-90">
                  Continue to Shipping Method
                </button>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4"><Truck className="w-5 h-5 text-primary" /><h2 className="font-display text-xl font-bold">Shipping Method</h2></div>
                {shippingLoading ? <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin" /></div> : (
                  <div className="space-y-3">
                    {shippingMethods?.map((m) => (
                      <button 
                        key={m.id}
                        onClick={() => setSelectedMethodId(m.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                          (selectedMethodId === m.id || (!selectedMethodId && shippingMethods[0].id === m.id)) 
                          ? "border-primary bg-primary/5 ring-1 ring-primary" 
                          : "border-border hover:border-border/80 bg-secondary/30"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                            <Truck className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-bold text-sm">{m.carrier} {m.name}</p>
                            <p className="text-xs text-muted-foreground">{m.estimated_days} • {m.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${Number(m.price).toFixed(2)}</p>
                          {m.min_order_amount && totalPrice >= m.min_order_amount && (
                            <p className="text-[10px] text-green-400 font-bold uppercase">Free</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={() => setStep(0)} className="flex-1 bg-secondary text-foreground font-semibold py-4 rounded-xl hover:bg-secondary/80">Back</button>
                  <button onClick={() => validateStep(1) && setStep(2)} className="flex-1 gold-gradient text-background font-semibold py-4 rounded-xl hover:opacity-90">Continue to Payment</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4"><CreditCard className="w-5 h-5 text-primary" /><h2 className="font-display text-xl font-bold">Payment Details</h2></div>
                <input className={inputClass} placeholder="Cardholder Name" value={formData.cardName} onChange={(e) => update("cardName", e.target.value)} />
                <input className={inputClass} placeholder="Card Number" value={formData.cardNumber} onChange={(e) => update("cardNumber", e.target.value)} />
                <div className="grid grid-cols-2 gap-4">
                  <input className={inputClass} placeholder="MM/YY" value={formData.cardExpiry} onChange={(e) => update("cardExpiry", e.target.value)} />
                  <input className={inputClass} placeholder="CVC" value={formData.cardCvc} onChange={(e) => update("cardCvc", e.target.value)} />    
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Lock className="w-4 h-4" /> Your payment information is encrypted and secure</div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 bg-secondary text-foreground font-semibold py-4 rounded-xl hover:bg-secondary/80">Back</button>
                  <button onClick={() => validateStep(2) && setStep(3)} className="flex-1 gold-gradient text-background font-semibold py-4 rounded-xl hover:opacity-90">Review Order</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="font-display text-xl font-bold">Review Your Order</h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={`${item.product.id}-${item.variant.id}`} className="flex items-center gap-3 bg-secondary/50 rounded-xl p-3">
                      <img src={item.product.images[0]} alt="" className="w-16 h-16 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">Size: {item.variant.size} · Color: {item.variant.color} · Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold">${(item.variant.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-secondary/30 rounded-xl p-4">
                  <div><p className="text-muted-foreground mb-1 uppercase text-[10px] font-bold tracking-wider">Ship to</p><p className="font-medium">{formData.firstName} {formData.lastName}<br/>{formData.address}<br/>{formData.city}, {formData.state} {formData.zip}</p></div>
                  <div><p className="text-muted-foreground mb-1 uppercase text-[10px] font-bold tracking-wider">Shipping Method</p><p className="font-medium">{selectedMethod?.carrier} {selectedMethod?.name}<br/><span className="text-xs text-muted-foreground">{selectedMethod?.estimated_days}</span></p></div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="flex-1 bg-secondary text-foreground font-semibold py-4 rounded-xl hover:bg-secondary/80">Back</button>
                  <button onClick={handleSubmit} disabled={submitting} className="flex-1 gold-gradient text-background font-semibold py-4 rounded-xl hover:opacity-90 disabled:opacity-50 text-sm md:text-base">
                    {submitting ? "Placing Order..." : `Place Order — $${total.toFixed(2)}`}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        <div className="glass rounded-2xl p-6 h-fit lg:sticky lg:top-24 space-y-4">
          <h2 className="font-display text-xl font-bold">Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal ({items.length} items)</span><span>${totalPrice.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>${tax.toFixed(2)}</span></div>
          </div>
          <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
            <span>Total</span><span className="gold-text">${total.toFixed(2)}</span>
          </div>
          {selectedMethod && (
            <div className="flex items-start gap-2 text-[10px] text-muted-foreground bg-secondary/20 p-2 rounded-lg">
              <Truck className="w-3 h-3 text-primary shrink-0 mt-0.5" /> 
              <span>Shipping via {selectedMethod.carrier} ({selectedMethod.estimated_days})</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
