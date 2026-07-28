// ============================================================================
// Sign-in screen - custom Clerk email + code (OTP) sign-in for mobile
// ============================================================================

import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useState, useCallback } from 'react';
import { useSignIn, useAuth } from '@clerk/clerk-expo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

type Stage = 'email' | 'code';

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();

  const [stage, setStage] = useState<Stage>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSubmit = useCallback(async () => {
    if (!isLoaded || !email.trim()) return;
    setLoading(true);
    setError(null);

    try {
      await signIn.create({
        identifier: email.trim(),
        strategy: 'email_code',
      });
      setStage('code');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ message: string }> };
      const message =
        clerkErr.errors?.[0]?.message ?? 'Could not send code. Check your email.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, email, signIn]);

  const handleCodeSubmit = useCallback(async () => {
    if (!isLoaded || !code.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'email_code',
        code: code.trim(),
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        router.replace('/(tabs)');
      } else {
        setError('Verification incomplete. Please try again.');
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ message: string }> };
      const message =
        clerkErr.errors?.[0]?.message ?? 'Invalid code. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, code, signIn, setActive, router]);

  const handleBack = () => {
    setStage('email');
    setCode('');
    setError(null);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: '#FAFAF7' }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 60,
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo / Header */}
        <View className="items-center mb-12">
          <View className="w-16 h-16 rounded-full bg-accent items-center justify-center mb-4">
            <Ionicons name="sparkles" size={28} color="#FFFFFF" />
          </View>
          <Text className="text-ink text-display font-bold tracking-tight">
            Verso
          </Text>
          <Text className="text-muted text-body mt-2 text-center">
            Your AI coach for the mental side of sales
          </Text>
        </View>

        {/* Form card */}
        <View className="bg-surface border border-border rounded-2xl p-6">
          {stage === 'email' ? (
            <>
              <Text className="text-ink text-title font-semibold mb-1">
                Welcome back
              </Text>
              <Text className="text-muted text-caption mb-5">
                Enter your email and we'll send you a verification code.
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@company.com"
                placeholderTextColor="#A1A1AA"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={{
                  borderWidth: 1,
                  borderColor: '#E4E4E7',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: '#0A0A0B',
                  backgroundColor: '#FAFAF7',
                  marginBottom: 16,
                }}
              />
              <Pressable
                onPress={handleEmailSubmit}
                disabled={loading || !email.trim()}
                className={`rounded-xl py-4 items-center ${
                  loading || !email.trim() ? 'bg-border' : 'bg-accent'
                }`}
              >
                <Text className="text-white text-body font-semibold">
                  {loading ? 'Sending...' : 'Send code'}
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-ink text-title font-semibold">
                  Enter code
                </Text>
                <Pressable onPress={handleBack} className="p-1">
                  <Ionicons name="arrow-back" size={20} color="#71717A" />
                </Pressable>
              </View>
              <Text className="text-muted text-caption mb-5">
                We sent a 6-digit code to {email.trim()}
              </Text>
              <TextInput
                value={code}
                onChangeText={setCode}
                placeholder="123456"
                placeholderTextColor="#A1A1AA"
                keyboardType="number-pad"
                maxLength={6}
                style={{
                  borderWidth: 1,
                  borderColor: '#E4E4E7',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 24,
                  fontWeight: '600',
                  color: '#0A0A0B',
                  backgroundColor: '#FAFAF7',
                  marginBottom: 16,
                  textAlign: 'center',
                  letterSpacing: 8,
                }}
              />
              <Pressable
                onPress={handleCodeSubmit}
                disabled={loading || code.trim().length < 6}
                className={`rounded-xl py-4 items-center ${
                  loading || code.trim().length < 6 ? 'bg-border' : 'bg-accent'
                }`}
              >
                <Text className="text-white text-body font-semibold">
                  {loading ? 'Verifying...' : 'Verify & sign in'}
                </Text>
              </Pressable>
            </>
          )}

          {error && (
            <View className="mt-4 bg-danger/10 rounded-xl px-4 py-3">
              <Text className="text-danger text-caption">{error}</Text>
            </View>
          )}
        </View>

        <Text className="text-mutedLight text-micro text-center mt-6 leading-5">
          By continuing, you agree to our Terms of Service and Privacy Policy.
          {'\n'}This app is not a substitute for professional mental health care.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
