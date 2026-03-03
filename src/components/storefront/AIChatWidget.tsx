import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles, ShoppingBag, RotateCcw } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { Link } from "react-router-dom";

interface Message {
  id: string;
  type: "bot" | "user";
  text: string;
  timestamp: Date;
  suggestions?: string[];
  productLink?: { name: string; slug: string };
}

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      text: "Hello! I'm your Merchant's Delight AI assistant. How can I help you today?",
      timestamp: new Date(),
      suggestions: ["Recommend shoes", "Return an order", "Shipping info"]
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: products } = useProducts();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      type: "user",
      text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulated AI Logic
    setTimeout(() => {
      let response: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        text: "I'm not sure about that. Would you like to speak with a human agent?",
        timestamp: new Date(),
        suggestions: ["Speak to agent", "Main menu"]
      };

      const lowerText = text.toLowerCase();

      if (lowerText.includes("recommend") || lowerText.includes("shoe") || lowerText.includes("suggest")) {
        const randomProduct = products?.[Math.floor(Math.random() * (products?.length || 0))];
        if (randomProduct) {
          response = {
            ...response,
            text: `Based on your style, I highly recommend the ${randomProduct.name}! It's one of our top-rated pairs.`,
            productLink: { name: randomProduct.name, slug: randomProduct.slug },
            suggestions: ["See more running shoes", "Filter by price"]
          };
        } else {
          response.text = "I recommend checking out our latest 'Air Velocity Pro' for high-performance running!";
        }
      } else if (lowerText.includes("return") || lowerText.includes("exchange")) {
        response = {
          ...response,
          text: "To start a return, please visit our 'Track Order' page and enter your order number. We offer free returns within 30 days!",
          suggestions: ["Go to Track Order", "View Return Policy"]
        };
      } else if (lowerText.includes("shipping")) {
        response.text = "We offer free standard shipping on orders over $100! Delivery usually takes 5-7 business days.";
        response.suggestions = ["Express shipping rates", "International delivery"];
      }

      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-[90vw] sm:w-[400px] h-[600px] max-h-[80vh] glass border border-white/20 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="p-6 gold-gradient flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-background/20 backdrop-blur-md flex items-center justify-center">
                  <Bot className="w-6 h-6 text-background" />
                </div>
                <div>
                  <h3 className="text-background font-display font-bold">ShoeShop AI</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-background animate-pulse" />
                    <span className="text-[10px] text-background/80 font-bold uppercase tracking-widest">Online</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-background/10 rounded-full transition-colors">
                <X className="w-5 h-5 text-background" />
              </button>
            </div>

            {/* Chat Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-3 max-w-[85%] ${m.type === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.type === "bot" ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
                      {m.type === "bot" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className="space-y-2">
                      <div className={`px-4 py-3 rounded-2xl text-sm ${
                        m.type === "user" 
                        ? "bg-primary text-primary-foreground rounded-tr-none" 
                        : "bg-secondary/50 text-foreground rounded-tl-none"
                      }`}>
                        {m.text}
                      </div>
                      
                      {m.productLink && (
                        <Link 
                          to={`/product/${m.productLink.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-xl hover:bg-primary/20 transition-colors group"
                        >
                          <ShoppingBag className="w-4 h-4 text-primary" />
                          <span className="text-xs font-bold text-primary">{m.productLink.name}</span>
                          <Sparkles className="w-3 h-3 text-primary ml-auto group-hover:rotate-12 transition-transform" />
                        </Link>
                      )}

                      {m.suggestions && (
                        <div className="flex flex-wrap gap-2">
                          {m.suggestions.map(s => (
                            <button 
                              key={s} 
                              onClick={() => handleSend(s)}
                              className="text-[10px] font-bold px-3 py-1.5 rounded-full border border-border hover:border-primary hover:text-primary transition-colors bg-background/50"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-secondary/50 px-4 py-3 rounded-2xl rounded-tl-none">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
              className="p-6 pt-0"
            >
              <div className="relative">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about shoes or returns..."
                  className="w-full bg-secondary/50 border border-border/50 rounded-2xl pl-4 pr-12 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
                <button 
                  type="submit"
                  disabled={!input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 gold-gradient text-background rounded-xl flex items-center justify-center disabled:opacity-50 disabled:grayscale transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full gold-gradient shadow-2xl flex items-center justify-center text-background relative group"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
              <X className="w-7 h-7" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }}>
              <MessageSquare className="w-7 h-7" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Notification Ping */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold">1</span>
        )}
      </motion.button>
    </div>
  );
}
