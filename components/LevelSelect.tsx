'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAudio } from '@/lib/useAudio';
import { GameDef, AgeRange } from '@/lib/gameConfig';
import { useMemo } from 'react';

interface LevelSelectProps {
  game: GameDef;
  ageRange: AgeRange;
  unlockedLevel: number;
  gameStars: number[];
  maxLevels: number;
}

interface Point {
  x: number;
  y: number;
  level: number;
  isLocked: boolean;
  stars: number;
}

function StarRating({ count }: { count: number }) {
  return (
    <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-0.5 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm z-10 pointer-events-none">
      {[1, 2, 3].map((s) => (
        <span
          key={s}
          className={`text-[10px] leading-none ${s <= count ? 'text-yellow-400' : 'text-white/20'}`}
        >
          ⭐
        </span>
      ))}
    </div>
  );
}

export default function LevelSelect({
  game,
  ageRange,
  unlockedLevel,
  gameStars,
  maxLevels,
}: LevelSelectProps) {
  const { playSound } = useAudio();

  const stepHeight = 130;
  const svgWidth = 400;
  const svgHeight = maxLevels * stepHeight;

  // Generate the coordinates along a wavy path
  const points: Point[] = useMemo(() => {
    const pts: Point[] = [];
    for (let i = 0; i < maxLevels; i++) {
      const level = i + 1;
      // Wavy sine path: horizontal sway back and forth
      const x = svgWidth / 2 + 110 * Math.sin(i * 1.3);
      const y = svgHeight - (i * stepHeight) - stepHeight / 2;
      pts.push({
        x,
        y,
        level,
        isLocked: level > unlockedLevel,
        stars: gameStars[i] || 0,
      });
    }
    return pts;
  }, [maxLevels, unlockedLevel, gameStars, svgHeight]);

  // Construct SVG Bezier path for the entire trail
  const fullPathD = useMemo(() => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cp1x = p0.x;
      const cp1y = (p0.y + p1.y) / 2;
      const cp2x = p1.x;
      const cp2y = (p0.y + p1.y) / 2;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [points]);

  // Construct SVG Bezier path for progress (up to current active level)
  const progressPathD = useMemo(() => {
    if (points.length === 0) return '';
    // Draw only up to unlockedLevel index
    const activeIndex = Math.min(unlockedLevel - 1, points.length - 1);
    if (activeIndex === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < activeIndex; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cp1x = p0.x;
      const cp1y = (p0.y + p1.y) / 2;
      const cp2x = p1.x;
      const cp2y = (p0.y + p1.y) / 2;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [points, unlockedLevel]);

  return (
    <div className="relative w-full max-w-[400px] mx-auto select-none" style={{ height: svgHeight }}>
      {/* SVG Path Background and Progress */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        fill="none"
      >
        {/* Full grey path road */}
        {fullPathD && (
          <path
            d={fullPathD}
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Progress path road (colored & glowing) */}
        {progressPathD && (
          <motion.path
            d={progressPathD}
            stroke={game.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{
              filter: `drop-shadow(0 0 6px ${game.color}80)`,
            }}
          />
        )}
      </svg>

      {/* Level Nodes */}
      {points.map((p) => {
        const isActive = p.level === unlockedLevel;

        return (
          <div
            key={p.level}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
            style={{ left: p.x, top: p.y }}
          >
            {p.stars > 0 && <StarRating count={p.stars} />}

            {p.isLocked ? (
              <div className="w-16 h-16 rounded-full flex flex-col items-center justify-center bg-slate-800/80 border-2 border-slate-700/60 shadow-lg text-slate-500 cursor-not-allowed">
                <span className="text-xl">🔒</span>
                <span className="text-[10px] font-bold text-slate-600 leading-none mt-0.5">
                  {p.level}
                </span>
              </div>
            ) : (
              <Link href={`/${ageRange}/${game.slug}/${p.level}`}>
                <motion.button
                  onMouseEnter={() => playSound('click')}
                  className={`w-16 h-16 rounded-full flex flex-col items-center justify-center font-display text-2xl font-extrabold text-white cursor-pointer relative shadow-xl focus:outline-none`}
                  style={{
                    background: isActive
                      ? `linear-gradient(135deg, ${game.color}, ${game.color}cc)`
                      : `linear-gradient(135deg, ${game.color}dd, ${game.color}aa)`,
                    boxShadow: isActive
                      ? `0 0 25px ${game.color}, inset 0 2px 4px rgba(255,255,255,0.4)`
                      : `0 4px 12px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.2)`,
                    border: isActive ? `3px solid white` : `2px solid rgba(255,255,255,0.4)`,
                  }}
                  whileHover={{
                    scale: 1.15,
                    boxShadow: `0 0 30px ${game.color}, inset 0 2px 6px rgba(255,255,255,0.5)`,
                  }}
                  whileTap={{ scale: 0.95 }}
                  animate={
                    isActive
                      ? {
                          scale: [1, 1.06, 1],
                          boxShadow: [
                            `0 0 20px ${game.color}80`,
                            `0 0 35px ${game.color}`,
                            `0 0 20px ${game.color}80`,
                          ],
                        }
                      : {}
                  }
                  transition={
                    isActive
                      ? {
                          repeat: Infinity,
                          duration: 2,
                          ease: 'easeInOut',
                        }
                      : {}
                  }
                >
                  <span className="drop-shadow-md leading-none">{p.level}</span>
                </motion.button>
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
