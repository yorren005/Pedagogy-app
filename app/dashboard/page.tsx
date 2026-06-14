"use client";

import Link from "next/link";
import { useState } from "react";
import { useGameStore } from "@/lib/store";
import { getXPForNextLevel } from "@/lib/rlEngine";
import { motion } from "framer-motion";
import { AGE_RANGES, AgeRange, getAgeRange, getAllZoneKeys, getMaxLevelsForZone } from "@/lib/gameConfig";

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
    selectedAgeRange,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<AgeRange>(selectedAgeRange || "elementary");

  const xpInfo = getXPForNextLevel(xp);
  const allKeys = getAllZoneKeys();

  const totalCompletedLevelsGlobal = allKeys.reduce((sum, key) => {
    const unlocked = unlockedLevels[key] || 1;
    const maxVal = getMaxLevelsForZone(key);
    return sum + Math.min(maxVal, Math.max(0, unlocked - 1));
  }, 0);

  const totalMaxLevelsGlobal = allKeys.reduce((sum, key) => sum + getMaxLevelsForZone(key), 0);

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

  const getStrengthAnalysis = (zoneKey: string) => {
    const level = unlockedLevels[zoneKey] || 1;
    const skill = zoneLearnerStates[zoneKey]?.skillLevel || 10;

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

  const activeRangeDef = getAgeRange(activeTab);

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
              <h2 className="text-xl font-bold font-display">Learner Profile</h2>
              <div className="text-white/50 text-xs mt-1 flex items-center gap-1.5">
                <span>Active Learning Range:</span>
                <span className="bg-white/5 px-2 py-0.5 rounded text-white font-bold text-[10px] uppercase border border-white/10 flex items-center gap-1">
                  <span>{getAgeRange(selectedAgeRange || "elementary").emoji}</span>
                  <span>{getAgeRange(selectedAgeRange || "elementary").label}</span>
                </span>
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
                {totalCompletedLevelsGlobal} / {totalMaxLevelsGlobal}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Age Range Tabs */}
        <section className="flex flex-col gap-3">
          <div className="text-xs text-white/40 font-bold uppercase tracking-wider">
            Filter Curriculum Details by Age Range:
          </div>
          <div className="flex flex-wrap gap-2">
            {AGE_RANGES.map((ar) => {
              const isActive = ar.key === activeTab;
              return (
                <button
                  key={ar.key}
                  onClick={() => setActiveTab(ar.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold border transition-all ${
                    isActive
                      ? "bg-white/10 border-white/30 text-white shadow-md shadow-white/5"
                      : "bg-white/0 border-white/5 text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                  style={{
                    borderColor: isActive ? ar.color : undefined,
                  }}
                >
                  <span className="text-lg">{ar.emoji}</span>
                  <div className="flex flex-col items-start leading-none">
                    <span>{ar.label}</span>
                    <span className="text-[9px] text-white/45 mt-0.5">{ar.ageText}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Curriculum Analytics Details */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="font-display text-xl font-bold text-white/80">
              Curriculum Progress & Learning Strengths
            </h3>
            <span className="text-xs font-bold text-white/45 bg-white/5 px-2.5 py-1 rounded-full border border-white/10 uppercase tracking-wide">
              {activeRangeDef.emoji} {activeRangeDef.label} Curriculum
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {activeRangeDef.games.map((zone, idx) => {
              const ratingList = starRatings[zone.key] || [];
              const unlocked = unlockedLevels[zone.key] || 1;
              const completedVal = Math.min(zone.maxLevels, Math.max(0, unlocked - 1));
              const percent = Math.min(100, Math.round((completedVal / zone.maxLevels) * 100));
              const difficulty = zoneDifficulties[zone.key] || "easy";
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
                        <div className="flex items-center gap-2">
                          <h4
                            className="text-lg font-extrabold"
                            style={{ color: zone.color }}
                          >
                            {zone.name}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-white/5 border border-white/10 text-white/60">
                            {zone.subject}
                          </span>
                        </div>
                        <span className="text-xs text-white/40 font-bold">
                          {zone.subtitle}
                        </span>
                      </div>
                    </div>

                    {/* Difficulty Badge & Skill Level Gauge */}
                    <div className="flex flex-wrap items-center gap-3">
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
                      <div className="bg-white/5 px-3 py-1 rounded-full text-xs font-bold border border-white/10 flex items-center gap-1.5">
                        <span className="text-white/40">Progress:</span>
                        <span className="text-emerald-400 font-extrabold">{percent}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Level dots map */}
                  <div className="mb-4">
                    <div className="text-xs text-white/50 font-bold mb-2 uppercase tracking-wide">
                      Levels Path Rating:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: zone.maxLevels }).map((_, lIdx) => {
                        const level = lIdx + 1;
                        const starsEarned = ratingList[lIdx] || 0;
                        const isLevelUnlocked = level <= unlocked;

                        return (
                          <div
                            key={level}
                            className={`flex flex-col items-center justify-center p-1.5 rounded-xl w-11 h-13 border transition-all ${
                              isLevelUnlocked
                                ? "bg-white/5 border-white/20"
                                : "bg-white/0 border-white/5 opacity-30"
                            }`}
                          >
                            <span className="text-[9px] text-white/40 font-bold leading-none mb-1">
                              L{level}
                            </span>
                            {isLevelUnlocked ? (
                              starsEarned > 0 ? (
                                <div className="flex flex-col items-center leading-none">
                                  <span className="text-[10px] text-yellow-400">★</span>
                                  <span className="text-[8px] font-black text-yellow-300">
                                    {starsEarned}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-white/70 font-bold leading-none">●</span>
                              )
                            ) : (
                              <span className="text-[9px] leading-none">🔒</span>
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
