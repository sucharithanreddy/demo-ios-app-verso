// ============================================================================
// ChatInput — text input with send button
// ============================================================================

import {
  View,
  TextInput,
  Pressable,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';
import * as Haptics from 'expo-haptics';

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: Props) {
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);

  const canSend = text.trim().length > 0 && !disabled;

  const handleSend = () => {
    if (!canSend) return;
    const msg = text.trim();
    setText('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onSend(msg);
    // Keep keyboard open on iOS for fast back-and-forth
    inputRef.current?.focus();
  };

  return (
    <View className="flex-row items-end px-4 py-3 gap-2">
      <View className="flex-1 bg-paper border border-border rounded-2xl px-4 py-2.5">
        <TextInput
          ref={inputRef}
          value={text}
          onChangeText={setText}
          placeholder="Share what's on your mind..."
          placeholderTextColor="#A1A1AA"
          multiline
          maxLength={2000}
          editable={!disabled}
          style={{
            fontSize: 16,
            color: '#0A0A0B',
            maxHeight: 120,
            minHeight: 24,
            padding: 0,
          }}
          onSubmitEditing={() => {
            // Submit on Enter (without shift) — only on iOS single-line behavior
          }}
          blurOnSubmit={false}
        />
      </View>
      <Pressable
        onPress={handleSend}
        disabled={!canSend}
        className={`w-11 h-11 rounded-full items-center justify-center ${
          canSend ? 'bg-accent' : 'bg-border'
        }`}
        style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
      >
        <Ionicons
          name={disabled ? 'hourglass-outline' : 'arrow-up'}
          size={20}
          color="#FFFFFF"
        />
      </Pressable>
    </View>
  );
}
