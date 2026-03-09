import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User, Loader2, ShoppingBag, Search as SearchIcon } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";

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

const SHOPPING_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;
const SHOPPING_SUGGESTIONS = ["Find me running shoes", "What's trending?", "Shoes under $150"];

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  // Only show on Homepage as requested by user
  if (location.pathname !== "/") {
    return null;
  }

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

  const getHeaders = useCallback(async () => {
    const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token || publishableKey;
    return {
      "Content-Type": "application/json",
      apikey: publishableKey,
      Authorization: `Bearer ${token}`,
    };
  }, []);

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

    const upsertAssistant = (chunk: string) => {
      assistantText += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.type === "bot" && last.id === "streaming") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, text: assistantText } : m));
        }
        return [...prev, { id: "streaming", type: "bot", text: assistantText, timestamp: new Date() }];
      });
    };

    try {
      const resp = await fetch(SHOPPING_URL, {
        method: "POST",
        headers: await getHeaders(),
        body: JSON.stringify({ messages: newHistory }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `AI service unavailable (${resp.status})`);
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsertAssistant(content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      const links = findProductLinks(assistantText);
      setChatHistory((prev) => [...prev, { role: "assistant", content: assistantText }]);

      const suggestions = ["Show me more options", "Compare these shoes", "Size guide help"];

      setMessages((prev) =>
        prev.map((m) =>
          m.id === "streaming"
            ? {
                ...m,
                id: Date.now().toString(),
                productLinks: links.length > 0 ? links : undefined,
                suggestions,
              }
            : m
        )
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
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-[92vw] sm:w-[420px] h-[78vh] sm:h-[620px] max-h-[85vh] glass border border-white/10 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden mb-3"
          >
            {/* Header */}
            <div className="shrink-0">
              <div className="px-4 py-3 sm:p-4 gold-gradient flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-background/20 backdrop-blur-md flex items-center justify-center">
                    <SearchIcon className="w-5 h-5 text-background" />
                  </div>
                  <div>
                    <h3 className="text-background font-display font-bold text-sm">Shopping Assistant</h3>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-background animate-pulse" />
                      <span className="text-[9px] text-background/80 font-bold uppercase tracking-widest">Online</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-background/10 rounded-full transition-colors">
                  <X className="w-5 h-5 text-background" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 sm:px-5 sm:py-5 space-y-4 no-scrollbar">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-2.5 max-w-[88%] ${m.type === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 ${m.type === "bot" ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
                      {m.type === "bot" ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                    </div>
                    <div className="space-y-2 min-w-0">
                      <div
                        className={`px-4 py-3 rounded-2xl text-[13px] leading-relaxed ${
                          m.type === "user"
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-secondary/50 text-foreground rounded-tl-sm"
                        }`}
                      >
                        {m.type === "bot" ? (
                          <div className="prose prose-sm prose-invert max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:pl-4 [&>ul]:space-y-1 [&>ol]:pl-4 [&>ol]:space-y-1 [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-sm [&_strong]:text-primary [&_a]:text-primary">
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
                          className="flex items-center gap-3 p-2.5 bg-background border border-primary/20 rounded-xl hover:border-primary/50 transition-all group overflow-hidden"
                        >
                          {pl.image && <img src={pl.image} alt={pl.name} className="w-10 h-10 rounded-lg object-cover" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Recommended</p>
                            <span className="text-xs font-bold text-foreground truncate block">{pl.name}</span>
                          </div>
                          <ShoppingBag className="w-4 h-4 text-primary mr-2 group-hover:scale-110 transition-transform" />
                        </Link>
                      ))}

                      {/* Suggestions */}
                      {m.suggestions && !isStreaming && (
                        <div className="flex flex-wrap gap-1.5">
                          {m.suggestions.map((s) => (
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
              {isStreaming && messages[messages.length - 1]?.type !== "bot" && (
                <div className="flex justify-start">
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="bg-secondary/50 px-4 py-3 rounded-2xl rounded-tl-sm">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="px-3 pb-3 sm:px-5 sm:pb-4 pt-0 shrink-0">
              <div className="relative">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about shoes, sizes, styles..."
                  disabled={isStreaming}
                  className="w-full bg-secondary/50 border border-border/50 rounded-2xl pl-4 pr-12 py-3.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isStreaming}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 gold-gradient text-background rounded-xl flex items-center justify-center disabled:opacity-50 disabled:grayscale transition-all"
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
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full gold-gradient shadow-2xl flex items-center justify-center text-background relative group"
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
