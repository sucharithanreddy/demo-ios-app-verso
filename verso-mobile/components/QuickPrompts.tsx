// ============================================================================
// QuickPrompts — horizontal scroll of situation-based prompts
// ============================================================================

import { View, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { QUICK_PROMPTS } from '@/lib/types';

interface Props {
  onSelect: (prompt: string) => void;
}

export function QuickPrompts({ onSelect }: Props) {
  const handlePress = (prompt: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onSelect(prompt);
  };

  return (
    <View>
      <Text className="text-muted text-micro font-semibold mb-2 px-1">
        QUICK STARTERS
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}
      >
        {QUICK_PROMPTS.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => handlePress(p.prompt)}
            className="bg-surface border border-border rounded-full px-4 py-2 active:bg-paper"
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <Text className="text-ink text-caption font-medium">
              {p.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
