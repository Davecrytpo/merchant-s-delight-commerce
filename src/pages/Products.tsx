import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
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
      <div className="container py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-3">
            {category ? `${category} Collection` : "All Products"}
          </p>
          <h1 className="font-heading text-5xl md:text-7xl font-bold mb-4">
            {category || "All"} <span className="text-gradient">Shoes</span>
          </h1>
          <p className="text-lg text-muted-foreground">{filtered.length} products available</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex gap-3 mb-12 flex-wrap"
        >
          {categories.map((c) => {
            const isActive = (c === "All" && !category) || c === category;
            return (
              <a
                key={c}
                href={c === "All" ? "/products" : `/products?category=${c}`}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-accent text-accent-foreground glow-accent"
                    : "glass text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {c}
              </a>
            );
          })}
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-32">
            <p className="text-2xl font-heading font-bold text-muted-foreground">No products found</p>
            <p className="text-muted-foreground mt-2">Try a different category.</p>
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
}
