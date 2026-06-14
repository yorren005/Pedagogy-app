"use client";

import Link from "next/link";
import { useGameStore } from "@/lib/store";
import { motion } from "framer-motion";
import { GameDef, AgeRange } from "@/lib/gameConfig";
import { useAudio } from "@/lib/useAudio";
import { useEffect } from "react";
import LevelSelect from "./LevelSelect";

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

  return (
    <div
      className={`${game.zoneClass} flex flex-col items-center min-h-screen relative overflow-y-auto overflow-x-hidden px-4 py-8`}
    >
      {/* Floating Background Emojis */}
      {floatingEmojis.map((emoji, i) => (
        <motion.div
          key={`float-${i}`}
          className="absolute text-3xl opacity-[0.08] pointer-events-none select-none"
          style={{
            left: `${8 + ((i * 9) % 84)}%`,
            top: `${5 + ((i * 13) % 85)}%`,
          }}
          animate={{
            y: [0, -18, 0],
            rotate: [0, i % 2 === 0 ? 10 : -10, 0],
          }}
          transition={{
            duration: 3 + (i % 3),
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
          className="text-2xl bg-white/10 backdrop-blur-sm border border-white/20 rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:scale-105 hover:bg-white/20 transition-all"
        >
          ⬅️
        </Link>
      </div>

      {/* Zone Title */}
      <motion.div
        className="flex flex-col items-center z-10 mt-10 mb-6"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="text-8xl drop-shadow-lg mb-2"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {game.emoji}
        </motion.div>
        <h1 className="font-display text-5xl font-extrabold text-white drop-shadow-lg tracking-tight">
          {game.name}
        </h1>
        <p className="text-lg font-semibold mt-1 tracking-wide" style={{ color: game.color }}>
          {game.subtitle}
        </p>
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
