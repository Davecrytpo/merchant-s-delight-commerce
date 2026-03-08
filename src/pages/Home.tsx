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
  hiking: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=1000&q=80",
  office: "https://images.pexels.com/photos/19090/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1000",
  luxury: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1000",
  kids: "https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg?auto=compress&cs=tinysrgb&w=1000",
  lifestyle: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=1000&q=80",
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
      {/* Hero */}
      <HeroCarousel />

      {/* Brand Marquee */}
      <div className="bg-card border-y border-border py-4 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, j) => (
            <div key={j} className="flex items-center gap-12 mx-6">
              {["PREMIUM QUALITY", "✦", "FREE SHIPPING", "✦", "100% AUTHENTIC", "✦", "NEW ARRIVALS WEEKLY", "✦", "SHOESHOP", "✦"].map((text, i) => (
                <span key={i} className={`text-sm font-bold tracking-[0.3em] uppercase ${text === "✦" ? "text-primary" : "text-muted-foreground"}`}>
                  {text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Features Bar */}
      <section className="py-12 border-b border-border relative z-20 bg-background">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <Link key={i} to={f.link} className="block relative z-30 group">
              <motion.div
                className="flex items-center gap-4 p-4 rounded-xl glass h-full hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-primary/50"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center shrink-0 shadow-lg group-hover:shadow-primary/20 transition-shadow">
                  <f.icon className="w-5 h-5 text-background" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{f.title}</h4>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex justify-between items-end mb-10"
            >
              <div>
                <span className="text-primary text-sm font-semibold uppercase tracking-wider">Browse</span>
                <h2 className="font-display text-3xl md:text-4xl font-bold mt-1">Shop by Category</h2>
              </div>
              <Link to="/shop" className="text-primary text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                    className="group relative aspect-[4/3] rounded-2xl overflow-hidden block"
                  >
                    <img
                      src={getSafeImageSrc(cat.image_url || categoryFallbackImages[cat.slug])}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.onerror = null;
                        target.src = IMAGE_PLACEHOLDER;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <h3 className="font-display text-xl font-bold">{cat.name}</h3>
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
        <section className="py-20 bg-card/50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex justify-between items-end mb-10"
            >
              <div>
                <span className="text-primary text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Curated
                </span>
                <h2 className="font-display text-3xl md:text-4xl font-bold mt-1">Featured Collection</h2>
              </div>
              <Link to="/shop" className="text-primary text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featured.map((product: any, i: number) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending */}
      {trending.length > 0 && (
        <section className="py-20 bg-card/50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <span className="text-primary text-sm font-semibold uppercase tracking-wider">Hot Right Now</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold mt-1">Trending This Week</h2>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {trending.map((product: any, i: number) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <span className="text-primary text-sm font-semibold uppercase tracking-wider">Just Dropped</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold mt-1">New Arrivals</h2>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {newArrivals.map((product: any, i: number) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4 text-center">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">Reviews</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-1 mb-12">What Our Customers Say</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { name: "Alex M.", text: "Best running shoes I've ever owned. The Air Velocity Pro changed my training.", rating: 5 },
              { name: "Sarah K.", text: "The quality is incredible for the price. I've bought 3 pairs from ShoeShop.", rating: 5 },
              { name: "David L.", text: "Fast shipping, great packaging, and the shoes look even better in person.", rating: 5 },
            ].map((review, i) => (
              <motion.div
                key={i}
                className="glass rounded-2xl p-6 text-left"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: review.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">"{review.text}"</p>
                <p className="font-semibold">{review.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

