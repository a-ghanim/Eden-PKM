import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEden } from "@/lib/store";
import { apiRequest } from "@/lib/queryClient";
import type { ChatMessage } from "@shared/schema";

export function ChatInterface() {
  const { isChatOpen, setIsChatOpen, chatMessages, setChatMessages, items } = useEden();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isChatOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isChatOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };

    setChatMessages([...chatMessages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/chat", {
        message: userMessage.content,
        items: items.map((item) => ({
          id: item.id,
          title: item.title,
          summary: item.summary,
          tags: item.tags,
          concepts: item.concepts,
          url: item.url,
        })),
      });
      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response,
        timestamp: Date.now(),
      };

      setChatMessages([...chatMessages, userMessage, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: Date.now(),
      };
      setChatMessages([...chatMessages, userMessage, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQueries = [
    "What have I saved about React?",
    "Summarize my recent saves",
    "What should I read next?",
  ];

  const handleSuggestion = (query: string) => {
    setInput(query);
    inputRef.current?.focus();
  };

  if (!isChatOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md"
        onClick={() => setIsChatOpen(false)}
      >
        <motion.div
          initial={{ opacity: 0, x: "100%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="absolute right-0 top-0 bottom-0 w-full max-w-lg glass border-l border-border/30 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="flex items-center justify-between p-4 border-b border-border/30">
            <div>
              <h2 className="font-serif text-xl">Ask Eden</h2>
              <p className="text-xs text-muted-foreground">
                Query your saved knowledge
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsChatOpen(false)}
              className="rounded-xl"
              data-testid="button-chat-close"
            >
              <X className="w-5 h-5" />
            </Button>
          </header>

          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 sphere-3d opacity-50 mb-6" />
                <h3 className="font-serif text-xl mb-2">
                  Ask anything
                </h3>
                <p className="text-sm text-muted-foreground mb-8">
                  Eden can search, summarize, and find connections.
                </p>
                <div className="space-y-2 w-full max-w-sm">
                  {suggestedQueries.map((query) => (
                    <Button
                      key={query}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3 px-4 rounded-xl"
                      onClick={() => handleSuggestion(query)}
                      data-testid={`button-suggestion-${query.slice(0, 20)}`}
                    >
                      <span className="text-sm">{query}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {chatMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-accent" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted/50"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-accent" />
                    </div>
                    <div className="bg-muted/50 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </ScrollArea>

          <form onSubmit={handleSubmit} className="p-4 border-t border-border/30">
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your knowledge..."
                className="flex-1 h-11 rounded-xl bg-muted/50 border-border/50"
                disabled={isLoading}
                data-testid="input-chat"
              />
              <Button
                type="submit"
                size="icon"
                className="h-11 w-11 rounded-xl shrink-0"
                disabled={!input.trim() || isLoading}
                data-testid="button-chat-send"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
