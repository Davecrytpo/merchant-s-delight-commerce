import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Shield, Truck } from "lucide-react";
import { products } from "@/data/products";
import ProductCard from "./ProductCard";

export default function FeaturedSection() {
  const featured = products.filter((p) => p.status === "published").slice(0, 4);

  return (
    <section className="py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-3">Curated Selection</p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold">
              Featured <span className="text-gradient">Picks</span>
            </h2>
          </div>
          <Link
            to="/products"
            className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-accent transition-colors group"
          >
            View All <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20"
        >
          {[
            { icon: Truck, label: "Free Shipping", desc: "On orders over $100" },
            { icon: Shield, label: "2 Year Warranty", desc: "Quality guaranteed" },
            { icon: Zap, label: "Fast Delivery", desc: "2-4 business days" },
          ].map((item) => (
            <div
              key={item.label}
              className="glass rounded-2xl p-8 flex items-center gap-5 hover:bg-secondary/50 transition-colors"
            >
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                <item.icon className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h4 className="font-body font-semibold text-foreground">{item.label}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
