import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroShoe1 from "@/assets/hero-shoe-1.jpg";
import heroShoe2 from "@/assets/hero-shoe-2.jpg";
import heroShoe3 from "@/assets/hero-shoe-3.jpg";

const slides = [
  {
    id: 1,
    image: heroShoe1,
    subtitle: "New Arrival 2026",
    title: "Runner",
    titleAccent: "Pro",
    description: "Engineered for speed. Built for comfort. The ultimate performance running shoe.",
    price: "$129.99",
    link: "/products/runner-pro",
    color: "from-amber-900/20",
  },
  {
    id: 2,
    image: heroShoe2,
    subtitle: "Everyday Essential",
    title: "Urban",
    titleAccent: "Walker",
    description: "Premium suede meets memory foam. All-day comfort, effortless style.",
    price: "$89.99",
    link: "/products/urban-walker",
    color: "from-stone-700/20",
  },
  {
    id: 3,
    image: heroShoe3,
    subtitle: "Heritage Collection",
    title: "Heritage",
    titleAccent: "Boot",
    description: "Full-grain leather. Goodyear welt. Built to last a lifetime.",
    price: "$199.99",
    link: "/products/heritage-boot",
    color: "from-emerald-900/20",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((p) => (p + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((p) => (p - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  const imageVariants = {
    enter: (dir: number) => ({
      scale: 1.1,
      opacity: 0,
      x: dir > 0 ? 100 : -100,
      rotateY: dir > 0 ? 8 : -8,
    }),
    center: {
      scale: 1,
      opacity: 1,
      x: 0,
      rotateY: 0,
      transition: { duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
    exit: (dir: number) => ({
      scale: 0.95,
      opacity: 0,
      x: dir > 0 ? -200 : 200,
      rotateY: dir > 0 ? -5 : 5,
      transition: { duration: 0.6, ease: "easeInOut" as const },
    }),
  };

  const textVariants = {
    enter: { opacity: 0, y: 60, filter: "blur(10px)" },
    center: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const, staggerChildren: 0.1 },
    },
    exit: {
      opacity: 0,
      y: -40,
      filter: "blur(8px)",
      transition: { duration: 0.4 },
    },
  };

  const childVariants = {
    enter: { opacity: 0, y: 30 },
    center: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  return (
    <section className="relative h-[100vh] min-h-[700px] overflow-hidden bg-background">
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${slide.color} to-transparent z-0 transition-all duration-1000`} />

      {/* Floating orb glow */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
        style={{ background: "hsl(35 100% 55%)" }}
        animate={{
          x: ["-10%", "60%", "30%"],
          y: ["20%", "50%", "10%"],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container relative z-10 h-full flex items-center">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full">
          {/* Text */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={slide.id}
              className="space-y-6 lg:space-y-8"
              variants={textVariants}
              initial="enter"
              animate="center"
              exit="exit"
              custom={direction}
            >
              <motion.p
                variants={childVariants}
                className="text-xs md:text-sm uppercase tracking-[0.3em] text-accent font-semibold"
              >
                {slide.subtitle}
              </motion.p>

              <motion.h1
                variants={childVariants}
                className="font-heading text-6xl md:text-8xl lg:text-9xl font-bold leading-[0.9] tracking-tight"
              >
                {slide.title}
                <br />
                <span className="text-gradient">{slide.titleAccent}</span>
              </motion.h1>

              <motion.p
                variants={childVariants}
                className="text-lg md:text-xl text-muted-foreground max-w-md leading-relaxed"
              >
                {slide.description}
              </motion.p>

              <motion.div variants={childVariants} className="flex items-center gap-6">
                <Link
                  to={slide.link}
                  className="group inline-flex items-center gap-3 bg-accent text-accent-foreground px-8 py-4 rounded-full font-semibold text-sm uppercase tracking-wider hover:scale-105 transition-transform duration-300 glow-accent"
                >
                  Shop Now
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <span className="text-3xl font-heading font-bold text-foreground">{slide.price}</span>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Image with 3D perspective */}
          <div className="relative h-[400px] lg:h-[600px]" style={{ perspective: "1200px" }}>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={slide.id}
                className="absolute inset-0 flex items-center justify-center"
                variants={imageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                custom={direction}
              >
                <motion.img
                  src={slide.image}
                  alt={`${slide.title} ${slide.titleAccent}`}
                  className="w-full h-full object-contain drop-shadow-2xl"
                  style={{ filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.5))" }}
                  whileHover={{ scale: 1.03, rotateY: 5 }}
                  transition={{ duration: 0.4 }}
                />
              </motion.div>
            </AnimatePresence>

            {/* Reflection effect */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-gradient-to-t from-accent/5 to-transparent rounded-full blur-2xl" />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-8 left-0 right-0 z-20">
        <div className="container flex items-center justify-between">
          {/* Slide indicators */}
          <div className="flex items-center gap-3">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => {
                  setDirection(i > current ? 1 : -1);
                  setCurrent(i);
                }}
                className="group relative"
              >
                <div className={`h-1 rounded-full transition-all duration-500 ${
                  i === current ? "w-12 bg-accent" : "w-6 bg-muted-foreground/30 group-hover:bg-muted-foreground/50"
                }`} />
                <span className={`absolute -top-6 left-0 text-xs font-medium transition-opacity ${
                  i === current ? "opacity-100 text-accent" : "opacity-0"
                }`}>
                  0{i + 1}
                </span>
              </button>
            ))}
          </div>

          {/* Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              className="glass w-12 h-12 rounded-full flex items-center justify-center hover:bg-accent/10 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              className="glass w-12 h-12 rounded-full flex items-center justify-center hover:bg-accent/10 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 hidden lg:flex flex-col items-center gap-2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-px h-8 bg-gradient-to-b from-transparent to-muted-foreground/50" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Scroll</span>
      </motion.div>
    </section>
  );
}
