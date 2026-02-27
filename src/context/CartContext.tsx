import React, { createContext, useContext, useState, useCallback } from "react";
import { Product, ProductVariant, CartItem } from "@/data/products";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((product: Product, variant: ProductVariant, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.product.id === product.id && i.variant.id === variant.id
      );
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id && i.variant.id === variant.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { product, variant, quantity }];
    });
  }, []);

  const removeItem = useCallback((productId: string, variantId: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.product.id === productId && i.variant.id === variantId))
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: string, variantId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId, variantId);
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.product.id === productId && i.variant.id === variantId
            ? { ...i, quantity }
            : i
        )
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.variant.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
