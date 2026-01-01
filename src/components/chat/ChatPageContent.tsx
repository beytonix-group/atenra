"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Task-focused sample questions for regular users
const SAMPLE_QUESTIONS = [
  "What can I do here?",
  "Help me find a service",
  "How do I contact support?",
  "Show my account info",
];

interface ChatPageContentProps {
  userId: string;
}

export function ChatPageContent({ userId: _userId }: ChatPageContentProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const greetingFetchedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  // Fetch personalized greeting on mount
  useEffect(() => {
    if (greetingFetchedRef.current || messages.length > 0) {
      return;
    }

    greetingFetchedRef.current = true;
    setIsLoading(true);

    const abortController = new AbortController();

    async function fetchGreeting() {
      try {
        const response = await fetch("/api/chat-task", {
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

        setMessages((prev) => {
          if (prev.length === 0) {
            return [{ role: "assistant", content: data.message as string }];
          }
          return prev;
        });
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          greetingFetchedRef.current = false;
          return;
        }
        console.error("Greeting error:", error);
        // Fallback greeting
        setMessages((prev) => {
          if (prev.length === 0) {
            return [{
              role: "assistant",
              content: "Hello! Welcome to Atenra. I'm here to help you get things done. What would you like to do today?",
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
  }, [messages.length]);

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
      const messageHistory = [...messages, { role: "user" as const, content: userMessage }];

      const response = await fetch("/api/chat-task", {
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

      setMessages((prev) => [...prev, { role: "assistant", content: data.message as string }]);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
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

  const handleSampleQuestion = (question: string) => {
    setInput(question);
    // Focus the textarea
    textareaRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <Card className="flex-1 flex flex-col m-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">Atenra Assistant</h1>
            <p className="text-sm text-muted-foreground">Here to help you get things done</p>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg">{isLoading ? "Getting ready..." : "Starting conversation..."}</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={cn("flex gap-3", msg.role === "user" && "justify-end")}>
              {msg.role === "assistant" && (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border"
                )}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}

          {/* Sample questions - show after greeting */}
          {messages.length === 1 && messages[0].role === "assistant" && !isLoading && (
            <div className="flex flex-wrap gap-2 mt-4 pl-11">
              {SAMPLE_QUESTIONS.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSampleQuestion(question)}
                  className="text-sm px-4 py-2 rounded-full bg-card hover:bg-muted text-muted-foreground transition-colors border border-border hover:border-primary/50"
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          {isLoading && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div className="bg-card border border-border rounded-2xl px-4 py-3">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-border bg-card">
          <div className="flex gap-3 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm min-h-[48px] max-h-[120px] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              rows={1}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="lg"
              className="rounded-xl h-12 w-12 flex-shrink-0"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </Card>
    </div>
  );
}
