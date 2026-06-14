'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAudio } from '@/lib/useAudio';
import { GameDef, AgeRange } from '@/lib/gameConfig';
import { useMemo, useEffect, useRef } from 'react';
import { ZONE_NAMES } from '@/lib/zoneNames';

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
  zoneName: string;
}

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5 bg-black/60 px-1.5 py-0.5 rounded-full border border-white/10 backdrop-blur-md pointer-events-none mt-1 shadow-inner">
      {[1, 2, 3].map((s) => (
        <span
          key={s}
          className={`text-[9px] leading-none ${s <= count ? 'text-yellow-400 drop-shadow-[0_0_2px_rgba(250,204,21,0.6)]' : 'text-white/10'}`}
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
  const activeNodeRef = useRef<HTMLDivElement>(null);

  const stepHeight = 160; // Increased to give space for zone labels
  const svgWidth = 400;
  const svgHeight = maxLevels * stepHeight;

  // Define terrain themes based on ageRange
  const terrain = useMemo(() => {
    switch (ageRange) {
      case 'elementary':
        return {
          bg: 'from-emerald-950 via-green-900 to-emerald-950',
          pathColor: '#fbbf24',
          trailDash: '8,8',
          glowColor: 'rgba(251, 191, 36, 0.4)',
          decorations: ['🌳', '🌸', '🍄', '🍀', '🦋', '🌲'],
          particleColor: 'bg-green-400/20',
          borderStyle: 'border-emerald-500/50',
        };
      case 'middle-school-lower':
        return {
          bg: 'from-amber-950 via-yellow-900 to-stone-900',
          pathColor: '#14b8a6',
          trailDash: '10,5',
          glowColor: 'rgba(20, 184, 166, 0.4)',
          decorations: ['🌵', '🏜️', '🐫', '☀️', '🧗', '⛺'],
          particleColor: 'bg-yellow-500/20',
          borderStyle: 'border-amber-500/50',
        };
      case 'middle-school-upper':
        return {
          bg: 'from-sky-950 via-blue-900 to-indigo-950',
          pathColor: '#a855f7',
          trailDash: '12,6',
          glowColor: 'rgba(168, 85, 247, 0.4)',
          decorations: ['🏝️', '⛵', '🐠', '🐳', '🐬', '🐙'],
          particleColor: 'bg-sky-400/25',
          borderStyle: 'border-sky-500/50',
        };
      case 'high-school':
        return {
          bg: 'from-slate-950 via-purple-950 to-zinc-900',
          pathColor: '#06b6d4',
          trailDash: '6,6',
          glowColor: 'rgba(6, 182, 212, 0.4)',
          decorations: ['🏔️', '🌲', '🦅', '❄️', '🏔️', '🐺'],
          particleColor: 'bg-cyan-400/20',
          borderStyle: 'border-purple-500/50',
        };
      case 'university':
      default:
        return {
          bg: 'from-neutral-950 via-slate-900 to-purple-950',
          pathColor: '#14b8a6',
          trailDash: '15,5',
          glowColor: 'rgba(20, 184, 166, 0.4)',
          decorations: ['🪐', '✨', '🛸', '🛰️', '☄️', '🌌'],
          particleColor: 'bg-indigo-400/30',
          borderStyle: 'border-indigo-500/50',
        };
    }
  }, [ageRange]);

  // Generate the coordinates along a wavy path and fetch zone names
  const points: Point[] = useMemo(() => {
    const pts: Point[] = [];
    const gameZoneNames = ZONE_NAMES[game.key] || [];

    for (let i = 0; i < maxLevels; i++) {
      const level = i + 1;
      // Wavy sine path
      const x = svgWidth / 2 + 100 * Math.sin(i * 1.4);
      const y = svgHeight - (i * stepHeight) - stepHeight / 2;
      const zoneName = gameZoneNames[i] || `Zone ${level}`;

      pts.push({
        x,
        y,
        level,
        isLocked: level > unlockedLevel,
        stars: gameStars[i] || 0,
        zoneName,
      });
    }
    return pts;
  }, [maxLevels, unlockedLevel, gameStars, svgHeight, game.key]);

  // Auto-scroll to current active level node
  useEffect(() => {
    if (activeNodeRef.current) {
      activeNodeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [unlockedLevel]);

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

  // Random positions for terrain decorations
  const decorCoords = useMemo(() => {
    const coords = [];
    for (let i = 0; i < maxLevels * 2.5; i++) {
      const x = Math.random() * (svgWidth - 60) + 30;
      const y = Math.random() * (svgHeight - 100) + 50;
      // Filter out decorations overlapping with nodes
      const overlaps = points.some(p => {
        const dx = p.x - x;
        const dy = p.y - y;
        return Math.sqrt(dx * dx + dy * dy) < 70;
      });
      if (!overlaps) {
        coords.push({
          x,
          y,
          emoji: terrain.decorations[i % terrain.decorations.length],
          scale: 0.8 + Math.random() * 0.5,
          opacity: 0.15 + Math.random() * 0.15,
        });
      }
    }
    return coords;
  }, [maxLevels, points, terrain.decorations, svgHeight]);

  return (
    <div 
      className={`relative w-full max-w-[480px] mx-auto select-none rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-gradient-to-b ${terrain.bg}`}
      style={{ height: svgHeight }}
    >
      {/* Visual Ambient Grid & Particles */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] opacity-40 pointer-events-none" />

      {/* Terrain-specific ambient graphics */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {decorCoords.map((d, index) => (
          <motion.div
            key={`decor-${index}`}
            className="absolute text-2xl select-none"
            style={{ 
              left: d.x, 
              top: d.y, 
              scale: d.scale, 
              opacity: d.opacity 
            }}
            animate={{
              y: [0, -5, 0],
              rotate: [0, index % 2 === 0 ? 5 : -5, 0]
            }}
            transition={{
              duration: 4 + (index % 4),
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.2
            }}
          >
            {d.emoji}
          </motion.div>
        ))}
      </div>

      {/* SVG Path Background and Progress */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        fill="none"
      >
        {/* Full grey path road */}
        {fullPathD && (
          <>
            <path
              d={fullPathD}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={fullPathD}
              stroke="rgba(0, 0, 0, 0.3)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={terrain.trailDash}
            />
          </>
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
              filter: `drop-shadow(0 0 8px ${game.color}cc)`,
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
            ref={isActive ? activeNodeRef : null}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
            style={{ left: p.x, top: p.y }}
          >
            {/* Exploration Node Card */}
            <div className="flex flex-col items-center">
              
              {/* Node Button / Lock */}
              {p.isLocked ? (
                // Locked Zone: Frosted fog overlay
                <div className="w-16 h-16 rounded-full flex flex-col items-center justify-center bg-slate-950/70 border border-slate-800/80 shadow-lg text-slate-500 cursor-not-allowed backdrop-blur-[2px] relative group overflow-hidden">
                  {/* Fog overlay animation */}
                  <div className="absolute inset-0 bg-white/5 opacity-40 mix-blend-overlay animate-pulse" />
                  <span className="text-lg opacity-60">🔒</span>
                  <span className="text-[9px] font-bold text-slate-600 leading-none mt-0.5 font-mono">
                    Zone {p.level}
                  </span>
                </div>
              ) : (
                // Unlocked / Completed / Active Zone
                <Link href={`/${ageRange}/${game.slug}/${p.level}`} className="relative group">
                  {/* Glowing halo for active level */}
                  {isActive && (
                    <motion.div
                      className="absolute -inset-3 rounded-full opacity-70 blur-md pointer-events-none"
                      style={{ backgroundColor: game.color }}
                      animate={{
                        scale: [0.9, 1.25, 0.9],
                        opacity: [0.4, 0.7, 0.4]
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: 'easeInOut'
                      }}
                    />
                  )}

                  <motion.button
                    onMouseEnter={() => playSound('click')}
                    className={`w-16 h-16 rounded-full flex flex-col items-center justify-center font-display text-xl font-extrabold text-white cursor-pointer relative shadow-2xl focus:outline-none border-2`}
                    style={{
                      background: isActive
                        ? `linear-gradient(135deg, ${game.color}, #ffffff50)`
                        : `linear-gradient(135deg, ${game.color}cc, ${game.color}40)`,
                      borderColor: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.25)',
                      boxShadow: isActive
                        ? `0 0 20px ${game.color}, inset 0 2px 4px rgba(255,255,255,0.4)`
                        : `0 8px 16px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.15)`,
                    }}
                    whileHover={{
                      scale: 1.12,
                      boxShadow: `0 0 25px ${game.color}, inset 0 2px 6px rgba(255,255,255,0.5)`,
                    }}
                    whileTap={{ scale: 0.96 }}
                  >
                    {isActive ? (
                      <span className="text-xl animate-bounce mt-1">🧭</span>
                    ) : (
                      <span className="text-lg font-mono font-black">{p.level}</span>
                    )}

                    {/* Checkmark or Stars decoration inside the bubble if completed */}
                    {p.stars > 0 && !isActive && (
                      <span className="absolute -bottom-1 -right-1 text-xs bg-emerald-500 rounded-full w-5 h-5 flex items-center justify-center border border-white/20 shadow-md">
                        ✓
                      </span>
                    )}
                  </motion.button>
                </Link>
              )}

              {/* Zone Details / Label */}
              <div 
                className={`mt-2 flex flex-col items-center text-center px-3 py-1 rounded-xl border transition-all duration-300 max-w-[130px] ${
                  p.isLocked 
                    ? 'bg-black/30 border-transparent opacity-40' 
                    : isActive 
                      ? 'bg-black/70 border-white/20 shadow-md scale-105' 
                      : 'bg-black/50 border-white/5 hover:border-white/10'
                }`}
              >
                <span className={`text-[9px] font-mono tracking-widest uppercase font-bold ${isActive ? 'text-yellow-400' : 'text-white/40'}`}>
                  {isActive ? 'Current Zone' : `Zone ${p.level}`}
                </span>
                <h4 className="text-[10px] font-bold text-white/90 leading-tight mt-0.5 truncate w-full">
                  {p.zoneName}
                </h4>
                {p.stars > 0 && <StarRating count={p.stars} />}
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
}
