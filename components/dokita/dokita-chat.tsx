"use client";

import { useRef, useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { 
  Send, 
  Mic, 
  MicOff, 
  Stethoscope, 
  History,
  Plus,
  Languages,
  AlertTriangle,
  Sparkles,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useChatStore } from "@/stores/chat-store";
import { useEmergencyStore } from "@/stores/emergency-store";
import { detectLanguage } from "@/lib/language-detection";
import { emergencyCheck } from "@/lib/safety-engine";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "pcm", label: "Pidgin" },
  { code: "yo", label: "Yoruba" },
  { code: "ig", label: "Igbo" },
  { code: "ha", label: "Hausa" },
] as const;

const SUGGESTED_PROMPTS = [
  "I have a headache and feel dizzy",
  "My child has a fever of 38.5°C",
  "I dey feel body pain well well",
  "I need help managing my diabetes",
];

// Helper to extract text from UIMessage parts
function getMessageText(message: { parts?: Array<{ type: string; text?: string }> }): string {
  if (!message.parts || !Array.isArray(message.parts)) return "";
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text" && typeof p.text === "string")
    .map((p) => p.text)
    .join("");
}

export function DokitaChat() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<typeof LANGUAGES[number]["code"]>("en");
  
  const { 
    sessions, 
    currentSessionId, 
    createSession, 
    setCurrentSession,
    addMessage,
    getCurrentSession,
  } = useChatStore();
  
  const { activateEmergency } = useEmergencyStore();

  // AI SDK 6 useChat with DefaultChatTransport
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ 
      api: "/api/dokita",
      body: {
        language: selectedLanguage,
      },
    }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Initialize session
  useEffect(() => {
    if (!currentSessionId) {
      createSession();
    }
  }, [currentSessionId, createSession]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle voice input
  const toggleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice input is not supported in your browser");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = selectedLanguage === "pcm" ? "en-NG" : selectedLanguage;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.start();
  };

  // Handle message submission with safety check
  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const trimmedInput = input.trim();
    
    if (!trimmedInput || isLoading) {
      return;
    }

    // Detect language
    const detectedLang = detectLanguage(trimmedInput);
    if (detectedLang) {
      setSelectedLanguage(detectedLang);
    }

    // Check for emergency keywords using safety engine
    const emergencyResult = emergencyCheck(trimmedInput);
    if (emergencyResult.isEmergency) {
      activateEmergency();
      return;
    }

    // Add user message to store
    addMessage({
      role: "user",
      content: trimmedInput,
    });

    // Send message using AI SDK 6 pattern
    sendMessage({ text: trimmedInput });
    setInput("");
  };

  const handleNewChat = () => {
    createSession();
    setShowHistory(false);
  };

  const handleSelectSession = (sessionId: string) => {
    setCurrentSession(sessionId);
    setShowHistory(false);
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
            <Stethoscope className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Dokita AI</h1>
            <p className="text-xs text-muted-foreground">Your AI Health Assistant</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value as typeof selectedLanguage)}
            className="rounded-lg border border-border bg-card px-2 py-1 text-sm text-foreground"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHistory(!showHistory)}
          >
            <History className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" onClick={handleNewChat}>
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Chat History Sidebar */}
      {showHistory && (
        <div className="absolute right-0 top-14 z-50 h-[calc(100%-3.5rem)] w-72 border-l border-border bg-card shadow-lg">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="font-semibold text-foreground">Chat History</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowHistory(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="overflow-y-auto p-2">
            {sessions.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">
                No chat history yet
              </p>
            ) : (
              <div className="space-y-1">
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => handleSelectSession(session.id)}
                    className={cn(
                      "w-full rounded-lg p-3 text-left transition-colors hover:bg-accent",
                      currentSessionId === session.id && "bg-accent"
                    )}
                  >
                    <p className="truncate text-sm font-medium text-foreground">
                      {session.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(session.updatedAt).toLocaleDateString()}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            <div className="mb-6 rounded-full bg-primary/10 p-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              How can I help you today?
            </h2>
            <p className="mb-6 max-w-md text-center text-muted-foreground">
              Describe your symptoms or health concerns in any language. 
              I&apos;ll help you understand them and guide you to the right care.
            </p>

            {/* Language Indicator */}
            <div className="mb-6 flex items-center gap-2 rounded-full bg-secondary px-4 py-2">
              <Languages className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Speak in English, Pidgin, Yoruba, Igbo, or Hausa
              </span>
            </div>

            {/* Suggested Prompts */}
            <div className="grid w-full max-w-lg gap-2 sm:grid-cols-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <Card
                  key={prompt}
                  className="cursor-pointer p-3 transition-all hover:border-primary hover:shadow-sm"
                  onClick={() => handleSuggestedPrompt(prompt)}
                >
                  <p className="text-sm text-foreground">{prompt}</p>
                </Card>
              ))}
            </div>

            {/* Safety Notice */}
            <div className="mt-6 flex items-start gap-2 rounded-lg bg-amber-500/10 p-3 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-xs">
                For emergencies, use the red emergency button or call 112 immediately. 
                This AI provides guidance only, not medical diagnosis.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const messageText = getMessageText(message);
              
              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[70%]",
                      message.role === "user"
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm bg-muted text-foreground"
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="mb-1 flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-primary" />
                        <span className="text-xs font-medium text-primary">Dokita AI</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap text-sm">{messageText}</p>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-primary" />
                    <div className="flex gap-1">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-primary/60" style={{ animationDelay: "0ms" }} />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-primary/60" style={{ animationDelay: "150ms" }} />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-primary/60" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card p-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Button
            type="button"
            variant={isListening ? "destructive" : "outline"}
            size="icon"
            onClick={toggleVoiceInput}
            className="shrink-0"
          >
            {isListening ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
          
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your symptoms..."
            className="flex-1"
            disabled={isLoading}
          />
          
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}

// Add SpeechRecognition types
declare global {
  interface Window {
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
