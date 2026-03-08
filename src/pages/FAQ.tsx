import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  { q: "How do I find my shoe size?", a: "Visit our Size Guide page for detailed measurements. We recommend measuring your foot in the afternoon when it's slightly larger. If you're between sizes, we suggest going up half a size." },
  { q: "What is your return policy?", a: "We offer a 30-day hassle-free return policy. Items must be unworn and in original packaging. Simply initiate a return through your account or contact our support team." },
  { q: "How long does shipping take?", a: "Standard shipping: 5-7 business days. Express shipping: 2-3 business days. Overnight: Next business day. Free standard shipping on orders over $100." },
  { q: "Are your shoes authentic?", a: "Absolutely. We guarantee 100% authentic products. Every pair comes with a certificate of authenticity and passes through our quality inspection process." },
  { q: "Do you offer international shipping?", a: "Yes! We ship to over 15 countries worldwide. International shipping typically takes 7-14 business days." },
  { q: "How can I track my order?", a: "Once your order ships, you'll receive an email with a tracking number. You can also track your order on our Track Order page." },
  { q: "Can I cancel or modify my order?", a: "You can cancel or modify your order within 1 hour of placing it. After that, the order enters processing and cannot be changed." },
  { q: "Do you have a loyalty program?", a: "Yes! ShoeShop Rewards gives you 1 point for every dollar spent. Earn 100 points and get $10 off your next purchase." },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="container mx-auto px-4 py-10 md:py-16 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 md:mb-12">
        <h1 className="font-display text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-3">Frequently Asked <span className="gold-text">Questions</span></h1>
        <p className="text-xs md:text-base text-muted-foreground">Everything you need to know about ShoeShop</p>
      </motion.div>

      <div className="space-y-2 md:space-y-3">
        {faqs.map((faq, i) => (
          <motion.div key={i} className="glass rounded-xl md:rounded-2xl overflow-hidden" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-4 md:p-5 text-left">
              <span className="font-semibold text-sm md:text-base pr-4">{faq.q}</span>
              <ChevronDown className={`w-4 h-4 md:w-5 md:h-5 shrink-0 text-primary transition-transform duration-300 ${open === i ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                  <p className="px-4 md:px-5 pb-4 md:pb-5 text-xs md:text-base text-muted-foreground">{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
