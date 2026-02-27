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
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <ShoppingBag className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
          <h1 className="font-display text-3xl font-bold mb-3">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-6">Discover our amazing collection of shoes</p>
          <Link to="/shop" className="gold-gradient text-background font-semibold px-8 py-3 rounded-xl inline-block">
            Start Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold mb-8">Shopping Cart <span className="text-muted-foreground text-lg font-body">({totalItems} items)</span></h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, i) => (
            <motion.div
              key={`${item.product.id}-${item.variant.id}`}
              className="glass rounded-2xl p-4 flex gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/product/${item.product.slug}`} className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden shrink-0">
                <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <Link to={`/product/${item.product.slug}`} className="font-display font-semibold hover:text-primary transition-colors">
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    Size: {item.variant.size} · Color: {item.variant.color}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.variant.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.variant.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold">${(item.variant.price * item.quantity).toFixed(2)}</span>
                    <button
                      onClick={() => removeItem(item.product.id, item.variant.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="glass rounded-2xl p-6 h-fit sticky top-24 space-y-4">
          <h2 className="font-display text-xl font-bold">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${totalPrice.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>${tax.toFixed(2)}</span></div>
            {shipping === 0 && <p className="text-xs text-primary">✓ You qualify for free shipping!</p>}
          </div>
          <div className="border-t border-border pt-4 flex justify-between font-bold text-lg">
            <span>Total</span><span>${total.toFixed(2)}</span>
          </div>
          <Link
            to="/checkout"
            className="gold-gradient text-background font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity w-full"
          >
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/shop" className="text-center block text-sm text-muted-foreground hover:text-foreground transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
