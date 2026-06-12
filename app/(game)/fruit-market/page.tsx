"use client";

import Link from "next/link";
import { useGameStore } from "@/lib/store";
import { motion } from "framer-motion";

const FLOATING_EMOJIS = ["🍎", "🍊", "🍋", "🍇", "🍓", "🍎", "🍊", "🍋", "🍇", "🍓"];

function StarDisplay({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map((s) => (
        <span
          key={s}
          className={`text-sm ${s <= count ? "star-filled" : "star-empty"}`}
        >
          ⭐
        </span>
      ))}
    </div>
  );
}

export default function FruitMarketHub() {
  const { unlockedLevels, starRatings } = useGameStore();
  const unlockedLevel = unlockedLevels.fruitMarket;
  const fruitStars = starRatings.fruitMarket;

  return (
    <div className="zone-fruit flex flex-col items-center min-h-screen relative overflow-y-auto overflow-x-hidden px-4 py-8">
      {/* Floating Background Emojis */}
      {FLOATING_EMOJIS.map((emoji, i) => (
        <motion.div
          key={`float-${i}`}
          className="absolute text-3xl opacity-15 pointer-events-none select-none"
          style={{
            left: `${8 + (i * 9) % 84}%`,
            top: `${5 + (i * 13) % 85}%`,
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
          href="/"
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
          🍎
        </motion.div>
        <h1 className="font-display text-5xl font-extrabold text-white drop-shadow-lg tracking-tight">
          Fruit Market
        </h1>
        <p className="text-[#ff6b81] text-lg font-semibold mt-1 tracking-wide">
          Addition Adventure
        </p>
      </motion.div>

      {/* Level Path — vertical zigzag */}
      <div className="flex flex-col items-center z-10 w-full max-w-sm gap-0 pb-12">
        {Array.from({ length: 10 }).map((_, i) => {
          const level = i + 1;
          const isLocked = level > unlockedLevel;
          const stars = fruitStars[i] || 0;
          // Zigzag: odd levels offset left, even offset right
          const offsetX = i % 2 === 0 ? -60 : 60;

          return (
            <motion.div
              key={`level-${level}`}
              className="relative flex flex-col items-center"
              style={{ transform: `translateX(${offsetX}px)` }}
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: i * 0.08,
                ease: [0.34, 1.56, 0.64, 1],
              }}
            >
              {/* Connector line to next node */}
              {i < 9 && (
                <svg
                  className="absolute top-full left-1/2 z-0 opacity-30"
                  width="140"
                  height="50"
                  style={{
                    transform: `translateX(${i % 2 === 0 ? 10 : -130}px)`,
                  }}
                >
                  <line
                    x1={i % 2 === 0 ? 60 : 80}
                    y1="0"
                    x2={i % 2 === 0 ? 80 : 60}
                    y2="50"
                    stroke="rgba(255, 107, 129, 0.5)"
                    strokeWidth="3"
                    strokeDasharray="6,6"
                  />
                </svg>
              )}

              {/* Level Node */}
              {isLocked ? (
                <div
                  className={`level-node locked w-18 h-18 rounded-full flex flex-col items-center justify-center
                    bg-white/5 border-2 border-white/10 shadow-lg mb-8`}
                >
                  <span className="text-2xl opacity-50">🔒</span>
                  <span className="text-xs text-white/30 font-bold mt-0.5">
                    {level}
                  </span>
                </div>
              ) : (
                <Link href={`/fruit-market/${level}`} className="mb-8">
                  <motion.div
                    className={`level-node w-18 h-18 rounded-full flex flex-col items-center justify-center
                      bg-gradient-to-br from-[#ff6b81] to-[#ff4757] border-3 border-white/30
                      shadow-[0_0_20px_rgba(255,107,129,0.3)] cursor-pointer`}
                    whileHover={{ scale: 1.15, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-2xl font-extrabold text-white drop-shadow-md">
                      {level}
                    </span>
                    {stars > 0 && <StarDisplay count={stars} />}
                  </motion.div>
                </Link>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
