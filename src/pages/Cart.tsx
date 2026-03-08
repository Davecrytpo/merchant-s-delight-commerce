import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Cart() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
  const shipping = totalPrice > 100 ? 0 : 9.99;
  const tax = totalPrice * 0.08;
  const total = totalPrice + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <ShoppingBag className="w-16 h-16 md:w-20 md:h-20 text-muted-foreground mx-auto mb-4 md:mb-6" />
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-2 md:mb-3">Your Cart is Empty</h1>
          <p className="text-muted-foreground text-sm md:text-base mb-5 md:mb-6">Discover our amazing collection of shoes</p>
          <Link to="/shop" className="gold-gradient text-background font-semibold px-6 md:px-8 py-3 rounded-xl inline-block text-sm md:text-base">
            Start Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 md:px-4 py-6 md:py-8">
      <h1 className="font-display text-2xl md:text-3xl font-bold mb-6 md:mb-8">
        Shopping Cart <span className="text-muted-foreground text-sm md:text-lg font-body">({totalItems} items)</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3 md:space-y-4">
          {items.map((item, i) => (
            <motion.div
              key={`${item.product.id}-${item.variant.id}`}
              className="glass rounded-xl md:rounded-2xl p-3 md:p-4 flex gap-3 md:gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/product/${item.product.slug}`} className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-lg md:rounded-xl overflow-hidden shrink-0">
                <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <Link to={`/product/${item.product.slug}`} className="font-display font-semibold text-sm sm:text-base hover:text-primary transition-colors line-clamp-1">
                    {item.product.name}
                  </Link>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Size: {item.variant.size} · Color: {item.variant.color}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.variant.id, item.quantity - 1)}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 sm:w-8 text-center font-medium text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.variant.id, item.quantity + 1)}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <span className="font-bold text-sm sm:text-base">${(item.variant.price * item.quantity).toFixed(2)}</span>
                    <button
                      onClick={() => removeItem(item.product.id, item.variant.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="glass rounded-xl md:rounded-2xl p-4 md:p-6 h-fit lg:sticky lg:top-24 space-y-3 md:space-y-4">
          <h2 className="font-display text-lg md:text-xl font-bold">Order Summary</h2>
          <div className="space-y-2.5 md:space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${totalPrice.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>${tax.toFixed(2)}</span></div>
            {shipping === 0 && <p className="text-[10px] sm:text-xs text-primary">✓ You qualify for free shipping!</p>}
          </div>
          <div className="border-t border-border pt-3 md:pt-4 flex justify-between font-bold text-base md:text-lg">
            <span>Total</span><span>${total.toFixed(2)}</span>
          </div>
          <Link
            to="/checkout"
            className="gold-gradient text-background font-semibold py-3.5 md:py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity w-full text-sm md:text-base"
          >
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/shop" className="text-center block text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
