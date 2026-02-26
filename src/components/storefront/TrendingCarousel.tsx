import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { products, Product } from "@/data/products";

import productRunning from "@/assets/product-running.jpg";
import productCasual from "@/assets/product-casual.jpg";
import productBoot from "@/assets/product-boot.jpg";
import productTraining from "@/assets/product-training.jpg";

const categoryImages: Record<string, string> = {
  Running: productRunning,
  Casual: productCasual,
  Boots: productBoot,
  Training: productTraining,
};

export default function TrendingCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);

  const published = products.filter((p) => p.status === "published");

  return (
    <section ref={containerRef} className="py-24 overflow-hidden">
      <div className="container mb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-3">Trending Now</p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold">
              Most <span className="text-gradient">Popular</span>
            </h2>
          </div>
          <Link
            to="/products"
            className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-accent transition-colors"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>

      {/* Horizontal scroll on vertical scroll */}
      <motion.div style={{ x }} className="flex gap-6 px-8">
        {[...published, ...published].map((product, i) => (
          <TrendingCard key={`${product.id}-${i}`} product={product} index={i} />
        ))}
      </motion.div>
    </section>
  );
}

function TrendingCard({ product, index }: { product: Product; index: number }) {
  const image = categoryImages[product.category] || productRunning;
  const minPrice = Math.min(...product.variants.map((v) => v.price));

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group flex-shrink-0 w-[320px] md:w-[400px]"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-secondary mb-4">
        <img
          src={image}
          alt={product.name}
          className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1">{product.brand}</p>
          <h3 className="font-heading text-2xl font-bold mb-1">{product.name}</h3>
          <p className="text-lg font-semibold text-accent">${minPrice.toFixed(2)}</p>
        </div>
        <div className="absolute top-4 right-4 glass rounded-full px-3 py-1.5 text-xs font-semibold">
          #{index + 1} Trending
        </div>
      </div>
    </Link>
  );
}
