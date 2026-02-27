import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { products, SHOE_IMAGES } from "@/data/products";

const slides = [
  {
    title: "Step Into",
    highlight: "Greatness",
    subtitle: "Premium footwear engineered for champions",
    cta: "Shop Collection",
    link: "/shop",
    image: SHOE_IMAGES[0],
    accent: "Running",
  },
  {
    title: "Redefine",
    highlight: "Street Style",
    subtitle: "Where heritage meets modern culture",
    cta: "Explore Lifestyle",
    link: "/shop?category=Casual",
    image: SHOE_IMAGES[4],
    accent: "Casual",
  },
  {
    title: "Conquer",
    highlight: "Every Trail",
    subtitle: "Built for the wildest adventures",
    cta: "Shop Outdoor",
    link: "/shop?category=Hiking",
    image: SHOE_IMAGES[7],
    accent: "Hiking",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > current ? 1 : -1);
      setCurrent(index);
    },
    [current]
  );

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  const imageVariants = {
    enter: (d: number) => ({
      clipPath: d > 0
        ? "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)"
        : "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
      scale: 1.2,
    }),
    center: {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      scale: 1,
      transition: { clipPath: { duration: 1, ease: [0.77, 0, 0.175, 1] }, scale: { duration: 1.5, ease: "easeOut" } },
    },
    exit: (d: number) => ({
      clipPath: d > 0
        ? "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)"
        : "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
      transition: { duration: 0.8, ease: [0.77, 0, 0.175, 1] },
    }),
  };

  const textVariants = {
    enter: { opacity: 0, y: 80, filter: "blur(10px)" },
    center: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, delay: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: -40, filter: "blur(5px)", transition: { duration: 0.4 } },
  };

  return (
    <section className="relative h-[90vh] md:h-screen overflow-hidden bg-background">
      {/* Background Image */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={current}
          custom={direction}
          variants={imageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full container mx-auto px-4 flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            variants={textVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="max-w-2xl"
          >
            <motion.span
              className="inline-block px-4 py-1.5 rounded-full border border-primary/40 text-primary text-sm font-medium mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              {slide.accent} Collection
            </motion.span>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-none mb-4">
              {slide.title}
              <br />
              <span className="gold-text">{slide.highlight}</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg">
              {slide.subtitle}
            </p>
            <div className="flex gap-4">
              <Link
                to={slide.link}
                className="gold-gradient text-background font-semibold px-8 py-4 rounded-xl hover:opacity-90 transition-opacity text-lg"
              >
                {slide.cta}
              </Link>
              <Link
                to="/shop"
                className="border border-foreground/20 text-foreground font-semibold px-8 py-4 rounded-xl hover:bg-foreground/5 transition-colors text-lg"
              >
                View All
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-8 left-0 right-0 z-20">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === current ? "w-12 bg-primary" : "w-6 bg-foreground/20"
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={prev}
              className="w-12 h-12 rounded-full glass glass-hover flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="w-12 h-12 rounded-full glass glass-hover flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating product cards */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3 z-20">
        {slides.map((s, i) => (
          <motion.button
            key={i}
            onClick={() => goTo(i)}
            className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
              i === current ? "border-primary scale-110" : "border-transparent opacity-50 hover:opacity-80"
            }`}
            whileHover={{ scale: 1.1 }}
          >
            <img src={s.image} alt="" className="w-full h-full object-cover" />
          </motion.button>
        ))}
      </div>
    </section>
  );
}
