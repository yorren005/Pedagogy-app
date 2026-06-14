"use client";

import Link from "next/link";
import { useGameStore } from "@/lib/store";
import { motion } from "framer-motion";
import { GameDef, AgeRange } from "@/lib/gameConfig";
import { useAudio } from "@/lib/useAudio";
import { useEffect, useMemo } from "react";
import LevelSelect from "./LevelSelect";
import { ZONE_NAMES } from "@/lib/zoneNames";

interface GameLevelHubProps {
  game: GameDef;
  ageRange: AgeRange;
}

export default function GameLevelHub({ game, ageRange }: GameLevelHubProps) {
  const { unlockedLevels, starRatings } = useGameStore();
  const unlockedLevel = unlockedLevels[game.key] || 1;
  const gameStars = starRatings[game.key] || Array(game.maxLevels).fill(0);
  const { playMusic } = useAudio();

  useEffect(() => {
    playMusic(ageRange);
  }, [playMusic, ageRange]);

  const floatingEmojis = Array(10)
    .fill(game.emoji)
    .map((e, i) => (i % 3 === 0 ? "✨" : e));

  // Calculate expedition progress details
  const completedCount = useMemo(() => {
    // Number of levels that have a star rating > 0
    return gameStars.filter((stars) => stars > 0).length;
  }, [gameStars]);

  const currentZoneName = useMemo(() => {
    const names = ZONE_NAMES[game.key] || [];
    return names[unlockedLevel - 1] || `Zone ${unlockedLevel}`;
  }, [game.key, unlockedLevel]);

  const progressPercent = Math.round((completedCount / game.maxLevels) * 100);

  return (
    <div
      className={`${game.zoneClass} flex flex-col items-center min-h-screen relative overflow-y-auto overflow-x-hidden px-4 py-8 bg-[#0a0f1d]`}
    >
      {/* Floating Background Emojis */}
      {floatingEmojis.map((emoji, i) => (
        <motion.div
          key={`float-${i}`}
          className="absolute text-3xl opacity-[0.05] pointer-events-none select-none"
          style={{
            left: `${8 + ((i * 9) % 84)}%`,
            top: `${5 + ((i * 13) % 85)}%`,
          }}
          animate={{
            y: [0, -25, 0],
            rotate: [0, i % 2 === 0 ? 12 : -12, 0],
          }}
          transition={{
            duration: 4 + (i % 3),
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.4,
          }}
        >
          {emoji}
        </motion.div>
      ))}

      {/* Back Button */}
      <div className="absolute top-4 left-4 z-20">
        <Link
          href={`/${ageRange}`}
          className="text-2xl bg-white/10 backdrop-blur-md border border-white/20 rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:scale-105 hover:bg-white/20 hover:border-white/40 active:scale-95 transition-all"
        >
          ⬅️
        </Link>
      </div>

      {/* Zone Title / Progression Card */}
      <motion.div
        className="flex flex-col items-center z-10 mt-10 mb-8 max-w-md w-full text-center px-4"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="text-7xl drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] mb-3"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {game.emoji}
        </motion.div>

        <h1 className="font-display text-4xl sm:text-5xl font-black text-white drop-shadow-md tracking-tight">
          {game.name}
        </h1>
        <p className="text-sm font-bold mt-1 uppercase tracking-widest" style={{ color: game.color }}>
          {game.subtitle} Map
        </p>

        {/* Territory Progress stats */}
        <div className="mt-5 w-full bg-black/55 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg text-left">
          <div className="flex justify-between items-center text-xs font-mono font-bold text-white/50 mb-2">
            <span>TERRITORY EXPLORED</span>
            <span style={{ color: game.color }}>{progressPercent}%</span>
          </div>

          {/* Custom Progress Bar */}
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-4 border border-white/5">
            <motion.div 
              className="h-full rounded-full"
              style={{ 
                background: `linear-gradient(90deg, ${game.color}, #ffffff50)`,
                boxShadow: `0 0 8px ${game.color}`
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="border-r border-white/10 pr-2">
              <span className="text-white/40 block text-[10px]">COMPLETED ZONES</span>
              <span className="text-white font-black text-base">{completedCount} / {game.maxLevels}</span>
            </div>
            <div className="pl-2">
              <span className="text-white/40 block text-[10px]">CURRENT EXPEDITION</span>
              <span className="text-white font-black text-base truncate block" style={{ color: game.color }}>
                {unlockedLevel <= game.maxLevels ? currentZoneName : "Completed!"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Level Path — animated curved bezier trail */}
      <div className="z-10 w-full max-w-md pb-16 flex flex-col items-center">
        <LevelSelect
          game={game}
          ageRange={ageRange}
          unlockedLevel={unlockedLevel}
          gameStars={gameStars}
          maxLevels={game.maxLevels}
        />
      </div>
    </div>
  );
}
