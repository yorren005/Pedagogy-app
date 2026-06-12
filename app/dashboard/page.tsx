"use client";

import Link from "next/link";
import { useGameStore, ZoneKey } from "@/lib/store";
import { getXPForNextLevel } from "@/lib/rlEngine";
import { motion } from "framer-motion";

const ZONE_METADATA = [
  {
    key: "fruitMarket" as ZoneKey,
    name: "Fruit Market",
    subtitle: "Addition",
    emoji: "🍎",
    color: "#ff6b81",
    accentColor: "rgba(255, 107, 129, 0.2)",
  },
  {
    key: "picnic" as ZoneKey,
    name: "The Picnic",
    subtitle: "Subtraction",
    emoji: "🥪",
    color: "#70a1ff",
    accentColor: "rgba(112, 161, 255, 0.2)",
  },
  {
    key: "toyFactory" as ZoneKey,
    name: "Toy Factory",
    subtitle: "Multiplication",
    emoji: "🧸",
    color: "#7bed9f",
    accentColor: "rgba(123, 237, 159, 0.2)",
  },
  {
    key: "pizzaParty" as ZoneKey,
    name: "Pizza Party",
    subtitle: "Fractions",
    emoji: "🍕",
    color: "#ffa502",
    accentColor: "rgba(255, 165, 2, 0.2)",
  },
  {
    key: "wordSafari" as ZoneKey,
    name: "Word Safari",
    subtitle: "Spelling & Vocab",
    emoji: "🦁",
    color: "#2ed573",
    accentColor: "rgba(46, 213, 115, 0.2)",
  },
];

