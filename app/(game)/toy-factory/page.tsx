"use client";

import Link from "next/link";
import { useGameStore } from "@/lib/store";
import { motion } from "framer-motion";

const floatingEmojis = [
  { emoji: "🧸", x: "8%", y: "12%", size: "text-5xl", delay: 0, duration: 5 },
  { emoji: "🎲", x: "85%", y: "8%", size: "text-4xl", delay: 1.2, duration: 6 },
  { emoji: "🎮", x: "75%", y: "35%", size: "text-5xl", delay: 0.8, duration: 4.5 },
  { emoji: "🤖", x: "10%", y: "55%", size: "text-4xl", delay: 2, duration: 5.5 },
  { emoji: "🧸", x: "90%", y: "60%", size: "text-3xl", delay: 0.3, duration: 6.5 },
  { emoji: "🎲", x: "20%", y: "80%", size: "text-5xl", delay: 1.5, duration: 4 },
  { emoji: "🎮", x: "50%", y: "90%", size: "text-4xl", delay: 2.5, duration: 5 },
  { emoji: "🤖", x: "65%", y: "75%", size: "text-3xl", delay: 0.6, duration: 7 },
  { emoji: "🧸", x: "40%", y: "15%", size: "text-3xl", delay: 1.8, duration: 5.2 },
  { emoji: "🎮", x: "30%", y: "45%", size: "text-4xl", delay: 3, duration: 4.8 },
];

export default function ToyFactoryHub() {
  const { unlockedLevels, starRatings } = useGameStore();
  const unlockedLevel = unlockedLevels.toyFactory;
  const ratings = starRatings.toyFactory;

  return (
    <div className="flex flex-col flex-1 items-center min-h-screen relative overflow-y-auto zone-factory px-4 py-8">
      {/* Floating Background Emojis */}
      {floatingEmojis.map((item, i) => (
        <motion.div
          key={`float-${i}`}
          className={`absolute ${item.size} opacity-10 pointer-events-none select-none`}
          style={{ left: item.x, top: item.y }}
          animate={{
            y: [0, -18, 0],
            rotate: [0, 8, -8, 0],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {item.emoji}
        </motion.div>
      ))}

      {/* Back Button */}
      <motion.div
        className="absolute top-4 left-4 z-20"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link
          href="/"
          className="text-3xl bg-white/10 backdrop-blur-md rounded-full w-14 h-14 flex items-center justify-center shadow-lg border border-white/20 hover:scale-105 hover:bg-white/20 transition-all"
        >
          ⬅️
        </Link>
      </motion.div>

      <main className="flex flex-col items-center z-10 w-full max-w-lg text-center gap-4 mt-12 pb-12">
        {/* Zone Title */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
          className="text-8xl drop-shadow-lg"
        >
          🧸
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="font-display text-5xl font-extrabold text-factory drop-shadow-lg"
        >
          Toy Factory
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="text-xl text-white/60 font-semibold -mt-1 mb-4"
        >
          Multiplication Adventure
        </motion.p>

        {/* Level Path — Vertical Zigzag */}
        <div className="w-full flex flex-col items-center gap-1 relative">
          {Array.from({ length: 10 }).map((_, i) => {
            const level = i + 1;
            const isLocked = level > unlockedLevel;
            const starCount = ratings[i] || 0;
            // Zigzag: even levels go left, odd go right
            const offsetX = i % 2 === 0 ? -60 : 60;

            return (
              <motion.div
                key={`level-${level}`}
                initial={{ opacity: 0, x: offsetX, scale: 0.5 }}
                animate={{ opacity: 1, x: offsetX, scale: 1 }}
                transition={{
                  delay: 0.15 * i + 0.5,
                  type: "spring",
                  stiffness: 180,
                  damping: 14,
                }}
                className="relative"
              >
                {/* Connecting line to next node */}
                {i < 9 && (
                  <div
                    className="absolute w-px h-12 bg-white/15"
                    style={{
                      bottom: -48,
                      left: "50%",
                      transform: `translateX(-50%) rotate(${i % 2 === 0 ? 35 : -35}deg)`,
                      transformOrigin: "top center",
                      height: 56,
                    }}
                  />
                )}

                {isLocked ? (
                  <div className="level-node locked w-20 h-20 rounded-full flex flex-col items-center justify-center bg-white/5 border-2 border-white/10 shadow-lg">
                    <span className="text-2xl opacity-50">🔒</span>
                    <span className="text-xs text-white/30 font-bold mt-0.5">{level}</span>
                  </div>
                ) : (
                  <Link href={`/toy-factory/${level}`}>
                    <div className="level-node w-20 h-20 rounded-full flex flex-col items-center justify-center bg-factory/20 border-3 border-factory shadow-lg shadow-factory/20 hover:shadow-factory/40 relative overflow-hidden">
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-factory/30 to-transparent rounded-full" />
                      <span className="text-2xl font-extrabold text-white z-10">{level}</span>
                      {/* Star display */}
                      <div className="flex gap-0.5 z-10 -mt-0.5">
                        {[1, 2, 3].map((s) => (
                          <span
                            key={s}
                            className={`text-xs ${s <= starCount ? "star-filled" : "star-empty"}`}
                          >
                            ⭐
                          </span>
                        ))}
                      </div>
                      {/* Pulse ring for current level */}
                      {level === unlockedLevel && (
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-factory"
                          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </div>
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
