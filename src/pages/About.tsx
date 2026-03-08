import { motion } from "framer-motion";
import { SHOE_IMAGES } from "@/data/products";
import { Award, Users, Globe, Leaf, Target, Heart } from "lucide-react";

const stats = [
  { value: "50K+", label: "Happy Customers" },
  { value: "200+", label: "Shoe Models" },
  { value: "15", label: "Countries" },
  { value: "98%", label: "Satisfaction Rate" },
];

const values = [
  { icon: Award, title: "Quality First", desc: "Every shoe undergoes rigorous testing to meet our premium standards." },
  { icon: Leaf, title: "Sustainability", desc: "Committed to reducing our footprint with eco-friendly materials." },
  { icon: Heart, title: "Community", desc: "Building a global community of shoe enthusiasts and athletes." },
  { icon: Target, title: "Innovation", desc: "Constantly pushing boundaries in footwear technology and design." },
];

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-[35vh] md:h-[50vh] overflow-hidden">
        <img src={SHOE_IMAGES[4]} alt="About" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold mb-2 md:mb-4">About <span className="gold-text">ShoeShop</span></h1>
            <p className="text-sm md:text-xl text-muted-foreground max-w-xl mx-auto">Crafting the future of footwear since 2020</p>
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      <section className="py-10 md:py-16 border-b border-border">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {stats.map((s, i) => (
            <motion.div key={i} className="text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <p className="font-display text-2xl md:text-4xl font-bold gold-text">{s.value}</p>
              <p className="text-xs md:text-base text-muted-foreground mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <span className="text-primary text-xs md:text-sm font-semibold uppercase tracking-wider">Our Story</span>
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold mt-2 mb-4 md:mb-6">Born From a Passion for Perfect Shoes</h2>
            <div className="space-y-3 md:space-y-4 text-sm md:text-base text-muted-foreground">
              <p>ShoeShop was founded in 2020 by a group of sneaker enthusiasts and footwear engineers who believed that great shoes shouldn't come with a luxury price tag.</p>
              <p>We partner directly with skilled artisans and cutting-edge factories to bring you premium footwear at honest prices.</p>
              <p>Today, we serve over 50,000 customers across 15 countries, and we're just getting started.</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="rounded-2xl md:rounded-3xl overflow-hidden aspect-[4/3]">
            <img src={SHOE_IMAGES[7]} alt="Workshop" className="w-full h-full object-cover" />
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 md:py-20 bg-card/50">
        <div className="container mx-auto px-4 text-center">
          <span className="text-primary text-xs md:text-sm font-semibold uppercase tracking-wider">Our Values</span>
          <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold mt-2 mb-8 md:mb-12">What Drives Us</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {values.map((v, i) => (
              <motion.div key={i} className="glass rounded-xl md:rounded-2xl p-4 md:p-6 text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl gold-gradient flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <v.icon className="w-5 h-5 md:w-6 md:h-6 text-background" />
                </div>
                <h3 className="font-display font-bold text-sm md:text-base mb-1 md:mb-2">{v.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
