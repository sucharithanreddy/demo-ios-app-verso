// ============================================================================
// IcebergDepthIndicator — visualizes how deep the conversation has gone.
//
// The engine returns `layerProgress` = { surface, trigger, emotion, coreBelief }
// each 0-100. We render 4 horizontal layers stacked vertically, like an
// iceberg seen from the side. The current "effective layer" glows; deeper
// layers fade in as the conversation progresses.
//
// This is the signature visual of the AI companion — it shows the user that
// the conversation is going somewhere, not just circling on the surface.
// ============================================================================

import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import type { LayerProgress } from '@/lib/types';

interface Props {
  layerProgress?: LayerProgress;
  effectiveLayer?: string; // 'surface' | 'transition' | 'emotion' | 'core_wound' (case-insensitive)
  progressScore?: number; // 0-100 overall
  groundingMode?: boolean;
  turnCount?: number;
  compact?: boolean; // smaller variant for inline use
}

interface LayerDef {
  key: keyof LayerProgress;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  description: string;
}

const LAYERS: LayerDef[] = [
  {
    key: 'surface',
    label: 'Surface',
    icon: 'water-outline',
    color: '#3B82F6', // blue
    description: "What's happening",
  },
  {
    key: 'trigger',
    label: 'Trigger',
    icon: 'flash-outline',
    color: '#F59E0B', // amber
    description: 'What set it off',
  },
  {
    key: 'emotion',
    label: 'Emotion',
    icon: 'heart-outline',
    color: '#EC4899', // pink
    description: 'What you feel',
  },
  {
    key: 'coreBelief',
    label: 'Core belief',
    icon: 'diamond-outline',
    color: '#FF5C28', // accent
    description: 'What you believe',
  },
];

function normalizeLayer(layer: string | undefined): string {
  return (layer ?? '').toLowerCase();
}

export function IcebergDepthIndicator({
  layerProgress,
  effectiveLayer,
  progressScore,
  groundingMode,
  turnCount,
  compact = false,
}: Props) {
  const activeLayer = normalizeLayer(effectiveLayer);

  if (compact) {
    return <CompactIndicator layerProgress={layerProgress} activeLayer={activeLayer} />;
  }

  return (
    <View className="bg-surface border border-border rounded-2xl px-4 py-3 mb-3">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-2.5">
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="analytics-outline" size={14} color="#71717A" />
          <Text className="text-micro font-semibold text-muted tracking-wider">
            CONVERSATION DEPTH
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          {groundingMode && (
            <View className="flex-row items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full">
              <Ionicons name="leaf-outline" size={10} color="#3B82F6" />
              <Text className="text-micro font-medium text-blue-600">Grounding</Text>
            </View>
          )}
          {typeof turnCount === 'number' && turnCount > 0 && (
            <Text className="text-micro text-muted">
              Turn {turnCount}
            </Text>
          )}
          {typeof progressScore === 'number' && (
            <Text className="text-micro font-semibold text-ink">
              {Math.round(progressScore)}%
            </Text>
          )}
        </View>
      </View>

      {/* Layer bars */}
      <View className="flex-col gap-1.5">
        {LAYERS.map((layer, idx) => {
          const value = layerProgress?.[layer.key] ?? 0;
          const isActive =
            activeLayer === layer.key ||
            (layer.key === 'surface' && (activeLayer === '' || activeLayer === 'surface')) ||
            (layer.key === 'trigger' && activeLayer === 'transition');
          return (
            <LayerRow
              key={layer.key}
              layer={layer}
              value={value}
              isActive={isActive}
              delay={idx * 80}
            />
          );
        })}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Full layer row with animated progress bar
// ---------------------------------------------------------------------------

function LayerRow({
  layer,
  value,
  isActive,
  delay,
}: {
  layer: LayerDef;
  value: number;
  isActive: boolean;
  delay: number;
}) {
  const barStyle = useAnimatedStyle(() => {
    const width = withDelay(
      delay,
      withTiming(Math.max(2, Math.min(100, value)), {
        duration: 600,
      })
    );
    return { width: `${width}%` };
  });

  const opacity = value > 5 ? 1 : 0.4;

  return (
    <View style={{ opacity }}>
      <View className="flex-row items-center justify-between mb-0.5">
        <View className="flex-row items-center gap-1.5">
          <Ionicons
            name={layer.icon}
            size={12}
            color={isActive ? layer.color : '#A1A1AA'}
          />
          <Text
            style={{
              fontSize: 11,
              fontWeight: isActive ? '600' : '500',
              color: isActive ? layer.color : '#71717A',
            }}
          >
            {layer.label}
          </Text>
        </View>
        <Text className="text-micro text-muted">
          {layer.description}
        </Text>
      </View>
      <View className="h-1.5 bg-paper rounded-full overflow-hidden">
        <Animated.View
          style={[
            {
              height: '100%',
              borderRadius: 999,
              backgroundColor: layer.color,
            },
            barStyle,
          ]}
        />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Compact variant — 4 dots, the active one glows. Used inline in the chat
// header to give a constant sense of progress without taking vertical space.
// ---------------------------------------------------------------------------

function CompactIndicator({
  layerProgress,
  activeLayer,
}: {
  layerProgress?: LayerProgress;
  activeLayer: string;
}) {
  return (
    <View className="flex-row items-center gap-1.5">
      {LAYERS.map((layer) => {
        const value = layerProgress?.[layer.key] ?? 0;
        const isActive =
          activeLayer === layer.key ||
          (layer.key === 'surface' && (activeLayer === '' || activeLayer === 'surface')) ||
          (layer.key === 'trigger' && activeLayer === 'transition');
        const filled = value > 5;
        return (
          <View
            key={layer.key}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: isActive
                ? layer.color
                : filled
                  ? layer.color + '40' // 25% opacity
                  : '#E4E4E7',
            }}
          />
        );
      })}
    </View>
  );
}
