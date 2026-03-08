import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Check, CreditCard, Lock, Truck, MapPin, Loader2, Coins, ChevronRight, Gift, ShieldCheck, Globe, Flag, Tag, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useShippingMethods, type ShippingMethod } from "@/hooks/useShipping";

const STEPS = ["Shipping", "Carrier", "Payment"];

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "AU", name: "Australia" },
  { code: "JP", name: "Japan" },
  { code: "NG", name: "Nigeria" },
  { code: "GH", name: "Ghana" },
  { code: "ZA", name: "South Africa" },
  { code: "KE", name: "Kenya" },
  { code: "IN", name: "India" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SG", name: "Singapore" },
  { code: "KR", name: "South Korea" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "NL", name: "Netherlands" },
];

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [usePoints, setUsePoints] = useState(false);
  const [deliveryType, setDeliveryType] = useState<"domestic" | "international" | null>(null);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; type: string; value: number } | null>(null);
  const [applyingCode, setApplyingCode] = useState(false);

  const [formData, setFormData] = useState({
    firstName: profile?.full_name?.split(" ")[0] || "",
    lastName: profile?.full_name?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
    phone: profile?.phone || "",
    address: profile?.address_line1 || "",
    city: profile?.city || "",
    state: profile?.state || "",
    zip: profile?.zip_code || "",
    country: profile?.country || "US",
  });

  const { data: shippingMethods, isLoading: shippingLoading } = useShippingMethods(formData.country);

  // Auto-detect delivery type based on country
  useEffect(() => {
    if (formData.country === "US") {
      setDeliveryType("domestic");
    } else {
      setDeliveryType("international");
    }
    setSelectedMethodId(null); // Reset carrier selection when country changes
  }, [formData.country]);

  // Handle Stripe redirect results
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

  // Business rule:
  // - US destination => USPS only
  // - Non-US destination => DHL only
  const filteredShippingMethods = useMemo(() => {
    if (!shippingMethods) return [];
    if (deliveryType === "domestic") {
      return shippingMethods.filter((m: ShippingMethod) =>
        m.carrier.toUpperCase().includes("USPS")
      );
    }
    if (deliveryType === "international") {
      return shippingMethods.filter((m: ShippingMethod) =>
        m.carrier.toUpperCase().includes("DHL")
      );
    }
    return shippingMethods;
  }, [shippingMethods, deliveryType]);

  // Auto-select first available method
  useEffect(() => {
    if (filteredShippingMethods.length > 0 && !selectedMethodId) {
      setSelectedMethodId(filteredShippingMethods[0].id);
    }
  }, [filteredShippingMethods, selectedMethodId]);

  const selectedMethod: ShippingMethod | undefined = useMemo(
    () => filteredShippingMethods?.find((m: ShippingMethod) => m.id === selectedMethodId) || filteredShippingMethods?.[0],
    [filteredShippingMethods, selectedMethodId]
  );

  const shippingCost = useMemo(() => {
    if (!selectedMethod) return 0;
    if (selectedMethod.min_order_amount && totalPrice >= selectedMethod.min_order_amount) return 0;
    return Number(selectedMethod.price);
  }, [selectedMethod, totalPrice]);

  const pointsDiscount = useMemo(() => {
    if (!usePoints || !profile?.reward_points) return 0;
    const maxRedeemablePoints = Math.floor(profile.reward_points / 100) * 100;
    const maxDiscount = (maxRedeemablePoints / 100) * 10;
    return Math.min(maxDiscount, totalPrice);
  }, [usePoints, profile?.reward_points, totalPrice]);

  const discountAmount = useMemo(() => {
    if (!appliedDiscount) return 0;
    if (appliedDiscount.type === 'percentage') {
      return (totalPrice * appliedDiscount.value) / 100;
    }
    return Math.min(appliedDiscount.value, totalPrice);
  }, [appliedDiscount, totalPrice]);

  const tax = Math.max(0, (totalPrice - pointsDiscount - discountAmount)) * 0.08;
  const total = Math.max(0, totalPrice - pointsDiscount - discountAmount + shippingCost + tax);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    setApplyingCode(true);
    try {
      const { data, error } = await supabase
        .from("discount_codes")
        .select("*")
        .eq("code", discountCode.trim().toUpperCase())
        .eq("is_active", true)
        .single();
      if (error || !data) {
        toast.error("Invalid or expired discount code");
        setApplyingCode(false);
        return;
      }
      if (data.max_uses && data.current_uses >= data.max_uses) {
        toast.error("This code has reached its maximum uses");
        setApplyingCode(false);
        return;
      }
      if (data.min_order_amount && totalPrice < Number(data.min_order_amount)) {
        toast.error(`Minimum order of $${Number(data.min_order_amount).toFixed(2)} required`);
        setApplyingCode(false);
        return;
      }
      setAppliedDiscount({ code: data.code, type: data.discount_type, value: Number(data.discount_value) });
      toast.success(`Discount "${data.code}" applied!`);
    } catch {
      toast.error("Failed to validate code");
    }
    setApplyingCode(false);
  };

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
    setPaymentStatus("processing");

    const orderItems = items.map((i) => ({
      product_id: i.product.id,
      product_name: i.product.name,
      variant_size: i.variant.size,
      variant_color: i.variant.color,
      quantity: i.quantity,
      price: i.variant.price,
      image: i.product.images?.[0],
    }));

    try {
      const payload = {
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
        shippingMethod: `${selectedMethod?.carrier} ${selectedMethod?.name}`,
      };

      let data: any = null;
      let lastError: any = null;
      for (const fnName of ["create-checkout", "create-checkout-session"]) {
        const result = await supabase.functions.invoke(fnName, { body: payload });
        if (!result.error) {
          data = result.data;
          lastError = null;
          break;
        }
        lastError = result.error;
      }

      if (lastError) {
        const message = lastError.message || "Payment service error";
        if (message.includes("Failed to send a request")) {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "unknown";
          throw new Error(
            `Unable to reach Supabase Edge Functions at ${supabaseUrl}. Confirm the app is using the correct project URL and that create-checkout is deployed on that project.`
          );
        }
        throw new Error(message);
      }
      if (!data?.url) throw new Error("No checkout URL received");

      window.location.href = data.url;
    } catch (error: any) {
      console.error("Checkout Error:", error);
      setPaymentStatus("error");
      toast.error(error.message || "Payment service temporarily unavailable. Please try again.");
      setSubmitting(false);
    }
  };

  if (paymentStatus === "processing" && submitting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-8 max-w-sm px-6">
          <div className="relative w-24 h-24 mx-auto">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute inset-0 border-t-4 border-primary rounded-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-primary animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-display font-bold">Processing Payment</h2>
            <p className="text-muted-foreground text-sm">Redirecting to Stripe secure checkout...</p>
          </div>
          <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
            <motion.div initial={{ x: "-100%" }} animate={{ x: "100%" }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} className="h-full w-1/2 gold-gradient" />
          </div>
        </motion.div>
      </div>
    );
  }

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

  const inputClass = "w-full bg-secondary rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary text-sm";

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <h1 className="font-display text-2xl md:text-3xl font-bold mb-6 md:mb-8">Checkout</h1>

      {/* Steps */}
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
            {/* Step 0: Shipping Address */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-lg md:text-xl font-bold">Shipping Address</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input className={inputClass} placeholder="First Name" value={formData.firstName} onChange={(e) => update("firstName", e.target.value)} />
                  <input className={inputClass} placeholder="Last Name" value={formData.lastName} onChange={(e) => update("lastName", e.target.value)} />
                </div>
                <input className={inputClass} placeholder="Email" type="email" value={formData.email} onChange={(e) => update("email", e.target.value)} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Country</label>
                    <select 
                      className={inputClass} 
                      value={formData.country} 
                      onChange={(e) => update("country", e.target.value)}
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Phone</label>
                    <input className={inputClass} placeholder="Phone" value={formData.phone} onChange={(e) => update("phone", e.target.value)} />
                  </div>
                </div>
                <input className={inputClass} placeholder="Street Address" value={formData.address} onChange={(e) => update("address", e.target.value)} />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input className={inputClass} placeholder="City" value={formData.city} onChange={(e) => update("city", e.target.value)} />
                  <input className={inputClass} placeholder="State / Province" value={formData.state} onChange={(e) => update("state", e.target.value)} />
                  <input className={inputClass} placeholder="ZIP / Postal Code" value={formData.zip} onChange={(e) => update("zip", e.target.value)} />
                </div>

                <div className="mt-2 flex items-center gap-2">
                  {formData.country === "US" ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-full">
                      <Flag className="w-3 h-3" />
                      <span>Domestic shipping via <strong>USPS</strong></span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-yellow-500/10 text-yellow-400 px-3 py-1.5 rounded-full">
                      <Globe className="w-3 h-3" />
                      <span>International shipping via <strong>DHL</strong></span>
                    </div>
                  )}
                </div>

                <button onClick={() => validateStep(0) && setStep(1)} className="gold-gradient text-background font-semibold w-full py-4 rounded-xl hover:opacity-90">
                  Continue to Shipping Method
                </button>
              </div>
            )}

            {/* Step 1: Carrier Selection */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-lg md:text-xl font-bold">
                    {deliveryType === "domestic" ? "USPS Shipping Options" : "DHL International Shipping"}
                  </h2>
                </div>

                <div className={`p-3 rounded-xl text-xs font-medium ${deliveryType === "domestic" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"}`}>
                  {deliveryType === "domestic"
                    ? "📦 US destination detected. Carrier automatically set to USPS."
                    : "🌍 International destination detected. Carrier automatically set to DHL."}
                </div>

                {shippingLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin" /></div>
                ) : filteredShippingMethods.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <Truck className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No shipping methods available for this region yet.</p>
                    <p className="text-xs mt-1">Please contact support or try a different delivery country.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredShippingMethods.map((m: ShippingMethod) => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMethodId(m.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                          selectedMethodId === m.id
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:border-border/80 bg-secondary/30"
                        }`}
                      >
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                            <Truck className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-bold text-sm">{m.carrier} — {m.name}</p>
                            <p className="text-xs text-muted-foreground">{m.estimated_days}{m.description ? ` • ${m.description}` : ""}</p>
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
                  <button onClick={() => validateStep(1) && setStep(2)} className="flex-1 gold-gradient text-background font-semibold py-4 rounded-xl hover:opacity-90 text-sm" disabled={!selectedMethod}>
                    Continue to Review
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Review & Pay */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-lg md:text-xl font-bold">Review & Pay</h2>
                </div>

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
                    <p className="font-medium text-sm">
                      {formData.firstName} {formData.lastName}<br />
                      {formData.address}<br />
                      {formData.city}, {formData.state} {formData.zip}<br />
                      {COUNTRIES.find((c) => c.code === formData.country)?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1 uppercase text-[10px] font-bold tracking-wider">Shipping Method</p>
                    <p className="font-medium text-sm">
                      {selectedMethod?.carrier} — {selectedMethod?.name}<br />
                      <span className="text-xs text-muted-foreground">{selectedMethod?.estimated_days}</span>
                    </p>
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

        {/* Order Summary Sidebar */}
        <div className="glass rounded-2xl p-4 md:p-6 h-fit lg:sticky lg:top-24 space-y-4">
          <h2 className="font-display text-lg md:text-xl font-bold">Summary</h2>

          {/* Reward Points UI */}
          {user && (profile?.reward_points || 0) >= 100 && (
            <div className={`p-4 rounded-xl border transition-all ${usePoints ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" : "border-border bg-secondary/20"}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Coins className={`w-4 h-4 ${usePoints ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-xs font-bold uppercase tracking-wider text-[10px]">ShoeShop Rewards</span>
                </div>
                <input type="checkbox" checked={usePoints} onChange={(e) => setUsePoints(e.target.checked)} className="w-4 h-4 accent-primary cursor-pointer" />
              </div>
              <p className="text-[10px] text-muted-foreground mb-3">
                You have <span className="text-foreground font-bold">{profile?.reward_points}</span> points available.
              </p>
              {usePoints ? (
                <div className="flex items-center justify-between text-primary animate-in fade-in slide-in-from-top-1">
                  <span className="text-[10px] font-medium">Applied Discount</span>
                  <span className="font-bold text-xs">-${pointsDiscount.toFixed(2)}</span>
                </div>
              ) : (
                <p className="text-[10px] italic">
                  Redeem {Math.floor((profile?.reward_points || 0) / 100) * 100} points for a{" "}
                  <span className="text-primary font-bold">${(Math.floor((profile?.reward_points || 0) / 100) * 10).toFixed(2)}</span> discount.
                </p>
              )}
            </div>
          )}

          {/* Points info for users without enough */}
          {user && (profile?.reward_points || 0) > 0 && (profile?.reward_points || 0) < 100 && (
            <div className="p-3 rounded-xl border border-border bg-secondary/20">
              <div className="flex items-center gap-2 mb-1">
                <Coins className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Rewards Progress</span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                You have <strong>{profile?.reward_points}</strong> pts. Earn <strong>{100 - (profile?.reward_points || 0)}</strong> more to unlock a $10 discount!
              </p>
              <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full gold-gradient rounded-full transition-all" style={{ width: `${Math.min(100, (profile?.reward_points || 0))}%` }} />
              </div>
            </div>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            {pointsDiscount > 0 && (
              <div className="flex justify-between text-primary">
                <span className="flex items-center gap-1"><Gift className="w-3 h-3" /> Reward Discount</span>
                <span>-${pointsDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
          </div>
          <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="gold-text">${total.toFixed(2)}</span>
          </div>
          {selectedMethod && (
            <div className="flex items-start gap-2 text-[10px] text-muted-foreground bg-secondary/20 p-2 rounded-lg">
              <Truck className="w-3 h-3 text-primary shrink-0 mt-0.5" />
              <span>Shipping via {selectedMethod.carrier} ({selectedMethod.estimated_days})</span>
            </div>
          )}

          {/* Points earning info */}
          {user && (
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-primary/5 p-2 rounded-lg border border-primary/10">
              <Coins className="w-3 h-3 text-primary shrink-0" />
              <span>You'll earn <strong className="text-primary">{Math.max(1, Math.floor(total))} pts</strong> from this purchase!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

