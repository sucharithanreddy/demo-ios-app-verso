// ============================================================================
// Home screen — daily check-in status + AI greeting + streak
// ============================================================================

import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import {
  useProfile,
  useLatestDiagnostic,
  useStreak,
  useCoachingTips,
} from '@/lib/hooks';
import { CheckInModal } from '@/components/CheckInModal';
import { CoachingTipCard } from '@/components/CoachingTipCard';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useUser();
  const [checkInModalVisible, setCheckInModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data: profile } = useProfile();
  const { data: diagnostic } = useLatestDiagnostic();
  const { data: streak } = useStreak();
  const { data: coachingData, refetch: refetchCoaching } = useCoachingTips('morning');

  const archetype = diagnostic?.primaryProfile;
  const firstName = user?.firstName || profile?.name?.split(' ')[0] || 'there';
  const today = new Date();
  const hour = today.getHours();

  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.allSettled([refetchCoaching()]);
    setRefreshing(false);
  }, [refetchCoaching]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#FAFAF7' }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF5C28" />}
    >
      {/* Greeting */}
      <View className="px-6 mb-6">
        <Text className="text-muted text-body font-medium mb-1">
          {greeting},
        </Text>
        <Text className="text-ink text-display font-bold tracking-tight">
          {firstName}
        </Text>
        {archetype && (
          <View className="flex-row items-center mt-2">
            <View className="bg-accent/10 px-3 py-1 rounded-full">
              <Text className="text-accent text-caption font-semibold">
                {archetype} archetype
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Daily check-in CTA */}
      <View className="px-6 mb-6">
        <Pressable
          onPress={() => setCheckInModalVisible(true)}
          className="bg-ink rounded-2xl p-5 active:opacity-90"
          style={({ pressed }) => [{ opacity: pressed ? 0.88 : 1 }]}
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-white text-title font-semibold">
              Daily Check-in
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </View>
          <Text className="text-white/70 text-caption leading-5">
            Take 30 seconds to log how you're feeling today. Your AI coach uses this to personalize guidance.
          </Text>
          <View className="flex-row items-center mt-3">
            <View className="bg-white/15 px-2.5 py-1 rounded-md">
              <Text className="text-white text-micro font-semibold">
                {streak?.currentStreak ?? 0} day streak
              </Text>
            </View>
          </View>
        </Pressable>
      </View>

      {/* Quick actions */}
      <View className="px-6 mb-6">
        <Text className="text-ink text-title font-semibold mb-3">
          Quick actions
        </Text>
        <View className="flex-row gap-3">
          <QuickActionCard
            icon="chatbubble-ellipses"
            label="Talk to Coach"
            onPress={() => router.push('/(tabs)/coach')}
          />
          <QuickActionCard
            icon="trending-up"
            label="Insights"
            onPress={() => router.push('/(tabs)/insights')}
          />
        </View>
      </View>

      {/* Today's coaching tip */}
      {coachingData && coachingData.tips.length > 0 && (
        <View className="px-6 mb-6">
          <Text className="text-ink text-title font-semibold mb-3">
            Today's coaching
          </Text>
          {coachingData.tips.slice(0, 2).map((tip) => (
            <CoachingTipCard key={tip.id} tip={tip} />
          ))}
        </View>
      )}

      {/* Streak card */}
      {streak && streak.longestStreak > 0 && (
        <View className="px-6 mb-6">
          <View className="bg-surface border border-border rounded-2xl p-5">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-ink text-title font-semibold">Your streak</Text>
              <Ionicons name="flame" size={24} color="#FF5C28" />
            </View>
            <View className="flex-row items-end gap-6">
              <View>
                <Text className="text-muted text-caption mb-1">Current</Text>
                <Text className="text-ink text-display font-bold">
                  {streak.currentStreak}
                </Text>
              </View>
              <View>
                <Text className="text-muted text-caption mb-1">Best</Text>
                <Text className="text-mutedLight text-display font-bold">
                  {streak.longestStreak}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      <CheckInModal
        visible={checkInModalVisible}
        onClose={() => setCheckInModalVisible(false)}
      />
    </ScrollView>
  );
}

function QuickActionCard({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 bg-surface border border-border rounded-2xl p-4 items-center active:opacity-80"
    >
      <View className="w-10 h-10 rounded-full bg-accent/10 items-center justify-center mb-2">
        <Ionicons name={icon} size={20} color="#FF5C28" />
      </View>
      <Text className="text-ink text-caption font-semibold text-center">
        {label}
      </Text>
    </Pressable>
  );
}
