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
  // Backend session ID for cross-device persistence. Null = no session yet.
  // Stored in-memory only; on app restart, a fresh session is created.
  backendSessionId: string | null;

  // Actions
  addUserMessage: (content: string) => string;
  addAssistantMessage: (response: EngineResponse) => void;
  setThinking: (thinking: boolean) => void;
  setError: (error: string | null) => void;
  setBackendSessionId: (id: string | null) => void;
  clearConversation: () => void;
  hydrateFromDb: (messages: ChatMessage[]) => void;
  markSynced: (messageId: string) => void;
}

/**
 * Build the conversation history that the engine expects.
 * - Skips the latest message (engine adds the current user message separately).
 * - For assistant messages, sends the full structured content as a JSON string
 *   so the engine can hydrate previousQuestions/reframes/etc. on the server side.
 * - Filters to synced messages to avoid sending the just-added optimistic user
 *   message twice.
 */
function buildHistoryFromMessages(
  messages: ChatMessage[]
): Array<{ role: 'user' | 'assistant'; content: string }> {
  return messages
    .filter((m) => m.synced)
    .map((m) => {
      if (m.role === 'assistant') {
        // Send a flattened plaintext version so the engine can parse it back
        // into structured fields via hydrateMemoryFromHistory()
        const parts: string[] = [];
        if (m.acknowledgment) parts.push(m.acknowledgment);
        if (m.thoughtPattern) parts.push(`Pattern: ${m.thoughtPattern}`);
        if (m.reframe) parts.push(`Reframe: ${m.reframe}`);
        if (m.question) parts.push(m.question);
        if (m.encouragement) parts.push(m.encouragement);
        return { role: 'assistant' as const, content: parts.join('\n\n') };
      }
      return { role: 'user' as const, content: m.content };
    });
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isThinking: false,
  error: null,
  conversationHistory: [],
  backendSessionId: null,

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
      patternNote: response.patternNote,
      reframe: response.reframe,
      question: response.question,
      encouragement: response.encouragement,
      icebergLayer: response.icebergLayer,
      layerInsight: response.layerInsight,
      progressScore: response.progressScore,
      layerProgress: response.layerProgress,
      groundingMode: response.groundingMode,
      groundingTurns: response.groundingTurns,
      isCrisisResponse: response.isCrisisResponse,
      meta: response.meta,
      createdAt: Date.now(),
      // Mark as synced — the round is now complete and this message is part of
      // the conversation history that will be sent on the next turn.
      synced: true,
    };

    set((state) => {
      // Mark the immediately-preceding user message as synced too — it's now
      // part of the committed conversation history.
      const messages = state.messages.map((m, i) =>
        i === state.messages.length - 1 && m.role === 'user'
          ? { ...m, synced: true }
          : m
      );
      const updatedMessages = [...messages, message];
      return {
        messages: updatedMessages,
        conversationHistory: buildHistoryFromMessages(updatedMessages),
      };
    });
  },

  setThinking: (thinking: boolean) => set({ isThinking: thinking }),
  setError: (error: string | null) => set({ error }),
  setBackendSessionId: (id: string | null) => set({ backendSessionId: id }),

  clearConversation: () =>
    set({
      messages: [],
      conversationHistory: [],
      error: null,
      isThinking: false,
      backendSessionId: null,
    }),

  hydrateFromDb: (messages: ChatMessage[]) => {
    // Hydrated messages are already part of the persisted conversation, so
    // mark them as synced so they get included in conversationHistory.
    const syncedMessages = messages.map((m) => ({ ...m, synced: true }));
    set({
      messages: syncedMessages,
      conversationHistory: buildHistoryFromMessages(syncedMessages),
    });
  },

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
