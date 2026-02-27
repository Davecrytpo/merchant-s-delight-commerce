import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="font-display text-8xl font-bold gold-text mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">Page not found</p>
        <Link to="/" className="gold-gradient text-background font-semibold px-8 py-3 rounded-xl inline-flex items-center gap-2">
          <Home className="w-4 h-4" /> Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
