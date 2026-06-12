"use client";

import Link from "next/link";
import { useGameStore } from "@/lib/store";
import { getXPForNextLevel, BADGES } from "@/lib/rlEngine";
import { motion } from "framer-motion";

const ZONES = [
  {
    key: "fruitMarket" as const,
    name: "Fruit Market",
    subtitle: "Addition",
    emoji: "🍎",
    href: "/fruit-market",
    color: "#ff6b81",
    gradient: "from-[#ff6b81] to-[#ff4757]",
    bgGlow: "rgba(255, 107, 129, 0.3)",
  },
  {
    key: "picnic" as const,
    name: "The Picnic",
    subtitle: "Subtraction",
    emoji: "🥪",
    href: "/the-picnic",
    color: "#70a1ff",
    gradient: "from-[#70a1ff] to-[#1e90ff]",
    bgGlow: "rgba(112, 161, 255, 0.3)",
  },
  {
    key: "toyFactory" as const,
    name: "Toy Factory",
    subtitle: "Multiplication",
    emoji: "🧸",
    href: "/toy-factory",
    color: "#7bed9f",
    gradient: "from-[#7bed9f] to-[#2ed573]",
    bgGlow: "rgba(123, 237, 159, 0.3)",
  },
  {
    key: "pizzaParty" as const,
    name: "Pizza Party",
    subtitle: "Fractions",
    emoji: "🍕",
    href: "/pizza-party",
    color: "#ffa502",
    gradient: "from-[#ffa502] to-[#ff6348]",
    bgGlow: "rgba(255, 165, 2, 0.3)",
  },
];

const FLOATING_ITEMS = [
  { emoji: "⭐", x: "10%", y: "15%", delay: 0, duration: 5 },
  { emoji: "🌙", x: "85%", y: "10%", delay: 1, duration: 6 },
  { emoji: "✨", x: "70%", y: "25%", delay: 2, duration: 4 },
  { emoji: "💫", x: "20%", y: "80%", delay: 0.5, duration: 5.5 },
  { emoji: "🌟", x: "90%", y: "70%", delay: 1.5, duration: 4.5 },
  { emoji: "⚡", x: "5%", y: "50%", delay: 2.5, duration: 6 },
  { emoji: "🪐", x: "50%", y: "5%", delay: 3, duration: 7 },
];

