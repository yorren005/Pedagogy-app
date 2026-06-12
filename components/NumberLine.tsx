'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface Hop {
  from: number;
  to: number;
}

interface NumberLineProps {
  min: number;
  max: number;
  highlightFrom?: number;
  highlightTo?: number;
  hops?: Hop[];
  accentColor?: string;
}

/* ─── Helpers ───────────────────────────────────────────────────────────── */

/** Map a value on [min,max] → x pixel position inside the line area */
function valToX(value: number, min: number, max: number, leftPad: number, lineWidth: number) {
  if (max === min) return leftPad;
  return leftPad + ((value - min) / (max - min)) * lineWidth;
}

/** Build an SVG arc path for a hop from x1 → x2 above the number line */
function hopArcPath(x1: number, x2: number, baseY: number): string {
  const dx = x2 - x1;
  const peakHeight = Math.min(Math.abs(dx) * 0.55, 60); // arc height
  const cpX = (x1 + x2) / 2;
  const cpY = baseY - peakHeight;
  return `M ${x1} ${baseY} Q ${cpX} ${cpY} ${x2} ${baseY}`;
}

/* ─── Component ─────────────────────────────────────────────────────────── */

/**
 * An interactive number-line for addition / subtraction visualisation.
 *
 * Features:
 * - Tick marks at every integer from `min` to `max`
 * - Optional highlighted segment (coloured bar)
 * - Animated hop arcs with a 🐸 that hops along
 * - Responsive (fills container width)
 */
export function NumberLine({
  min,
  max,
  highlightFrom,
  highlightTo,
  hops = [],
  accentColor = '#8b5cf6',
}: NumberLineProps) {
  /* Layout constants */
  const PADDING_LEFT = 28;
  const PADDING_RIGHT = 28;
  const SVG_HEIGHT = 140;
  const TICK_Y = 90; // baseline of the number line
  const TICK_HEIGHT = 14;
  const LABEL_Y = TICK_Y + 24;

  const tickCount = max - min + 1;

  /* Derive all tick positions once */
  const ticks = useMemo(() => {
    const arr: { value: number; label: string }[] = [];
    for (let i = min; i <= max; i++) {
      arr.push({ value: i, label: String(i) });
    }
    return arr;
  }, [min, max]);

  /* We render inside a viewBox so the SVG scales with the container. */
  const viewBoxWidth = Math.max(tickCount * 48, 320);
  const lineWidth = viewBoxWidth - PADDING_LEFT - PADDING_RIGHT;

  const x = (v: number) => valToX(v, min, max, PADDING_LEFT, lineWidth);

  /* Glow filter id (unique per accent) */
  const glowId = 'numline-glow';

  return (
    <div className="w-full overflow-x-auto rounded-2xl" style={{ background: 'rgba(0,0,0,0.25)' }}>
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${SVG_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full"
        style={{ minWidth: 280 }}
      >
        {/* ── Defs (glow filter) ─────────────────────────────────── */}
        <defs>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Main horizontal line ───────────────────────────────── */}
        <line
          x1={PADDING_LEFT}
          y1={TICK_Y}
          x2={viewBoxWidth - PADDING_RIGHT}
          y2={TICK_Y}
          stroke="rgba(255,255,255,0.35)"
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* ── Highlighted segment ────────────────────────────────── */}
        {highlightFrom !== undefined && highlightTo !== undefined && (
          <motion.line
            x1={x(highlightFrom)}
            y1={TICK_Y}
            x2={x(highlightTo)}
            y2={TICK_Y}
            stroke={accentColor}
            strokeWidth={6}
            strokeLinecap="round"
            filter={`url(#${glowId})`}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
          />
        )}

        {/* ── Tick marks & labels ────────────────────────────────── */}
        {ticks.map(({ value, label }) => {
          const tx = x(value);
          const isHighlighted =
            highlightFrom !== undefined &&
            highlightTo !== undefined &&
            value >= Math.min(highlightFrom, highlightTo) &&
            value <= Math.max(highlightFrom, highlightTo);

          return (
            <g key={value}>
              {/* tick mark */}
              <line
                x1={tx}
                y1={TICK_Y - TICK_HEIGHT / 2}
                x2={tx}
                y2={TICK_Y + TICK_HEIGHT / 2}
                stroke={isHighlighted ? accentColor : 'rgba(255,255,255,0.5)'}
                strokeWidth={isHighlighted ? 3 : 2}
                strokeLinecap="round"
              />
              {/* label */}
              <text
                x={tx}
                y={LABEL_Y}
                textAnchor="middle"
                fill={isHighlighted ? '#ffffff' : 'rgba(255,255,255,0.6)'}
                fontSize={isHighlighted ? 14 : 12}
                fontWeight={isHighlighted ? 700 : 500}
                fontFamily="var(--font-display), system-ui, sans-serif"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* ── Hop arcs ───────────────────────────────────────────── */}
        {hops.map((hop, i) => {
          const x1 = x(hop.from);
          const x2 = x(hop.to);
          const d = hopArcPath(x1, x2, TICK_Y);

          return (
            <g key={`hop-${i}`}>
              {/* Arc stroke (animated draw) */}
              <motion.path
                d={d}
                fill="none"
                stroke={accentColor}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeDasharray="6 4"
                filter={`url(#${glowId})`}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{
                  pathLength: { duration: 0.5, delay: 0.4 + i * 0.45, ease: 'easeInOut' },
                  opacity: { duration: 0.2, delay: 0.4 + i * 0.45 },
                }}
              />

              {/* Arrowhead dot at landing */}
              <motion.circle
                cx={x2}
                cy={TICK_Y}
                r={4}
                fill={accentColor}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.9 + i * 0.45, type: 'spring', stiffness: 500 }}
              />

              {/* 🐸 character that hops along the arc */}
              <motion.text
                fontSize={22}
                textAnchor="middle"
                dominantBaseline="auto"
                initial={{ x: x1, y: TICK_Y, opacity: 0, scale: 0 }}
                animate={{
                  x: [x1, (x1 + x2) / 2, x2],
                  y: [
                    TICK_Y,
                    TICK_Y - Math.min(Math.abs(x2 - x1) * 0.55, 60),
                    TICK_Y,
                  ],
                  opacity: [0, 1, 1],
                  scale: [0.4, 1.2, 1],
                }}
                transition={{
                  duration: 0.55,
                  delay: 0.4 + i * 0.45,
                  ease: 'easeInOut',
                }}
              >
                🐸
              </motion.text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
