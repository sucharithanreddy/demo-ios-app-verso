'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * CircularGauge
 *
 * Animated SVG ring used throughout the Wellbeing Dashboard.
 *
 * - `value` is clamped to 0..100
 * - `size` controls the overall diameter (px)
 * - `stroke` controls the ring thickness (px)
 * - `color` is a CSS color (hex / rgb / oklch) used for the arc + label
 * - `trackColor` is the background ring (defaults to a neutral)
 * - `label` is rendered centred above the value
 * - `sublabel` is rendered centred below the value
 * - `delay` controls the entrance animation stagger (seconds)
 *
 * The arc animates from 0 to its target using Framer Motion's
 * `strokeDashoffset` tween. The numeric value also counts up.
 */
export interface CircularGaugeProps {
  value: number;
  size?: number;
  stroke?: number;
  color: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
  delay?: number;
  showValue?: boolean;
  valueSuffix?: string;
  icon?: React.ReactNode;
  glow?: boolean;
}

export function CircularGauge({
  value,
  size = 120,
  stroke = 10,
  color,
  trackColor = 'rgba(120, 120, 140, 0.15)',
  label,
  sublabel,
  delay = 0,
  showValue = true,
  valueSuffix = '',
  icon,
  glow = false,
}: CircularGaugeProps) {
  const safe = Math.max(0, Math.min(100, Number(value) || 0));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  // 270° arc starting at 135° (bottom-left) — looks like a speedometer
  // but a full ring is more flexible. Use full ring for now.
  const offset = circumference - (safe / 100) * circumference;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={cn('-rotate-90', glow && 'drop-shadow-[0_0_12px_currentColor]')}
        style={{ color }}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        {/* Animated arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{
            duration: 1.1,
            delay,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
      </svg>

      {/* Centre label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
        {icon && <div className="mb-0.5">{icon}</div>}
        {showValue && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.3, duration: 0.4 }}
            className="font-bold leading-none"
            style={{ color, fontSize: size * 0.22 }}
          >
            {Math.round(safe)}
            <span className="text-muted-foreground" style={{ fontSize: size * 0.1 }}>
              {valueSuffix}
            </span>
          </motion.div>
        )}
        {label && (
          <div
            className="font-medium text-foreground mt-0.5 leading-tight"
            style={{ fontSize: size * 0.09 }}
          >
            {label}
          </div>
        )}
        {sublabel && (
          <div
            className="text-muted-foreground leading-tight"
            style={{ fontSize: size * 0.07 }}
          >
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
}