export default function Home() {
  const { stars, coins, xp, playerLevel, badges, unlockedLevels, starRatings } = useGameStore();
  const xpInfo = getXPForNextLevel(xp);

  const totalStarsEarned = Object.values(starRatings).flat().reduce((a, b) => a + b, 0);
  const totalLevelsCompleted = Object.values(starRatings).flat().filter(s => s > 0).length;

  return (
    <div className="flex flex-col flex-1 items-center min-h-screen relative overflow-y-auto overflow-x-hidden px-4 pb-24"
      style={{ background: "linear-gradient(180deg, #0f0a2e 0%, #1a1145 30%, #0f0a2e 100%)" }}
    >
      {/* Floating Background Elements */}
      {FLOATING_ITEMS.map((item, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl md:text-3xl opacity-20 pointer-events-none select-none"
          style={{ left: item.x, top: item.y }}
          animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0] }}
          transition={{ duration: item.duration, repeat: Infinity, delay: item.delay, ease: "easeInOut" }}
        >
          {item.emoji}
        </motion.div>
      ))}

      {/* Top Nav */}
      <div className="w-full max-w-2xl flex justify-between items-center py-4 z-20">
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
        <Link
          href="/dashboard"
          className="glass-card px-4 py-2 flex items-center gap-2 font-bold text-white/60 text-sm hover:text-white/90 transition-colors"
        >
          ⚙️ Parents
        </Link>
      </div>

      {/* Player Profile */}
      <motion.div
        className="w-full max-w-2xl glass-card p-5 mb-8 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4 mb-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/30">
            🧒
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-bold text-white">Math Explorer</span>
              <span className="bg-gradient-to-r from-purple-500 to-cyan-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                Lv.{playerLevel}
              </span>
            </div>
            <div className="text-white/50 text-xs mt-0.5">
              {totalLevelsCompleted}/40 levels • {totalStarsEarned} stars earned
            </div>
          </div>
        </div>
        {/* XP Progress Bar */}
        <div className="w-full">
          <div className="flex justify-between text-xs text-white/40 mb-1">
            <span>Level {playerLevel}</span>
            <span>{xpInfo.current}/{xpInfo.needed} XP</span>
          </div>
          <div className="progress-bar">
            <motion.div
              className="progress-bar-fill xp-bar"
              initial={{ width: 0 }}
              animate={{ width: `${xpInfo.progress * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>

      {/* Title */}
      <motion.div
        className="flex flex-col items-center gap-1 mb-8 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h1 className="font-display text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-300 to-green-300">
          Adventure Map
        </h1>
        <p className="text-white/50 font-bold text-sm">Choose your quest!</p>
      </motion.div>

      {/* Zone Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-2xl z-10">
        {ZONES.map((zone, index) => {
          const zoneStars = starRatings[zone.key];
          const completedLevels = zoneStars.filter((s: number) => s > 0).length;
          const totalStarsInZone = zoneStars.reduce((a: number, b: number) => a + b, 0);
          const maxStars = 30; // 10 levels * 3 stars
          const progress = completedLevels / 10;

          return (
            <motion.div
              key={zone.key}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            >
              <Link
                href={zone.href}
                className="group block glass-card p-6 relative overflow-hidden hover:scale-[1.02] transition-transform duration-300"
              >
                {/* Glow Effect */}
                <div
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"
                  style={{ background: zone.bgGlow }}
                />

                <div className="relative z-10">
                  {/* Zone Icon */}
                  <motion.div
                    className="text-6xl mb-3 drop-shadow-lg"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: index * 0.5, ease: "easeInOut" }}
                  >
                    {zone.emoji}
                  </motion.div>

                  {/* Zone Name */}
                  <h2 className="text-xl font-extrabold mb-0.5" style={{ color: zone.color }}>
                    {zone.name}
                  </h2>
                  <p className="text-white/40 text-xs font-bold mb-3">{zone.subtitle}</p>

                  {/* Progress */}
                  <div className="flex items-center justify-between text-xs text-white/50 mb-1.5">
                    <span>{completedLevels}/10 levels</span>
                    <span>⭐ {totalStarsInZone}/{maxStars}</span>
                  </div>
                  <div className="progress-bar h-2">
                    <div
                      className="progress-bar-fill h-full"
                      style={{
                        width: `${progress * 100}%`,
                        background: `linear-gradient(90deg, ${zone.color}, ${zone.color}88)`,
                      }}
                    />
                  </div>

                  {/* Level Unlock Indicator */}
                  <div className="mt-3 text-xs text-white/30">
                    Level {unlockedLevels[zone.key]} unlocked
                    {unlockedLevels[zone.key] >= 10 && " ✅"}
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Badges Section */}
      {badges.length > 0 && (
        <motion.div
          className="w-full max-w-2xl mt-8 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="text-sm font-bold text-white/40 mb-3 px-1">🏆 Badges Earned</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {badges.map((badgeId) => {
              const badge = BADGES.find(b => b.id === badgeId);
              if (!badge) return null;
              return (
                <motion.div
                  key={badgeId}
                  className="glass-card flex-shrink-0 w-20 h-20 flex flex-col items-center justify-center gap-1"
                  whileHover={{ scale: 1.1, y: -4 }}
                >
                  <span className="text-2xl">{badge.emoji}</span>
                  <span className="text-[10px] text-white/50 text-center leading-tight">{badge.name}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Daily Challenge */}
      <motion.div
        className="w-full max-w-2xl mt-6 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <Link href={`/${['fruit-market', 'the-picnic', 'toy-factory', 'pizza-party'][Math.floor(Date.now() / 86400000) % 4]}`}>
          <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-r from-purple-600/30 to-cyan-600/30 border border-purple-500/20">
            <div className="absolute -top-6 -right-6 text-7xl opacity-10 rotate-12">🎯</div>
            <div className="relative z-10 flex items-center gap-3">
              <div className="text-3xl">🎯</div>
              <div>
                <div className="font-bold text-white text-sm">Daily Challenge</div>
                <div className="text-white/40 text-xs">Earn bonus XP today!</div>
              </div>
              <div className="ml-auto text-white/30 text-xl">→</div>
            </div>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
