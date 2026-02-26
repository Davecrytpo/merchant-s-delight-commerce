import { motion } from "framer-motion";
import { useState } from "react";
import { Send } from "lucide-react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[300px] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-3">Stay Updated</p>
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Join the <span className="text-gradient">Club</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-10">
            Get exclusive access to new drops, special offers, and insider news. No spam, ever.
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-2xl p-8"
            >
              <p className="text-lg font-semibold text-accent">Welcome to the club! 🎉</p>
              <p className="text-muted-foreground mt-2">Check your inbox for a special welcome offer.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 bg-secondary border border-border rounded-full px-6 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-shadow"
              />
              <button
                type="submit"
                className="bg-accent text-accent-foreground px-8 py-4 rounded-full font-semibold text-sm uppercase tracking-wider hover:scale-105 transition-transform duration-300 flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" /> Subscribe
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
