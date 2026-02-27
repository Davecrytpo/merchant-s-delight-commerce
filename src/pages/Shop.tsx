import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { SlidersHorizontal, Grid3X3, LayoutList, X } from "lucide-react";
import ProductCard from "@/components/storefront/ProductCard";
import { products, categories } from "@/data/products";

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Top Rated", value: "rating" },
  { label: "Most Popular", value: "popular" },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [gridCols, setGridCols] = useState(4);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeCategory = searchParams.get("category") || "";
  const activeSort = searchParams.get("sort") || "newest";
  const priceRange = searchParams.get("price") || "";

  const filtered = useMemo(() => {
    let result = [...products];
    if (activeCategory) result = result.filter((p) => p.category === activeCategory);
    if (priceRange) {
      const [min, max] = priceRange.split("-").map(Number);
      result = result.filter((p) => p.price >= min && p.price <= max);
    }
    switch (activeSort) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "rating": result.sort((a, b) => b.rating - a.rating); break;
      case "popular": result.sort((a, b) => b.reviewCount - a.reviewCount); break;
      default: break;
    }
    return result;
  }, [activeCategory, activeSort, priceRange]);

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="bg-card py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            className="font-display text-4xl md:text-5xl font-bold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {activeCategory || "All"} <span className="gold-text">Shoes</span>
          </motion.h1>
          <p className="text-muted-foreground mt-2">{filtered.length} products</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl glass glass-hover text-sm font-medium"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
            {activeCategory && (
              <button
                onClick={() => setFilter("category", "")}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/20 text-primary text-sm"
              >
                {activeCategory} <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <select
              value={activeSort}
              onChange={(e) => setFilter("sort", e.target.value)}
              className="bg-secondary rounded-xl px-4 py-2 text-sm outline-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="hidden md:flex gap-1">
              {[3, 4].map((cols) => (
                <button
                  key={cols}
                  onClick={() => setGridCols(cols)}
                  className={`p-2 rounded-lg transition-colors ${gridCols === cols ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
                >
                  {cols === 3 ? <LayoutList className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <motion.aside
            className={`${filtersOpen ? "block" : "hidden"} md:block w-full md:w-64 shrink-0`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="glass rounded-2xl p-6 space-y-6 sticky top-24">
              <div>
                <h3 className="font-semibold mb-3">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setFilter("category", "")}
                    className={`block text-sm w-full text-left px-3 py-2 rounded-lg transition-colors ${!activeCategory ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
                  >
                    All ({products.length})
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => setFilter("category", cat.name)}
                      className={`block text-sm w-full text-left px-3 py-2 rounded-lg transition-colors ${activeCategory === cat.name ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
                    >
                      {cat.name} ({products.filter((p) => p.category === cat.name).length})
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Price Range</h3>
                <div className="space-y-2">
                  {[["Under $100", "0-100"], ["$100 - $200", "100-200"], ["$200 - $300", "200-300"], ["Over $300", "300-999"]].map(([label, val]) => (
                    <button
                      key={val}
                      onClick={() => setFilter("price", priceRange === val ? "" : val)}
                      className={`block text-sm w-full text-left px-3 py-2 rounded-lg transition-colors ${priceRange === val ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Products Grid */}
          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-muted-foreground">No products found</p>
                <button onClick={() => setSearchParams({})} className="text-primary mt-2 underline">Clear filters</button>
              </div>
            ) : (
              <div className={`grid grid-cols-2 ${gridCols === 3 ? "md:grid-cols-3" : "md:grid-cols-3 lg:grid-cols-4"} gap-6`}>
                {filtered.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
