import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import ProductCard from "@/components/storefront/ProductCard";

export default function Wishlist() {
  const { items } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <Heart className="w-14 h-14 md:w-20 md:h-20 text-muted-foreground mx-auto mb-4 md:mb-6" />
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-2 md:mb-3">Your Wishlist is Empty</h1>
          <p className="text-sm text-muted-foreground mb-4 md:mb-6">Save items you love for later</p>
          <Link to="/shop" className="gold-gradient text-background font-semibold px-6 md:px-8 py-3 rounded-xl inline-block text-sm">Browse Shoes</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <h1 className="font-display text-2xl md:text-3xl font-bold mb-6 md:mb-8">Wishlist <span className="text-muted-foreground text-sm md:text-lg font-body">({items.length} items)</span></h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
        {items.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </div>
  );
}
