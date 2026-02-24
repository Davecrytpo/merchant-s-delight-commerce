import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-heading text-xl font-bold mb-4">ShoeShop</h3>
          <p className="text-sm opacity-70 leading-relaxed">
            Premium footwear for every step of your journey. Quality craftsmanship meets modern style.
          </p>
        </div>
        <div>
          <h4 className="font-body text-sm font-semibold uppercase tracking-wider mb-4">Shop</h4>
          <ul className="space-y-2 text-sm opacity-70">
            <li><Link to="/products" className="hover:opacity-100 transition-opacity">All Shoes</Link></li>
            <li><Link to="/products?category=Running" className="hover:opacity-100 transition-opacity">Running</Link></li>
            <li><Link to="/products?category=Casual" className="hover:opacity-100 transition-opacity">Casual</Link></li>
            <li><Link to="/products?category=Boots" className="hover:opacity-100 transition-opacity">Boots</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-body text-sm font-semibold uppercase tracking-wider mb-4">Support</h4>
          <ul className="space-y-2 text-sm opacity-70">
            <li><span className="cursor-default">Shipping Info</span></li>
            <li><span className="cursor-default">Returns</span></li>
            <li><span className="cursor-default">Size Guide</span></li>
            <li><span className="cursor-default">Contact Us</span></li>
          </ul>
        </div>
        <div>
          <h4 className="font-body text-sm font-semibold uppercase tracking-wider mb-4">Company</h4>
          <ul className="space-y-2 text-sm opacity-70">
            <li><span className="cursor-default">About</span></li>
            <li><span className="cursor-default">Careers</span></li>
            <li><span className="cursor-default">Privacy Policy</span></li>
            <li><span className="cursor-default">Terms of Service</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-sidebar-border">
        <div className="container py-4 text-center text-xs opacity-50">
          &copy; 2026 ShoeShop. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
