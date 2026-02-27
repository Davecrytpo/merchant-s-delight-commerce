import { Link } from "react-router-dom";
import { Instagram, Twitter, Facebook, Youtube, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      {/* Newsletter */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-16 text-center">
          <h3 className="font-display text-3xl font-bold mb-3">Stay in the Loop</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">Get early access to new releases, exclusive deals, and style inspiration.</p>
          <div className="flex max-w-md mx-auto gap-2">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 bg-secondary rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
            />
            <button className="gold-gradient text-background font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="container mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h4 className="font-display font-semibold text-lg mb-4">Shop</h4>
          <div className="flex flex-col gap-2">
            <Link to="/shop" className="text-muted-foreground hover:text-foreground transition-colors text-sm">All Shoes</Link>
            <Link to="/shop?category=Running" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Running</Link>
            <Link to="/shop?category=Casual" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Casual</Link>
            <Link to="/shop?category=Boots" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Boots</Link>
            <Link to="/shop?category=Training" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Training</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold text-lg mb-4">Help</h4>
          <div className="flex flex-col gap-2">
            <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors text-sm">FAQ</Link>
            <Link to="/size-guide" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Size Guide</Link>
            <Link to="/track-order" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Track Order</Link>
            <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Contact Us</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold text-lg mb-4">Company</h4>
          <div className="flex flex-col gap-2">
            <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors text-sm">About Us</Link>
            <Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Blog</Link>
            <span className="text-muted-foreground text-sm">Careers</span>
            <span className="text-muted-foreground text-sm">Press</span>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold text-lg mb-4">Contact</h4>
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> hello@shoeshop.com</div>
            <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> +1 (555) 123-4567</div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> New York, NY</div>
          </div>
          <div className="flex gap-3 mt-4">
            <a href="#" className="p-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-all"><Instagram className="w-4 h-4" /></a>
            <a href="#" className="p-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-all"><Twitter className="w-4 h-4" /></a>
            <a href="#" className="p-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-all"><Facebook className="w-4 h-4" /></a>
            <a href="#" className="p-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-all"><Youtube className="w-4 h-4" /></a>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© 2026 ShoeShop. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Cookie Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
