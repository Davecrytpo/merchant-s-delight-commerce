import { useState } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Check, CreditCard, Lock, Truck, MapPin } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const STEPS = ["Shipping", "Payment", "Review"];

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
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

  const shipping = totalPrice > 100 ? 0 : 9.99;
  const tax = totalPrice * 0.08;
  const total = totalPrice + shipping + tax;

  const update = (key: string, value: string) => setFormData((prev) => ({ ...prev, [key]: value }));

  const validateStep = (s: number): boolean => {
    if (s === 0) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.address || !formData.city || !formData.state || !formData.zip) {
        toast.error("Please fill in all shipping fields");
        return false;
      }
    }
    if (s === 1) {
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
      shipping,
      tax,
      total,
      shipping_address: {
        name: `${formData.firstName} ${formData.lastName}`,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        country: formData.country,
      },
      payment_method: "card",
    });

    if (error) {
      toast.error("Failed to place order. Please try again.");
    } else {
      setOrderNumber(orderNum);
      setOrderPlaced(true);
      clearCart();
      toast.success("Order placed successfully! 🎉");
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

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold mb-3">Your cart is empty</h1>
          <Link to="/shop" className="gold-gradient text-background font-semibold px-8 py-3 rounded-xl inline-block">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold mb-3">Sign In to Checkout</h1>
          <p className="text-muted-foreground mb-6">You need an account to place an order</p>
          <Link to="/account" className="gold-gradient text-background font-semibold px-8 py-3 rounded-xl inline-block">
            Sign In / Create Account
          </Link>
        </div>
      </div>
    );
  }

  const inputClass = "w-full bg-secondary rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>

      <div className="flex items-center gap-4 mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              i <= step ? "gold-gradient text-background" : "bg-secondary text-muted-foreground"
            }`}>
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-sm font-medium ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`w-12 h-0.5 ${i < step ? "bg-primary" : "bg-secondary"}`} />}
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
                  Continue to Payment
                </button>
              </div>
            )}

            {step === 1 && (
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
                  <button onClick={() => setStep(0)} className="flex-1 bg-secondary text-foreground font-semibold py-4 rounded-xl hover:bg-secondary/80">Back</button>
                  <button onClick={() => validateStep(1) && setStep(2)} className="flex-1 gold-gradient text-background font-semibold py-4 rounded-xl hover:opacity-90">Review Order</button>
                </div>
              </div>
            )}

            {step === 2 && (
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
                <div className="grid grid-cols-2 gap-4 text-sm bg-secondary/30 rounded-xl p-4">
                  <div><p className="text-muted-foreground">Ship to</p><p className="font-medium">{formData.firstName} {formData.lastName}<br/>{formData.address}<br/>{formData.city}, {formData.state} {formData.zip}</p></div>
                  <div><p className="text-muted-foreground">Payment</p><p className="font-medium">Card ending in {formData.cardNumber.slice(-4) || "****"}</p></div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 bg-secondary text-foreground font-semibold py-4 rounded-xl hover:bg-secondary/80">Back</button>
                  <button onClick={handleSubmit} disabled={submitting} className="flex-1 gold-gradient text-background font-semibold py-4 rounded-xl hover:opacity-90 disabled:opacity-50">
                    {submitting ? "Placing Order..." : `Place Order — $${total.toFixed(2)}`}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        <div className="glass rounded-2xl p-6 h-fit sticky top-24 space-y-4">
          <h2 className="font-display text-xl font-bold">Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal ({items.length} items)</span><span>${totalPrice.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>${tax.toFixed(2)}</span></div>
          </div>
          <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
            <span>Total</span><span>${total.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Truck className="w-4 h-4 text-primary" /> {shipping === 0 ? "Free shipping applied!" : "Free shipping on orders over $100"}</div>
        </div>
      </div>
    </div>
  );
}
