"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GameShellProps {
  zoneClass: string;
  backHref: string;
  title: string;
  levelNum: number;
  equation: string;
  currentRound: number;
  totalRounds: number;
  comboStreak: number;
  children: ReactNode;
  topRight?: ReactNode;
}

export default function GameShell({
  zoneClass,
  backHref,
  title,
  levelNum,
  equation,
  currentRound,
  totalRounds,
  comboStreak,
  children,
  topRight,
}: GameShellProps) {
  const progress = totalRounds > 0 ? (currentRound / totalRounds) * 100 : 0;

  return (
    <div className={`flex flex-col min-h-screen ${zoneClass} relative overflow-hidden`}>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 z-20">
        <Link
          href={backHref}
          className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-2xl hover:scale-105 transition-transform"
        >
          ⬅️
        </Link>
        <div className="glass-card px-4 py-2 rounded-full">
          <span className="font-display text-lg font-bold text-white/90">
            {title} · Lv {levelNum}
          </span>
        </div>
        {topRight || <div className="w-12" />}
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-2 z-20">
        <div className="progress-bar">
          <motion.div
            className="progress-bar-fill xp-bar"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-white/50 font-bold">
          <span>Round {Math.min(currentRound + 1, totalRounds)}/{totalRounds}</span>
          {comboStreak > 1 && (
            <motion.span
              className="combo-fire text-warning font-extrabold"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              key={comboStreak}
            >
              🔥 {comboStreak}x Combo!
            </motion.span>
          )}
        </div>
      </div>

      {/* Equation Display */}
      <div className="flex justify-center px-4 py-4 z-20">
        <motion.div
          className="glass-card px-8 py-5 flex items-center gap-3 text-4xl font-extrabold text-white font-display"
          key={equation}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {equation}
        </motion.div>
      </div>

      {/* Game Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 z-10">
        {children}
      </div>
    </div>
  );
}
