import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { toast } from "sonner";

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addItem } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();
  const wishlisted = isInWishlist(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const variant =
      product.variants?.[0] ||
      (product as any).product_variants?.[0]
        ? {
            ...(product.variants?.[0] || (product as any).product_variants?.[0]),
            colorHex:
              (product.variants?.[0] as any)?.colorHex ??
              ((product as any).product_variants?.[0] as any)?.color_hex ??
              "#000000",
            price:
              (product.variants?.[0] as any)?.price ??
              ((product as any).product_variants?.[0] as any)?.price ??
              product.price,
          }
        : null;

    if (variant) {
      addItem(product, variant as any);
      toast.success(`${product.name} added to cart`);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
    toast.success(wishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Link to={`/product/${product.slug}`} className="group block">
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary mb-4">
          <img
            src={product.images?.[0] || (product as any).product_images?.[0]?.image_url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80"}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.isNew && (
              <span className="px-2 py-1 text-xs font-bold uppercase gold-gradient text-background rounded-full">New</span>
            )}
            {discount > 0 && (
              <span className="px-2 py-1 text-xs font-bold uppercase bg-destructive text-destructive-foreground rounded-full">-{discount}%</span>
            )}
          </div>

          {/* Actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            <button
              onClick={handleWishlist}
              className={`p-2.5 rounded-full backdrop-blur-sm transition-all ${
                wishlisted ? "bg-primary text-primary-foreground" : "bg-white/10 hover:bg-white/20 text-foreground"
              }`}
            >
              <Heart className="w-4 h-4" fill={wishlisted ? "currentColor" : "none"} />
            </button>
            <button
              onClick={handleQuickAdd}
              className="p-2.5 rounded-full bg-white/10 hover:bg-primary hover:text-primary-foreground backdrop-blur-sm transition-all text-foreground"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>

          {/* Quick add bar */}
          <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            <button
              onClick={handleQuickAdd}
              className="w-full py-2.5 rounded-xl gold-gradient text-background font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Quick Add
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{product.brand}</p>
          <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-primary fill-primary" />
              <span className="text-sm font-medium">{product.rating}</span>
              <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">${product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
