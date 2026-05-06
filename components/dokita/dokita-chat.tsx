"use client";

import { useRef, useEffect, useState } from "react";
import { 
  Send, 
  Mic, 
  MicOff, 
  Stethoscope, 
  Languages,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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

type BrowserSpeechRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  start: () => void;
}

type BrowserSpeechRecognitionEvent = {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;
type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
}

export function DokitaChat() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<typeof LANGUAGES[number]["code"]>("en");

  const { activateEmergency } = useEmergencyStore();

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
    if (!SpeechRecognition) {
      alert("Voice input is not supported in your browser");
      return;
    }

    const recognition = new SpeechRecognition();
    
    recognition.lang = selectedLanguage === "pcm" ? "en-NG" : selectedLanguage;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    
    recognition.onresult = (event: BrowserSpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.start();
  };

  // Handle message submission with safety check
  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
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

    // Send message using AI SDK 6 pattern
    setChatError(null);
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: trimmedInput,
    };
    setMessages((current) => [...current, userMessage]);
    setInput("");

    try {
      setIsLoading(true);
      const response = await fetch("/api/dokita", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: selectedLanguage,
          messages: [...messages, userMessage].map((message) => ({
            role: message.role,
            parts: [{ type: "text", text: message.text }],
          })),
        }),
      });

      const text = await response.text();
      if (!response.ok) {
        throw new Error(text || "Dokito AI is not responding");
      }

      const assistantText = parseDokitaResponse(text);
      if (!assistantText.trim()) {
        throw new Error("Dokito AI returned an empty response");
      }

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: assistantText,
        },
      ]);
    } catch (err) {
      setChatError(err instanceof Error ? err.message : "Dokito AI is having trouble connecting. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="flex h-full min-w-0 flex-col overflow-x-hidden">
      {/* Header */}
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-b border-border bg-card p-3 sm:p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
            <Stethoscope className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate font-semibold text-foreground">Dokito AI</h1>
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
        </div>
      </div>

      {/* Messages Area */}
      <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4">
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
                  className="min-w-0 cursor-pointer p-3 transition-all hover:border-primary hover:shadow-sm"
                  onClick={() => handleSuggestedPrompt(prompt)}
                >
                  <p className="break-words text-sm text-foreground">{prompt}</p>
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

            {chatError && (
              <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {chatError}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {chatError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {chatError}
              </div>
            )}

            {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "min-w-0 max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[70%]",
                      message.role === "user"
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm bg-muted text-foreground"
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="mb-1 flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-primary" />
                        <span className="text-xs font-medium text-primary">Dokito AI</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap break-words text-sm">{message.text}</p>
                  </div>
                </div>
            ))}

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
      <div className="border-t border-border bg-card p-3 sm:p-4">
        <form onSubmit={handleSendMessage} className="flex min-w-0 items-center gap-2">
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
            className="min-w-0 flex-1"
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
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
    SpeechRecognition?: BrowserSpeechRecognitionConstructor;
  }
}

function parseDokitaResponse(raw: string) {
  const textChunks: string[] = [];

  for (const line of raw.split(/\r?\n/)) {
    if (line.startsWith("0:")) {
      try {
        textChunks.push(JSON.parse(line.slice(2)));
      } catch {
        textChunks.push(line.slice(2));
      }
    }

    if (line.startsWith("data: ")) {
      const payload = line.slice(6);
      if (payload === "[DONE]") continue;
      try {
        const parsed = JSON.parse(payload);
        if (parsed.type === "text-delta" && typeof parsed.textDelta === "string") {
          textChunks.push(parsed.textDelta);
        }
        if (parsed.type === "error" && typeof parsed.errorText === "string") {
          textChunks.push(parsed.errorText);
        }
      } catch {
        // Ignore non-JSON stream control lines.
      }
    }
  }

  return textChunks.join("").trim();
}
