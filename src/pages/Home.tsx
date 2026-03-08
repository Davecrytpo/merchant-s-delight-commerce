import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import HeroCarousel from "@/components/storefront/HeroCarousel";
import ProductCard from "@/components/storefront/ProductCard";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { Truck, Shield, RotateCcw, Headphones, Star, ArrowRight, Zap, Loader2 } from "lucide-react";
import { IMAGE_PLACEHOLDER, getSafeImageSrc } from "@/lib/imageFallback";

const features = [
  { icon: Truck, title: "Free Shipping", desc: "On orders over $100", link: "/faq" },
  { icon: Shield, title: "Authenticity", desc: "100% genuine products", link: "/about" },
  { icon: RotateCcw, title: "Easy Returns", desc: "30-day return policy", link: "/faq" },
  { icon: Headphones, title: "24/7 Support", desc: "Always here for you", link: "/contact" },
];

const categoryFallbackImages: Record<string, string> = {
  running: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=80",
  casual: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1000&q=80",
  training: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1000&q=80",
  hiking: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=1000&q=80",
  lifestyle: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=1000&q=80",
  loafers: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=1000&q=80",
  boots: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=1000&q=80",
  sandals: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=1000&q=80",
  oxford: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=1000&q=80",
  formal: "https://images.unsplash.com/photo-1626947346165-4c2288dadc2a?w=1000&q=80",
  basketball: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1000&q=80",
  skateboarding: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1000&q=80",
};

export default function Home() {
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();

  const featured = products?.filter((p: any) => p.is_featured) || [];
  const trending = products?.filter((p: any) => p.is_trending) || [];
  const newArrivals = products?.filter((p: any) => p.is_new) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <HeroCarousel />

      {/* Brand Marquee */}
      <div className="bg-card border-y border-border py-3 md:py-4 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, j) => (
            <div key={j} className="flex items-center gap-6 sm:gap-12 mx-4 sm:mx-6">
              {["PREMIUM QUALITY", "✦", "FREE SHIPPING", "✦", "100% AUTHENTIC", "✦", "NEW ARRIVALS WEEKLY", "✦", "SHOESHOP", "✦"].map((text, i) => (
                <span key={i} className={`text-[10px] sm:text-sm font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase ${text === "✦" ? "text-primary" : "text-muted-foreground"}`}>
                  {text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Features Bar */}
      <section className="py-8 md:py-12 border-b border-border relative z-20 bg-background">
        <div className="container mx-auto px-3 md:px-4">
          {/* Mobile: horizontal scroll. Desktop: grid */}
          <div className="flex md:grid md:grid-cols-4 gap-3 md:gap-6 overflow-x-auto pb-2 md:pb-0 snap-x snap-mandatory -mx-3 px-3 md:mx-0 md:px-0">
            {features.map((f, i) => (
              <Link key={i} to={f.link} className="block relative z-30 group snap-start shrink-0 w-[70%] sm:w-[45%] md:w-auto">
                <motion.div
                  className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl glass h-full hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-primary/50"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl gold-gradient flex items-center justify-center shrink-0 shadow-lg">
                    <f.icon className="w-4 h-4 md:w-5 md:h-5 text-background" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-xs sm:text-sm group-hover:text-primary transition-colors">{f.title}</h4>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{f.desc}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-3 md:px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex justify-between items-end mb-6 md:mb-10"
            >
              <div>
                <span className="text-primary text-xs sm:text-sm font-semibold uppercase tracking-wider">Browse</span>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mt-1">Shop by Category</h2>
              </div>
              <Link to="/shop" className="text-primary text-xs sm:text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all shrink-0">
                View All <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {categories.slice(0, 8).map((cat: any, i: number) => (
                <motion.div
                  key={cat.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/shop?category=${cat.id}`}
                    className="group relative aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden block"
                  >
                    <img
                      src={getSafeImageSrc(cat.image_url || categoryFallbackImages[cat.slug])}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.onerror = null;
                        target.src = IMAGE_PLACEHOLDER;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                    <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4">
                      <h3 className="font-display text-base sm:text-xl font-bold">{cat.name}</h3>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="py-12 md:py-20 bg-card/50">
          <div className="container mx-auto px-3 md:px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex justify-between items-end mb-6 md:mb-10"
            >
              <div>
                <span className="text-primary text-xs sm:text-sm font-semibold uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                  <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Curated
                </span>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mt-1">Featured Collection</h2>
              </div>
              <Link to="/shop" className="text-primary text-xs sm:text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all shrink-0">
                View All <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {featured.map((product: any, i: number) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending */}
      {trending.length > 0 && (
        <section className="py-12 md:py-20 bg-card/50">
          <div className="container mx-auto px-3 md:px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-6 md:mb-10"
            >
              <span className="text-primary text-xs sm:text-sm font-semibold uppercase tracking-wider">Hot Right Now</span>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mt-1">Trending This Week</h2>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {trending.map((product: any, i: number) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-3 md:px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-6 md:mb-10"
            >
              <span className="text-primary text-xs sm:text-sm font-semibold uppercase tracking-wider">Just Dropped</span>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mt-1">New Arrivals</h2>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {newArrivals.map((product: any, i: number) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-12 md:py-20 bg-card/50">
        <div className="container mx-auto px-3 md:px-4 text-center">
          <span className="text-primary text-xs sm:text-sm font-semibold uppercase tracking-wider">Reviews</span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mt-1 mb-8 md:mb-12">What Our Customers Say</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
            {[
              { name: "Alex M.", text: "Best running shoes I've ever owned. The Air Velocity Pro changed my training.", rating: 5 },
              { name: "Sarah K.", text: "The quality is incredible for the price. I've bought 3 pairs from ShoeShop.", rating: 5 },
              { name: "David L.", text: "Fast shipping, great packaging, and the shoes look even better in person.", rating: 5 },
            ].map((review, i) => (
              <motion.div
                key={i}
                className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 text-left"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex gap-0.5 sm:gap-1 mb-2 sm:mb-3">
                  {Array.from({ length: review.rating }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm sm:text-base mb-3 sm:mb-4">"{review.text}"</p>
                <p className="font-semibold text-sm sm:text-base">{review.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
