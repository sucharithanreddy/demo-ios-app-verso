// ============================================================================
// CheckInModal - daily check-in flow (mood, energy, confidence, impact tags)
// ============================================================================

import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { useCreateCheckIn } from '@/lib/hooks';
import { IMPACT_TAGS } from '@/lib/types';
import { savePendingCheckIn } from '@/lib/db';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function CheckInModal({ visible, onClose }: Props) {
  const [mood, setMood] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const createCheckIn = useCreateCheckIn();

  const canSubmit = mood > 0 && energy > 0 && confidence > 0 && !submitting;

  const reset = () => {
    setMood(0);
    setEnergy(0);
    setConfidence(0);
    setSelectedTags([]);
    setNotes('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const toggleTag = (tagId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((t) => t !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    const checkInId = `checkin_${Date.now()}`;
    const input = {
      mood,
      energy,
      confidence,
      impactTags: selectedTags,
      notes: notes.trim() || undefined,
    };

    try {
      const result = await createCheckIn.mutateAsync(input);

      Alert.alert(
        'Check-in saved',
        result.patternInsight || "Your AI coach now has today's context.",
        [{ text: 'Done', onPress: handleClose }]
      );
    } catch (err) {
      // Offline - save to pending queue
      await savePendingCheckIn({
        id: checkInId,
        ...input,
      }).catch(() => {});

      Alert.alert(
        'Saved offline',
        "Your check-in was saved. It will sync when you're back online.",
        [{ text: 'OK', onPress: handleClose }]
      );
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, mood, energy, confidence, selectedTags, notes, createCheckIn]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View className="flex-1 bg-paper">
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-border">
            <Pressable onPress={handleClose} className="p-1">
              <Ionicons name="close" size={24} color="#71717A" />
            </Pressable>
            <Text className="text-ink text-title font-semibold">
              Daily Check-in
            </Text>
            <View className="w-8" />
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text className="text-muted text-body mb-6 leading-6">
              Take 30 seconds. Your coach uses this to understand where you are today.
            </Text>

            {/* Mood */}
            <RatingRow
              label="How was today?"
              icon="happy-outline"
              value={mood}
              onChange={setMood}
            />

            {/* Energy */}
            <RatingRow
              label="Energy level"
              icon="flash-outline"
              value={energy}
              onChange={setEnergy}
            />

            {/* Confidence */}
            <RatingRow
              label="Confidence"
              icon="shield-outline"
              value={confidence}
              onChange={setConfidence}
            />

            {/* Impact tags */}
            <View className="mt-6 mb-6">
              <Text className="text-ink text-body font-semibold mb-3">
                What affected you today?
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {IMPACT_TAGS.map((tag) => {
                  const selected = selectedTags.includes(tag.id);
                  return (
                    <Pressable
                      key={tag.id}
                      onPress={() => toggleTag(tag.id)}
                      className={`flex-row items-center gap-1.5 px-3 py-2 rounded-full border ${
                        selected
                          ? 'border-accent bg-accent/10'
                          : 'border-border bg-surface'
                      }`}
                    >
                      <Ionicons
                        name={tag.icon as keyof typeof Ionicons.glyphMap}
                        size={14}
                        color={selected ? '#FF5C28' : '#71717A'}
                      />
                      <Text
                        className={`text-caption font-medium ${
                          selected ? 'text-accent' : 'text-ink'
                        }`}
                      >
                        {tag.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Notes */}
            <View className="mb-6">
              <Text className="text-ink text-body font-semibold mb-2">
                Anything else? <Text className="text-muted">(optional)</Text>
              </Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="What's on your mind?"
                placeholderTextColor="#A1A1AA"
                multiline
                maxLength={500}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1,
                  borderColor: '#E4E4E7',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: '#0A0A0B',
                  minHeight: 56,
                  maxHeight: 120,
                  textAlignVertical: 'top',
                }}
              />
            </View>

            {/* Submit */}
            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit}
              className={`rounded-xl py-4 items-center ${
                canSubmit ? 'bg-accent' : 'bg-border'
              }`}
            >
              <Text className="text-white text-body font-semibold">
                {submitting ? 'Saving...' : 'Save check-in'}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Rating row - 5 dots
// ---------------------------------------------------------------------------

function RatingRow({
  label,
  icon,
  value,
  onChange,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View className="mb-5">
      <View className="flex-row items-center gap-2 mb-3">
        <Ionicons name={icon} size={18} color="#71717A" />
        <Text className="text-ink text-body font-semibold">{label}</Text>
      </View>
      <View className="flex-row gap-2">
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = n <= value;
          const color =
            value >= 4 ? '#22C55E' : value >= 3 ? '#F59E0B' : value > 0 ? '#EF4444' : '#E4E4E7';
          return (
            <Pressable
              key={n}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                onChange(n);
              }}
              className="flex-1 items-center"
            >
              <View
                className="w-full h-10 rounded-lg items-center justify-center"
                style={{
                  backgroundColor: filled ? color : '#FFFFFF',
                  borderWidth: 1,
                  borderColor: filled ? color : '#E4E4E7',
                }}
              >
                <Text
                  className="text-caption font-bold"
                  style={{ color: filled ? '#FFFFFF' : '#71717A' }}
                >
                  {n}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
