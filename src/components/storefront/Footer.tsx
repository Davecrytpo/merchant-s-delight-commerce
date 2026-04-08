import { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Twitter, Facebook, Youtube, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/integrations/api/client";

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
    const { error } = await apiClient
      .from("newsletter_subscribers")
      .insert({ email: email.trim().toLowerCase() });

    if (error) {
      if (error.code === "23505") {
        toast.info("You're already subscribed!");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } else {
      toast.success("Subscribed! Welcome to Merchant's Delight.");
    }

    setEmail("");
    setSubscribing(false);
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-10 text-center md:py-16">
          <h3 className="mb-2 font-display text-2xl font-bold md:mb-3 md:text-3xl">Stay in the Loop</h3>
          <p className="mx-auto mb-5 max-w-md text-sm text-muted-foreground md:mb-6 md:text-base">
            Get early access to new releases, exclusive deals, and style inspiration.
          </p>
          <form onSubmit={handleSubscribe} className="mx-auto flex max-w-md flex-col gap-2 sm:flex-row">
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-lg bg-secondary px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <button
              type="submit"
              disabled={subscribing}
              className="copper-gradient whitespace-nowrap rounded-lg px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 sm:text-base"
            >
              {subscribing ? "..." : "Subscribe"}
            </button>
          </form>
        </div>
      </div>

      <div className="container mx-auto grid grid-cols-2 gap-6 px-4 py-8 md:grid-cols-4 md:gap-8 md:py-12">
        <div>
          <h4 className="mb-3 font-display text-base font-semibold md:mb-4 md:text-lg">Shop</h4>
          <div className="flex flex-col gap-2">
            <Link to="/shop" className="text-xs text-muted-foreground transition-colors hover:text-primary sm:text-sm">All Shoes</Link>
            <Link to="/shop?category=Running" className="text-xs text-muted-foreground transition-colors hover:text-primary sm:text-sm">Running</Link>
            <Link to="/shop?category=Casual" className="text-xs text-muted-foreground transition-colors hover:text-primary sm:text-sm">Casual</Link>
            <Link to="/shop?category=Boots" className="text-xs text-muted-foreground transition-colors hover:text-primary sm:text-sm">Boots</Link>
            <Link to="/shop?category=Training" className="text-xs text-muted-foreground transition-colors hover:text-primary sm:text-sm">Training</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-3 font-display text-base font-semibold md:mb-4 md:text-lg">Help</h4>
          <div className="flex flex-col gap-2">
            <Link to="/faq" className="text-xs text-muted-foreground transition-colors hover:text-primary sm:text-sm">FAQ</Link>
            <Link to="/size-guide" className="text-xs text-muted-foreground transition-colors hover:text-primary sm:text-sm">Size Guide</Link>
            <Link to="/track-order" className="text-xs text-muted-foreground transition-colors hover:text-primary sm:text-sm">Track Order</Link>
            <Link to="/returns" className="text-xs text-muted-foreground transition-colors hover:text-primary sm:text-sm">Returns & Exchanges</Link>
            <Link to="/contact" className="text-xs text-muted-foreground transition-colors hover:text-primary sm:text-sm">Contact Us</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-3 font-display text-base font-semibold md:mb-4 md:text-lg">Company</h4>
          <div className="flex flex-col gap-2">
            <Link to="/about" className="text-xs text-muted-foreground transition-colors hover:text-primary sm:text-sm">About Us</Link>
            <Link to="/blog" className="text-xs text-muted-foreground transition-colors hover:text-primary sm:text-sm">Blog</Link>
            <span className="text-xs text-muted-foreground sm:text-sm">Careers</span>
            <span className="text-xs text-muted-foreground sm:text-sm">Press</span>
          </div>
        </div>
        <div>
          <h4 className="mb-3 font-display text-base font-semibold md:mb-4 md:text-lg">Contact</h4>
          <div className="flex flex-col gap-2.5 text-xs text-muted-foreground sm:text-sm">
            <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" /> <span className="truncate">hello@merchantsdelight.com</span></div>
            <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" /> +1 (555) 123-4567</div>
            <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" /> New York, NY</div>
          </div>
          <div className="mt-4 flex gap-2 sm:gap-3">
            <a href="#" className="rounded-full bg-secondary p-1.5 transition-all hover:bg-primary hover:text-primary-foreground sm:p-2"><Instagram className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></a>
            <a href="#" className="rounded-full bg-secondary p-1.5 transition-all hover:bg-primary hover:text-primary-foreground sm:p-2"><Twitter className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></a>
            <a href="#" className="rounded-full bg-secondary p-1.5 transition-all hover:bg-primary hover:text-primary-foreground sm:p-2"><Facebook className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></a>
            <a href="#" className="rounded-full bg-secondary p-1.5 transition-all hover:bg-primary hover:text-primary-foreground sm:p-2"><Youtube className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></a>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-4 py-4 md:flex-row md:gap-4 md:py-6">
          <p className="text-xs text-muted-foreground sm:text-sm">© 2026 Merchant's Delight. All rights reserved.</p>
          <div className="flex gap-4 text-xs text-muted-foreground sm:gap-6 sm:text-sm">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Cookie Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

