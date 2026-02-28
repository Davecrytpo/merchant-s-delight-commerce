import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Heart, Search, Menu, X, User, LogOut } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { products } from "@/data/products";

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
  const [searchResults, setSearchResults] = useState<typeof products>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const { totalItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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

  // Live search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const results = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q))
    ).slice(0, 6);
    setSearchResults(results);
  }, [searchQuery]);

  // Click outside to close search
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchQuery("");
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
      setSearchQuery("");
    }
  };

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "glass py-3" : "bg-transparent py-5"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center">
              <span className="text-background font-display font-bold text-lg">S</span>
            </div>
            <span className="font-display text-xl font-bold tracking-tight">
              Shoe<span className="gold-text">Shop</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium tracking-wide uppercase transition-colors duration-300 hover:text-primary ${
                  location.pathname === link.path ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { setSearchOpen(!searchOpen); setSearchQuery(""); }}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            <Link to="/wishlist" className="p-2 rounded-full hover:bg-secondary transition-colors relative">
              <Heart className="w-5 h-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            <Link to="/cart" className="p-2 rounded-full hover:bg-secondary transition-colors relative">
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
            {user ? (
              <div className="hidden md:flex items-center gap-1">
                <Link to="/account" className="p-2 rounded-full hover:bg-secondary transition-colors">
                  <User className="w-5 h-5" />
                </Link>
                <button onClick={signOut} className="p-2 rounded-full hover:bg-secondary transition-colors" title="Sign Out">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/account" className="hidden md:flex p-2 rounded-full hover:bg-secondary transition-colors">
                <User className="w-5 h-5" />
              </Link>
            )}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar with Live Results */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              ref={searchRef}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-visible"
            >
              <div className="container mx-auto px-4 py-4 relative">
                <form onSubmit={handleSearchSubmit}>
                  <input
                    type="text"
                    placeholder="Search for shoes, brands, categories..."
                    className="w-full bg-secondary rounded-full px-6 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute left-4 right-4 top-full mt-2 glass rounded-2xl overflow-hidden z-[100] border border-border shadow-2xl"
                  >
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.slug}`}
                        className="flex items-center gap-4 p-3 hover:bg-secondary/50 transition-colors"
                        onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                      >
                        <img src={product.images[0]} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.category} · {product.brand}</p>
                        </div>
                        <span className="text-sm font-bold text-primary">${product.price}</span>
                      </Link>
                    ))}
                    <button
                      onClick={() => {
                        navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
                        setSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className="w-full p-3 text-center text-sm text-primary font-medium hover:bg-secondary/50 border-t border-border"
                    >
                      View all results for "{searchQuery}"
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[60] bg-background"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="flex justify-between items-center p-4 border-b border-border">
              <span className="font-display text-xl font-bold">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="p-2">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex flex-col p-6 gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-2xl font-display font-semibold hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-border pt-6 flex flex-col gap-4">
                <Link to="/account" className="text-lg text-muted-foreground hover:text-foreground">
                  {user ? "My Account" : "Sign In"}
                </Link>
                <Link to="/orders" className="text-lg text-muted-foreground hover:text-foreground">Orders</Link>
                <Link to="/wishlist" className="text-lg text-muted-foreground hover:text-foreground">Wishlist</Link>
                <Link to="/size-guide" className="text-lg text-muted-foreground hover:text-foreground">Size Guide</Link>
                <Link to="/faq" className="text-lg text-muted-foreground hover:text-foreground">FAQ</Link>
                {user && (
                  <button onClick={signOut} className="text-lg text-destructive text-left">Sign Out</button>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
