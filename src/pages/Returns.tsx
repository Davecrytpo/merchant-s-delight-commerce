import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, RotateCcw, Package, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  returnAction?: any;
}

const RETURN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/return-assistant`;
const RETURN_SUGGESTIONS = ["I want to return an item", "Check my return status", "What's the return policy?"];

export default function Returns() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DisplayMessage[]>([
    {
      id: "welcome-return",
      type: "bot",
      text: "Hello! 👋 I'm your **Return Assistant**.\n\nI can help you process returns, check eligibility, and track your return requests. To get started, you can ask to start a return or provide your **Order Number**.",
      timestamp: new Date(),
      suggestions: RETURN_SUGGESTIONS,
    },
  ]);
  const [chatHistory, setChatHistory] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

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

  const handleReturnAction = useCallback(async (actionType: string, payload: any) => {
    try {
      const resp = await fetch(RETURN_URL, {
        method: "POST",
        headers: await getHeaders(),
        body: JSON.stringify({ action: actionType, payload }),
      });
      if (!resp.ok) throw new Error("Action failed");
      return await resp.json();
    } catch (e) {
      console.error("Return action error:", e);
      return null;
    }
  }, [getHeaders]);

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

    // Look for order numbers or return IDs to provide immediate context
    const orderMatch = text.match(/(?:order\s*(?:#|number|num)?:?\s*)?(ORD-[A-Z0-9]+|[A-Z0-9]{6,})/i);
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    
    if (orderMatch) {
      const result = await handleReturnAction("lookup_order", {
        order_number: orderMatch[1].toUpperCase(),
        email: emailMatch ? emailMatch[0] : undefined,
        user_id: user?.id,
      });
      if (result) {
        let contextMsg = "";
        if (result.needs_verification) {
          contextMsg = `[SYSTEM CONTEXT: Order found but needs email verification. ${result.message}]`;
        } else {
          contextMsg = result.found
            ? `[SYSTEM CONTEXT: Order found - ${JSON.stringify(result.order)}. Eligible for return: ${result.eligible}. ${result.reason || `${result.days_remaining} days remaining in return window.`}]`
            : `[SYSTEM CONTEXT: No order found with number "${orderMatch[1]}". Ask the customer to double-check.]`;
        }
        newHistory.push({ role: "assistant", content: contextMsg });
      }
    }

    const returnMatch = text.match(/RET-[A-Z0-9]+/i);
    if (returnMatch) {
      const result = await handleReturnAction("check_return_status", {
        return_request_id: returnMatch[0].toUpperCase(),
        user_id: user?.id,
      });
      if (result?.returns?.length) {
        const r = result.returns[0];
        const contextMsg = `[SYSTEM CONTEXT: Return ${r.return_request_id} found. Status: ${r.status}. Reason: ${r.reason}. Resolution: ${r.resolution}. Created: ${r.created_at}]`;
        newHistory.push({ role: "assistant", content: contextMsg });
      }
    }

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
      const resp = await fetch(RETURN_URL, {
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

      setChatHistory((prev) => [...prev, { role: "assistant", content: assistantText }]);

      const suggestions = ["Start a new return", "Check return status", "What items can I return?"];

      setMessages((prev) =>
        prev.map((m) =>
          m.id === "streaming"
            ? {
                ...m,
                id: Date.now().toString(),
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
            suggestions: RETURN_SUGGESTIONS,
          },
        ];
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link to="/" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-4 group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
            <h1 className="text-4xl font-display font-bold gold-gradient bg-clip-text text-transparent">Returns & Exchanges</h1>
            <p className="text-muted-foreground mt-2">Process your return or check status with our AI assistant.</p>
          </div>
          <div className="hidden sm:flex items-center gap-4 p-4 bg-secondary/30 rounded-2xl border border-white/5">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <RotateCcw className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Return Window</p>
              <p className="text-sm font-bold">14 Days from Delivery</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[650px]">
          {/* Info Panel */}
          <div className="hidden lg:flex flex-col gap-4">
            <div className="p-6 glass border border-white/10 rounded-[2rem] space-y-4">
              <h3 className="font-bold flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                How it works
              </h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">Provide your **Order Number** and email to verify eligibility.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">Tell the AI why you're returning the item and choose a resolution.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">Receive instant instructions and a **Return ID** to track your request.</p>
                </li>
              </ul>
            </div>

            <div className="p-6 glass border border-white/10 rounded-[2rem] space-y-4 bg-primary/5">
              <h3 className="font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Quick Status
              </h3>
              <p className="text-xs text-muted-foreground">Already have a return? Just paste your **RET-XXXX** code in the chat to see where it is.</p>
            </div>

            <div className="mt-auto p-4 bg-secondary/20 rounded-2xl border border-white/5 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground leading-tight italic">
                Need manual help? Our support team is available 24/7 via the contact page.
              </p>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2 flex flex-col glass border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl relative">
            {/* Chat Header */}
            <div className="px-6 py-4 bg-secondary/50 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Return Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-muted-foreground font-medium">Ready to help</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-3 max-w-[85%] ${m.type === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${m.type === "bot" ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
                      {m.type === "bot" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className="space-y-3 min-w-0">
                      <div
                        className={`px-5 py-4 rounded-2xl text-sm leading-relaxed ${
                          m.type === "user"
                            ? "bg-primary text-primary-foreground rounded-tr-sm shadow-lg shadow-primary/20"
                            : "bg-secondary/50 text-foreground rounded-tl-sm border border-white/5"
                        }`}
                      >
                        {m.type === "bot" ? (
                          <div className="prose prose-sm prose-invert max-w-none [&>p]:mb-3 [&>p:last-child]:mb-0 [&>ul]:pl-4 [&>ul]:space-y-1 [&>ol]:pl-4 [&>ol]:space-y-1 [&_strong]:text-primary [&_a]:text-primary [&_code]:bg-background/50 [&_code]:px-1 [&_code]:rounded">
                            <ReactMarkdown>{m.text}</ReactMarkdown>
                          </div>
                        ) : (
                          m.text
                        )}
                      </div>

                      {/* Suggestions */}
                      {m.suggestions && !isStreaming && (
                        <div className="flex flex-wrap gap-2">
                          {m.suggestions.map((s) => (
                            <button
                              key={s}
                              onClick={() => handleSend(s)}
                              className="text-[11px] font-bold px-4 py-2 rounded-xl border border-border hover:border-primary hover:text-primary transition-all bg-background/50 hover:bg-primary/5"
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
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-secondary/50 px-5 py-4 rounded-2xl rounded-tl-sm border border-white/5">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="p-6 bg-secondary/30 border-t border-white/5">
              <div className="relative">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter order number or ask a question..."
                  disabled={isStreaming}
                  className="w-full bg-background border border-white/10 rounded-2xl pl-5 pr-14 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50 shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isStreaming}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 gold-gradient text-background rounded-xl flex items-center justify-center disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[10px] text-center text-muted-foreground mt-3 font-medium tracking-wide">
                Powered by ShoeShop AI Assistant • Secure & Encrypted
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
