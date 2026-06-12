"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ConfettiBurst } from "./Particles";

/* ─── LevelComplete Overlay ────────────────────────────────────────────────── */

interface LevelCompleteProps {
  stars: number;
  xpEarned: number;
  coinsEarned: number;
  onNext: () => void;
  onRetry: () => void;
  equation?: string;
}

export function LevelComplete({
  stars,
  xpEarned,
  coinsEarned,
  onNext,
  onRetry,
  equation,
}: LevelCompleteProps) {
  const [xpCount, setXpCount] = useState(0);
  const [coinsCount, setCoinsCount] = useState(0);
  const [animateStars, setAnimateStars] = useState([false, false, false]);

  useEffect(() => {
    // Staggered star animation
    const starTimers = [
      setTimeout(() => setAnimateStars([true, false, false]), 300),
      setTimeout(() => setAnimateStars([true, true, false]), 600),
      setTimeout(() => setAnimateStars([true, true, true]), 900),
    ];

    // XP count up
    let currentXp = 0;
    const xpInterval = setInterval(() => {
      if (currentXp < xpEarned) {
        currentXp += Math.ceil(xpEarned / 20);
        if (currentXp > xpEarned) currentXp = xpEarned;
        setXpCount(currentXp);
      } else {
        clearInterval(xpInterval);
      }
    }, 40);

    // Coins count up
    let currentCoins = 0;
    const coinsInterval = setInterval(() => {
      if (currentCoins < coinsEarned) {
        currentCoins += Math.ceil(coinsEarned / 20);
        if (currentCoins > coinsEarned) currentCoins = coinsEarned;
        setCoinsCount(currentCoins);
      } else {
        clearInterval(coinsInterval);
      }
    }, 40);

    return () => {
      starTimers.forEach(clearTimeout);
      clearInterval(xpInterval);
      clearInterval(coinsInterval);
    };
  }, [stars, xpEarned, coinsEarned]);

  const reactionEmoji = stars === 3 ? "🌟" : stars === 2 ? "🎉" : "👏";
  const reactionText = stars === 3 ? "Excellent!" : stars === 2 ? "Great Job!" : "Completed!";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f0a2e]/80 backdrop-blur-md px-4">
      {stars === 3 && <ConfettiBurst id="level-complete-confetti" />}

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-full max-w-md glass-card p-8 flex flex-col items-center text-center relative overflow-hidden border border-white/20 shadow-2xl"
      >
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Reaction Emoji */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: [1, 1.2, 1], rotate: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-7xl mb-2 drop-shadow-md"
        >
          {reactionEmoji}
        </motion.div>

        {/* Success Text */}
        <h2 className="font-display text-4xl font-extrabold text-white mb-2 drop-shadow-sm">
          {reactionText}
        </h2>
        {equation && (
          <p className="text-white/50 font-medium text-sm mb-6 bg-white/5 px-3 py-1 rounded-full border border-white/10">
            Completed: {equation}
          </p>
        )}

        {/* Stars */}
        <div className="flex justify-center gap-4 mb-8">
          {[0, 1, 2].map((idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0 }}
              animate={animateStars[idx] ? { scale: 1.2 } : { scale: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 12 }}
              className={`text-5xl drop-shadow-lg ${
                idx < stars ? "text-warning" : "text-white/10"
              }`}
            >
              ⭐
            </motion.div>
          ))}
        </div>

        {/* Rewards grid */}
        <div className="grid grid-cols-2 gap-4 w-full mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center shadow-inner">
            <span className="text-3xl mb-1">⚡</span>
            <span className="text-xs text-white/40 font-bold uppercase tracking-wider">
              XP Earned
            </span>
            <motion.span className="text-2xl font-extrabold text-cyan-400">
              +{xpCount}
            </motion.span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center shadow-inner">
            <span className="text-3xl mb-1">🪙</span>
            <span className="text-xs text-white/40 font-bold uppercase tracking-wider">
              Coins
            </span>
            <motion.span className="text-2xl font-extrabold text-warning">
              +{coinsCount}
            </motion.span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 w-full">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNext}
            className="w-full btn-game bg-gradient-to-r from-primary to-secondary text-white font-extrabold text-lg py-3.5 shadow-lg shadow-primary/30"
          >
            Next Level!
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRetry}
            className="w-full bg-white/10 hover:bg-white/15 border border-white/20 text-white/90 font-extrabold text-sm py-3 rounded-full transition-all"
          >
            Play Again 🔄
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── ComboIndicator ───────────────────────────────────────────────────────── */

interface ComboIndicatorProps {
  combo: number;
  visible: boolean;
}

export function ComboIndicator({ combo, visible }: ComboIndicatorProps) {
  return (
    <AnimatePresence>
      {visible && combo >= 2 && (
        <motion.div
          initial={{ scale: 0, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: -20 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-orange-500 to-red-500 px-6 py-2.5 rounded-full flex items-center gap-2 border-2 border-white/20 shadow-xl"
        >
          <span className="text-2xl">🔥</span>
          <motion.span
            key={combo}
            initial={{ scale: 1.5 }}
            animate={{ scale: 1 }}
            className="font-display font-extrabold text-white text-lg tracking-wide uppercase text-shadow-sm"
          >
            {combo}x Combo Streak!
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── BadgeEarned Overlay ──────────────────────────────────────────────────── */

interface BadgeEarnedProps {
  badge: {
    emoji: string;
    name: string;
    description: string;
  };
  onClose: () => void;
}

export function BadgeEarned({ badge, onClose }: BadgeEarnedProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f0a2e]/90 backdrop-blur-md px-4">
      <ConfettiBurst id="badge-earned-confetti" />

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 15 }}
        className="w-full max-w-sm glass-card p-8 flex flex-col items-center text-center relative border border-warning/30 shadow-[0_0_50px_rgba(251,191,36,0.15)]"
      >
        {/* Glowing border animation */}
        <div className="absolute inset-0 rounded-3xl border border-warning/40 animate-pulse pointer-events-none" />

        <div className="text-xs text-warning font-extrabold uppercase tracking-widest mb-2">
          New Badge Unlocked!
        </div>

        {/* Badge Emoji */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ delay: 0.3, duration: 0.6, type: "spring", stiffness: 200 }}
          className="w-28 h-28 rounded-full bg-gradient-to-br from-warning/20 to-warning/5 border-2 border-warning flex items-center justify-center text-6xl shadow-xl shadow-warning/20 mb-6 relative"
        >
          <div className="absolute inset-0 rounded-full border-4 border-dashed border-warning/30 animate-spin-slow" />
          <span>{badge.emoji}</span>
        </motion.div>

        {/* Badge Info */}
        <h3 className="font-display text-2xl font-extrabold text-white mb-2 tracking-wide">
          {badge.name}
        </h3>
        <p className="text-white/60 font-semibold text-sm mb-8 px-4 leading-relaxed">
          {badge.description}
        </p>

        {/* Close Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="w-full btn-game bg-warning text-white font-extrabold text-md py-3 shadow-lg shadow-warning/20"
        >
          Awesome! 👍
        </motion.button>
      </motion.div>
    </div>
  );
}
