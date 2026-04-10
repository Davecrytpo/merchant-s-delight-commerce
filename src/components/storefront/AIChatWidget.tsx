import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User, Loader2, ShoppingBag, Search as SearchIcon } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { apiClient } from "@/integrations/api/client";

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

interface DisplayMessage {
  id: string;
  type: "bot" | "user";
  text: string;
  timestamp: Date;
  suggestions?: string[];
  productLinks?: { name: string; slug: string; image?: string }[];
}

const SHOPPING_SUGGESTIONS = ["Find me running shoes", "What's trending?", "Shoes under $150"];

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;
  const [messages, setMessages] = useState<DisplayMessage[]>([
    {
      id: "welcome-shop",
      type: "bot",
      text: "Hey there! 👋 I'm your **Shopping Assistant**.\n\nI can help you find the perfect pair of shoes, compare products, check sizes, and more. What are you looking for?",
      timestamp: new Date(),
      suggestions: SHOPPING_SUGGESTIONS,
    },
  ]);
  const [chatHistory, setChatHistory] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: products } = useProducts();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  const findProductLinks = useCallback(
    (text: string) => {
      if (!products?.length) return [];
      const links: { name: string; slug: string; image?: string }[] = [];
      const lower = text.toLowerCase();
      for (const p of products) {
        if (lower.includes(p.name.toLowerCase()) || lower.includes(p.slug.replace(/-/g, " "))) {
          const img = (p as any).product_images?.[0]?.image_url;
          links.push({ name: p.name, slug: p.slug, image: img });
        }
      }
      return links.slice(0, 3);
    },
    [products]
  );

  const isShoppingRoute =
    pathname === "/" ||
    pathname === "/shop" ||
    pathname === "/cart" ||
    pathname === "/wishlist" ||
    pathname.startsWith("/product/");

  const hidden = pathname.startsWith("/admin") || pathname === "/returns";
  if (!isShoppingRoute || hidden) {
    return null;
  }

  const handleSend = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsg: DisplayMessage = {
      id: Date.now().toString(),
      type: "user",
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    const newHistory: ChatMsg[] = [...chatHistory, { role: "user", content: text }];
    setChatHistory(newHistory);

    let assistantText = "";

    try {
      const { data, error } = await apiClient.functions.invoke("ai-assistant", {
        body: { messages: newHistory },
      });
      if (error) throw new Error(error.message || "AI service unavailable");
      assistantText = data?.reply || "I couldn't generate a response right now.";

      const links = findProductLinks(assistantText);
      setChatHistory((prev) => [...prev, { role: "assistant", content: assistantText }]);

      const suggestions = ["Show me more options", "Compare these shoes", "Size guide help"];

      setMessages((prev) =>
        [
          ...prev,
          {
            id: Date.now().toString(),
            type: "bot" as const,
            text: assistantText,
            timestamp: new Date(),
            productLinks: links.length > 0 ? links : undefined,
            suggestions,
          },
        ]
      );
    } catch (e: any) {
      console.error("AI chat error:", e);
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== "streaming");
        return [
          ...filtered,
          {
            id: Date.now().toString(),
            type: "bot" as const,
            text: "I'm having trouble connecting right now. Please try again in a moment! 🙏",
            timestamp: new Date(),
            suggestions: SHOPPING_SUGGESTIONS,
          },
        ];
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-0 w-full sm:w-[440px] h-full sm:h-[680px] sm:max-h-[calc(100vh-120px)] bg-card border-0 sm:border border-border sm:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden z-[101]"
          >
            {/* Header */}
            <div className="shrink-0">
              <div className="px-5 py-4 sm:p-5 copper-gradient flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                    <SearchIcon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-primary-foreground font-display font-bold text-base sm:text-lg tracking-tight">Shopping Assistant</h3>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                      <span className="text-[10px] text-primary-foreground/90 font-bold uppercase tracking-[0.15em]">Expert Service</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-2.5 hover:bg-white/10 active:bg-white/20 rounded-full transition-all duration-200"
                >
                  <X className="w-6 h-6 text-primary-foreground" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8 space-y-6 no-scrollbar bg-gradient-to-b from-transparent to-secondary/10">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.type === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`flex gap-3 max-w-[90%] sm:max-w-[85%] ${m.type === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm ${m.type === "bot" ? "bg-primary/15 text-primary border border-primary/20" : "bg-secondary text-muted-foreground border border-border"}`}>
                      {m.type === "bot" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className="space-y-3 min-w-0">
                      <div
                        className={`px-5 py-3.5 rounded-2xl text-[14px] sm:text-[15px] leading-relaxed shadow-sm ${
                          m.type === "user"
                            ? "bg-primary text-primary-foreground rounded-tr-none font-medium"
                            : "bg-secondary/50 backdrop-blur-sm text-foreground rounded-tl-none border border-border/50"
                        }`}
                      >
                        {m.type === "bot" ? (
                          <div className="prose prose-sm max-w-none 
                            [&>p]:mb-3 [&>p:last-child]:mb-0 
                            [&>ul]:pl-5 [&>ul]:space-y-1.5 [&>ul]:mb-3
                            [&>ol]:pl-5 [&>ol]:space-y-1.5 [&>ol]:mb-3
                            [&>h1]:text-base [&>h1]:font-bold [&>h1]:mb-2
                            [&>h2]:text-sm [&>h2]:font-bold [&>h2]:mb-2
                            [&_strong]:text-primary [&_strong]:font-bold
                            [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4
                            text-foreground/90">
                            <ReactMarkdown>{m.text}</ReactMarkdown>
                          </div>
                        ) : (
                          m.text
                        )}
                      </div>

                      {/* Product Links */}
                      {m.productLinks?.map((pl) => (
                        <Link
                          key={pl.slug}
                          to={`/product/${pl.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-4 p-3 bg-card border border-primary/15 rounded-2xl hover:border-primary/40 hover:bg-secondary/30 transition-all duration-300 group shadow-sm hover:shadow-md"
                        >
                          {pl.image && (
                            <div className="relative shrink-0 overflow-hidden rounded-xl border border-border">
                              <img src={pl.image} alt={pl.name} className="w-12 h-12 object-cover transition-transform duration-500 group-hover:scale-110" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-primary/70 uppercase font-black tracking-widest mb-0.5">Recommended</p>
                            <span className="text-sm font-bold text-foreground truncate block tracking-tight">{pl.name}</span>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                            <ShoppingBag className="w-4 h-4" />
                          </div>
                        </Link>
                      ))}

                      {/* Suggestions */}
                      {m.suggestions && !isStreaming && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {m.suggestions.map((s) => (
                            <button
                              key={s}
                              onClick={() => handleSend(s)}
                              className="text-[11px] font-bold px-4 py-2 rounded-full border border-border bg-card/50 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-200 shadow-sm active:scale-95"
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
              {isStreaming && messages[messages.length - 1]?.type !== "bot" && (
                <div className="flex justify-start animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center border border-primary/20">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-secondary/50 backdrop-blur-sm px-5 py-4 rounded-2xl rounded-tl-none border border-border/50">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="px-4 pb-6 sm:px-6 sm:pb-8 pt-4 bg-background border-t border-border/50 shrink-0">
              <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Search styles, sizes, or ask a question..."
                    disabled={isStreaming}
                    className="w-full bg-secondary/50 border border-border rounded-2xl pl-5 pr-4 py-4 text-sm sm:text-base outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all duration-200 disabled:opacity-50 placeholder:text-muted-foreground/60 font-medium"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!input.trim() || isStreaming}
                  className="w-12 h-12 copper-gradient text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 disabled:opacity-50 disabled:grayscale transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 active:translate-y-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[10px] text-center text-muted-foreground/60 mt-4 font-bold uppercase tracking-[0.2em]">
                Verified Shopping Assistant
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full copper-gradient shadow-xl shadow-primary/20 flex items-center justify-center text-primary-foreground relative group"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
              <X className="w-6 h-6 sm:w-7 sm:h-7" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }}>
              <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

