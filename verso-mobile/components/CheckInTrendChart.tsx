// ============================================================================
// CheckInTrendChart - SVG line chart (mood, energy, confidence)
// ============================================================================

import { View, Text } from 'react-native';
import { useMemo } from 'react';
import Svg, { Path, Circle, Line, Text as SvgText, G } from 'react-native-svg';
import type { SalesCheckIn } from '@/lib/types';

interface Props {
  checkIns: SalesCheckIn[]; // Most recent first
}

const CHART_HEIGHT = 180;
const CHART_PADDING = 30;

export function CheckInTrendChart({ checkIns }: Props) {
  // Reverse so oldest is first
  const data = useMemo(() => [...checkIns].reverse(), [checkIns]);

  const width = Math.max(data.length * 50, 300);
  const chartWidth = width - CHART_PADDING * 2;
  const chartHeight = CHART_HEIGHT - CHART_PADDING - 20;

  if (data.length < 2) return null;

  const pointSpacing = chartWidth / (data.length - 1);

  const getPoints = (key: 'mood' | 'energy' | 'confidence') => {
    return data.map((c, i) => {
      const x = CHART_PADDING + i * pointSpacing;
      // 1-5 scale → y position (5 at top, 1 at bottom)
      const y = CHART_PADDING + chartHeight - ((c[key] - 1) / 4) * chartHeight;
      return { x, y, value: c[key] };
    });
  };

  const moodPoints = getPoints('mood');
  const energyPoints = getPoints('energy');
  const confidencePoints = getPoints('confidence');

  const toPath = (points: Array<{ x: number; y: number }>) => {
    if (points.length === 0) return '';
    return points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');
  };

  return (
    <View className="bg-surface border border-border rounded-2xl p-4">
      {/* Legend */}
      <View className="flex-row gap-4 mb-3">
        <LegendItem color="#22C55E" label="Mood" />
        <LegendItem color="#F59E0B" label="Energy" />
        <LegendItem color="#3B82F6" label="Confidence" />
      </View>

      {/* Chart */}
      <View style={{ height: CHART_HEIGHT }}>
        <Svg width={width} height={CHART_HEIGHT} viewBox={`0 0 ${width} ${CHART_HEIGHT}`}>
          {/* Grid lines (1-5) */}
          {[1, 2, 3, 4, 5].map((n) => {
            const y = CHART_PADDING + chartHeight - ((n - 1) / 4) * chartHeight;
            return (
              <G key={`grid-${n}`}>
                <Line
                  x1={CHART_PADDING}
                  y1={y}
                  x2={width - CHART_PADDING}
                  y2={y}
                  stroke="#E4E4E7"
                  strokeWidth="1"
                  strokeDasharray="2 3"
                />
                <SvgText
                  x={CHART_PADDING - 8}
                  y={y + 3}
                  fontSize="10"
                  fill="#A1A1AA"
                  textAnchor="end"
                >
                  {n}
                </SvgText>
              </G>
            );
          })}

          {/* Lines */}
          <Path
            d={toPath(moodPoints)}
            fill="none"
            stroke="#22C55E"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <Path
            d={toPath(energyPoints)}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <Path
            d={toPath(confidencePoints)}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Dots */}
          {moodPoints.map((p, i) => (
            <Circle key={`m-${i}`} cx={p.x} cy={p.y} r="3" fill="#22C55E" />
          ))}
          {energyPoints.map((p, i) => (
            <Circle key={`e-${i}`} cx={p.x} cy={p.y} r="3" fill="#F59E0B" />
          ))}
          {confidencePoints.map((p, i) => (
            <Circle key={`c-${i}`} cx={p.x} cy={p.y} r="3" fill="#3B82F6" />
          ))}

          {/* X-axis labels */}
          {data.map((c, i) => {
            const x = CHART_PADDING + i * pointSpacing;
            const d = new Date(c.date);
            const label = `${d.getMonth() + 1}/${d.getDate()}`;
            return (
              <SvgText
                key={`x-${i}`}
                x={x}
                y={CHART_HEIGHT - 4}
                fontSize="9"
                fill="#A1A1AA"
                textAnchor="middle"
              >
                {label}
              </SvgText>
            );
          })}
        </Svg>
      </View>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View
        style={{
          width: 10,
          height: 3,
          borderRadius: 2,
          backgroundColor: color,
        }}
      />
      <Text className="text-muted text-caption">{label}</Text>
    </View>
  );
}
