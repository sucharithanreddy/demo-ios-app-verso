// ============================================================================
// ChatMessageBubble — renders a single message (user or assistant)
//
// Assistant messages are structured into 5 visible sections + an optional
// crisis footer. Each section fades + slides in with a staggered delay to
// make the response feel "thoughtful" rather than "instant":
//
//   1. Acknowledgment   — "I hear you. That's heavy."
//   2. Thought pattern  — yellow chip with the cognitive distortion
//   3. Pattern note     — small muted line explaining the pattern
//   4. Reframe          — orange card with the cognitive reframe (markdown)
//   5. Question         — the probing question that moves the conversation
//   6. Encouragement    — small italic closing line
//
// When the engine flags a crisis response, we hide 2/3/4/5 and show a
// warm, supportive footer instead — the user needs presence, not analysis.
// ============================================================================

import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import Animated, {
  FadeInDown,
} from 'react-native-reanimated';
import type { ChatMessage } from '@/lib/types';

interface Props {
  message: ChatMessage;
  /**
   * When true, this message is the most recent assistant reply and should
   * animate in section-by-section. When false (e.g., hydrated from SQLite),
   * all sections appear instantly.
   */
  animate?: boolean;
}

const ENTRY_DURATION = 320;
// Reanimated v3.16: Easing.bezier returns an EasingFunction wrapper,
// but FadeInDown.easing() expects a raw (t:number)=>number. Use a simple
// ease-out curve instead — works on both iOS and Android, looks great.
const EASE_OUT = (t: number) => 1 - Math.pow(1 - t, 3);

export function ChatMessageBubble({ message, animate = false }: Props) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <Animated.View
        entering={animate ? FadeInDown.duration(200).springify() : undefined}
        className="flex-row justify-end mb-3"
      >
        <View className="max-w-[80%] bg-ink rounded-2xl rounded-br-md px-4 py-3">
          <Text className="text-white text-body leading-6">
            {message.content}
          </Text>
        </View>
      </Animated.View>
    );
  }

  // Crisis response — strip the structured analysis. Just presence.
  if (message.isCrisisResponse) {
    return (
      <View className="flex-row justify-start mb-3">
        <View className="max-w-[85%]">
          {message.acknowledgment && (
            <Reveal delay={0} animate={animate}>
              <View className="bg-danger/10 border border-danger/20 rounded-2xl rounded-bl-md px-4 py-3">
                <Text className="text-ink text-body leading-6">
                  {message.acknowledgment}
                </Text>
              </View>
            </Reveal>
          )}
          {message.encouragement && (
            <Reveal delay={120} animate={animate}>
              <View className="bg-danger/5 border border-danger/10 rounded-xl px-4 py-2.5 mt-1.5">
                <Text className="text-ink text-caption leading-5 italic">
                  {message.encouragement}
                </Text>
              </View>
            </Reveal>
          )}
          <Reveal delay={240} animate={animate}>
            <View className="flex-row items-center gap-1.5 mt-2 px-2">
              <Ionicons name="heart" size={12} color="#EF4444" />
              <Text className="text-danger text-micro font-medium">
                You matter. Help is here.
              </Text>
            </View>
          </Reveal>
        </View>
      </View>
    );
  }

  // Standard structured assistant response
  return (
    <View className="flex-row justify-start mb-3">
      <View className="max-w-[85%]">
        {/* 1. Acknowledgment — the warm reflection */}
        {message.acknowledgment && (
          <Reveal delay={0} animate={animate}>
            <View className="bg-surface border border-border rounded-2xl rounded-bl-md px-4 py-3 mb-1.5">
              <Text className="text-ink text-body leading-6">
                {message.acknowledgment}
              </Text>
            </View>
          </Reveal>
        )}

        {/* 2. Thought pattern — the cognitive distortion chip */}
        {message.thoughtPattern && (
          <Reveal delay={120} animate={animate}>
            <View className="bg-warning/10 border border-warning/20 rounded-xl px-3 py-2 mb-1.5 flex-row items-start gap-2">
              <Ionicons
                name="git-branch-outline"
                size={16}
                color="#F59E0B"
                style={{ marginTop: 2 }}
              />
              <View className="flex-1">
                <Text className="text-warning text-micro font-semibold mb-0.5 tracking-wider">
                  PATTERN DETECTED
                </Text>
                <Text className="text-ink text-caption leading-5 font-medium">
                  {message.thoughtPattern}
                </Text>
                {/* 3. Pattern note — why this pattern shows up */}
                {message.patternNote && (
                  <Text className="text-muted text-caption leading-5 mt-1">
                    {message.patternNote}
                  </Text>
                )}
              </View>
            </View>
          </Reveal>
        )}

        {/* 4. Reframe — the cognitive reframe (the heart of the response) */}
        {message.reframe && (
          <Reveal delay={240} animate={animate}>
            <View className="bg-accent/10 border border-accent/20 rounded-xl px-3 py-2.5 mb-1.5">
              <View className="flex-row items-center gap-1.5 mb-1">
                <Ionicons name="bulb-outline" size={14} color="#FF5C28" />
                <Text className="text-accent text-micro font-bold tracking-wider">
                  REFRAME
                </Text>
              </View>
              <Markdown
                style={{
                  body: { fontSize: 14, color: '#0A0A0B', lineHeight: 20 },
                  strong: { fontWeight: '700' },
                  em: { fontStyle: 'italic' },
                  paragraph: { marginTop: 0, marginBottom: 0 },
                }}
              >
                {message.reframe}
              </Markdown>
            </View>
          </Reveal>
        )}

        {/* 5. Question — the probe that moves the conversation forward */}
        {message.question && (
          <Reveal delay={360} animate={animate}>
            <View className="bg-paper border border-border rounded-2xl rounded-bl-md px-4 py-3 mb-1.5">
              <Text className="text-ink text-body leading-6 font-medium">
                {message.question}
              </Text>
            </View>
          </Reveal>
        )}

        {/* 6. Encouragement — the closing lift */}
        {message.encouragement && (
          <Reveal delay={440} animate={animate}>
            <View className="px-2 mt-0.5">
              <Text className="text-muted text-caption leading-5 italic">
                {message.encouragement}
              </Text>
            </View>
          </Reveal>
        )}

        {/* Footer: tiny meta line (only when animate=true, i.e., fresh response) */}
        {animate && message.meta && (
          <Reveal delay={520} animate={animate}>
            <View className="flex-row items-center gap-1.5 mt-1.5 px-2">
              <View
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: message.meta.coreBeliefDetected
                    ? '#FF5C28'
                    : '#22C55E',
                }}
              />
              <Text className="text-muted text-micro">
                {message.meta.coreBeliefDetected
                  ? 'Touched something deeper'
                  : message.meta.effectiveLayer
                    ? `Exploring ${message.meta.effectiveLayer.toLowerCase()}`
                    : 'Listening'}
              </Text>
            </View>
          </Reveal>
        )}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Reveal wrapper — staggered fade-in for fresh assistant messages
// ---------------------------------------------------------------------------

function Reveal({
  delay,
  animate,
  children,
}: {
  delay: number;
  animate: boolean;
  children: React.ReactNode;
}) {
  if (!animate) return <>{children}</>;
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(ENTRY_DURATION).easing(EASE_OUT)}>
      {children}
    </Animated.View>
  );
}
