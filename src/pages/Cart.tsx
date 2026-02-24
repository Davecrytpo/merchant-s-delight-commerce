import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import StorefrontLayout from "@/components/storefront/StorefrontLayout";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

export default function Cart() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <StorefrontLayout>
        <div className="container py-20 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-heading text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Looks like you haven't added anything yet.</p>
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/products">Continue Shopping</Link>
          </Button>
        </div>
      </StorefrontLayout>
    );
  }

  return (
    <StorefrontLayout>
      <div className="container py-10">
        <Link to="/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Continue Shopping
        </Link>

        <h1 className="font-heading text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.variant.id} className="flex gap-4 bg-card rounded-lg p-4 border border-border">
                <div className="h-24 w-24 rounded-md bg-secondary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{item.product.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.variant.color} / {item.variant.size}
                  </p>
                  <p className="text-sm font-medium mt-1">${item.variant.price.toFixed(2)}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button onClick={() => removeItem(item.variant.id)} className="text-muted-foreground hover:text-destructive transition-colors" aria-label="Remove item">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="flex items-center border border-border rounded-md">
                    <button onClick={() => updateQuantity(item.variant.id, item.quantity - 1)} className="px-2 py-1 hover:bg-secondary" aria-label="Decrease quantity">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="px-3 text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.variant.id, item.quantity + 1)} className="px-2 py-1 hover:bg-secondary" aria-label="Increase quantity">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-lg p-6 h-fit space-y-4">
            <h2 className="font-heading text-xl font-bold">Order Summary</h2>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium">{totalPrice > 100 ? "Free" : "$9.99"}</span>
            </div>
            <div className="border-t border-border pt-4 flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>${(totalPrice + (totalPrice > 100 ? 0 : 9.99)).toFixed(2)}</span>
            </div>
            <Button
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold uppercase tracking-wider"
              size="lg"
              onClick={() => {
                toast.success("Checkout coming soon!");
              }}
            >
              Checkout
            </Button>
            <p className="text-xs text-muted-foreground text-center">Free shipping on orders over $100</p>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
