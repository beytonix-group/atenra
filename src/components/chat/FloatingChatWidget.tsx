"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Sample questions to help users discover chatbot capabilities
const SAMPLE_QUESTIONS = [
  "Show my recent invoices",
  "What's my account info?",
  "Show company invoices",
  "How do I book a service?",
];

export function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const greetingFetchedRef = useRef(false);

  // Auto-scroll when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 80)}px`;
    }
  }, [input]);

  // Fetch personalized greeting when chat opens for the first time
  useEffect(() => {
    if (!isOpen || greetingFetchedRef.current || messages.length > 0) {
      return;
    }

    // Mark as fetched immediately to prevent duplicate calls
    greetingFetchedRef.current = true;
    setIsLoading(true);

    const abortController = new AbortController();

    async function fetchGreeting() {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [],
            includeUserContext: true,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) throw new Error("Failed to get greeting");

        const data = await response.json() as { message?: unknown };
        if (!data?.message || typeof data.message !== "string") {
          throw new Error("Invalid response format");
        }
        const greetingContent: string = data.message;
        // Only set greeting if no messages exist (user might have sent one during fetch)
        setMessages((prev) => {
          if (prev.length === 0) {
            return [{ role: "assistant", content: greetingContent }];
          }
          return prev;
        });
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          // Request aborted, reset ref so we can retry
          greetingFetchedRef.current = false;
          return;
        }
        console.error("Greeting error:", error);
        // Fallback greeting if API fails
        setMessages((prev) => {
          if (prev.length === 0) {
            return [{
              role: "assistant",
              content: "Hello! I'm the Atenra AI Assistant. How can I help you today?",
            }];
          }
          return prev;
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchGreeting();

    return () => {
      abortController.abort();
    };
  }, [isOpen, messages.length]);

  // Track abort controller for ongoing requests
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    // Abort any previous request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    try {
      // Build message history for API (only user and assistant messages)
      const messageHistory = [...messages, { role: "user" as const, content: userMessage }];

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messageHistory,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.json() as { message?: unknown };
      if (!data?.message || typeof data.message !== "string") {
        throw new Error("Invalid response format");
      }
      const messageContent: string = data.message;
      setMessages((prev) => [...prev, { role: "assistant", content: messageContent }]);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return; // Request aborted, don't update state
      }
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Collapsed state - Chat button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-12 px-4 shadow-lg hover:shadow-xl transition-shadow"
        >
          <MessageSquare className="h-5 w-5 mr-2" />
          Chat
        </Button>
      )}

      {/* Expanded state - Chat popover */}
      {isOpen && (
        <Card className="w-[480px] sm:w-[576px] h-[750px] flex flex-col shadow-2xl border-border">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-border bg-card rounded-t-lg">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <span className="font-semibold">AI Assistant</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-background">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>{isLoading ? "Loading..." : "Starting conversation..."}</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex gap-2", msg.role === "user" && "justify-end")}>
                {msg.role === "assistant" && (
                  <Bot className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <User className="h-6 w-6 text-muted-foreground mt-1 flex-shrink-0" />
                )}
              </div>
            ))}
            {/* Sample questions - show after greeting */}
            {messages.length === 1 && messages[0].role === "assistant" && !isLoading && (
              <div className="flex flex-wrap gap-2 mt-2 pl-8">
                {SAMPLE_QUESTIONS.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(question)}
                    className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground transition-colors border border-border"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}
            {isLoading && (
              <div className="flex gap-2">
                <Bot className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="p-3 border-t border-border bg-card rounded-b-lg">
            <div className="flex gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[40px] max-h-[80px] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                rows={1}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
