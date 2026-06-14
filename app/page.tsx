"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AGE_RANGES } from "@/lib/gameConfig";

const FLOATING_SYMBOLS = [
  { symbol: "∑", x: "8%", y: "12%", delay: 0, size: "text-4xl" },
  { symbol: "π", x: "88%", y: "8%", delay: 0.8, size: "text-5xl" },
  { symbol: "∫", x: "75%", y: "22%", delay: 1.6, size: "text-3xl" },
  { symbol: "√", x: "15%", y: "75%", delay: 0.4, size: "text-4xl" },
  { symbol: "∞", x: "92%", y: "65%", delay: 2, size: "text-5xl" },
  { symbol: "θ", x: "5%", y: "45%", delay: 1.2, size: "text-3xl" },
  { symbol: "λ", x: "50%", y: "4%", delay: 2.4, size: "text-4xl" },
  { symbol: "Δ", x: "82%", y: "82%", delay: 1, size: "text-3xl" },
  { symbol: "Ω", x: "35%", y: "88%", delay: 0.6, size: "text-4xl" },
  { symbol: "∂", x: "65%", y: "45%", delay: 1.8, size: "text-3xl" },
  { symbol: "ABC", x: "22%", y: "30%", delay: 2.2, size: "text-2xl" },
  { symbol: "φ", x: "45%", y: "60%", delay: 0.3, size: "text-4xl" },
];

export default function Home() {
  return (
    <div
      className="flex flex-col flex-1 items-center min-h-screen relative overflow-y-auto overflow-x-hidden px-4 pb-16"
      style={{
        background:
          "linear-gradient(180deg, #0f0a2e 0%, #0d1528 30%, #0a1a30 60%, #0f0a2e 100%)",
      }}
    >
      {/* Floating Background Symbols */}
      {FLOATING_SYMBOLS.map((item, i) => (
        <motion.div
          key={i}
          className={`absolute ${item.size} opacity-[0.06] pointer-events-none select-none font-display font-bold`}
          style={{
            left: item.x,
            top: item.y,
            color: AGE_RANGES[i % AGE_RANGES.length].color,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 8, -8, 0],
            opacity: [0.04, 0.08, 0.04],
          }}
          transition={{
            duration: 5 + (i % 3),
            repeat: Infinity,
            delay: item.delay,
            ease: "easeInOut",
          }}
        >
          {item.symbol}
        </motion.div>
      ))}

      {/* Hero Section */}
      <motion.div
        className="flex flex-col items-center z-10 mt-16 mb-4"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        {/* Logo / Title */}
        <motion.div
          className="text-7xl mb-4 drop-shadow-2xl"
          animate={{ y: [0, -8, 0], rotate: [0, 3, -3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          🎓
        </motion.div>
        <h1 className="font-display text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-300 to-green-300 mb-3 text-center leading-tight">
          Learn & Play
        </h1>
        <p className="text-white/40 font-semibold text-base md:text-lg text-center max-w-md mb-2">
          Interactive games for Math & English
        </p>
        <div className="flex items-center gap-2 text-white/25 text-sm">
          <span>📐 Math</span>
          <span>•</span>
          <span>📝 English</span>
          <span>•</span>
          <span>🎮 Games</span>
        </div>
      </motion.div>

      {/* Subtitle */}
      <motion.p
        className="text-white/50 font-bold text-sm mb-8 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Choose your level to begin
      </motion.p>

      {/* Age Range Cards */}
      <div className="flex flex-col gap-4 w-full max-w-lg z-10">
        {AGE_RANGES.map((ar, index) => (
          <motion.div
            key={ar.key}
            initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.3 + index * 0.12,
              ease: [0.34, 1.56, 0.64, 1],
            }}
          >
            <Link
              href={`/${ar.key}`}
              className="group block relative overflow-hidden rounded-2xl hover:scale-[1.02] transition-all duration-300"
            >
              {/* Card Background */}
              <div
                className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity"
                style={{
                  background: `linear-gradient(135deg, ${ar.color}22 0%, transparent 60%)`,
                }}
              />

              <div className="glass-card p-5 relative">
                {/* Glow Effect */}
                <div
                  className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                  style={{ background: ar.bgGlow }}
                />

                <div className="relative z-10 flex items-center gap-4">
                  {/* Emoji Icon */}
                  <motion.div
                    className="text-5xl drop-shadow-lg flex-shrink-0"
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: index * 0.3,
                      ease: "easeInOut",
                    }}
                  >
                    {ar.emoji}
                  </motion.div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h2
                        className="text-xl font-extrabold truncate"
                        style={{ color: ar.color }}
                      >
                        {ar.label}
                      </h2>
                      <span className="text-xs text-white/30 font-bold bg-white/5 px-2 py-0.5 rounded-full flex-shrink-0">
                        {ar.ageText}
                      </span>
                    </div>
                    <p className="text-white/40 text-xs font-medium leading-relaxed">
                      {ar.description}
                    </p>
                    <div className="flex gap-3 mt-2">
                      <span className="text-[10px] text-white/25 font-bold">
                        📐 {ar.games.filter((g) => g.subject === "math").length} Math
                      </span>
                      <span className="text-[10px] text-white/25 font-bold">
                        📝 {ar.games.filter((g) => g.subject === "english").length} English
                      </span>
                      <span className="text-[10px] text-white/25 font-bold">
                        🎮 {ar.games.reduce((sum, g) => sum + g.maxLevels, 0)} Levels
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="text-white/20 text-2xl group-hover:text-white/40 transition-colors group-hover:translate-x-1 duration-300 flex-shrink-0">
                    →
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <motion.div
        className="mt-10 mb-4 z-10 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <Link
          href="/dashboard"
          className="text-white/30 text-xs font-semibold hover:text-white/50 transition-colors"
        >
          ⚙️ Dashboard & Progress
        </Link>
      </motion.div>
    </div>
  );
}
