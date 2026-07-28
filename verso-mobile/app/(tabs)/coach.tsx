// ============================================================================
// Coach screen - AI Coach chat (the hero feature)
// ============================================================================

import {
  View,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRef, useCallback, useEffect, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useChatStore } from '@/lib/store';
import { useSendMessage, useLatestDiagnostic } from '@/lib/hooks';
import { saveMessage, clearMessages } from '@/lib/db';
import {
  createSession,
  appendSessionMessage,
  updateSessionState,
} from '@/lib/api';
import { ChatMessageBubble } from '@/components/ChatMessageBubble';
import { ChatInput } from '@/components/ChatInput';
import { QuickPrompts } from '@/components/QuickPrompts';
import { TypingIndicator } from '@/components/TypingIndicator';
import { IcebergDepthIndicator } from '@/components/IcebergDepthIndicator';
import type { ChatMessage, EngineResponse } from '@/lib/types';

export default function CoachScreen() {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  const messages = useChatStore((s) => s.messages);
  const isThinking = useChatStore((s) => s.isThinking);
  const error = useChatStore((s) => s.error);
  const addUserMessage = useChatStore((s) => s.addUserMessage);
  const addAssistantMessage = useChatStore((s) => s.addAssistantMessage);
  const setThinking = useChatStore((s) => s.setThinking);
  const setError = useChatStore((s) => s.setError);
  const conversationHistory = useChatStore((s) => s.conversationHistory);

  const sendMessage = useSendMessage();
  const { data: diagnostic } = useLatestDiagnostic();
  const backendSessionId = useChatStore((s) => s.backendSessionId);
  const setBackendSessionId = useChatStore((s) => s.setBackendSessionId);

  // The most recent assistant message - drives the depth indicator + state
  const lastAssistantMessage = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') return messages[i];
    }
    return null;
  }, [messages]);

  // Derive sessionContext from the last assistant message's preserved state.
  // The engine can reconstruct previousQuestions/reframes/etc. from history,
  // but grounding/intent state must be passed in explicitly.
  const sessionContext = useMemo(() => {
    if (!lastAssistantMessage) return undefined;
    return {
      groundingMode: lastAssistantMessage.groundingMode,
      groundingTurns: lastAssistantMessage.groundingTurns,
      coreBeliefAlreadyDetected: lastAssistantMessage.meta?.coreBeliefDetected,
      lastQuestionType:
        lastAssistantMessage.meta?.state === 'choice'
          ? ('choice' as const)
          : lastAssistantMessage.question
            ? ('open' as const)
            : ('' as const),
      userIntent: lastAssistantMessage.meta?.intent ?? ('AUTO' as const),
      originalTrigger: messages.find((m) => m.role === 'user')?.content,
    };
  }, [lastAssistantMessage, messages]);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 50);
    }
  }, [messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom, isThinking]);

  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim() || isThinking) return;

      setError(null);

      // Add user message to store + SQLite
      const userMsgId = addUserMessage(text);
      const userMessage: ChatMessage = useChatStore
        .getState()
        .messages.find((m) => m.id === userMsgId)!;
      await saveMessage(userMessage).catch(() => {});

      // Best-effort: lazily create a backend session on the first user message.
      // This persists the conversation cross-device without blocking the chat.
      let sessionId = backendSessionId;
      if (!sessionId) {
        // Fire-and-forget - don't await. We'll capture the sessionId when it lands.
        createSession(text)
          .then((res) => {
            if (res?.sessionId) {
              setBackendSessionId(res.sessionId);
              // The first user message is already saved by createSession(firstThought).
            }
          })
          .catch(() => {});
      } else {
        // Subsequent messages - append to existing backend session.
        appendSessionMessage(sessionId, {
          role: 'user',
          content: text,
        }).catch(() => {});
      }

      setThinking(true);

      try {
        const response: EngineResponse = await sendMessage.mutateAsync({
          userMessage: text,
          conversationHistory,
          sessionContext,
        });

        // Add assistant response to store + SQLite
        addAssistantMessage(response);
        const assistantMessage = useChatStore.getState().messages[
          useChatStore.getState().messages.length - 1
        ];
        await saveMessage(assistantMessage).catch(() => {});

        // Best-effort: persist assistant message + session state to backend.
        // Wait for sessionId in case the createSession call from this same
        // turn hasn't resolved yet - race condition tolerant.
        const targetSessionId = sessionId ?? useChatStore.getState().backendSessionId;
        if (targetSessionId) {
          appendSessionMessage(targetSessionId, {
            role: 'assistant',
            content: assistantMessage.content,
            acknowledgment: assistantMessage.acknowledgment,
            thoughtPattern: assistantMessage.thoughtPattern,
            patternNote: assistantMessage.patternNote,
            reframe: assistantMessage.reframe,
            question: assistantMessage.question,
            encouragement: assistantMessage.encouragement,
            icebergLayer: assistantMessage.icebergLayer,
            layerInsight: assistantMessage.layerInsight,
            progressScore: assistantMessage.progressScore,
            layerProgress: assistantMessage.layerProgress as Record<string, number> | undefined,
            groundingMode: assistantMessage.groundingMode,
            groundingTurns: assistantMessage.groundingTurns,
            isCrisisResponse: assistantMessage.isCrisisResponse,
            meta: assistantMessage.meta as Record<string, unknown> | undefined,
          }).catch(() => {});

          updateSessionState(targetSessionId, {
            groundingMode: assistantMessage.groundingMode,
            groundingTurns: assistantMessage.groundingTurns,
            coreBeliefAlreadyDetected: assistantMessage.meta?.coreBeliefDetected,
            lastQuestionType: assistantMessage.question ? 'open' : '',
            lastIntentUsed: assistantMessage.meta?.intent ?? 'AUTO',
            currentLayer: assistantMessage.meta?.effectiveLayer,
          }).catch(() => {});
        }

        // Show crisis alert if needed
        if (response.isCrisisResponse) {
          Alert.alert(
            'You matter',
            'It sounds like you\'re going through a really hard time. If you\'re in crisis, please reach out to someone who can help.\n\nUS: 988 (Suicide & Crisis Lifeline)\nUK: 116 123 (Samaritans)\nOr text HOME to 741741',
            [{ text: 'I understand', style: 'default' }]
          );
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Something went wrong. Please try again.';
        setError(message);
      } finally {
        setThinking(false);
      }
    },
    [
      isThinking,
      addUserMessage,
      addAssistantMessage,
      setThinking,
      setError,
      sendMessage,
      conversationHistory,
      sessionContext,
      backendSessionId,
      setBackendSessionId,
    ]
  );

  const handleClearConversation = useCallback(() => {
    Alert.alert(
      'Clear conversation',
      'This will erase all messages on this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            useChatStore.getState().clearConversation();
            clearMessages();
          },
        },
      ]
    );
  }, []);

  const renderMessage = useCallback(
    ({ item, index }: { item: ChatMessage; index: number }) => (
      <ChatMessageBubble
        message={item}
        // Only animate the most recent assistant message - older messages
        // should render instantly when hydrated or scrolled back into view.
        animate={
          item.role === 'assistant' &&
          index === messages.length - 1 &&
          !isThinking
        }
      />
    ),
    [messages.length, isThinking]
  );

  // The depth indicator shows when there's at least one assistant reply
  // and we have layerProgress data. Sits above the input as a sticky footer
  // companion to give constant sense of progression.
  const showDepthIndicator =
    !isThinking &&
    lastAssistantMessage?.layerProgress &&
    Object.keys(lastAssistantMessage.layerProgress).length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 12,
          backgroundColor: '#FFFFFF',
          borderBottomColor: '#E4E4E7',
          borderBottomWidth: 1,
        }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="w-9 h-9 rounded-full bg-accent items-center justify-center">
              <Ionicons name="sparkles" size={18} color="#FFFFFF" />
            </View>
            <View>
              <Text className="text-ink text-title font-semibold">AI Coach</Text>
              <Text className="text-muted text-micro">
                {diagnostic
                  ? `${diagnostic.primaryProfile} mode`
                  : 'Personalized to you'}
              </Text>
            </View>
          </View>
          {messages.length > 0 && (
            <Pressable
              onPress={handleClearConversation}
              className="w-9 h-9 rounded-full items-center justify-center active:bg-paper"
            >
              <Ionicons name="trash-outline" size={18} color="#71717A" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 16,
          flexGrow: 1,
        }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center px-6 py-20">
            <View className="w-16 h-16 rounded-full bg-accent/10 items-center justify-center mb-4">
              <Ionicons name="chatbubbles-outline" size={32} color="#FF5C28" />
            </View>
            <Text className="text-ink text-title font-semibold text-center mb-2">
              How are you feeling today?
            </Text>
            <Text className="text-muted text-body text-center leading-6">
              Your coach is here to help you navigate the mental side of sales. Share what's on your mind.
            </Text>
          </View>
        }
        ListFooterComponent={
          isThinking ? (
            <View className="px-4 py-2">
              <TypingIndicator />
            </View>
          ) : null
        }
        onContentSizeChange={scrollToBottom}
        onLayout={scrollToBottom}
      />

      {/* Error banner */}
      {error && (
        <View className="px-4 py-3 bg-danger/10 mx-4 mb-2 rounded-xl">
          <Text className="text-danger text-caption font-medium">{error}</Text>
        </View>
      )}

      {/* Iceberg depth indicator - sticky above the input */}
      {showDepthIndicator && lastAssistantMessage && (
        <View className="px-4 pb-2">
          <IcebergDepthIndicator
            layerProgress={lastAssistantMessage.layerProgress}
            effectiveLayer={lastAssistantMessage.meta?.effectiveLayer}
            progressScore={lastAssistantMessage.progressScore}
            groundingMode={lastAssistantMessage.groundingMode}
            turnCount={lastAssistantMessage.meta?.turn}
          />
        </View>
      )}

      {/* Quick prompts (only when conversation is empty) */}
      {messages.length === 0 && !isThinking && (
        <View className="px-4 pb-2">
          <QuickPrompts onSelect={handleSend} />
        </View>
      )}

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View
          style={{
            paddingBottom: insets.bottom,
            backgroundColor: '#FFFFFF',
            borderTopColor: '#E4E4E7',
            borderTopWidth: 1,
          }}
        >
          <ChatInput onSend={handleSend} disabled={isThinking} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
