import { Link } from "react-router-dom";
import { Product } from "@/data/products";
import { Star } from "lucide-react";
import shoesCollection from "@/assets/shoes-collection.jpg";

export default function ProductCard({ product }: { product: Product }) {
  const minPrice = Math.min(...product.variants.map((v) => v.price));
  const uniqueColors = [...new Set(product.variants.map((v) => v.color))];

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group block animate-fade-in"
    >
      <div className="aspect-square overflow-hidden rounded-lg bg-secondary mb-3">
        <img
          src={shoesCollection}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{product.brand}</p>
        <h3 className="font-body font-semibold text-foreground group-hover:text-accent transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground">{product.shortDescription}</p>
        <div className="flex items-center gap-2 pt-1">
          <div className="flex items-center gap-0.5">
            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
            <span className="text-sm font-medium">{product.rating}</span>
          </div>
          <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="font-semibold">${minPrice.toFixed(2)}</span>
          <div className="flex gap-1">
            {uniqueColors.slice(0, 4).map((c) => (
              <span
                key={c}
                className="h-3 w-3 rounded-full border border-border"
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
  );
}
