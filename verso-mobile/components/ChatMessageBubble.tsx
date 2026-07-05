// ============================================================================
// ChatMessageBubble — renders a single message (user or assistant)
// ============================================================================

import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import type { ChatMessage } from '@/lib/types';

interface Props {
  message: ChatMessage;
}

export function ChatMessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <View className="flex-row justify-end mb-3">
        <View className="max-w-[80%] bg-ink rounded-2xl rounded-br-md px-4 py-3">
          <Text className="text-white text-body leading-6">
            {message.content}
          </Text>
        </View>
      </View>
    );
  }

  // Assistant message — structured display
  return (
    <View className="flex-row justify-start mb-3">
      <View className="max-w-[85%]">
        {/* Acknowledgment */}
        {message.acknowledgment && (
          <View className="bg-surface border border-border rounded-2xl rounded-bl-md px-4 py-3 mb-1.5">
            <Text className="text-ink text-body leading-6">
              {message.acknowledgment}
            </Text>
          </View>
        )}

        {/* Thought pattern (if detected) */}
        {message.thoughtPattern && (
          <View className="bg-warning/10 border border-warning/20 rounded-xl px-3 py-2 mb-1.5 flex-row items-start gap-2">
            <Ionicons name="git-branch-outline" size={16} color="#F59E0B" style={{ marginTop: 2 }} />
            <View className="flex-1">
              <Text className="text-warning text-micro font-semibold mb-0.5">
                PATTERN DETECTED
              </Text>
              <Text className="text-ink text-caption leading-5">
                {message.thoughtPattern}
              </Text>
            </View>
          </View>
        )}

        {/* Reframe */}
        {message.reframe && (
          <View className="bg-accent/10 border border-accent/20 rounded-xl px-3 py-2.5 mb-1.5">
            <View className="flex-row items-center gap-1.5 mb-1">
              <Ionicons name="bulb-outline" size={14} color="#FF5C28" />
              <Text className="text-accent text-micro font-bold">REFRAME</Text>
            </View>
            <Markdown
              style={{
                body: { fontSize: 14, color: '#0A0A0B', lineHeight: 20 },
                strong: { fontWeight: '700' },
              }}
            >
              {message.reframe}
            </Markdown>
          </View>
        )}

        {/* Question */}
        {message.question && (
          <View className="bg-surface border border-border rounded-2xl rounded-bl-md px-4 py-3">
            <Text className="text-ink text-body leading-6 font-medium">
              {message.question}
            </Text>
          </View>
        )}

        {/* Crisis response indicator */}
        {message.isCrisisResponse && (
          <View className="flex-row items-center gap-1.5 mt-2 px-2">
            <Ionicons name="heart" size={12} color="#EF4444" />
            <Text className="text-danger text-micro">
              We're here for you. You matter.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
