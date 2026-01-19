"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bot, Loader2, UserCheck, UserX } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

type ConversationPhase = "initial" | "auto_connecting" | "searching_agent" | "connecting" | "no_agents" | "error";

interface AutoConnectResponse {
  messages?: Array<{ role: "assistant"; content: string }>;
  redirect?: {
    url: string;
    agentName: string;
    conversationId: number;
  };
  noAgentsAvailable?: boolean;
  error?: string;
}

interface ChatPageContentProps {
  userId: string;
}

export function ChatPageContent({ userId: _userId }: ChatPageContentProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState<ConversationPhase>("initial");
  const [connectingAgentName, setConnectingAgentName] = useState<string | null>(null);
  const [loadingTooLong, setLoadingTooLong] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const autoConnectStartedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, phase]);

  // Auto-connect flow on mount
  const startAutoConnect = useCallback(async () => {
    if (autoConnectStartedRef.current) return;
    autoConnectStartedRef.current = true;

    setPhase("auto_connecting");
    setIsLoading(true);
    setLoadingTooLong(false);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Show "taking longer than expected" after 10 seconds
    const loadingTimeout = setTimeout(() => {
      setLoadingTooLong(true);
    }, 10000);

    try {
      const response = await fetch("/api/chat-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [],
          autoConnect: true,
        }),
        signal: abortController.signal,
      });

      clearTimeout(loadingTimeout);

      if (!response.ok) {
        throw new Error("Failed to auto-connect");
      }

      const data = (await response.json()) as AutoConnectResponse;

      // Display messages with animation delays
      if (data.messages && data.messages.length > 0) {
        // Add first message (greeting)
        setMessages([{ role: "assistant", content: data.messages[0].content }]);

        // Show searching state after greeting
        await new Promise((resolve) => setTimeout(resolve, 1500));

        if (abortController.signal.aborted) return;

        setPhase("searching_agent");

        // Wait while "searching"
        await new Promise((resolve) => setTimeout(resolve, 1500));

        if (abortController.signal.aborted) return;

        // Add remaining messages
        if (data.messages.length > 1) {
          const remainingMessages = data.messages.slice(1);
          setMessages((prev) => [
            ...prev,
            ...remainingMessages.map((m) => ({ role: "assistant" as const, content: m.content })),
          ]);
        }
      }

      // Handle redirect or no agents
      if (data.redirect) {
        setPhase("connecting");
        setConnectingAgentName(data.redirect.agentName);

        // Brief pause before redirect
        await new Promise((resolve) => setTimeout(resolve, 1500));

        if (abortController.signal.aborted) return;

        // Validate redirect URL
        const url = data.redirect.url;
        if (!url.startsWith("/") || url.startsWith("//")) {
          throw new Error("Invalid redirect URL");
        }

        router.push(url);
      } else if (data.noAgentsAvailable) {
        setPhase("no_agents");
        setIsLoading(false);
      } else {
        // Unexpected response
        setPhase("error");
        setIsLoading(false);
      }
    } catch (error) {
      clearTimeout(loadingTimeout);
      if (error instanceof Error && error.name === "AbortError") {
        autoConnectStartedRef.current = false;
        return;
      }
      console.error("Auto-connect error:", error);
      setPhase("error");
      setMessages([
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
      setIsLoading(false);
      setLoadingTooLong(false);
    }
  }, [router]);

  // Start auto-connect on mount
  useEffect(() => {
    startAutoConnect();

    return () => {
      // Reset ref on cleanup so React strict mode remount can restart
      // This is necessary because strict mode unmounts and remounts in development
      autoConnectStartedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, [startAutoConnect]);

  // Handle retry
  const handleRetry = () => {
    autoConnectStartedRef.current = false;
    setMessages([]);
    setPhase("initial");
    setConnectingAgentName(null);
    startAutoConnect();
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
            <p className="text-sm text-muted-foreground">Here to connect you with our team</p>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
          {/* Initial/Auto-connecting loading state */}
          {(phase === "initial" || (phase === "auto_connecting" && messages.length === 0)) && (
            <div className="text-center text-muted-foreground py-12">
              <Bot className="h-12 w-12 mx-auto mb-3 opacity-50 animate-pulse" />
              <p className="text-lg">Getting ready...</p>
              <p className="text-sm mt-2 opacity-70">
                {loadingTooLong
                  ? "This is taking longer than expected. Please wait..."
                  : "Preparing your personalized greeting"}
              </p>
            </div>
          )}

          {/* Messages */}
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
            </div>
          ))}

          {/* Searching for agent state */}
          {phase === "searching_agent" && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div className="bg-card border border-border rounded-2xl px-4 py-3 flex items-center gap-3">
                <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                <span className="text-sm text-muted-foreground">Searching for available agents...</span>
              </div>
            </div>
          )}

          {/* Connecting state */}
          {phase === "connecting" && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div className="bg-card border border-border rounded-2xl px-4 py-3 flex items-center gap-3">
                <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                <span className="text-sm text-muted-foreground">
                  Connecting you with {connectingAgentName || "an agent"}...
                </span>
              </div>
            </div>
          )}

          {/* No agents available state */}
          {phase === "no_agents" && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <UserX className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="bg-card border border-border rounded-2xl px-4 py-3">
                <p className="text-sm text-muted-foreground mb-3">
                  All agents are currently offline. Please try again at a later time.
                </p>
                <Button variant="outline" size="sm" onClick={handleRetry}>
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Error state */}
          {phase === "error" && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <Bot className="h-5 w-5 text-destructive" />
              </div>
              <div className="bg-card border border-border rounded-2xl px-4 py-3">
                <p className="text-sm text-muted-foreground mb-3">
                  Something went wrong. Please try again.
                </p>
                <Button variant="outline" size="sm" onClick={handleRetry}>
                  Try Again
                </Button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Footer - info text only during auto-connect */}
        <div className="p-4 border-t border-border bg-card">
          <p className="text-xs text-muted-foreground text-center">
            {phase === "connecting"
              ? "Redirecting you to the conversation..."
              : phase === "no_agents"
                ? "No agents are available right now"
                : phase === "error"
                  ? "An error occurred"
                  : "Connecting you with our team..."}
          </p>
        </div>
      </Card>
    </div>
  );
}
