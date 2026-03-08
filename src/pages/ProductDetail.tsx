import { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star, Truck, Shield, RotateCcw, Minus, Plus, ChevronRight, Loader2 } from "lucide-react";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import ProductCard from "@/components/storefront/ProductCard";
import ProductImageGallery from "@/components/product/ProductImageGallery";
import ReviewSection from "@/components/product/ReviewSection";
import { toast } from "sonner";

export default function ProductDetail() {
  const { slug } = useParams();
  const { data: product, isLoading, error } = useProduct(slug || "");
  const { data: allProducts } = useProducts();
  const { addItem } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    setSelectedSize("");
    setSelectedColor("");
    setQuantity(1);
  }, [slug]);

  const colors = useMemo(() => {
    if (!product?.product_variants) return [];
    const map = new Map<string, string>();
    product.product_variants.forEach((v: any) => map.set(v.color, v.color_hex || "#000000"));
    return Array.from(map.entries());
  }, [product]);

  const sizes = useMemo(() => {
    if (!product?.product_variants) return [];
    const set = new Set<string>();
    product.product_variants
      .filter((v: any) => !selectedColor || v.color === selectedColor)
      .forEach((v: any) => set.add(v.size));
    return Array.from(set).sort((a, b) => {
      const aNum = parseFloat(a);
      const bNum = parseFloat(b);
      const bothNumeric = !Number.isNaN(aNum) && !Number.isNaN(bNum);
      return bothNumeric ? aNum - bNum : a.localeCompare(b);
    });
  }, [product, selectedColor]);

  const selectedVariant = useMemo(() => {
    if (!product?.product_variants) return undefined;
    return product.product_variants.find(
      (v: any) => v.size === selectedSize && v.color === selectedColor
    );
  }, [product, selectedSize, selectedColor]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!product || error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">Product Not Found</h1>
          <Link to="/shop" className="text-primary underline">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);
  const related = allProducts?.filter((p: any) => p.category_id === product.category_id && p.id !== product.id).slice(0, 4) || [];
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error("Please select size and color");
      return;
    }
    const cartProduct: any = {
      ...product,
      category: (product as any).categories?.name || "Uncategorized",
      longDescription: product.long_description || product.description || "",
      images: (product as any).product_images?.map((img: any) => img.image_url) || [],
      variants: (product as any).product_variants || [],
      reviewCount: product.review_count || 0,
      tags: [],
    };
    addItem(cartProduct, { ...selectedVariant, colorHex: selectedVariant.color_hex || "#000" } as any, quantity);
    toast.success(`${product.name} added to cart`);
  };

  const images = product.product_images?.map((img: any) => img.image_url) || [];

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground overflow-x-auto">
          <Link to="/" className="hover:text-foreground shrink-0">Home</Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <Link to="/shop" className="hover:text-foreground shrink-0">Shop</Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <span className="text-foreground truncate">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
          {/* Images */}
          <ProductImageGallery images={images.length > 0 ? images : ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"]} name={product.name} />

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 md:space-y-6">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-1">{product.brand}</p>
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold">{product.name}</h1>
              <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
                <div className="flex items-center gap-0.5 sm:gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${i < Math.floor(product.rating || 5) ? "text-primary fill-primary" : "text-muted"}`} />
                  ))}
                </div>
                <span className="text-xs sm:text-sm font-medium">{product.rating || "5.0"}</span>
                <span className="text-xs sm:text-sm text-muted-foreground">({product.review_count || 0} reviews)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <span className="font-display text-2xl sm:text-3xl font-bold">${product.price}</span>
              {product.original_price && (
                <>
                  <span className="text-lg sm:text-xl text-muted-foreground line-through">${product.original_price}</span>
                  <span className="px-2 py-0.5 sm:py-1 rounded-full bg-destructive/20 text-destructive text-xs sm:text-sm font-bold">-{discount}%</span>
                </>
              )}
            </div>

            <p className="text-muted-foreground text-sm sm:text-base">{product.description}</p>

            {/* Color */}
            <div>
              <p className="font-semibold text-sm sm:text-base mb-2 sm:mb-3">Color: {selectedColor || "Select"}</p>
              <div className="flex gap-2.5 sm:gap-3 flex-wrap">
                {colors.map(([name, hex]) => (
                  <button key={name} onClick={() => setSelectedColor(name)} className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 transition-all ${selectedColor === name ? "border-primary scale-110 ring-2 ring-primary/30" : "border-transparent"}`} style={{ backgroundColor: hex }} title={name} />
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <div className="flex justify-between mb-2 sm:mb-3">
                <p className="font-semibold text-sm sm:text-base">Size: {selectedSize || "Select"}</p>
                <Link to="/size-guide" className="text-primary text-xs sm:text-sm underline">Size Guide</Link>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {sizes.map((size) => (
                  <button key={size} onClick={() => setSelectedSize(size)} className={`py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${selectedSize === size ? "gold-gradient text-background" : "bg-secondary hover:bg-secondary/80"}`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <p className="font-semibold text-sm sm:text-base mb-2 sm:mb-3">Quantity</p>
              <div className="flex items-center gap-3 sm:gap-4">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-secondary flex items-center justify-center"><Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
                <span className="font-semibold text-base sm:text-lg w-8 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-secondary flex items-center justify-center"><Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
              </div>
            </div>

            {/* Actions - sticky on mobile */}
            <div className="flex gap-2.5 sm:gap-3">
              <button onClick={handleAddToCart} className="flex-1 gold-gradient text-background font-semibold py-3.5 sm:py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 text-sm sm:text-lg">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" /> Add to Cart
              </button>
              <button onClick={() => { toggleItem(product as any); toast.success(wishlisted ? "Removed" : "Added to wishlist"); }} className={`w-12 sm:w-14 rounded-xl flex items-center justify-center transition-all ${wishlisted ? "bg-primary text-primary-foreground" : "glass glass-hover"}`}>
                <Heart className="w-4 h-4 sm:w-5 sm:h-5" fill={wishlisted ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Trust */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-border">
              {[{ icon: Truck, text: "Free Shipping" }, { icon: Shield, text: "Authentic" }, { icon: RotateCcw, text: "30-Day Returns" }].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm text-muted-foreground"><item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" /><span className="leading-tight">{item.text}</span></div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mt-10 md:mt-16">
          <div className="flex gap-4 sm:gap-6 border-b border-border overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0">
            {["description", "reviews", "shipping"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors relative whitespace-nowrap ${activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                {tab}
                {activeTab === tab && <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" layoutId="tab-underline" />}
              </button>
            ))}
          </div>
          <div className="py-6 md:py-8 text-muted-foreground leading-relaxed text-sm sm:text-base">
            {activeTab === "description" && <div className="max-w-3xl whitespace-pre-wrap">{product.long_description || product.description}</div>}
            {activeTab === "reviews" && <ReviewSection productId={product.id} />}
            {activeTab === "shipping" && <div className="max-w-3xl"><p>Free standard shipping on orders over $100. Standard: 5-7 days | Express: 2-3 days | Overnight: Next day</p></div>}
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-10 md:mt-16">
            <h2 className="font-display text-xl md:text-2xl font-bold mb-6 md:mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {related.map((p: any, i: number) => {
                const normalized = {
                  ...p,
                  category: p.categories?.name || "Uncategorized",
                  longDescription: p.long_description || p.description || "",
                  images: p.product_images?.map((img: any) => img.image_url) || [],
                  variants: p.product_variants || [],
                  reviewCount: p.review_count || 0,
                  tags: [],
                };
                return <ProductCard key={p.id} product={normalized} index={i} />;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
