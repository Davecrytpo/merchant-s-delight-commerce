import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Check, CreditCard, Lock, Truck, MapPin, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useShippingMethods, type ShippingMethod } from "@/hooks/useShipping";

const STEPS = ["Shipping", "Carrier", "Payment"];

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, profile } = useAuth();
  const { data: shippingMethods, isLoading: shippingLoading } = useShippingMethods();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
  });

  // Handle Stripe redirect
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      const order = searchParams.get("order");
      setOrderPlaced(true);
      setOrderNumber(order || "");
      clearCart();
    }
    if (searchParams.get("canceled") === "true") {
      toast.error("Payment was canceled. Your cart is still saved.");
    }
  }, [searchParams, clearCart]);

  const selectedMethod: ShippingMethod | undefined = useMemo(
    () => shippingMethods?.find((m: ShippingMethod) => m.id === selectedMethodId) || shippingMethods?.[0],
    [shippingMethods, selectedMethodId]
  );

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
    return true;
  };

  const handleStripeCheckout = async () => {
    if (!user) {
      toast.error("Please sign in to place an order");
      navigate("/account");
      return;
    }
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setSubmitting(true);
    try {
      const orderItems = items.map((i) => ({
        product_id: i.product.id,
        product_name: i.product.name,
        variant_size: i.variant.size,
        variant_color: i.variant.color,
        quantity: i.quantity,
        price: i.variant.price,
        image: i.product.images[0],
      }));

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          items: orderItems,
          shippingCost,
          tax,
          shippingAddress: {
            name: `${formData.firstName} ${formData.lastName}`,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
            country: formData.country,
            carrier: selectedMethod?.carrier,
            method: selectedMethod?.name,
          },
          shippingMethod: selectedMethod ? `${selectedMethod.carrier} ${selectedMethod.name}` : "Standard",
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to start checkout");
    } finally {
      setSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-20 h-20 rounded-full gold-gradient flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-background" />
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-3">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-2">Thank you for your purchase</p>
          {orderNumber && <p className="text-primary font-semibold mb-6">Order: {orderNumber}</p>}
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/orders" className="gold-gradient text-background font-semibold px-6 py-3 rounded-xl inline-block">View Orders</Link>
            <Link to="/shop" className="bg-secondary text-foreground font-semibold px-6 py-3 rounded-xl inline-block">Continue Shopping</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold mb-4">Your cart is empty</h1>
          <Link to="/shop" className="text-primary underline">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  const inputClass = "w-full bg-secondary rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary text-sm";

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <h1 className="font-display text-2xl md:text-3xl font-bold mb-6 md:mb-8">Checkout</h1>

      <div className="flex items-center gap-3 md:gap-4 mb-8 overflow-x-auto pb-4">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i <= step ? "gold-gradient text-background" : "bg-secondary text-muted-foreground"}`}>
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-sm font-medium ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`w-6 md:w-12 h-0.5 ${i < step ? "bg-primary" : "bg-secondary"}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-4 md:p-6">
            {step === 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4"><MapPin className="w-5 h-5 text-primary" /><h2 className="font-display text-lg md:text-xl font-bold">Shipping Address</h2></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input className={inputClass} placeholder="First Name" value={formData.firstName} onChange={(e) => update("firstName", e.target.value)} />
                  <input className={inputClass} placeholder="Last Name" value={formData.lastName} onChange={(e) => update("lastName", e.target.value)} />
                </div>
                <input className={inputClass} placeholder="Email" type="email" value={formData.email} onChange={(e) => update("email", e.target.value)} />
                <input className={inputClass} placeholder="Phone" value={formData.phone} onChange={(e) => update("phone", e.target.value)} />
                <input className={inputClass} placeholder="Address" value={formData.address} onChange={(e) => update("address", e.target.value)} />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <div className="flex items-center gap-2 mb-4"><Truck className="w-5 h-5 text-primary" /><h2 className="font-display text-lg md:text-xl font-bold">Shipping Method</h2></div>
                {shippingLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin" /></div>
                ) : (
                  <div className="space-y-3">
                    {shippingMethods?.map((m: ShippingMethod) => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMethodId(m.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                          (selectedMethodId === m.id || (!selectedMethodId && shippingMethods[0].id === m.id))
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:border-border/80 bg-secondary/30"
                        }`}
                      >
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                            <Truck className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-bold text-sm">{m.carrier} {m.name}</p>
                            <p className="text-xs text-muted-foreground">{m.estimated_days} • {m.description}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <p className="font-bold text-sm">${Number(m.price).toFixed(2)}</p>
                          {m.min_order_amount && totalPrice >= m.min_order_amount && (
                            <p className="text-[10px] text-green-400 font-bold uppercase">Free</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={() => setStep(0)} className="flex-1 bg-secondary text-foreground font-semibold py-4 rounded-xl hover:bg-secondary/80 text-sm">Back</button>
                  <button onClick={() => validateStep(1) && setStep(2)} className="flex-1 gold-gradient text-background font-semibold py-4 rounded-xl hover:opacity-90 text-sm">Continue to Review</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4"><CreditCard className="w-5 h-5 text-primary" /><h2 className="font-display text-lg md:text-xl font-bold">Review & Pay</h2></div>
                
                {/* Order items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={`${item.product.id}-${item.variant.id}`} className="flex items-center gap-3 bg-secondary/50 rounded-xl p-3">
                      <img src={item.product.images[0]} alt="" className="w-14 h-14 md:w-16 md:h-16 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">Size: {item.variant.size} · Color: {item.variant.color} · Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-sm shrink-0">${(item.variant.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Shipping & address summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-secondary/30 rounded-xl p-4">
                  <div>
                    <p className="text-muted-foreground mb-1 uppercase text-[10px] font-bold tracking-wider">Ship to</p>
                    <p className="font-medium text-sm">{formData.firstName} {formData.lastName}<br />{formData.address}<br />{formData.city}, {formData.state} {formData.zip}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1 uppercase text-[10px] font-bold tracking-wider">Shipping Method</p>
                    <p className="font-medium text-sm">{selectedMethod?.carrier} {selectedMethod?.name}<br /><span className="text-xs text-muted-foreground">{selectedMethod?.estimated_days}</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 border border-primary/20 rounded-xl p-3">
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                  <span>You'll be redirected to Stripe's secure checkout to complete your payment</span>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 bg-secondary text-foreground font-semibold py-4 rounded-xl hover:bg-secondary/80 text-sm">Back</button>
                  <button
                    onClick={handleStripeCheckout}
                    disabled={submitting}
                    className="flex-1 gold-gradient text-background font-semibold py-4 rounded-xl hover:opacity-90 disabled:opacity-50 text-sm"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Processing...</span>
                    ) : (
                      `Pay $${total.toFixed(2)} with Stripe`
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        <div className="glass rounded-2xl p-4 md:p-6 h-fit lg:sticky lg:top-24 space-y-4">
          <h2 className="font-display text-lg md:text-xl font-bold">Summary</h2>
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
