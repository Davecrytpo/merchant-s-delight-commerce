import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import HeroCarousel from "@/components/storefront/HeroCarousel";
import ProductCard from "@/components/storefront/ProductCard";
import { products, categories, SHOE_IMAGES } from "@/data/products";
import { Truck, Shield, RotateCcw, Headphones, Star, ArrowRight, Zap } from "lucide-react";

const features = [
  { icon: Truck, title: "Free Shipping", desc: "On orders over $100" },
  { icon: Shield, title: "Authenticity", desc: "100% genuine products" },
  { icon: RotateCcw, title: "Easy Returns", desc: "30-day return policy" },
  { icon: Headphones, title: "24/7 Support", desc: "Always here for you" },
];

export default function Home() {
  const featured = products.filter((p) => p.isFeatured);
  const trending = products.filter((p) => p.isTrending);
  const newArrivals = products.filter((p) => p.isNew);

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
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-4 p-4 rounded-xl glass"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center shrink-0">
                <f.icon className="w-5 h-5 text-background" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">{f.title}</h4>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories */}
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
            {categories.slice(0, 8).map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/shop?category=${cat.name}`}
                  className="group relative aspect-[4/3] rounded-2xl overflow-hidden block"
                >
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <h3 className="font-display text-xl font-bold">{cat.name}</h3>
                    <p className="text-sm text-muted-foreground">{cat.count} products</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
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
            {featured.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Big Banner */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="relative rounded-3xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <img src={SHOE_IMAGES[7]} alt="Collection" className="w-full h-[400px] md:h-[500px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/60 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="p-8 md:p-16 max-w-lg">
                <span className="text-primary text-sm font-semibold uppercase tracking-wider">Limited Edition</span>
                <h2 className="font-display text-4xl md:text-5xl font-bold mt-2 mb-4">Summit Trail X</h2>
                <p className="text-muted-foreground mb-6">Conquer any terrain with GORE-TEX® protection and Vibram® traction. Built for those who refuse to stay on the beaten path.</p>
                <Link to="/product/summit-trail-x" className="gold-gradient text-background font-semibold px-8 py-4 rounded-xl inline-block hover:opacity-90 transition-opacity">
                  Shop Now — $219
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trending */}
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
            {trending.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
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
            {newArrivals.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

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
