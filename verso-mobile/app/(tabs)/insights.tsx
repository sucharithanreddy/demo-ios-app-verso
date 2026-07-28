// ============================================================================
// Insights screen - check-in history, trends, weekly synthesis
// ============================================================================

import { View, Text, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback, useMemo } from 'react';
import { useCheckIns, useLatestDiagnostic, useStreak } from '@/lib/hooks';
import { CheckInTrendChart } from '@/components/CheckInTrendChart';
import { ImpactTagSummary } from '@/components/ImpactTagSummary';

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const { data: checkIns = [], refetch: refetchCheckIns } = useCheckIns(30);
  const { data: diagnostic } = useLatestDiagnostic();
  const { data: streak } = useStreak();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.allSettled([refetchCheckIns()]);
    setRefreshing(false);
  }, [refetchCheckIns]);

  // Compute averages from last 7 check-ins
  const last7 = useMemo(() => checkIns.slice(0, 7), [checkIns]);
  const averages = useMemo(() => {
    if (last7.length === 0) return null;
    const sum = last7.reduce(
      (acc, c) => ({
        mood: acc.mood + c.mood,
        energy: acc.energy + c.energy,
        confidence: acc.confidence + c.confidence,
      }),
      { mood: 0, energy: 0, confidence: 0 }
    );
    return {
      mood: (sum.mood / last7.length).toFixed(1),
      energy: (sum.energy / last7.length).toFixed(1),
      confidence: (sum.confidence / last7.length).toFixed(1),
    };
  }, [last7]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#FAFAF7' }}
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: 32,
      }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF5C28" />
      }
    >
      {/* Header */}
      <View className="px-6 mb-6">
        <Text className="text-display font-bold text-ink tracking-tight">
          Insights
        </Text>
        <Text className="text-muted text-body mt-1">
          Your patterns over the last 30 days
        </Text>
      </View>

      {checkIns.length === 0 ? (
        <View className="px-6 py-20 items-center">
          <View className="w-16 h-16 rounded-full bg-accent/10 items-center justify-center mb-4">
            <Ionicons name="analytics-outline" size={32} color="#FF5C28" />
          </View>
          <Text className="text-ink text-title font-semibold mb-2">
            No data yet
          </Text>
          <Text className="text-muted text-body text-center leading-6">
            Start doing daily check-ins and your patterns will appear here. Insights get richer with every entry.
          </Text>
        </View>
      ) : (
        <>
          {/* Averages card */}
          {averages && (
            <View className="px-6 mb-6">
              <View className="bg-surface border border-border rounded-2xl p-5">
                <Text className="text-muted text-caption font-semibold mb-3">
                  LAST 7 CHECK-INS - AVERAGE
                </Text>
                <View className="flex-row justify-between">
                  <MetricCard label="Mood" value={averages.mood} icon="happy-outline" color="#22C55E" />
                  <MetricCard label="Energy" value={averages.energy} icon="flash-outline" color="#F59E0B" />
                  <MetricCard label="Confidence" value={averages.confidence} icon="shield-outline" color="#3B82F6" />
                </View>
              </View>
            </View>
          )}

          {/* Trend chart */}
          {last7.length > 1 && (
            <View className="px-6 mb-6">
              <Text className="text-ink text-title font-semibold mb-3">
                Trend
              </Text>
              <CheckInTrendChart checkIns={last7} />
            </View>
          )}

          {/* Impact tags summary */}
          {checkIns.length > 0 && (
            <View className="px-6 mb-6">
              <Text className="text-ink text-title font-semibold mb-3">
                What's impacting you
              </Text>
              <ImpactTagSummary checkIns={checkIns} />
            </View>
          )}

          {/* Archetype card */}
          {diagnostic && (
            <View className="px-6 mb-6">
              <View className="bg-ink rounded-2xl p-5">
                <Text className="text-white/60 text-micro font-semibold mb-2">
                  YOUR ARCHETYPE
                </Text>
                <Text className="text-white text-display font-bold mb-3">
                  {diagnostic.primaryProfile}
                </Text>
                <Text className="text-white/80 text-body leading-6 mb-4">
                  {getArchetypeDescription(diagnostic.primaryProfile)}
                </Text>
                <View className="flex-row gap-2">
                  {[
                    { label: 'Driver', score: diagnostic.driverScore },
                    { label: 'Strategist', score: diagnostic.strategistScore },
                    { label: 'Connector', score: diagnostic.connectorScore },
                    { label: 'Reactor', score: diagnostic.reactorScore },
                  ].map((s) => (
                    <View
                      key={s.label}
                      className={`px-3 py-1.5 rounded-full ${
                        s.label === diagnostic.primaryProfile
                          ? 'bg-accent'
                          : 'bg-white/10'
                      }`}
                    >
                      <Text
                        className={`text-caption font-semibold ${
                          s.label === diagnostic.primaryProfile
                            ? 'text-white'
                            : 'text-white/60'
                        }`}
                      >
                        {s.label} {s.score}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Streak */}
          {streak && (
            <View className="px-6 mb-6">
              <View className="bg-surface border border-border rounded-2xl p-5 flex-row items-center justify-between">
                <View>
                  <Text className="text-muted text-caption mb-1">Current streak</Text>
                  <Text className="text-ink text-display font-bold">
                    {streak.currentStreak} {streak.currentStreak === 1 ? 'day' : 'days'}
                  </Text>
                </View>
                <View className="items-center">
                  <Ionicons name="flame" size={32} color="#FF5C28" />
                  <Text className="text-muted text-micro mt-1">
                    Best: {streak.longestStreak}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Recent check-ins list */}
          <View className="px-6">
            <Text className="text-ink text-title font-semibold mb-3">
              Recent check-ins
            </Text>
            <View className="gap-2">
              {checkIns.slice(0, 10).map((c) => (
                <View
                  key={c.id}
                  className="bg-surface border border-border rounded-xl p-4"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-ink text-caption font-semibold">
                      {formatDate(c.date)}
                    </Text>
                    <View className="flex-row gap-1">
                      <ScoreDot label="M" value={c.mood} />
                      <ScoreDot label="E" value={c.energy} />
                      <ScoreDot label="C" value={c.confidence} />
                    </View>
                  </View>
                  {c.patternInsight && (
                    <Text className="text-muted text-caption leading-5">
                      {c.patternInsight}
                    </Text>
                  )}
                  {c.notes && (
                    <Text className="text-ink text-caption mt-1 italic">
                      "{c.notes}"
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

function getArchetypeDescription(archetype: string): string {
  switch (archetype) {
    case 'Driver':
      return 'You push hard and aim high. Your strength is momentum - but watch for burnout under sustained pressure.';
    case 'Strategist':
      return 'You think ahead and plan carefully. Your strength is preparation - but watch for analysis paralysis when stakes are high.';
    case 'Connector':
      return 'You thrive on relationships and trust. Your strength is warmth - but you may take rejection more personally than others.';
    case 'Reactor':
      return 'You feel deeply and respond fast. Your strength is passion - but emotional spikes can hijack your focus if unchecked.';
    default:
      return 'Take the diagnostic to unlock personalized insights.';
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function MetricCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}) {
  return (
    <View className="items-center flex-1">
      <View
        className="w-10 h-10 rounded-full items-center justify-center mb-2"
        style={{ backgroundColor: `${color}15` }}
      >
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text className="text-ink text-title font-bold">{value}</Text>
      <Text className="text-muted text-micro">{label}</Text>
    </View>
  );
}

function ScoreDot({ label, value }: { label: string; value: number }) {
  const color =
    value >= 4 ? '#22C55E' : value >= 3 ? '#F59E0B' : '#EF4444';
  return (
    <View
      className="px-2 py-0.5 rounded-md flex-row items-center gap-1"
      style={{ backgroundColor: `${color}15` }}
    >
      <Text className="text-micro font-bold" style={{ color }}>
        {label}
      </Text>
      <Text className="text-micro font-bold" style={{ color }}>
        {value}
      </Text>
    </View>
  );
}
