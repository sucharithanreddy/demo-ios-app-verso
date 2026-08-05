'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * RadarChart
 *
 * A small SVG radar (a.k.a. spider) chart for the 4-axis
 * "Response to Pressure" and "Decision Style" visualisations.
 *
 * - `axes` is an array of { label, value (0..100), color }
 * - `size` controls the overall dimension (px)
 *
 * Draws concentric grid rings at 25/50/75/100, axis spokes,
 * and a filled polygon animated from the centre outward.
 */
export interface RadarAxis {
  label: string;
  value: number;
  color: string;
  description?: string;
}

export interface RadarChartProps {
  axes: RadarAxis[];
  size?: number;
  delay?: number;
}

export function RadarChart({ axes, size = 260, delay = 0 }: RadarChartProps) {
  const centre = size / 2;
  const radius = size * 0.36;
  const n = axes.length;
  // Angle for each axis, starting at top (-90°) and going clockwise
  const angleFor = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;

  const pointFor = (i: number, value: number) => {
    const v = Math.max(0, Math.min(100, value)) / 100;
    const a = angleFor(i);
    return {
      x: centre + radius * v * Math.cos(a),
      y: centre + radius * v * Math.sin(a),
    };
  };

  // Polygon points for the data shape
  const dataPoints = axes.map((axis, i) => pointFor(i, axis.value));
  const polygonPoints = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  // Concentric grid rings (25/50/75/100)
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="inline-flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid rings */}
        {gridLevels.map((level, idx) => {
          const points = axes
            .map((_, i) => {
              const a = angleFor(i);
              return `${centre + radius * level * Math.cos(a)},${centre + radius * level * Math.sin(a)}`;
            })
            .join(' ');
          return (
            <polygon
              key={idx}
              points={points}
              fill="none"
              stroke="rgba(120, 120, 140, 0.18)"
              strokeWidth={1}
            />
          );
        })}

        {/* Axis spokes + labels */}
        {axes.map((axis, i) => {
          const a = angleFor(i);
          const outerX = centre + radius * Math.cos(a);
          const outerY = centre + radius * Math.sin(a);
          const labelX = centre + (radius + 18) * Math.cos(a);
          const labelY = centre + (radius + 18) * Math.sin(a);
          return (
            <g key={i}>
              <line
                x1={centre}
                y1={centre}
                x2={outerX}
                y2={outerY}
                stroke="rgba(120, 120, 140, 0.18)"
                strokeWidth={1}
              />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-muted-foreground"
                style={{ fontSize: 10, fontWeight: 500 }}
              >
                {axis.label}
              </text>
              {/* Value chip on the axis */}
              <text
                x={labelX}
                y={labelY + 12}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: 9, fill: axis.color, fontWeight: 600 }}
              >
                {Math.round(axis.value)}
              </text>
            </g>
          );
        })}

        {/* Animated data polygon */}
        <motion.polygon
          points={polygonPoints}
          fill="rgba(99, 102, 241, 0.18)"
          stroke="rgb(99, 102, 241)"
          strokeWidth={2}
          strokeLinejoin="round"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: `${centre}px ${centre}px` }}
        />

        {/* Data point dots */}
        {dataPoints.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={4}
            fill={axes[i].color}
            stroke="white"
            strokeWidth={1.5}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.5 + i * 0.08, duration: 0.3 }}
          />
        ))}
      </svg>
    </div>
  );
}
