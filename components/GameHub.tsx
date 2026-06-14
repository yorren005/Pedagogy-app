"use client";

import Link from "next/link";
import { useGameStore } from "@/lib/store";
import { motion } from "framer-motion";
import { AgeRangeDef } from "@/lib/gameConfig";

interface GameHubProps {
  ageRange: AgeRangeDef;
}

export default function GameHub({ ageRange }: GameHubProps) {
  const { stars, coins, xp, playerLevel, unlockedLevels, starRatings } =
    useGameStore();

  const mathGames = ageRange.games.filter((g) => g.subject === "math");
  const englishGames = ageRange.games.filter((g) => g.subject === "english");

  const totalLevels = ageRange.games.reduce((sum, g) => sum + g.maxLevels, 0);
  const completedLevels = ageRange.games.reduce((sum, g) => {
    const ratings = starRatings[g.key] || [];
    return sum + ratings.filter((s: number) => s > 0).length;
  }, 0);
  const totalStarsEarned = ageRange.games.reduce((sum, g) => {
    const ratings = starRatings[g.key] || [];
    return sum + ratings.reduce((a: number, b: number) => a + b, 0);
  }, 0);

  return (
    <div
      className={`flex flex-col flex-1 items-center min-h-screen relative overflow-y-auto overflow-x-hidden px-4 pb-24 ${ageRange.themeClass}`}
      style={{
        background: `linear-gradient(180deg, var(--background) 0%, ${ageRange.color}08 40%, var(--background) 100%)`,
      }}
    >
      {/* Floating Background Elements */}
      {ageRange.games.map((game, i) => (
        <motion.div
          key={game.key}
          className="absolute text-3xl opacity-[0.08] pointer-events-none select-none"
          style={{
            left: `${10 + (i * 15) % 80}%`,
            top: `${8 + (i * 12) % 80}%`,
          }}
          animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0] }}
          transition={{
            duration: 4 + (i % 3),
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut",
          }}
        >
          {game.emoji}
        </motion.div>
      ))}

      {/* Top Nav */}
      <div className="w-full max-w-2xl flex justify-between items-center py-4 z-20">
        <Link
          href="/"
          className="glass-card px-4 py-2 flex items-center gap-2 font-bold text-white/60 text-sm hover:text-white/90 transition-colors"
        >
          ⬅️ Back
        </Link>
        <div className="flex gap-3">
          <motion.div
            className="glass-card px-4 py-2 flex items-center gap-2 font-bold text-yellow-300 text-sm"
            whileHover={{ scale: 1.05 }}
          >
            <span>⭐</span> {stars}
          </motion.div>
          <motion.div
            className="glass-card px-4 py-2 flex items-center gap-2 font-bold text-amber-300 text-sm"
            whileHover={{ scale: 1.05 }}
          >
            <span>🪙</span> {coins}
          </motion.div>
        </div>
      </div>

      {/* Age Range Header */}
      <motion.div
        className="w-full max-w-2xl flex flex-col items-center z-10 mb-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="text-7xl drop-shadow-2xl mb-2"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {ageRange.emoji}
        </motion.div>
        <h1
          className="font-display text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text mb-1 text-center"
          style={{
            backgroundImage: `linear-gradient(135deg, ${ageRange.color}, ${ageRange.color}aa)`,
          }}
        >
          {ageRange.label}
        </h1>
        <p className="text-white/40 text-sm font-semibold mb-1">
          {ageRange.ageText}
        </p>
        <p className="text-white/30 text-xs font-medium text-center max-w-sm">
          {ageRange.description}
        </p>
      </motion.div>

      {/* Progress Summary */}
      <motion.div
        className="w-full max-w-2xl glass-card p-4 mb-6 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-white/40 font-bold">Overall Progress</span>
          <span className="text-xs text-white/30">
            {completedLevels}/{totalLevels} levels • ⭐ {totalStarsEarned}
          </span>
        </div>
        <div className="progress-bar">
          <motion.div
            className="progress-bar-fill xp-bar"
            initial={{ width: 0 }}
            animate={{ width: `${totalLevels > 0 ? (completedLevels / totalLevels) * 100 : 0}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      {/* Math Games Section */}
      <motion.div
        className="w-full max-w-2xl z-10 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-sm font-bold text-white/40 mb-3 px-1 flex items-center gap-2">
          <span>📐</span> Math Games
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mathGames.map((game, index) => {
            const gameStars = starRatings[game.key] || [];
            const completed = gameStars.filter((s: number) => s > 0).length;
            const totalGameStars = gameStars.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const maxStars = game.maxLevels * 3;
            const progress = completed / game.maxLevels;

            return (
              <motion.div
                key={game.key}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.08 }}
              >
                <Link
                  href={`/${ageRange.key}/${game.slug}`}
                  className="group block glass-card p-5 relative overflow-hidden hover:scale-[1.02] transition-transform duration-300"
                >
                  <div
                    className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"
                    style={{ background: game.bgGlow }}
                  />

                  <div className="relative z-10">
                    <motion.div
                      className="text-5xl mb-2 drop-shadow-lg"
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: index * 0.4,
                        ease: "easeInOut",
                      }}
                    >
                      {game.emoji}
                    </motion.div>

                    <h3
                      className="text-lg font-extrabold mb-0.5"
                      style={{ color: game.color }}
                    >
                      {game.name}
                    </h3>
                    <p className="text-white/35 text-xs font-bold mb-3">
                      {game.subtitle}
                    </p>

                    <div className="flex items-center justify-between text-xs text-white/40 mb-1.5">
                      <span>
                        {completed}/{game.maxLevels} levels
                      </span>
                      <span>
                        ⭐ {totalGameStars}/{maxStars}
                      </span>
                    </div>
                    <div className="progress-bar h-2">
                      <div
                        className="progress-bar-fill h-full"
                        style={{
                          width: `${progress * 100}%`,
                          background: `linear-gradient(90deg, ${game.color}, ${game.color}88)`,
                        }}
                      />
                    </div>

                    <div className="mt-2 text-xs text-white/25">
                      Level {unlockedLevels[game.key] || 1} unlocked
                      {(unlockedLevels[game.key] || 1) >= game.maxLevels &&
                        " ✅"}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* English Games Section */}
      <motion.div
        className="w-full max-w-2xl z-10 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <h2 className="text-sm font-bold text-white/40 mb-3 px-1 flex items-center gap-2">
          <span>📝</span> English Games
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {englishGames.map((game, index) => {
            const gameStars = starRatings[game.key] || [];
            const completed = gameStars.filter((s: number) => s > 0).length;
            const totalGameStars = gameStars.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const maxStars = game.maxLevels * 3;
            const progress = completed / game.maxLevels;

            return (
              <motion.div
                key={game.key}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.7 + index * 0.08 }}
              >
                <Link
                  href={`/${ageRange.key}/${game.slug}`}
                  className="group block glass-card p-5 relative overflow-hidden hover:scale-[1.02] transition-transform duration-300"
                >
                  <div
                    className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"
                    style={{ background: game.bgGlow }}
                  />

                  <div className="relative z-10">
                    <motion.div
                      className="text-5xl mb-2 drop-shadow-lg"
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: index * 0.4,
                        ease: "easeInOut",
                      }}
                    >
                      {game.emoji}
                    </motion.div>

                    <h3
                      className="text-lg font-extrabold mb-0.5"
                      style={{ color: game.color }}
                    >
                      {game.name}
                    </h3>
                    <p className="text-white/35 text-xs font-bold mb-3">
                      {game.subtitle}
                    </p>

                    <div className="flex items-center justify-between text-xs text-white/40 mb-1.5">
                      <span>
                        {completed}/{game.maxLevels} levels
                      </span>
                      <span>
                        ⭐ {totalGameStars}/{maxStars}
                      </span>
                    </div>
                    <div className="progress-bar h-2">
                      <div
                        className="progress-bar-fill h-full"
                        style={{
                          width: `${progress * 100}%`,
                          background: `linear-gradient(90deg, ${game.color}, ${game.color}88)`,
                        }}
                      />
                    </div>

                    <div className="mt-2 text-xs text-white/25">
                      Level {unlockedLevels[game.key] || 1} unlocked
                      {(unlockedLevels[game.key] || 1) >= game.maxLevels &&
                        " ✅"}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Dashboard Link */}
      <motion.div
        className="w-full max-w-2xl z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Link href="/dashboard">
          <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/15">
            <div className="relative z-10 flex items-center gap-3">
              <div className="text-2xl">📊</div>
              <div>
                <div className="font-bold text-white text-sm">View Dashboard</div>
                <div className="text-white/35 text-xs">
                  Track your progress across all games
                </div>
              </div>
              <div className="ml-auto text-white/25 text-lg">→</div>
            </div>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
