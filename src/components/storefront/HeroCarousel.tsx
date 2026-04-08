import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { SHOE_IMAGES } from "@/data/products";
import { IMAGE_PLACEHOLDER, getSafeImageSrc } from "@/lib/imageFallback";

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
      opacity: 0,
      scale: 1.15,
      x: d > 0 ? "8%" : "-8%",
    }),
    center: {
      opacity: 1,
      scale: 1.02,
      x: "0%",
      transition: {
        opacity: { duration: 0.8, ease: "easeOut" },
        scale: { duration: 10, ease: "easeOut" },
        x: { duration: 1, ease: [0.22, 1, 0.36, 1] },
      },
    },
    exit: (d: number) => ({
      opacity: 0,
      scale: 1,
      x: d > 0 ? "-5%" : "5%",
      transition: { duration: 0.6, ease: [0.77, 0, 0.175, 1] },
    }),
  };

  const textVariants = {
    enter: { opacity: 0, y: 50, filter: "blur(8px)" },
    center: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] },
    },
    exit: { opacity: 0, y: -30, filter: "blur(6px)", transition: { duration: 0.4 } },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 30, rotateX: -60 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { delay: 0.4 + i * 0.03, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  return (
    <section className="relative h-[85vh] sm:h-[90vh] md:h-[92vh] overflow-hidden bg-secondary/30">
      {/* Soft ambient */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <motion.div
          key={`glow-${current}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.08 }}
          transition={{ duration: 2 }}
          className="absolute bottom-0 left-0 w-[80%] md:w-[60%] h-[50%] md:h-[60%] rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(12 76% 52%), transparent 70%)",
            filter: "blur(100px)",
          }}
        />
      </div>

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
            src={getSafeImageSrc(slide.image)}
            alt={slide.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.onerror = null;
              target.src = IMAGE_PLACEHOLDER;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 md:via-background/70 to-background/20 md:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full container mx-auto px-4 flex items-end pb-28 sm:pb-20 md:items-center md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            variants={textVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="max-w-lg md:max-w-2xl"
          >
            <motion.span
              className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1 md:py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs md:text-sm font-medium mb-4 md:mb-6"
              initial={{ opacity: 0, scale: 0.8, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
            >
              <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5" />
              {slide.accent} Collection
            </motion.span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-3 md:mb-4" style={{ perspective: "1000px" }}>
              <span className="block overflow-hidden">
                {slide.title.split("").map((char, i) => (
                  <motion.span
                    key={`${current}-${i}`}
                    custom={i}
                    variants={letterVariants}
                    initial="hidden"
                    animate="visible"
                    className="inline-block"
                    style={{ transformOrigin: "bottom" }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
              </span>
              <span className="block overflow-hidden">
                {slide.highlight.split("").map((char, i) => (
                  <motion.span
                    key={`${current}-h-${i}`}
                    custom={i + slide.title.length}
                    variants={letterVariants}
                    initial="hidden"
                    animate="visible"
                    className="inline-block copper-text"
                    style={{ transformOrigin: "bottom" }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
              </span>
            </h1>
            <motion.p
              className="text-sm sm:text-base md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              {slide.subtitle}
            </motion.p>
            <motion.div
              className="flex gap-3"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.8 }}
            >
              <Link
                to={slide.link}
                className="copper-gradient text-primary-foreground font-semibold px-5 sm:px-6 md:px-8 py-3 md:py-4 rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all duration-500 text-sm md:text-lg"
              >
                {slide.cta}
              </Link>
              <Link
                to="/shop"
                className="border border-foreground/20 text-foreground font-semibold px-5 sm:px-6 md:px-8 py-3 md:py-4 rounded-xl hover:bg-foreground/5 hover:border-foreground/40 transition-all duration-300 text-sm md:text-lg"
              >
                View All
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-0 right-0 z-20">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex gap-2 items-center">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="relative h-1.5 rounded-full overflow-hidden transition-all duration-500"
                style={{ width: i === current ? 48 : 20 }}
              >
                <div className="absolute inset-0 bg-foreground/10 rounded-full" />
                {i === current && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary"
                    initial={{ scaleX: 0, transformOrigin: "left" }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 6, ease: "linear" }}
                  />
                )}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={prev}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-card/80 backdrop-blur-sm border border-border/60 flex items-center justify-center hover:bg-card hover:shadow-md transition-all duration-300"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
              onClick={next}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-card/80 backdrop-blur-sm border border-border/60 flex items-center justify-center hover:bg-card hover:shadow-md transition-all duration-300"
            >
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating product cards - desktop only */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3 z-20">
        {slides.map((s, i) => (
          <motion.button
            key={i}
            onClick={() => goTo(i)}
            className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-500 shadow-md ${
              i === current ? "border-primary scale-110 shadow-lg shadow-primary/20" : "border-transparent opacity-50 hover:opacity-80"
            }`}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
          >
            <img
              src={getSafeImageSrc(s.image)}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.onerror = null;
                target.src = IMAGE_PLACEHOLDER;
              }}
            />
          </motion.button>
        ))}
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 2 }}
      >
        <motion.div
          className="w-5 h-8 rounded-full border-2 border-foreground/20 flex justify-center pt-1"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <motion.div
            className="w-1 h-2 rounded-full bg-primary"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
