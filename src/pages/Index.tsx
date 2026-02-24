import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import StorefrontLayout from "@/components/storefront/StorefrontLayout";
import ProductCard from "@/components/storefront/ProductCard";
import { products } from "@/data/products";
import heroImage from "@/assets/hero-shoe.jpg";

export default function Index() {
  const featured = products.filter((p) => p.status === "published").slice(0, 4);
  const categories = [
    { name: "Running", count: products.filter((p) => p.category === "Running").length },
    { name: "Casual", count: products.filter((p) => p.category === "Casual").length },
    { name: "Boots", count: products.filter((p) => p.category === "Boots").length },
    { name: "Training", count: products.filter((p) => p.category === "Training").length },
  ];

  return (
    <StorefrontLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="container grid md:grid-cols-2 gap-8 items-center py-16 md:py-24">
          <div className="space-y-6 z-10">
            <p className="text-sm uppercase tracking-[0.2em] text-accent font-semibold">New Collection 2026</p>
            <h1 className="font-heading text-4xl md:text-6xl font-bold leading-tight">
              Step Into <br />
              <span className="text-accent">Your Best</span>
            </h1>
            <p className="text-lg opacity-70 max-w-md leading-relaxed">
              Premium footwear crafted for performance and style. Find your perfect pair.
            </p>
            <div className="flex gap-3">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold uppercase tracking-wider text-sm">
                <Link to="/products">Shop Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <img
              src={heroImage}
              alt="Premium running shoe"
              className="w-full rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-16">
        <h2 className="font-heading text-3xl font-bold text-center mb-10">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${cat.name}`}
              className="group relative rounded-lg bg-secondary p-8 text-center hover:bg-accent hover:text-accent-foreground transition-colors duration-300"
            >
              <h3 className="font-heading text-xl font-semibold">{cat.name}</h3>
              <p className="text-sm text-muted-foreground group-hover:text-accent-foreground/70 mt-1">
                {cat.count} {cat.count === 1 ? "style" : "styles"}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-heading text-3xl font-bold">Featured</h2>
          <Link to="/products" className="text-sm font-medium text-accent hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </StorefrontLayout>
  );
}
