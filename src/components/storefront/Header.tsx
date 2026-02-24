import { Link } from "react-router-dom";
import { ShoppingBag, Search, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

export default function Header() {
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="font-heading text-2xl font-bold tracking-wide">
          ShoeShop
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide uppercase">
          <Link to="/products" className="hover:text-accent transition-colors">All Shoes</Link>
          <Link to="/products?category=Running" className="hover:text-accent transition-colors">Running</Link>
          <Link to="/products?category=Casual" className="hover:text-accent transition-colors">Casual</Link>
          <Link to="/products?category=Boots" className="hover:text-accent transition-colors">Boots</Link>
        </nav>

        <div className="flex items-center gap-4">
          <button className="hover:text-accent transition-colors" aria-label="Search">
            <Search className="h-5 w-5" />
          </button>
          <Link to="/cart" className="relative hover:text-accent transition-colors" aria-label="Cart">
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold">
                {totalItems}
              </span>
            )}
          </Link>
          <Link to="/admin" className="hidden md:inline-block text-xs uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity">
            Admin
          </Link>
          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-sidebar-border px-6 pb-4 pt-2 flex flex-col gap-3 text-sm font-medium uppercase">
          <Link to="/products" onClick={() => setMobileOpen(false)} className="py-1">All Shoes</Link>
          <Link to="/products?category=Running" onClick={() => setMobileOpen(false)} className="py-1">Running</Link>
          <Link to="/products?category=Casual" onClick={() => setMobileOpen(false)} className="py-1">Casual</Link>
          <Link to="/products?category=Boots" onClick={() => setMobileOpen(false)} className="py-1">Boots</Link>
          <Link to="/admin" onClick={() => setMobileOpen(false)} className="py-1 opacity-60">Admin</Link>
        </nav>
      )}
    </header>
  );
}
