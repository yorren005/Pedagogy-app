"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

const PALETTE = ["#8b5cf6", "#22d3ee", "#34d399", "#fbbf24", "#f472b6"];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ─── 1. ConfettiBurst ─────────────────────────────────────────────────────── */

interface ConfettiBurstProps {
  /** Unique key — change to re-trigger the burst */
  id?: string | number;
}

interface ConfettiParticle {
  id: number;
  color: string;
  shape: "circle" | "square" | "triangle";
  x: number;
  y: number;
  rotation: number;
  size: number;
  delay: number;
}

function generateConfettiParticles(): ConfettiParticle[] {
  return Array.from({ length: 40 }, (_, i) => ({
    id: i,
    color: pickRandom(PALETTE),
    shape: pickRandom<"circle" | "square" | "triangle">(["circle", "square", "triangle"]),
    x: rand(-300, 300),
    y: rand(-300, 300),
    rotation: rand(-720, 720),
    size: rand(6, 14),
    delay: rand(0, 0.3),
  }));
}

function confettiShapeBorderRadius(shape: "circle" | "square" | "triangle") {
  if (shape === "circle") return "50%";
  if (shape === "square") return "2px";
  return "0";
}

function confettiClipPath(shape: "circle" | "square" | "triangle") {
  if (shape === "triangle") return "polygon(50% 0%, 0% 100%, 100% 100%)";
  return undefined;
}

export function ConfettiBurst({ id }: ConfettiBurstProps) {
  const particles = useMemo(() => generateConfettiParticles(), [id]);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute left-1/2 top-1/2">
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={`${id}-${p.id}`}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
              animate={{
                x: p.x,
                y: p.y,
                opacity: 0,
                scale: rand(0.5, 1.5),
                rotate: p.rotation,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.5,
                delay: p.delay,
                ease: "easeOut",
              }}
              style={{
                position: "absolute",
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                borderRadius: confettiShapeBorderRadius(p.shape),
                clipPath: confettiClipPath(p.shape),
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── 2. StarShower ────────────────────────────────────────────────────────── */

interface StarShowerProps {
  /** Unique key — change to re-trigger */
  id?: string | number;
}

interface FallingStar {
  id: number;
  startX: number;
  swayX: number;
  delay: number;
  duration: number;
  size: number;
}

function generateFallingStars(): FallingStar[] {
  return Array.from({ length: 15 }, (_, i) => ({
    id: i,
    startX: rand(5, 95),
    swayX: rand(-40, 40),
    delay: rand(0, 1.2),
    duration: rand(1.5, 3),
    size: rand(20, 36),
  }));
}

export function StarShower({ id }: StarShowerProps) {
  const stars = useMemo(() => generateFallingStars(), [id]);

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden z-50"
      aria-hidden="true"
    >
      <AnimatePresence>
        {stars.map((s) => (
          <motion.div
            key={`${id}-star-${s.id}`}
            initial={{ y: -60, x: 0, opacity: 1, rotate: 0 }}
            animate={{
              y: "110vh",
              x: [0, s.swayX, -s.swayX * 0.5, s.swayX * 0.3],
              opacity: [1, 1, 0.8, 0],
              rotate: [0, 180, 360],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: s.duration,
              delay: s.delay,
              ease: "easeIn",
            }}
            style={{
              position: "absolute",
              left: `${s.startX}%`,
              top: 0,
              fontSize: s.size,
            }}
          >
            ⭐
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ─── 3. CoinSpray ─────────────────────────────────────────────────────────── */

interface CoinSprayProps {
  /** Unique key — change to re-trigger */
  id?: string | number;
  /** Horizontal origin in % (default 50) */
  originX?: number;
  /** Vertical origin in % (default 80) */
  originY?: number;
}

interface SprayingCoin {
  id: number;
  xOffset: number;
  peakY: number;
  endY: number;
  delay: number;
  rotation: number;
  size: number;
}

function generateSprayingCoins(): SprayingCoin[] {
  return Array.from({ length: 10 }, (_, i) => ({
    id: i,
    xOffset: rand(-120, 120),
    peakY: rand(-200, -120),
    endY: rand(80, 200),
    delay: rand(0, 0.25),
    rotation: rand(-360, 360),
    size: rand(22, 34),
  }));
}

export function CoinSpray({ id, originX = 50, originY = 80 }: CoinSprayProps) {
  const coins = useMemo(() => generateSprayingCoins(), [id]);

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden z-50"
      aria-hidden="true"
    >
      <AnimatePresence>
        {coins.map((c) => (
          <motion.div
            key={`${id}-coin-${c.id}`}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
            animate={{
              x: c.xOffset,
              y: [0, c.peakY, c.endY],
              opacity: [1, 1, 0],
              rotate: c.rotation,
              scale: [1, 1.2, 0.6],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1.2,
              delay: c.delay,
              ease: "easeOut",
              y: { duration: 1.2, ease: [0.33, 1, 0.68, 1] },
            }}
            style={{
              position: "absolute",
              left: `${originX}%`,
              top: `${originY}%`,
              fontSize: c.size,
            }}
          >
            🪙
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ─── 4. ComboFire ─────────────────────────────────────────────────────────── */

interface ComboFireProps {
  combo: number;
  visible: boolean;
}

export function ComboFire({ combo, visible }: ComboFireProps) {
  return (
    <AnimatePresence>
      {visible && combo >= 2 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [1, 1.15 + combo * 0.05, 1],
            opacity: 1,
          }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{
            scale: {
              repeat: Infinity,
              duration: 0.6,
              ease: "easeInOut",
            },
            opacity: { duration: 0.2 },
          }}
          className="flex flex-col items-center gap-0"
        >
          <span
            className="combo-fire"
            style={{ fontSize: Math.min(28 + combo * 4, 56) }}
          >
            🔥
          </span>
          <motion.span
            key={combo}
            initial={{ scale: 1.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="combo-fire font-display font-extrabold text-warning"
            style={{ fontSize: Math.min(18 + combo * 2, 32) }}
          >
            ×{combo}!
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── 5. WrongShake ────────────────────────────────────────────────────────── */

interface WrongShakeProps {
  trigger: boolean;
  children: React.ReactNode;
}

export function WrongShake({ trigger, children }: WrongShakeProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={trigger ? "shaking" : "idle"}
        animate={
          trigger
            ? {
                x: [0, -10, 10, -8, 8, -4, 4, 0],
              }
            : { x: 0 }
        }
        transition={{
          duration: 0.5,
          ease: "easeInOut",
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
