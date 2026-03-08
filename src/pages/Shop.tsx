import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { SlidersHorizontal, Grid3X3, LayoutList, X, Search, Loader2 } from "lucide-react";
import ProductCard from "@/components/storefront/ProductCard";
import { useProducts, useCategories } from "@/hooks/useProducts";

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

  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const activeCategoryId = searchParams.get("category") || "";
  const activeSort = searchParams.get("sort") || "newest";
  const priceRange = searchParams.get("price") || "";
  const searchQuery = searchParams.get("search") || "";

  const filtered = useMemo(() => {
    if (!products) return [];
    let result = [...products];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p: any) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }
    if (activeCategoryId) {
      result = result.filter((p: any) => p.category_id === activeCategoryId);
    }
    if (priceRange) {
      const [min, max] = priceRange.split("-").map(Number);
      result = result.filter((p: any) => p.price >= min && p.price <= max);
    }
    switch (activeSort) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "rating": result.sort((a, b) => (b.rating || 5) - (a.rating || 5)); break;
      case "popular": result.sort((a, b) => (b.review_count || 0) - (a.review_count || 0)); break;
      default: result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
    }
    return result;
  }, [products, activeCategoryId, activeSort, priceRange, searchQuery]);

  const activeCategoryName = useMemo(() => {
    return categories?.find((c: any) => c.id === activeCategoryId)?.name || "";
  }, [categories, activeCategoryId]);

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  };

  if (productsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="bg-card py-10 md:py-16">
        <div className="container mx-auto px-3 md:px-4 text-center">
          <motion.h1
            className="font-display text-2xl sm:text-3xl md:text-5xl font-bold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {searchQuery ? (
              <>Results for "<span className="gold-text">{searchQuery}</span>"</>
            ) : (
              <>{activeCategoryName || "All"} <span className="gold-text">Shoes</span></>
            )}
          </motion.h1>
          <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">{filtered.length} products found</p>
        </div>
      </div>

      <div className="container mx-auto px-3 md:px-4 py-6 md:py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 md:mb-8 gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl glass glass-hover text-xs sm:text-sm font-medium"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Filters
            </button>
            {activeCategoryId && (
              <button onClick={() => setFilter("category", "")} className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-primary/20 text-primary text-xs sm:text-sm">
                {activeCategoryName} <X className="w-3 h-3" />
              </button>
            )}
            {searchQuery && (
              <button onClick={() => setFilter("search", "")} className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-primary/20 text-primary text-xs sm:text-sm">
                <Search className="w-3 h-3" /> {searchQuery} <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <select
              value={activeSort}
              onChange={(e) => setFilter("sort", e.target.value)}
              className="bg-secondary rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm outline-none max-w-[150px] sm:max-w-none"
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

        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Mobile filter overlay */}
          {filtersOpen && (
            <div className="fixed inset-0 z-50 md:hidden" onClick={() => setFiltersOpen(false)}>
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-2xl p-5 max-h-[70vh] overflow-y-auto"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display font-bold text-lg">Filters</h3>
                  <button onClick={() => setFiltersOpen(false)} className="p-2 hover:bg-secondary rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <FilterContent
                  categories={categories}
                  activeCategoryId={activeCategoryId}
                  priceRange={priceRange}
                  setFilter={(k, v) => { setFilter(k, v); setFiltersOpen(false); }}
                />
              </motion.div>
            </div>
          )}

          {/* Desktop sidebar */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="glass rounded-2xl p-6 space-y-6 sticky top-24">
              <FilterContent
                categories={categories}
                activeCategoryId={activeCategoryId}
                priceRange={priceRange}
                setFilter={setFilter}
              />
            </div>
          </aside>

          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-lg md:text-xl text-muted-foreground">No products found</p>
                <button onClick={() => setSearchParams({})} className="text-primary mt-2 underline text-sm">Clear all filters</button>
              </div>
            ) : (
              <div className={`grid grid-cols-2 ${gridCols === 3 ? "md:grid-cols-3" : "md:grid-cols-3 lg:grid-cols-4"} gap-3 sm:gap-4 md:gap-6`}>
                {filtered.map((product: any, i: number) => (
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

function FilterContent({ categories, activeCategoryId, priceRange, setFilter }: {
  categories: any[] | undefined;
  activeCategoryId: string;
  priceRange: string;
  setFilter: (key: string, value: string) => void;
}) {
  return (
    <>
      <div>
        <h3 className="font-semibold mb-3 text-sm md:text-base">Categories</h3>
        <div className="space-y-1 sm:space-y-2">
          <button
            onClick={() => setFilter("category", "")}
            className={`block text-xs sm:text-sm w-full text-left px-3 py-2 rounded-lg transition-colors ${!activeCategoryId ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
          >
            All Products
          </button>
          {categories?.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setFilter("category", cat.id)}
              className={`block text-xs sm:text-sm w-full text-left px-3 py-2 rounded-lg transition-colors ${activeCategoryId === cat.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-3 text-sm md:text-base">Price Range</h3>
        <div className="space-y-1 sm:space-y-2">
          {[["Under $100", "0-100"], ["$100 - $200", "100-200"], ["$200 - $300", "200-300"], ["Over $300", "300-999"]].map(([label, val]) => (
            <button
              key={val}
              onClick={() => setFilter("price", priceRange === val ? "" : val)}
              className={`block text-xs sm:text-sm w-full text-left px-3 py-2 rounded-lg transition-colors ${priceRange === val ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
