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

  // Reset selections when product changes
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
    return Array.from(set).sort();
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
          <h1 className="font-display text-4xl font-bold mb-4">Product Not Found</h1>
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
    // Normalize product for cart context if necessary
    const cartProduct = {
      ...product,
      category: product.categories?.name || "Uncategorized",
      images: product.product_images?.map((img: any) => img.image_url) || []
    };
    
    addItem(cartProduct, selectedVariant, quantity);
    toast.success(`${product.name} added to cart`);
  };

  const images = product.product_images?.map((img: any) => img.image_url) || [];

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/shop" className="hover:text-foreground">Shop</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <ProductImageGallery images={images.length > 0 ? images : ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"]} name={product.name} />

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">{product.brand}</p>
              <h1 className="font-display text-3xl md:text-4xl font-bold">{product.name}</h1>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating || 5) ? "text-primary fill-primary" : "text-muted"}`} />
                  ))}
                </div>
                <span className="text-sm font-medium">{product.rating || "5.0"}</span>
                <span className="text-sm text-muted-foreground">({product.review_count || 0} reviews)</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-display text-3xl font-bold">${product.price}</span>
              {product.original_price && (
                <>
                  <span className="text-xl text-muted-foreground line-through">${product.original_price}</span>
                  <span className="px-2 py-1 rounded-full bg-destructive/20 text-destructive text-sm font-bold">-{discount}%</span>
                </>
              )}
            </div>

            <p className="text-muted-foreground">{product.description}</p>

            {/* Color */}
            <div>
              <p className="font-semibold mb-3">Color: {selectedColor || "Select"}</p>
              <div className="flex gap-3 flex-wrap">
                {colors.map(([name, hex]) => (
                  <button key={name} onClick={() => setSelectedColor(name)} className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor === name ? "border-primary scale-110" : "border-transparent"}`} style={{ backgroundColor: hex }} title={name} />
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <div className="flex justify-between mb-3">
                <p className="font-semibold">Size: {selectedSize || "Select"}</p>
                <Link to="/size-guide" className="text-primary text-sm underline">Size Guide</Link>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {sizes.map((size) => (
                  <button key={size} onClick={() => setSelectedSize(size)} className={`py-2.5 rounded-xl text-sm font-medium transition-all ${selectedSize === size ? "gold-gradient text-background" : "bg-secondary hover:bg-secondary/80"}`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <p className="font-semibold mb-3">Quantity</p>
              <div className="flex items-center gap-4">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                <span className="font-semibold text-lg w-8 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center"><Plus className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={handleAddToCart} className="flex-1 gold-gradient text-background font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 text-lg">
                <ShoppingBag className="w-5 h-5" /> Add to Cart
              </button>
              <button onClick={() => { toggleItem(product); toast.success(wishlisted ? "Removed" : "Added to wishlist"); }} className={`w-14 rounded-xl flex items-center justify-center transition-all ${wishlisted ? "bg-primary text-primary-foreground" : "glass glass-hover"}`}>
                <Heart className="w-5 h-5" fill={wishlisted ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Trust */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              {[{ icon: Truck, text: "Free Shipping" }, { icon: Shield, text: "Authentic" }, { icon: RotateCcw, text: "30-Day Returns" }].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground"><item.icon className="w-4 h-4 text-primary" />{item.text}</div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="flex gap-6 border-b border-border overflow-x-auto">
            {["description", "reviews", "shipping"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-sm font-semibold uppercase tracking-wider transition-colors relative whitespace-nowrap ${activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                {tab}
                {activeTab === tab && <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" layoutId="tab-underline" />}
              </button>
            ))}
          </div>
          <div className="py-8 text-muted-foreground leading-relaxed">
            {activeTab === "description" && <div className="max-w-3xl whitespace-pre-wrap">{product.long_description || product.description}</div>}
            {activeTab === "reviews" && <ReviewSection productId={product.id} />}
            {activeTab === "shipping" && <div className="max-w-3xl"><p>Free standard shipping on orders over $100. Standard: 5-7 days | Express: 2-3 days | Overnight: Next day</p></div>}
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl font-bold mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map((p: any, i: number) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
