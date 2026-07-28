// ============================================================================
// Clerk token cache - uses expo-secure-store (Keychain on iOS, Keystore on Android)
// ============================================================================

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// On web, SecureStore isn't available - fall back to localStorage
const webStorage = {
  async getToken(key: string): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, token: string): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, token);
    } catch {
      // ignore
    }
  },
};

const nativeStorage = {
  async getToken(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, token);
    } catch {
      // ignore - non-fatal
    }
  },
};

export const tokenCache = Platform.OS === 'web' ? webStorage : nativeStorage;

export const CLERK_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';
