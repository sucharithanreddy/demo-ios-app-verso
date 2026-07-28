// ============================================================================
// TypingIndicator - three pulsing dots shown while AI is thinking
// ============================================================================

import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withDelay,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';

export function TypingIndicator() {
  return (
    <View className="flex-row items-center gap-1.5 bg-surface border border-border rounded-2xl rounded-bl-md px-4 py-3 w-16">
      <Dot delay={0} />
      <Dot delay={200} />
      <Dot delay={400} />
    </View>
  );
}

function Dot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withDelay(
          delay,
          withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) })
        ),
        withTiming(0.3, { duration: 400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [opacity, delay]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: 7,
          height: 7,
          borderRadius: 4,
          backgroundColor: '#71717A',
        },
        style,
      ]}
    />
  );
}
