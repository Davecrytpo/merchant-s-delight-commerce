import { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Twitter, Facebook, Youtube, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    setSubscribing(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: email.trim().toLowerCase() });
    if (error) {
      if (error.code === "23505") {
        toast.info("You're already subscribed!");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } else {
      toast.success("Subscribed! Welcome to the ShoeShop family 🎉");
    }
    setEmail("");
    setSubscribing(false);
  };

  return (
    <footer className="bg-card border-t border-border">
      {/* Newsletter */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-10 md:py-16 text-center">
          <h3 className="font-display text-2xl md:text-3xl font-bold mb-2 md:mb-3">Stay in the Loop</h3>
          <p className="text-muted-foreground text-sm md:text-base mb-5 md:mb-6 max-w-md mx-auto">Get early access to new releases, exclusive deals, and style inspiration.</p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row max-w-md mx-auto gap-2 sm:gap-2">
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-secondary rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary text-sm"
              required
            />
            <button type="submit" disabled={subscribing} className="gold-gradient text-background font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-sm sm:text-base whitespace-nowrap">
              {subscribing ? "..." : "Subscribe"}
            </button>
          </form>
        </div>
      </div>

      {/* Links */}
      <div className="container mx-auto px-4 py-8 md:py-12 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        <div>
          <h4 className="font-display font-semibold text-base md:text-lg mb-3 md:mb-4">Shop</h4>
          <div className="flex flex-col gap-2">
            <Link to="/shop" className="text-muted-foreground hover:text-foreground transition-colors text-xs sm:text-sm">All Shoes</Link>
            <Link to="/shop?category=Running" className="text-muted-foreground hover:text-foreground transition-colors text-xs sm:text-sm">Running</Link>
            <Link to="/shop?category=Casual" className="text-muted-foreground hover:text-foreground transition-colors text-xs sm:text-sm">Casual</Link>
            <Link to="/shop?category=Boots" className="text-muted-foreground hover:text-foreground transition-colors text-xs sm:text-sm">Boots</Link>
            <Link to="/shop?category=Training" className="text-muted-foreground hover:text-foreground transition-colors text-xs sm:text-sm">Training</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold text-base md:text-lg mb-3 md:mb-4">Help</h4>
          <div className="flex flex-col gap-2">
            <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors text-xs sm:text-sm">FAQ</Link>
            <Link to="/size-guide" className="text-muted-foreground hover:text-foreground transition-colors text-xs sm:text-sm">Size Guide</Link>
            <Link to="/track-order" className="text-muted-foreground hover:text-foreground transition-colors text-xs sm:text-sm">Track Order</Link>
            <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors text-xs sm:text-sm">Contact Us</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold text-base md:text-lg mb-3 md:mb-4">Company</h4>
          <div className="flex flex-col gap-2">
            <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors text-xs sm:text-sm">About Us</Link>
            <Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors text-xs sm:text-sm">Blog</Link>
            <span className="text-muted-foreground text-xs sm:text-sm">Careers</span>
            <span className="text-muted-foreground text-xs sm:text-sm">Press</span>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold text-base md:text-lg mb-3 md:mb-4">Contact</h4>
          <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> <span className="truncate">hello@shoeshop.com</span></div>
            <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> +1 (555) 123-4567</div>
            <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> New York, NY</div>
          </div>
          <div className="flex gap-2 sm:gap-3 mt-4">
            <a href="#" className="p-1.5 sm:p-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-all"><Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></a>
            <a href="#" className="p-1.5 sm:p-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-all"><Twitter className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></a>
            <a href="#" className="p-1.5 sm:p-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-all"><Facebook className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></a>
            <a href="#" className="p-1.5 sm:p-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-all"><Youtube className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></a>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-4 md:py-6 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
          <p className="text-xs sm:text-sm text-muted-foreground">© 2026 ShoeShop. All rights reserved.</p>
          <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Cookie Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