export default function ParentDashboard() {
  const {
    stars,
    coins,
    xp,
    playerLevel,
    unlockedLevels,
    starRatings,
    zoneLearnerStates,
    zoneDifficulties,
    resetProgress,
  } = useGameStore();

  const xpInfo = getXPForNextLevel(xp);

  const totalLevelsUnlocked =
    unlockedLevels.fruitMarket +
    unlockedLevels.picnic +
    unlockedLevels.toyFactory +
    unlockedLevels.pizzaParty +
    unlockedLevels.wordSafari;

  const handleReset = () => {
    if (
      window.confirm(
        "Are you sure you want to wipe all progress? This cannot be undone."
      )
    ) {
      resetProgress();
      alert("Progress has been reset.");
    }
  };

  const getStrengthAnalysis = (zone: ZoneKey) => {
    const level = unlockedLevels[zone];
    const skill = zoneLearnerStates[zone]?.skillLevel || 10;

    if (level === 1 && skill < 15) {
      return "Getting started! Introducing fundamental concepts.";
    }
    if (skill > 70) {
      return "Outstanding master! Easily handles complex problems with high speed and accuracy.";
    }
    if (skill > 40) {
      return "Solid skills! Shows high accuracy on standard level tasks.";
    }
    return "Steadily developing. Needs focused practice to build confidence.";
  };

  return (
    <div
      className="flex flex-col flex-1 min-h-screen bg-slate-950 px-4 py-8 text-white relative overflow-y-auto"
      style={{
        background:
          "linear-gradient(180deg, #09061c 0%, #0c0926 50%, #09061c 100%)",
      }}
    >
      {/* Background glow decorations */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between mb-8 z-10">
        <Link
          href="/"
          className="text-2xl bg-white/10 backdrop-blur-md border border-white/20 rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:scale-105 hover:bg-white/20 transition-all"
        >
          ⬅
        </Link>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-300 drop-shadow-md">
          Parent Dashboard
        </h1>
        <div className="w-12" />
      </div>

      <main className="w-full max-w-4xl mx-auto flex flex-col gap-8 z-10 pb-12">
        {/* Kid Info Card */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-3xl shadow-lg shadow-purple-500/20">
              🧒
            </div>
            <div>
              <h2 className="text-xl font-bold font-display">Math Explorer</h2>
              <div className="text-white/50 text-xs mt-1">
                Active learning progress tracking
              </div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="flex-1 max-w-md">
            <div className="flex justify-between text-xs text-white/50 mb-1">
              <span className="font-bold">Player Level {playerLevel}</span>
              <span>{xpInfo.current}/{xpInfo.needed} XP</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill xp-bar"
                style={{ width: `${xpInfo.progress * 100}%` }}
              />
            </div>
          </div>
        </motion.section>

        {/* Global Summary Metrics */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-5 flex items-center gap-4 border-l-4 border-yellow-400"
          >
            <span className="text-4xl">⭐</span>
            <div>
              <div className="text-xs text-white/40 font-bold uppercase tracking-wider">
                Total Stars
              </div>
              <div className="text-2xl font-black text-yellow-400">{stars}</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="glass-card p-5 flex items-center gap-4 border-l-4 border-amber-400"
          >
            <span className="text-4xl">🪙</span>
            <div>
              <div className="text-xs text-white/40 font-bold uppercase tracking-wider">
                Total Coins
              </div>
              <div className="text-2xl font-black text-amber-400">{coins}</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-5 flex items-center gap-4 border-l-4 border-cyan-400"
          >
            <span className="text-4xl">🏆</span>
            <div>
              <div className="text-xs text-white/40 font-bold uppercase tracking-wider">
                Completed Levels
              </div>
              <div className="text-2xl font-black text-cyan-400">
                {totalLevelsUnlocked - 5} / 50
              </div>
            </div>
          </motion.div>
        </section>

        {/* Curriculum Analytics Details */}
        <section className="flex flex-col gap-6">
          <h3 className="font-display text-xl font-bold text-white/80 border-b border-white/10 pb-2">
            Curriculum Progress & Learning Strengths
          </h3>

          <div className="grid grid-cols-1 gap-6">
            {ZONE_METADATA.map((zone, idx) => {
              const ratingList = starRatings[zone.key] || [];
              const unlocked = unlockedLevels[zone.key];
              const percent = Math.min(100, Math.round((unlocked / 10) * 100));
              const difficulty = zoneDifficulties[zone.key];
              const skillLevel = zoneLearnerStates[zone.key]?.skillLevel || 10;

              return (
                <motion.div
                  key={zone.key}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="glass-card p-6 border border-white/5 relative overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{zone.emoji}</span>
                      <div>
                        <h4
                          className="text-lg font-extrabold"
                          style={{ color: zone.color }}
                        >
                          {zone.name}
                        </h4>
                        <span className="text-xs text-white/40 font-bold">
                          {zone.subtitle}
                        </span>
                      </div>
                    </div>

                    {/* Difficulty Badge & Skill Level Gauge */}
                    <div className="flex items-center gap-3">
                      <div className="bg-white/5 px-3 py-1 rounded-full text-xs font-bold border border-white/10 flex items-center gap-1.5">
                        <span className="text-white/40">Difficulty:</span>
                        <span className="capitalize" style={{ color: zone.color }}>
                          {difficulty}
                        </span>
                      </div>
                      <div className="bg-white/5 px-3 py-1 rounded-full text-xs font-bold border border-white/10 flex items-center gap-1.5">
                        <span className="text-white/40">Skill Rating:</span>
                        <span className="text-cyan-400 font-extrabold">{skillLevel}/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Level dots map */}
                  <div className="mb-4">
                    <div className="text-xs text-white/50 font-bold mb-2 uppercase tracking-wide">
                      Levels Path Rating:
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {Array.from({ length: 10 }).map((_, lIdx) => {
                        const level = lIdx + 1;
                        const starsEarned = ratingList[lIdx] || 0;
                        const isLevelUnlocked = level <= unlocked;

                        return (
                          <div
                            key={level}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl w-12 h-14 border transition-all ${
                              isLevelUnlocked
                                ? "bg-white/5 border-white/20"
                                : "bg-white/0 border-white/5 opacity-30"
                            }`}
                          >
                            <span className="text-[10px] text-white/40 font-bold leading-none mb-1">
                              L{level}
                            </span>
                            {isLevelUnlocked ? (
                              starsEarned > 0 ? (
                                <div className="flex flex-col items-center">
                                  <span className="text-xs text-yellow-400">⭐</span>
                                  <span className="text-[8px] font-black text-yellow-300">
                                    {starsEarned}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-white/70 font-bold">●</span>
                              )
                            ) : (
                              <span className="text-[9px]">🔒</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Analysis Description */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-start md:items-center">
                    <span className="text-xl">📊</span>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-0.5">
                        Adaptive Intelligence Assessment:
                      </div>
                      <p className="text-sm font-semibold text-white/80">
                        {getStrengthAnalysis(zone.key)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Administration Actions */}
        <section className="flex justify-between items-center bg-white/5 rounded-3xl p-5 border border-white/10 mt-4">
          <div className="text-left">
            <h4 className="text-sm font-bold text-white/90">Reset Student Progress</h4>
            <p className="text-xs text-white/40 mt-0.5">
              Wipe out all stars, coins, level unlocks, and skill metrics
            </p>
          </div>
          <button
            onClick={handleReset}
            className="px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-extrabold text-xs rounded-xl border border-rose-500/30 transition-colors shadow-lg"
          >
            Clear Save Data 🔄
          </button>
        </section>
      </main>
    </div>
  );
}
