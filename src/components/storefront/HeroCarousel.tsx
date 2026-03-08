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
      clipPath: d > 0
        ? "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)"
        : "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
      scale: 1.3,
      filter: "brightness(0.5)",
    }),
    center: {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      scale: 1.05,
      filter: "brightness(1)",
      transition: {
        clipPath: { duration: 1.2, ease: [0.77, 0, 0.175, 1] },
        scale: { duration: 8, ease: "easeOut" },
        filter: { duration: 1.5, ease: "easeOut" },
      },
    },
    exit: (d: number) => ({
      clipPath: d > 0
        ? "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)"
        : "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
      filter: "brightness(0.3)",
      transition: { duration: 0.8, ease: [0.77, 0, 0.175, 1] },
    }),
  };

  const textVariants = {
    enter: { opacity: 0, y: 100, filter: "blur(20px)", scale: 0.9 },
    center: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      scale: 1,
      transition: { duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] },
    },
    exit: { opacity: 0, y: -60, filter: "blur(10px)", scale: 0.95, transition: { duration: 0.5 } },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -90 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { delay: 0.5 + i * 0.04, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  return (
    <section className="relative h-[90vh] md:h-screen overflow-hidden bg-background">
      {/* Ambient glow */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <motion.div
          key={`glow-${current}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 2 }}
          className="absolute bottom-0 left-0 w-[60%] h-[60%] rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(36 100% 55%), transparent 70%)",
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
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-foreground/20" />
          {/* Grain overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />
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
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 text-primary text-sm font-medium mb-6 glow-border"
              initial={{ opacity: 0, scale: 0.8, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {slide.accent} Collection
            </motion.span>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-none mb-4 text-white" style={{ perspective: "1000px" }}>
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
                    className="inline-block gold-text"
                    style={{ transformOrigin: "bottom" }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
              </span>
            </h1>
            <motion.p
              className="text-lg md:text-xl text-white/70 mb-8 max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              {slide.subtitle}
            </motion.p>
            <motion.div
              className="flex gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.8 }}
            >
              <Link
                to={slide.link}
                className="gold-gradient text-primary-foreground font-semibold px-8 py-4 rounded-xl hover:shadow-[0_0_30px_-5px_hsl(36_100%_55%_/_0.5)] transition-all duration-500 text-lg glow-border"
              >
                {slide.cta}
              </Link>
              <Link
                to="/shop"
                className="border border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 hover:border-white/50 transition-all duration-300 text-lg"
              >
                View All
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-8 left-0 right-0 z-20">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex gap-2 items-center">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="relative h-1 rounded-full overflow-hidden transition-all duration-500"
                style={{ width: i === current ? 48 : 24 }}
              >
                <div className="absolute inset-0 bg-white/20 rounded-full" />
                {i === current && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ background: "linear-gradient(90deg, hsl(36 100% 55%), hsl(40 100% 68%))" }}
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
              className="w-12 h-12 rounded-full glass glass-hover flex items-center justify-center hover:glow-border transition-all duration-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="w-12 h-12 rounded-full glass glass-hover flex items-center justify-center hover:glow-border transition-all duration-300"
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
            className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-500 ${
              i === current ? "border-primary scale-110 glow-border" : "border-transparent opacity-40 hover:opacity-70"
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
        animate={{ opacity: 0.5 }}
        transition={{ delay: 2 }}
      >
        <motion.div
          className="w-5 h-8 rounded-full border-2 border-white/40 flex justify-center pt-1"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
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
