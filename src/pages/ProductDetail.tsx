import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star, Truck, Shield, RotateCcw, Minus, Plus, ChevronRight } from "lucide-react";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import ProductCard from "@/components/storefront/ProductCard";
import ProductImageGallery from "@/components/product/ProductImageGallery";
import ProductReviews from "@/components/product/ProductReviews";
import { toast } from "sonner";

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  const product = products.find((p) => p.slug === slug);

  const colors = useMemo(() => {
    if (!product) return [];
    const map = new Map<string, string>();
    product.variants.forEach((v) => map.set(v.color, v.colorHex));
    return Array.from(map.entries());
  }, [product]);

  const sizes = useMemo(() => {
    if (!product) return [];
    const set = new Set<string>();
    product.variants
      .filter((v) => !selectedColor || v.color === selectedColor)
      .forEach((v) => set.add(v.size));
    return Array.from(set);
  }, [product, selectedColor]);

  const selectedVariant = useMemo(() => {
    if (!product) return undefined;
    return product.variants.find(
      (v) => v.size === selectedSize && v.color === selectedColor
    );
  }, [product, selectedSize, selectedColor]);

  if (!product) {
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
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error("Please select size and color");
      return;
    }
    addItem(product, selectedVariant, quantity);
    toast.success(`${product.name} added to cart`);
  };

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <ProductImageGallery images={product.images} name={product.name} />

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">{product.brand}</p>
              <h1 className="font-display text-2xl md:text-4xl font-bold">{product.name}</h1>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? "text-primary fill-primary" : "text-muted"}`} />
                  ))}
                </div>
                <span className="text-sm font-medium">{product.rating}</span>
                <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-display text-2xl md:text-3xl font-bold">${product.price}</span>
              {product.originalPrice && (
                <>
                  <span className="text-lg md:text-xl text-muted-foreground line-through">${product.originalPrice}</span>
                  <span className="px-2 py-1 rounded-full bg-destructive/20 text-destructive text-sm font-bold">-{discount}%</span>
                </>
              )}
            </div>

            <p className="text-muted-foreground text-sm md:text-base">{product.description}</p>

            {/* Color */}
            <div>
              <p className="font-semibold mb-3 text-sm">Color: {selectedColor || "Select"}</p>
              <div className="flex gap-3 flex-wrap">
                {colors.map(([name, hex]) => (
                  <button key={name} onClick={() => setSelectedColor(name)} className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor === name ? "border-primary scale-110" : "border-transparent"}`} style={{ backgroundColor: hex }} title={name} />
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <div className="flex justify-between mb-3">
                <p className="font-semibold text-sm">Size: {selectedSize || "Select"}</p>
                <Link to="/size-guide" className="text-primary text-sm underline">Size Guide</Link>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {sizes.map((size) => (
                  <button key={size} onClick={() => setSelectedSize(size)} className={`py-2.5 rounded-xl text-sm font-medium transition-all ${selectedSize === size ? "gold-gradient text-background" : "bg-secondary hover:bg-secondary/80"}`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <p className="font-semibold mb-3 text-sm">Quantity</p>
              <div className="flex items-center gap-4">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                <span className="font-semibold text-lg w-8 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center"><Plus className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={handleAddToCart} className="flex-1 gold-gradient text-background font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 text-base md:text-lg">
                <ShoppingBag className="w-5 h-5" /> Add to Cart
              </button>
              <button onClick={() => { toggleItem(product); toast.success(wishlisted ? "Removed" : "Added to wishlist"); }} className={`w-14 rounded-xl flex items-center justify-center transition-all ${wishlisted ? "bg-primary text-primary-foreground" : "glass glass-hover"}`}>
                <Heart className="w-5 h-5" fill={wishlisted ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Trust */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
              {[{ icon: Truck, text: "Free Shipping" }, { icon: Shield, text: "Authentic" }, { icon: RotateCcw, text: "30-Day Returns" }].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground"><item.icon className="w-4 h-4 text-primary shrink-0" />{item.text}</div>
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
          <div className="py-8">
            {activeTab === "description" && (
              <div className="max-w-3xl text-muted-foreground leading-relaxed">{product.longDescription}</div>
            )}
            {activeTab === "reviews" && (
              <ProductReviews productId={product.id} productName={product.name} />
            )}
            {activeTab === "shipping" && (
              <div className="max-w-3xl text-muted-foreground leading-relaxed">
                <p>Free standard shipping on orders over $100. Standard: 5-7 days | Express: 2-3 days | Overnight: Next day</p>
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl font-bold mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
