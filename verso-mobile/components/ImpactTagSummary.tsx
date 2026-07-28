// ============================================================================
// ImpactTagSummary - frequency of impact tags across check-ins
// ============================================================================

import { View, Text } from 'react-native';
import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { SalesCheckIn } from '@/lib/types';
import { IMPACT_TAGS } from '@/lib/types';

interface Props {
  checkIns: SalesCheckIn[];
}

export function ImpactTagSummary({ checkIns }: Props) {
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    checkIns.forEach((c) => {
      c.impactTags?.forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6);
  }, [checkIns]);

  if (tagCounts.length === 0) return null;

  const maxCount = tagCounts[0][1];

  return (
    <View className="bg-surface border border-border rounded-2xl p-5">
      <Text className="text-muted text-micro font-semibold mb-3">
        MOST FREQUENT IMPACTS
      </Text>
      <View className="gap-3">
        {tagCounts.map(([tagId, count]) => {
          const tagDef = IMPACT_TAGS.find((t) => t.id === tagId);
          if (!tagDef) return null;
          const pct = (count / maxCount) * 100;
          return (
            <View key={tagId}>
              <View className="flex-row items-center justify-between mb-1">
                <View className="flex-row items-center gap-2">
                  <Ionicons
                    name={tagDef.icon as keyof typeof Ionicons.glyphMap}
                    size={14}
                    color={tagDef.color}
                  />
                  <Text className="text-ink text-caption font-medium">
                    {tagDef.label}
                  </Text>
                </View>
                <Text className="text-muted text-micro">{count}×</Text>
              </View>
              <View className="h-2 bg-border rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: tagDef.color,
                  }}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
