// ============================================================================
// Zustand stores — client state management
// ============================================================================

import { create } from 'zustand';
import type { ChatMessage, EngineResponse } from './types';

// ---------------------------------------------------------------------------
// Chat store — holds the conversation in memory + syncs to SQLite
// ---------------------------------------------------------------------------

interface ChatState {
  messages: ChatMessage[];
  isThinking: boolean;
  error: string | null;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;

  // Actions
  addUserMessage: (content: string) => string;
  addAssistantMessage: (response: EngineResponse) => void;
  setThinking: (thinking: boolean) => void;
  setError: (error: string | null) => void;
  clearConversation: () => void;
  hydrateFromDb: (messages: ChatMessage[]) => void;
  markSynced: (messageId: string) => void;
}

function buildHistoryFromMessages(
  messages: ChatMessage[]
): Array<{ role: 'user' | 'assistant'; content: string }> {
  // The engine expects conversationHistory WITHOUT the current message
  return messages
    .filter((m) => m.synced)
    .map((m) => ({
      role: m.role,
      // For assistant messages, use the full content (acknowledgment + reframe + question)
      content: m.content,
    }));
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isThinking: false,
  error: null,
  conversationHistory: [],

  addUserMessage: (content: string) => {
    const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const message: ChatMessage = {
      id,
      role: 'user',
      content,
      createdAt: Date.now(),
      synced: false,
    };
    set((state) => ({
      messages: [...state.messages, message],
      conversationHistory: buildHistoryFromMessages([...state.messages, message]),
    }));
    return id;
  },

  addAssistantMessage: (response: EngineResponse) => {
    const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    // Build the full displayable content from the structured response
    const parts: string[] = [];
    if (response.acknowledgment) parts.push(response.acknowledgment);
    if (response.reframe) parts.push(`**Reframe:** ${response.reframe}`);
    if (response.question) parts.push(response.question);
    const content = parts.join('\n\n') || "I'm here for you. Tell me more about what's going on.";

    const message: ChatMessage = {
      id,
      role: 'assistant',
      content,
      acknowledgment: response.acknowledgment,
      thoughtPattern: response.thoughtPattern,
      reframe: response.reframe,
      question: response.question,
      icebergLayer: response.icebergLayer,
      isCrisisResponse: response.isCrisisResponse,
      createdAt: Date.now(),
      synced: false,
    };
    set((state) => ({
      messages: [...state.messages, message],
      conversationHistory: buildHistoryFromMessages([...state.messages, message]),
    }));
  },

  setThinking: (thinking: boolean) => set({ isThinking: thinking }),
  setError: (error: string | null) => set({ error }),

  clearConversation: () =>
    set({
      messages: [],
      conversationHistory: [],
      error: null,
      isThinking: false,
    }),

  hydrateFromDb: (messages: ChatMessage[]) =>
    set({
      messages,
      conversationHistory: buildHistoryFromMessages(messages),
    }),

  markSynced: (messageId: string) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, synced: true } : m
      ),
    })),
}));

// ---------------------------------------------------------------------------
// Onboarding store — tracks whether the user has completed the diagnostic
// ---------------------------------------------------------------------------

interface OnboardingState {
  hasSeenWelcome: boolean;
  setHasSeenWelcome: (seen: boolean) => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  hasSeenWelcome: false,
  setHasSeenWelcome: (seen) => set({ hasSeenWelcome: seen }),
}));
