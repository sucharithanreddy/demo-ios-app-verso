// ============================================================================
// Profile screen - user info, archetype, subscription, settings
// ============================================================================

import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useProfile, useLatestDiagnostic } from '@/lib/hooks';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const { user } = useUser();
  const { data: profile } = useProfile();
  const { data: diagnostic } = useLatestDiagnostic();

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => signOut(),
      },
    ]);
  };

  const isPaid =
    profile?.subscriptionStatus === 'ACTIVE' ||
    profile?.subscriptionPlan !== 'FREE';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#FAFAF7' }}
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: 32,
      }}
    >
      {/* Header with avatar */}
      <View className="px-6 mb-6 items-center">
        <View className="w-20 h-20 rounded-full bg-accent items-center justify-center mb-3">
          <Text className="text-white text-display font-bold">
            {(user?.firstName?.[0] || profile?.name?.[0] || '?').toUpperCase()}
          </Text>
        </View>
        <Text className="text-ink text-heading font-bold">
          {user?.firstName} {user?.lastName}
        </Text>
        <Text className="text-muted text-body">
          {user?.primaryEmailAddress?.emailAddress || profile?.email}
        </Text>
        {profile?.companyName && (
          <Text className="text-muted text-caption mt-1">
            {profile.companyName}
          </Text>
        )}
      </View>

      {/* Subscription card */}
      <View className="px-6 mb-6">
        <View
          className={`rounded-2xl p-5 ${isPaid ? 'bg-accent' : 'bg-surface border border-border'}`}
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text
              className={`text-caption font-semibold ${isPaid ? 'text-white/80' : 'text-muted'}`}
            >
              SUBSCRIPTION
            </Text>
            <Ionicons
              name={isPaid ? 'checkmark-circle' : 'lock-closed'}
              size={20}
              color={isPaid ? '#FFFFFF' : '#71717A'}
            />
          </View>
          <Text
            className={`text-title font-bold mb-1 ${isPaid ? 'text-white' : 'text-ink'}`}
          >
            {isPaid ? 'Verso Pro' : 'Free Plan'}
          </Text>
          <Text
            className={`text-caption leading-5 ${isPaid ? 'text-white/80' : 'text-muted'}`}
          >
            {isPaid
              ? 'Unlimited AI coaching, weekly synthesis, and advanced insights.'
              : 'Upgrade for unlimited coaching, weekly synthesis, and advanced insights.'}
          </Text>
          {!isPaid && (
            <Pressable
              onPress={() =>
                Linking.openURL('https://optimism-engine.vercel.app/pricing')
              }
              className="mt-4 bg-ink rounded-xl py-3 items-center active:opacity-80"
            >
              <Text className="text-white text-body font-semibold">
                Upgrade to Pro
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Archetype section */}
      {diagnostic && (
        <View className="px-6 mb-6">
          <Text className="text-ink text-title font-semibold mb-3">
            Your Sales Wellbeing Map
          </Text>
          <View className="bg-surface border border-border rounded-2xl p-5">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-muted text-micro mb-1">PRIMARY</Text>
                <Text className="text-ink text-heading font-bold">
                  {diagnostic.primaryProfile}
                </Text>
              </View>
              {diagnostic.secondaryProfile && (
                <View className="items-end">
                  <Text className="text-muted text-micro mb-1">SECONDARY</Text>
                  <Text className="text-mutedLight text-title font-semibold">
                    {diagnostic.secondaryProfile}
                  </Text>
                </View>
              )}
            </View>

            {/* Score bars */}
            <View className="gap-3">
              {[
                { label: 'Driver', score: diagnostic.driverScore, color: '#EF4444' },
                { label: 'Strategist', score: diagnostic.strategistScore, color: '#3B82F6' },
                { label: 'Connector', score: diagnostic.connectorScore, color: '#22C55E' },
                { label: 'Reactor', score: diagnostic.reactorScore, color: '#F59E0B' },
              ].map((s) => (
                <View key={s.label}>
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-ink text-caption font-medium">
                      {s.label}
                    </Text>
                    <Text className="text-muted text-caption">{s.score}</Text>
                  </View>
                  <View className="h-2 bg-border rounded-full overflow-hidden">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${s.score}%`,
                        backgroundColor: s.color,
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>

            {/* Strengths & risks */}
            {diagnostic.strengths && diagnostic.strengths.length > 0 && (
              <View className="mt-5">
                <Text className="text-muted text-micro font-semibold mb-2">
                  STRENGTHS
                </Text>
                {diagnostic.strengths.map((s, i) => (
                  <View key={i} className="flex-row items-start gap-2 mb-1.5">
                    <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                    <Text className="text-ink text-caption flex-1 leading-5">{s}</Text>
                  </View>
                ))}
              </View>
            )}
            {diagnostic.wellbeingRisks && diagnostic.wellbeingRisks.length > 0 && (
              <View className="mt-4">
                <Text className="text-muted text-micro font-semibold mb-2">
                  WELLBEING RISKS
                </Text>
                {diagnostic.wellbeingRisks.map((s, i) => (
                  <View key={i} className="flex-row items-start gap-2 mb-1.5">
                    <Ionicons name="warning" size={16} color="#F59E0B" />
                    <Text className="text-ink text-caption flex-1 leading-5">{s}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      )}

      {/* Settings list */}
      <View className="px-6 mb-6">
        <Text className="text-ink text-title font-semibold mb-3">Settings</Text>
        <View className="bg-surface border border-border rounded-2xl overflow-hidden">
          <SettingRow
            icon="notifications-outline"
            label="Notifications"
            onPress={() => Alert.alert('Coming soon', 'Notification preferences will be available in the next update.')}
          />
          <Divider />
          <SettingRow
            icon="shield-checkmark-outline"
            label="Privacy"
            onPress={() => Linking.openURL('https://optimism-engine.vercel.app/privacy')}
          />
          <Divider />
          <SettingRow
            icon="document-text-outline"
            label="Terms of Service"
            onPress={() => Linking.openURL('https://optimism-engine.vercel.app/terms')}
          />
          <Divider />
          <SettingRow
            icon="help-circle-outline"
            label="Help & Support"
            onPress={() => Linking.openURL('mailto:support@verso.app')}
          />
        </View>
      </View>

      {/* Sign out */}
      <View className="px-6">
        <Pressable
          onPress={handleSignOut}
          className="bg-surface border border-border rounded-2xl py-4 items-center active:opacity-80"
        >
          <Text className="text-danger text-body font-semibold">Sign out</Text>
        </Pressable>
        <Text className="text-mutedLight text-micro text-center mt-4">
          Verso v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

function SettingRow({
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
      className="flex-row items-center justify-between px-5 py-4 active:bg-paper"
    >
      <View className="flex-row items-center gap-3">
        <Ionicons name={icon} size={20} color="#71717A" />
        <Text className="text-ink text-body">{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#A1A1AA" />
    </Pressable>
  );
}

function Divider() {
  return <View className="h-px bg-border ml-14" />;
}
