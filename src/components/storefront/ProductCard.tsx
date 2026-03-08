import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { toast } from "sonner";
import { IMAGE_PLACEHOLDER, getSafeImageSrc } from "@/lib/imageFallback";

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addItem } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();
  const wishlisted = isInWishlist(product.id);
  const safeImages = useMemo(
    () =>
      Array.from(
        new Set(
          ([...(product.images || []), ...(((product as any).product_images || []).map((i: any) => i.image_url || ""))] as string[])
            .filter(Boolean)
        )
      ),
    [product]
  );
  const [imageIdx, setImageIdx] = useState(0);

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
    >
      <Link to={`/product/${product.slug}`} className="group block">
        <div className="relative aspect-[3/4] sm:aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-secondary mb-2.5 sm:mb-4">
          <img
            src={getSafeImageSrc(safeImages[imageIdx])}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              if (imageIdx < safeImages.length - 1) {
                setImageIdx((prev) => prev + 1);
                return;
              }
              const target = e.currentTarget as HTMLImageElement;
              target.onerror = null;
              target.src = IMAGE_PLACEHOLDER;
            }}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1">
            {product.isNew && (
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold uppercase gold-gradient text-background rounded-full">New</span>
            )}
            {discount > 0 && (
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold uppercase bg-destructive text-destructive-foreground rounded-full">-{discount}%</span>
            )}
          </div>

          {/* Mobile: always visible wishlist button */}
          <button
            onClick={handleWishlist}
            className={`absolute top-2 sm:top-3 right-2 sm:right-3 p-2 rounded-full backdrop-blur-sm transition-all z-10 ${
              wishlisted ? "bg-primary text-primary-foreground" : "bg-background/60 sm:bg-white/10 text-foreground sm:opacity-0 sm:group-hover:opacity-100 sm:translate-x-2 sm:group-hover:translate-x-0"
            }`}
          >
            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill={wishlisted ? "currentColor" : "none"} />
          </button>

          {/* Desktop hover actions */}
          <div className="absolute top-12 right-3 hidden sm:flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            <button
              onClick={handleQuickAdd}
              className="p-2.5 rounded-full bg-white/10 hover:bg-primary hover:text-primary-foreground backdrop-blur-sm transition-all text-foreground"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>

          {/* Quick add bar - desktop */}
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 hidden sm:block">
            <button
              onClick={handleQuickAdd}
              className="w-full py-2.5 rounded-xl gold-gradient text-background font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Quick Add
            </button>
          </div>
        </div>

        <div className="space-y-0.5 sm:space-y-1.5 px-0.5">
          <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">{product.brand}</p>
          <h3 className="font-display font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary fill-primary" />
            <span className="text-xs sm:text-sm font-medium">{product.rating}</span>
            <span className="text-[10px] sm:text-xs text-muted-foreground">({product.reviewCount})</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-bold text-base sm:text-lg">${product.price}</span>
            {product.originalPrice && (
              <span className="text-xs sm:text-sm text-muted-foreground line-through">${product.originalPrice}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
