import { useParams, Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { Star, Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import StorefrontLayout from "@/components/storefront/StorefrontLayout";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import shoesCollection from "@/assets/shoes-collection.jpg";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const product = products.find((p) => p.slug === slug);
  const { addItem } = useCart();

  const uniqueColors = useMemo(
    () => (product ? [...new Set(product.variants.map((v) => v.color))] : []),
    [product]
  );
  const uniqueSizes = useMemo(
    () => (product ? [...new Set(product.variants.map((v) => v.size))] : []),
    [product]
  );

  const [selectedColor, setSelectedColor] = useState(uniqueColors[0] || "");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <StorefrontLayout>
        <div className="container py-20 text-center">
          <p className="text-muted-foreground">Product not found.</p>
          <Link to="/products" className="text-accent hover:underline mt-4 inline-block">Back to shop</Link>
        </div>
      </StorefrontLayout>
    );
  }

  const selectedVariant = product.variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize
  );

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error("Please select a size");
      return;
    }
    addItem(product, selectedVariant, quantity);
    toast.success(`${product.name} added to cart`);
  };

  const colorMap: Record<string, string> = {
    Black: "#1a1a1a", White: "#f5f5f5", Red: "#dc2626", Navy: "#1e3a5f",
  };

  return (
    <StorefrontLayout>
      <div className="container py-8">
        <Link to="/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to shop
        </Link>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Image */}
          <div className="aspect-square rounded-lg overflow-hidden bg-secondary">
            <img src={shoesCollection} alt={product.name} className="h-full w-full object-cover" />
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{product.brand} · {product.category}</p>
              <h1 className="font-heading text-3xl md:text-4xl font-bold">{product.name}</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-accent text-accent" />
                <span className="font-semibold">{product.rating}</span>
              </div>
              <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold">
                ${(selectedVariant?.price ?? product.variants[0].price).toFixed(2)}
              </span>
              {selectedVariant?.compareAtPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  ${selectedVariant.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            {/* Color */}
            <div>
              <p className="text-sm font-semibold mb-2">Color: {selectedColor}</p>
              <div className="flex gap-2">
                {uniqueColors.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setSelectedColor(c); setSelectedSize(""); }}
                    className={`h-8 w-8 rounded-full border-2 transition-all ${
                      selectedColor === c ? "border-accent scale-110" : "border-border"
                    }`}
                    style={{ backgroundColor: colorMap[c] || "#888" }}
                    title={c}
                    aria-label={`Select ${c}`}
                  />
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <p className="text-sm font-semibold mb-2">Size</p>
              <div className="flex flex-wrap gap-2">
                {uniqueSizes.map((s) => {
                  const variant = product.variants.find(
                    (v) => v.color === selectedColor && v.size === s
                  );
                  const inStock = variant && variant.inventory > 0;
                  return (
                    <button
                      key={s}
                      onClick={() => inStock && setSelectedSize(s)}
                      disabled={!inStock}
                      className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                        selectedSize === s
                          ? "bg-primary text-primary-foreground border-primary"
                          : inStock
                          ? "bg-card border-border hover:border-foreground"
                          : "bg-muted text-muted-foreground border-border opacity-40 cursor-not-allowed"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity + Add */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center border border-border rounded-md">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-secondary transition-colors" aria-label="Decrease quantity">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 hover:bg-secondary transition-colors" aria-label="Increase quantity">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button
                size="lg"
                onClick={handleAddToCart}
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold uppercase tracking-wider text-sm"
              >
                <ShoppingBag className="mr-2 h-4 w-4" /> Add to Cart
              </Button>
            </div>

            {selectedVariant && (
              <p className="text-xs text-muted-foreground">
                SKU: {selectedVariant.sku} · {selectedVariant.inventory} in stock
              </p>
            )}
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
