// ============================================================================
// CoachingTipCard - displays a single coaching tip
// ============================================================================

import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CoachingTip } from '@/lib/types';

interface Props {
  tip: CoachingTip;
}

export function CoachingTipCard({ tip }: Props) {
  return (
    <View className="bg-surface border border-border rounded-2xl p-4 mb-2">
      <View className="flex-row items-start gap-3">
        <View className="w-8 h-8 rounded-full bg-accent/10 items-center justify-center flex-shrink-0">
          <Ionicons name="bulb-outline" size={16} color="#FF5C28" />
        </View>
        <View className="flex-1">
          {tip.actionTitle && (
            <Text className="text-ink text-caption font-semibold mb-1">
              {tip.actionTitle}
            </Text>
          )}
          <Text className="text-muted text-caption leading-5">
            {tip.tip}
          </Text>
        </View>
      </View>
    </View>
  );
}
