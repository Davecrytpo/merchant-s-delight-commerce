import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

import productRunning from "@/assets/product-running.jpg";
import productCasual from "@/assets/product-casual.jpg";
import productBoot from "@/assets/product-boot.jpg";
import productTraining from "@/assets/product-training.jpg";

const categories = [
  {
    name: "Running",
    tagline: "Engineered for Speed",
    image: productRunning,
    count: 2,
    className: "md:col-span-2 md:row-span-2",
  },
  {
    name: "Casual",
    tagline: "Everyday Essentials",
    image: productCasual,
    count: 2,
    className: "md:col-span-1",
  },
  {
    name: "Boots",
    tagline: "Built to Last",
    image: productBoot,
    count: 1,
    className: "md:col-span-1",
  },
  {
    name: "Training",
    tagline: "Push Your Limits",
    image: productTraining,
    count: 1,
    className: "md:col-span-2",
  },
];

export default function CategoryShowcase() {
  return (
    <section className="py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-3">Collections</p>
          <h2 className="font-heading text-4xl md:text-6xl font-bold">
            Shop by <span className="text-gradient">Category</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[250px]">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={cat.className}
            >
              <Link
                to={`/products?category=${cat.name}`}
                className="group relative block h-full w-full overflow-hidden rounded-3xl bg-secondary"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-accent font-semibold mb-1">
                      {cat.tagline}
                    </p>
                    <h3 className="font-heading text-3xl md:text-4xl font-bold">{cat.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{cat.count} styles</p>
                  </div>
                  <div className="glass w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300 group-hover:scale-110">
                    <ArrowUpRight className="h-5 w-5" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
