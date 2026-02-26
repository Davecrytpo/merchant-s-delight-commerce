import { Link } from "react-router-dom";
import { Product } from "@/data/products";
import { Star, Heart, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";

import productRunning from "@/assets/product-running.jpg";
import productCasual from "@/assets/product-casual.jpg";
import productBoot from "@/assets/product-boot.jpg";
import productTraining from "@/assets/product-training.jpg";

const categoryImages: Record<string, string> = {
  Running: productRunning,
  Casual: productCasual,
  Boots: productBoot,
  Training: productTraining,
};

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const minPrice = Math.min(...product.variants.map((v) => v.price));
  const comparePrice = product.variants.find((v) => v.compareAtPrice)?.compareAtPrice;
  const uniqueColors = [...new Set(product.variants.map((v) => v.color))];
  const image = categoryImages[product.category] || productRunning;
  const { addItem } = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const firstVariant = product.variants[0];
    if (firstVariant) addItem(product, firstVariant);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link to={`/products/${product.slug}`} className="group block">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-secondary mb-4">
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110"
            loading="lazy"
          />

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Quick actions */}
          <div className="absolute bottom-4 left-4 right-4 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
            <button
              onClick={handleQuickAdd}
              className="flex-1 glass-strong rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <ShoppingBag className="h-4 w-4" /> Quick Add
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="glass-strong rounded-xl px-3 hover:bg-accent/20 transition-colors"
            >
              <Heart className="h-4 w-4" />
            </button>
          </div>

          {/* Sale badge */}
          {comparePrice && (
            <div className="absolute top-3 left-3 bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
              Sale
            </div>
          )}

          {/* New badge */}
          {!comparePrice && (
            <div className="absolute top-3 left-3 glass text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full text-foreground">
              New
            </div>
          )}
        </div>

        <div className="space-y-2 px-1">
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground uppercase tracking-[0.15em]">{product.brand}</p>
            <div className="flex items-center gap-1 ml-auto">
              <Star className="h-3 w-3 fill-accent text-accent" />
              <span className="text-xs font-medium text-muted-foreground">{product.rating}</span>
            </div>
          </div>

          <h3 className="font-body font-semibold text-foreground text-lg group-hover:text-accent transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">${minPrice.toFixed(2)}</span>
              {comparePrice && (
                <span className="text-sm text-muted-foreground line-through">${comparePrice.toFixed(2)}</span>
              )}
            </div>
            <div className="flex gap-1.5">
              {uniqueColors.slice(0, 4).map((c) => (
                <span
                  key={c}
                  className="h-4 w-4 rounded-full border-2 border-border hover:scale-125 transition-transform"
                  style={{
                    backgroundColor:
                      c === "Black" ? "#1a1a1a" : c === "White" ? "#f5f5f5" : c === "Red" ? "#dc2626" : c === "Navy" ? "#1e3a5f" : "#888",
                  }}
                  title={c}
                />
              ))}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
