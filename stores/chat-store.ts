import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChatMessage, ChatSession, Language } from "@/lib/types";

interface ChatStore {
  sessions: ChatSession[];
  currentSessionId: string | null;
  isTyping: boolean;
  language: Language;
  
  // Actions
  createSession: () => string;
  setCurrentSession: (id: string) => void;
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  updateLastMessage: (content: string) => void;
  setTyping: (isTyping: boolean) => void;
  setLanguage: (language: Language) => void;
  getCurrentSession: () => ChatSession | null;
  clearSession: (id: string) => void;
  deleteSession: (id: string) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionId: null,
      isTyping: false,
      language: "en",

      createSession: () => {
        const newSession: ChatSession = {
          id: `session_${Date.now()}`,
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          title: "New Consultation",
        };

        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: newSession.id,
        }));

        return newSession.id;
      },

      setCurrentSession: (id) => {
        set({ currentSessionId: id });
      },

      addMessage: (message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
        };

        set((state) => {
          const sessionId = state.currentSessionId;
          if (!sessionId) return state;

          return {
            sessions: state.sessions.map((session) =>
              session.id === sessionId
                ? {
                    ...session,
                    messages: [...session.messages, newMessage],
                    updatedAt: new Date().toISOString(),
                    // Update title based on first user message
                    title:
                      session.messages.length === 0 && message.role === "user"
                        ? message.content.slice(0, 50) + (message.content.length > 50 ? "..." : "")
                        : session.title,
                  }
                : session
            ),
          };
        });
      },

      updateLastMessage: (content) => {
        set((state) => {
          const sessionId = state.currentSessionId;
          if (!sessionId) return state;

          return {
            sessions: state.sessions.map((session) => {
              if (session.id !== sessionId) return session;
              
              const messages = [...session.messages];
              if (messages.length > 0) {
                messages[messages.length - 1] = {
                  ...messages[messages.length - 1],
                  content,
                };
              }
              
              return { ...session, messages, updatedAt: new Date().toISOString() };
            }),
          };
        });
      },

      setTyping: (isTyping) => {
        set({ isTyping });
      },

      setLanguage: (language) => {
        set({ language });
      },

      getCurrentSession: () => {
        const state = get();
        return state.sessions.find((s) => s.id === state.currentSessionId) || null;
      },

      clearSession: (id) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === id
              ? { ...session, messages: [], updatedAt: new Date().toISOString() }
              : session
          ),
        }));
      },

      deleteSession: (id) => {
        set((state) => {
          const newSessions = state.sessions.filter((s) => s.id !== id);
          return {
            sessions: newSessions,
            currentSessionId:
              state.currentSessionId === id
                ? newSessions[0]?.id || null
                : state.currentSessionId,
          };
        });
      },
    }),
    {
      name: "akili-chat-store",
      partialize: (state) => ({
        sessions: state.sessions.slice(0, 20), // Keep last 20 sessions
        language: state.language,
      }),
    }
  )
);
