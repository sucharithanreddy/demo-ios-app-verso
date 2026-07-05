// ============================================================================
// Tab navigation — Home, Coach, Insights, Profile
// ============================================================================

import { Tabs, Redirect } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChatStore } from '@/lib/store';
import { useEffect } from 'react';
import { loadMessages } from '@/lib/db';

export default function TabLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const insets = useSafeAreaInsets();
  const hydrateFromDb = useChatStore((s) => s.hydrateFromDb);

  // Hydrate chat messages from SQLite on mount
  useEffect(() => {
    if (isSignedIn) {
      loadMessages()
        .then((messages) => {
          if (messages.length > 0) {
            hydrateFromDb(messages);
          }
        })
        .catch((err) => console.warn('Failed to load messages from DB:', err));
    }
  }, [isSignedIn, hydrateFromDb]);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAF7' }}>
        <ActivityIndicator size="large" color="#FF5C28" />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF5C28',
        tabBarInactiveTintColor: '#71717A',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E4E4E7',
          borderTopWidth: 1,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: 'Coach',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
