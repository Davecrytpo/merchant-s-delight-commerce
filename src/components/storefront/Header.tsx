import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, Search, Menu, X, Heart, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  const navLinks = [
    { label: "New Arrivals", to: "/products" },
    { label: "Running", to: "/products?category=Running" },
    { label: "Casual", to: "/products?category=Casual" },
    { label: "Boots", to: "/products?category=Boots" },
    { label: "Training", to: "/products?category=Training" },
  ];

  return (
    <>
      {/* Promo banner */}
      <div className="bg-accent text-accent-foreground text-center py-2 text-xs font-semibold uppercase tracking-[0.15em]">
        Free Shipping on Orders Over $100 — Limited Time
      </div>

      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "glass-strong shadow-lg shadow-background/50"
            : "bg-transparent"
        }`}
      >
        <div className="container flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="font-heading text-2xl md:text-3xl font-bold tracking-wide relative group">
            <span className="text-foreground">Shoe</span>
            <span className="text-gradient">Shop</span>
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="relative text-sm font-medium tracking-wide text-muted-foreground hover:text-foreground transition-colors group py-2"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button className="hidden md:flex w-10 h-10 items-center justify-center rounded-full hover:bg-secondary transition-colors" aria-label="Search">
              <Search className="h-5 w-5 text-muted-foreground" />
            </button>
            <button className="hidden md:flex w-10 h-10 items-center justify-center rounded-full hover:bg-secondary transition-colors" aria-label="Wishlist">
              <Heart className="h-5 w-5 text-muted-foreground" />
            </button>
            <Link
              to="/cart"
              className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag className="h-5 w-5 text-muted-foreground" />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground text-[10px] font-bold"
                >
                  {totalItems}
                </motion.span>
              )}
            </Link>
            <Link
              to="/admin"
              className="hidden lg:flex w-10 h-10 items-center justify-center rounded-full hover:bg-secondary transition-colors"
              aria-label="Admin"
            >
              <User className="h-5 w-5 text-muted-foreground" />
            </Link>
            <button
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden overflow-hidden border-t border-border"
            >
              <div className="container py-6 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link to="/admin" className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
                  Admin
                </Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
