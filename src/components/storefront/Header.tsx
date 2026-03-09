import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Heart, Search, Menu, X, User, LogOut, RotateCcw } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/hooks/useProducts";

const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Shop", path: "/shop" },
  { label: "About", path: "/about" },
  { label: "Blog", path: "/blog" },
  { label: "Contact", path: "/contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const { totalItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const { data: allProducts } = useProducts();
  const searchResults = searchQuery.length > 1
    ? allProducts?.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setSearchQuery("");
  }, [location]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "glass py-2 md:py-3" : "bg-transparent py-3 md:py-5"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="container mx-auto px-3 md:px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl gold-gradient flex items-center justify-center transition-transform group-hover:scale-110">
              <span className="text-background font-display font-bold text-lg md:text-xl">S</span>
            </div>
            <span className="font-display text-lg md:text-xl font-bold tracking-tight">
              Shoe<span className="gold-text">Shop</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-xs font-bold tracking-widest uppercase transition-colors duration-300 hover:text-primary ${
                  location.pathname === link.path ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-0.5 sm:gap-1 md:gap-3">
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 rounded-full hover:bg-secondary transition-colors">
              <Search className="w-[18px] h-[18px] md:w-5 md:h-5" />
            </button>
            <Link to="/wishlist" className="p-2 rounded-full hover:bg-secondary transition-colors relative">
              <Heart className="w-[18px] h-[18px] md:w-5 md:h-5" />
              {wishlistItems.length > 0 && <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center font-bold">{wishlistItems.length}</span>}
            </Link>
            <Link to="/cart" className="p-2 rounded-full hover:bg-secondary transition-colors relative">
              <ShoppingBag className="w-[18px] h-[18px] md:w-5 md:h-5" />
              {totalItems > 0 && <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center font-bold">{totalItems}</span>}
            </Link>
            <Link to="/account" className="hidden sm:flex p-2 rounded-full hover:bg-secondary transition-colors">
              <User className="w-5 h-5" />
            </Link>
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-full hover:bg-secondary transition-colors ml-0.5">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.div ref={searchRef} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute left-0 right-0 top-full glass border-t border-border shadow-2xl overflow-hidden">
              <div className="container mx-auto px-3 md:px-4 py-4 md:py-6">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    placeholder="Search premium footwear..."
                    className="w-full bg-secondary rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-base md:text-lg outline-none focus:ring-2 focus:ring-primary shadow-inner"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 p-1.5 md:p-2 text-primary"><Search className="w-5 h-5 md:w-6 md:h-6" /></button>
                </form>
                {searchResults && searchResults.length > 0 && (
                  <div className="mt-3 md:mt-4 grid gap-1.5 md:gap-2 max-h-[50vh] overflow-y-auto">
                    {searchResults.map((p: any) => (
                      <Link key={p.id} to={`/product/${p.slug}`} className="flex items-center gap-3 md:gap-4 p-2.5 md:p-3 rounded-xl hover:bg-primary/10 transition-colors border border-transparent hover:border-primary/20">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-secondary flex-shrink-0 flex items-center justify-center text-[10px] font-bold">SHOE</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground uppercase tracking-tighter">{p.brand}</p>
                        </div>
                        <span className="font-bold text-primary text-sm">${p.price}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="fixed inset-0 z-[100] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            {/* Panel */}
            <motion.div className="absolute inset-y-0 right-0 w-[80%] max-w-sm bg-card border-l border-border flex flex-col shadow-2xl" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }}>
              <div className="p-5 flex items-center justify-between border-b border-border">
                <span className="font-display text-lg font-bold">Menu</span>
                <button onClick={() => setMobileOpen(false)} className="p-2 hover:bg-secondary rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <nav className="flex-1 overflow-y-auto p-5 space-y-1">
                {NAV_LINKS.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block text-lg font-display font-bold py-3 px-4 rounded-xl transition-colors ${
                      location.pathname === link.path ? "bg-primary/10 text-primary" : "hover:bg-secondary"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-6 mt-4 border-t border-border space-y-1">
                  <Link to="/account" className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-secondary transition-colors">
                    <User className="w-5 h-5 text-primary" />
                    <span className="font-medium">My Account</span>
                  </Link>
                  <Link to="/orders" className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-secondary transition-colors text-muted-foreground">
                    <ShoppingBag className="w-5 h-5" />
                    <span className="font-medium">Orders</span>
                  </Link>
                  <Link to="/returns" className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-secondary transition-colors text-muted-foreground">
                    <RotateCcw className="w-5 h-5" />
                    <span className="font-medium">Returns</span>
                  </Link>
                  <Link to="/wishlist" className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-secondary transition-colors text-muted-foreground">
                    <Heart className="w-5 h-5" />
                    <span className="font-medium">Wishlist</span>
                    {wishlistItems.length > 0 && <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">{wishlistItems.length}</span>}
                  </Link>
                  {user && (
                    <button onClick={() => { signOut(); setMobileOpen(false); }} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-destructive/10 transition-colors text-destructive w-full mt-4">
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  )}
                </div>
              </nav>
              <div className="p-5 border-t border-border">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em] text-center">Professional Footwear Solutions</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
