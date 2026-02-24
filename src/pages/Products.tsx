import { useSearchParams } from "react-router-dom";
import StorefrontLayout from "@/components/storefront/StorefrontLayout";
import ProductCard from "@/components/storefront/ProductCard";
import { products } from "@/data/products";

export default function Products() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");

  const filtered = products
    .filter((p) => p.status === "published")
    .filter((p) => !category || p.category === category);

  const categories = ["All", "Running", "Casual", "Boots", "Training"];

  return (
    <StorefrontLayout>
      <div className="container py-10">
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">
          {category || "All Shoes"}
        </h1>
        <p className="text-muted-foreground mb-8">{filtered.length} products</p>

        <div className="flex gap-2 mb-8 flex-wrap">
          {categories.map((c) => {
            const isActive = (c === "All" && !category) || c === category;
            return (
              <a
                key={c}
                href={c === "All" ? "/products" : `/products?category=${c}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {c}
              </a>
            );
          })}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-20">No products found in this category.</p>
        )}
      </div>
    </StorefrontLayout>
  );
}
