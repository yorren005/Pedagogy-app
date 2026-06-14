'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameVisualizerProps {
  slug: string;
  problem: any;
}

export default function GameVisualizer({ slug, problem }: GameVisualizerProps) {
  const [animationTick, setAnimationTick] = useState(0);

  // Reset or re-trigger animation loops when the problem changes
  useEffect(() => {
    setAnimationTick((t) => t + 1);
  }, [problem]);

  if (!problem) return null;

  // Render the specific animated visual based on the game slug
  switch (slug) {
    // Elementary
    case 'fruit-market':
      return <FruitMarketVisual key={animationTick} problem={problem} />;
    case 'the-picnic':
      return <PicnicVisual key={animationTick} problem={problem} />;
    case 'toy-factory':
      return <ToyFactoryVisual key={animationTick} problem={problem} />;
    case 'pizza-party':
      return <PizzaPartyVisual key={animationTick} problem={problem} />;
    case 'word-safari':
      return <WordSafariVisual key={animationTick} problem={problem} />;
    case 'story-builder':
      return <StoryBuilderVisual key={animationTick} problem={problem} />;

    // Middle School Lower
    case 'equation-quest':
      return <EquationQuestVisual key={animationTick} problem={problem} />;
    case 'shape-shift':
      return <ShapeShiftVisual key={animationTick} problem={problem} />;
    case 'ratio-rally':
      return <RatioRallyVisual key={animationTick} problem={problem} />;
    case 'data-detective':
      return <DataDetectiveVisual key={animationTick} problem={problem} />;
    case 'grammar-galaxy':
      return <GrammarGalaxyVisual key={animationTick} problem={problem} />;
    case 'vocab-vault':
      return <VocabVaultVisual key={animationTick} problem={problem} />;

    // Middle School Upper
    case 'function-forge':
      return <FunctionForgeVisual key={animationTick} problem={problem} />;
    case 'proof-quest':
      return <ProofQuestVisual key={animationTick} problem={problem} />;
    case 'probability-pinball':
      return <ProbabilityPinballVisual key={animationTick} problem={problem} />;
    case 'coordinate-clash':
      return <CoordinateClashVisual key={animationTick} problem={problem} />;
    case 'essay-engine':
      return <EssayEngineVisual key={animationTick} problem={problem} />;
    case 'rhetoric-arena':
      return <RhetoricArenaVisual key={animationTick} problem={problem} />;

    // High School
    case 'trig-tower':
      return <TrigTowerVisual key={animationTick} problem={problem} />;
    case 'matrix-maze':
      return <MatrixMazeVisual key={animationTick} problem={problem} />;
    case 'limit-launcher':
      return <LimitLauncherVisual key={animationTick} problem={problem} />;
    case 'stats-showdown':
      return <StatsShowdownVisual key={animationTick} problem={problem} />;
    case 'lit-labyrinth':
      return <LitLabyrinthVisual key={animationTick} problem={problem} />;
    case 'debate-dojo':
      return <DebateDojoVisual key={animationTick} problem={problem} />;

    // University
    case 'calculus-cascade':
      return <CalculusCascadeVisual key={animationTick} problem={problem} />;
    case 'proof-architect':
      return <ProofArchitectVisual key={animationTick} problem={problem} />;
    case 'abstract-arena':
      return <AbstractArenaVisual key={animationTick} problem={problem} />;
    case 'diff-eq-duel':
      return <DiffEqDuelVisual key={animationTick} problem={problem} />;
    case 'thesis-forge':
      return <ThesisForgeVisual key={animationTick} problem={problem} />;
    case 'critical-lens':
      return <CriticalLensVisual key={animationTick} problem={problem} />;

    default:
      return <SentenceTrainVisual key={animationTick} problem={problem} />;
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   🍎 ELEMENTARY GAMES
   ───────────────────────────────────────────────────────────────────────────── */

/* ─── 1. Fruit Market Visual (Addition) ─── */
function FruitMarketVisual({ problem }: { problem: any }) {
  const a = problem.a || 3;
  const b = problem.b || 2;
  const missingPosition = problem.missingPosition;

  // Mask missing number in the visual description to prevent answer leakage
  const descriptionText = useMemo(() => {
    if (missingPosition === 'a') return `? + ${b} = ${a + b} Apples`;
    if (missingPosition === 'b') return `${a} + ? = ${a + b} Apples`;
    if (missingPosition === 'answer') return `${a} + ${b} = ? Apples`;
    return `${a} + ${b} = ${a + b} Apples`;
  }, [a, b, missingPosition]);

  return (
    <div className="w-full h-56 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-2 left-4 text-xs font-bold text-white/30 uppercase">Addition Visual</div>
      <div className="relative w-full h-32 flex justify-center items-end">
        {/* Basket container */}
        <div className="absolute inset-0 flex items-end justify-center gap-1.5 pb-3">
          {/* Base apples (a) */}
          {Array.from({ length: a }).map((_, i) => (
            <motion.span
              key={`base-${i}`}
              className="text-4xl drop-shadow-md select-none"
              initial={{ scale: 0, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: i * 0.08, type: 'spring' }}
            >
              🍎
            </motion.span>
          ))}
          {/* Dropping apples (b) - inline flex alignment prevents overlaps */}
          {Array.from({ length: b }).map((_, i) => (
            <motion.span
              key={`drop-${i}`}
              className="text-4xl drop-shadow-md select-none"
              initial={{ y: -140, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{
                delay: a * 0.08 + i * 0.25 + 0.3,
                type: 'spring',
                stiffness: 90,
                damping: 12,
              }}
            >
              🍎
            </motion.span>
          ))}
        </div>
        <div className="text-7xl z-10 drop-shadow-lg select-none pointer-events-none">🧺</div>
      </div>
      <div className="mt-2 text-xs font-bold text-cyan-300">
        {descriptionText}
      </div>
    </div>
  );
}

/* ─── 2. Picnic Visual (Subtraction) ─── */
function PicnicVisual({ problem }: { problem: any }) {
  const a = problem.a || 5;
  const b = problem.b || 2;
  const remaining = a - b;
  const missingPosition = problem.missingPosition;

  // Mask missing number in the visual description to prevent answer leakage
  const descriptionText = useMemo(() => {
    if (missingPosition === 'a') return `? 🥪 minus ${b} taken = ${remaining} left`;
    if (missingPosition === 'b') return `${a} 🥪 minus ? taken = ${remaining} left`;
    if (missingPosition === 'answer') return `${a} 🥪 minus ${b} taken = ? left`;
    return `${a} 🥪 minus ${b} taken away = ${remaining} remaining`;
  }, [a, b, remaining, missingPosition]);

  return (
    <div className="w-full h-56 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-2 left-4 text-xs font-bold text-white/30 uppercase">Subtraction Visual</div>
      
      <div className="flex gap-4 justify-center items-center h-28 w-full relative">
        {/* Remaining sandwiches */}
        <div className="flex gap-2">
          {Array.from({ length: remaining }).map((_, i) => (
            <motion.span
              key={`remain-${i}`}
              className="text-4xl drop-shadow-md"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.08 }}
            >
              🥪
            </motion.span>
          ))}
        </div>

        {/* Stolen sandwiches - fixed width containers to avoid overlap collapse */}
        <div className="flex gap-4">
          {Array.from({ length: b }).map((_, i) => (
            <div key={`stolen-${i}`} className="relative w-12 h-16 flex flex-col items-center justify-end">
              {/* The sandwich */}
              <motion.span
                className="text-4xl drop-shadow-md absolute bottom-4"
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{ x: 120, y: -20, opacity: 0 }}
                transition={{ delay: i * 0.5 + 1.2, duration: 1.5, ease: 'easeInOut' }}
              >
                🥪
              </motion.span>
              {/* The ant crawling in, grabbing, and walking off */}
              <motion.span
                className="text-2xl absolute bottom-0"
                initial={{ x: 120, y: 0 }}
                animate={{ x: [120, 0, 120] }}
                transition={{ delay: i * 0.5 + 0.2, duration: 2.5, ease: 'easeInOut' }}
              >
                🐜
              </motion.span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 text-xs font-bold text-red-300">
        {descriptionText}
      </div>
    </div>
  );
}

/* ─── 3. Toy Factory Visual (Multiplication) ─── */
function ToyFactoryVisual({ problem }: { problem: any }) {
  const a = problem.a || 3; // boxes
  const b = problem.b || 4; // toys per box

  return (
    <div className="w-full h-56 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-2 left-4 text-xs font-bold text-white/30 uppercase">Multiplication Visual</div>

      <div className="flex gap-4 justify-center items-end h-28 w-full relative overflow-x-auto px-4">
        {Array.from({ length: a }).map((_, boxIdx) => (
          <div key={boxIdx} className="flex flex-col items-center relative min-w-[70px]">
            {/* Toys falling into this box */}
            <div className="flex flex-wrap justify-center gap-0.5 max-w-[60px] h-14 relative mb-2">
              {Array.from({ length: b }).map((_, toyIdx) => (
                <motion.span
                  key={toyIdx}
                  className="text-xl drop-shadow"
                  initial={{ y: -80, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: boxIdx * 0.3 + toyIdx * 0.12 + 0.4,
                    type: 'spring',
                    stiffness: 120,
                  }}
                >
                  🧸
                </motion.span>
              ))}
            </div>
            {/* The Box */}
            <motion.span
              className="text-4xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: boxIdx * 0.15 }}
            >
              📦
            </motion.span>
          </div>
        ))}
      </div>

      <div className="mt-2 text-xs font-bold text-green-300">
        {a} groups of {b} toys = {a * b} total
      </div>
    </div>
  );
}

/* ─── 4. Pizza Party Visual (Fractions) ─── */
function PizzaPartyVisual({ problem }: { problem: any }) {
  const num = problem.a || 3;
  const den = problem.b || 4;

  return (
    <div className="w-full h-56 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-2 left-4 text-xs font-bold text-white/30 uppercase">Fraction Visual</div>

      <div className="relative w-28 h-28 rounded-full border border-white/20 bg-white/5 overflow-hidden flex items-center justify-center mb-2">
        <svg className="w-full h-full rotate-[-90deg]">
          {Array.from({ length: den }).map((_, i) => {
            const angle = 360 / den;
            const startAngle = i * angle;
            const isFilled = i < num;
            const radStart = (startAngle * Math.PI) / 180;
            const radEnd = ((startAngle + angle) * Math.PI) / 180;

            const x1 = 56 + 56 * Math.cos(radStart);
            const y1 = 56 + 56 * Math.sin(radStart);
            const x2 = 56 + 56 * Math.cos(radEnd);
            const y2 = 56 + 56 * Math.sin(radEnd);

            return (
              <motion.path
                key={i}
                d={`M 56 56 L ${x1} ${y1} A 56 56 0 0 1 ${x2} ${y2} Z`}
                fill={isFilled ? 'rgba(249, 115, 22, 0.75)' : 'transparent'}
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                style={{
                  transformOrigin: '56px 56px',
                }}
                whileHover={{ scale: 1.05 }}
              />
            );
          })}
        </svg>
        <span className="absolute text-sm font-extrabold bg-black/60 px-2 py-0.5 rounded text-white border border-white/10">
          {num}/{den}
        </span>
      </div>

      <div className="text-xs font-bold text-amber-300">
        Showing {num} out of {den} slices
      </div>
    </div>
  );
}

/* ─── 5. Word Safari Visual (Spelling) ─── */
function WordSafariVisual({ problem }: { problem: any }) {
  const word = problem.word || "SAFARI";
  const letters = problem.letters || word.split("");

  return (
    <div className="w-full h-56 bg-emerald-950/20 border border-emerald-500/20 rounded-3xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-2 left-4 text-xs font-bold text-emerald-400/50 uppercase">Safari Jungle Canvas</div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06),transparent)] pointer-events-none" />

      {/* Jungle Backdrop Vines with Letters hanging */}
      <div className="flex gap-3 justify-center items-start h-28 w-full relative pt-2">
        {letters.map((char: string, idx: number) => (
          <div key={idx} className="flex flex-col items-center relative">
            {/* Hanging Vine Line */}
            <motion.div 
              className="w-[1.5px] bg-emerald-600/40"
              initial={{ height: 0 }}
              animate={{ height: 35 + (idx % 3) * 10 }}
              transition={{ delay: idx * 0.05, duration: 0.5 }}
            />
            {/* Letter bubble hanging on vine */}
            <motion.div
              className="w-10 h-10 rounded-full bg-emerald-500/15 border-2 border-emerald-400/40 flex items-center justify-center font-display text-lg font-bold text-white shadow-lg shadow-emerald-500/5"
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: idx * 0.08 + 0.3,
                type: 'spring',
                stiffness: 120,
              }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              {char}
            </motion.div>
          </div>
        ))}
      </div>

      {/* Safari Thematic message */}
      <div className="text-[11px] font-extrabold text-emerald-400 mt-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-400/10">
        🌿 Spell: <span className="text-white font-mono tracking-widest">{word}</span> 🦁
      </div>
    </div>
  );
}

/* ─── 6. Story Builder Visual (Reading) ─── */
function StoryBuilderVisual({ problem }: { problem: any }) {
  const equation = problem.equation || "Build the sentence!";
  const words = problem.words || ["The", "story", "unfolds."];

  return (
    <div className="w-full h-56 bg-amber-900/10 border border-amber-500/20 rounded-3xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-2 left-4 text-xs font-bold text-amber-500/50 uppercase">Open Storybook</div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.04),transparent)] pointer-events-none" />

      {/* Dynamic Book Mockup pages opening */}
      <div className="w-80 h-32 bg-amber-50 border-2 border-amber-100/90 rounded-xl relative shadow-2xl flex p-2 overflow-hidden bg-gradient-to-r from-amber-50/95 via-stone-100 to-amber-50/95">
        {/* Book gutter separator */}
        <div className="absolute inset-y-0 left-1/2 w-[2px] bg-amber-900/10 border-l border-amber-950/20" />

        {/* Left Page content */}
        <div className="flex-1 flex flex-col justify-center items-center px-2 text-center border-r border-amber-900/5">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[10px] text-amber-900/40 font-serif leading-relaxed italic"
          >
            "Once upon a time, words gathered to form magical thoughts..."
          </motion.div>
        </div>

        {/* Right Page content - sentence blocks flying in */}
        <div className="flex-1 flex flex-wrap gap-1 content-center justify-center p-1">
          {words.map((w: string, idx: number) => (
            <motion.span
              key={idx}
              className="px-1.5 py-0.5 bg-amber-600/10 border border-amber-600/20 rounded text-[11px] font-bold text-amber-950"
              initial={{ scale: 0, y: 15, rotate: -5 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              transition={{ delay: idx * 0.1 + 0.3 }}
            >
              {w}
            </motion.span>
          ))}
        </div>
      </div>

      <div className="text-[11px] font-bold text-amber-500 mt-3">
        📖 Assemble blocks in the correct grammatical sequence
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ⚖️ MIDDLE SCHOOL LOWER GAMES
   ───────────────────────────────────────────────────────────────────────────── */

/* ─── 7. Equation Quest Visual (Algebra Basics) ─── */
function EquationQuestVisual({ problem }: { problem: any }) {
  const left = problem.visualScaleLeft || 'x + 3';
  const right = problem.visualScaleRight || '7';

  return (
    <div className="w-full h-56 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-2 left-4 text-xs font-bold text-white/30 uppercase">Algebra balance scale</div>

      <div className="flex justify-between items-center w-full max-w-xs h-32 relative px-4">
        {/* Left Side Pan */}
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
          className="flex flex-col items-center justify-center bg-cyan-500/15 border-2 border-cyan-400/30 rounded-2xl p-2 w-24 h-16 shadow-lg shadow-cyan-500/5"
        >
          <span className="text-[9px] font-extrabold text-cyan-300 uppercase">Left Pan</span>
          <span className="text-sm font-extrabold text-white mt-0.5">{left}</span>
          <div className="flex gap-0.5 mt-0.5 text-xs">
            📦 {left.includes('+') && <span>⬜</span>}
          </div>
        </motion.div>

        {/* Scale Pivot */}
        <div className="w-1.5 h-16 bg-white/15 rounded flex items-end justify-center">
          <div className="w-5 h-5 bg-cyan-500 rounded-full border-2 border-white/20 shadow-md shadow-cyan-500/50" />
        </div>

        {/* Right Side Pan */}
        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 1.75 }}
          className="flex flex-col items-center justify-center bg-cyan-500/15 border-2 border-cyan-400/30 rounded-2xl p-2 w-24 h-16 shadow-lg shadow-cyan-500/5"
        >
          <span className="text-[9px] font-extrabold text-cyan-300 uppercase">Right Pan</span>
          <span className="text-sm font-extrabold text-white mt-0.5">{right}</span>
          <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center max-w-[60px]">
            {Array.from({ length: Math.min(parseInt(right) || 5, 6) }).map((_, i) => (
              <span key={i} className="text-[6px]">⬜</span>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="text-xs font-bold text-cyan-300">
        Balance the scale to solve the equation!
      </div>
    </div>
  );
}

/* ─── 8. Shape Shift Visual (Geometry) ─── */
function ShapeShiftVisual({ problem }: { problem: any }) {
  const shapeType = problem.shapeType || 'rectangle';
  const width = problem.width || 6;
  const height = problem.height || 4;

  return (
    <div className="w-full h-56 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-2 left-4 text-xs font-bold text-white/30 uppercase">Transformation Visual</div>

      <div className="w-40 h-32 bg-black/40 border border-white/10 rounded-2xl relative overflow-hidden flex items-center justify-center mb-1">
        {/* Draw a grid background */}
        <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 opacity-[0.07]">
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i} className="border border-white" />
          ))}
        </div>

        {/* Render specific geometry matching shapeType */}
        {shapeType === 'rectangle' && (
          <motion.div
            className="bg-teal-500/20 border-2 border-teal-400 rounded-lg flex items-center justify-center shadow-lg relative"
            style={{ width: `${width * 9}px`, height: `${height * 9}px` }}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            <span className="absolute -left-6 font-mono text-xs font-bold text-teal-300">{height}</span>
            <span className="absolute -bottom-5 font-mono text-xs font-bold text-teal-300">{width}</span>
            <span className="text-[9px] font-bold text-white/40">Area / Perimeter</span>
          </motion.div>
        )}

        {shapeType === 'triangle' && (
          <div className="w-28 h-20 relative flex items-center justify-center">
            <svg className="w-full h-full text-teal-400" viewBox="0 0 100 80">
              <motion.polygon
                points="50,10 10,70 90,70"
                fill="rgba(20, 184, 166, 0.15)"
                stroke="currentColor"
                strokeWidth="2.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8 }}
              />
              <line x1="50" y1="10" x2="50" y2="70" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeDasharray="3,3" />
              <text x="54" y="42" fill="white" fontSize="6.5" fontWeight="bold">h = {height}</text>
              <text x="44" y="78" fill="currentColor" fontSize="6.5" fontWeight="bold">b = {width}</text>
            </svg>
          </div>
        )}

        {shapeType === 'angle' && (
          <div className="w-28 h-20 relative flex items-center justify-center">
            <svg className="w-full h-full text-teal-400" viewBox="0 0 100 80">
              <motion.polygon
                points="15,70 85,70 50,25"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8 }}
              />
              <text x="18" y="66" fill="white" fontSize="6">{width}°</text>
              <text x="70" y="66" fill="white" fontSize="6">{height}°</text>
              <text x="46" y="36" fill="yellow" fontSize="8" fontWeight="bold">θ</text>
            </svg>
          </div>
        )}
      </div>

      <div className="text-xs font-bold text-teal-300">
        Geometric representation of the shape
      </div>
    </div>
  );
}

/* ─── 9. Ratio Rally Visual (Ratios & Proportions) ─── */
function RatioRallyVisual({ problem }: { problem: any }) {
  // Extract ratio from problem.equation (e.g. "If 2:3 = 6:x, find x")
  const extractedRatio = useMemo(() => {
    if (problem.equation) {
      const match = problem.equation.match(/If\s+(\d+):(\d+)/i);
      if (match) {
        return {
          a: parseInt(match[1]),
          b: parseInt(match[2]),
        };
      }
    }
    return { a: 2, b: 3 };
  }, [problem.equation]);

  const val1 = extractedRatio.a;
  const val2 = extractedRatio.b;

  return (
    <div className="w-full h-56 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-2 left-4 text-xs font-bold text-white/30 uppercase">Ratio Rally race</div>

      <div className="w-full h-24 bg-black/40 border border-white/10 rounded-xl relative flex flex-col justify-around p-2 mb-2">
        {/* Car 1 */}
        <div className="w-full h-8 relative border-b border-white/5 flex items-center">
          <motion.div
            animate={{ x: [0, 240, 0] }}
            transition={{
              repeat: Infinity,
              duration: 8 / val1,
              ease: 'linear',
            }}
            className="text-2xl absolute"
          >
            🏎️ <span className="text-[8px] text-orange-400 font-bold bg-black/60 px-1 rounded">Car A ({val1}x)</span>
          </motion.div>
        </div>

        {/* Car 2 */}
        <div className="w-full h-8 relative flex items-center">
          <motion.div
            animate={{ x: [0, 240, 0] }}
            transition={{
              repeat: Infinity,
              duration: 8 / val2,
              ease: 'linear',
            }}
            className="text-2xl absolute"
          >
            🚓 <span className="text-[8px] text-cyan-400 font-bold bg-black/60 px-1 rounded">Car B ({val2}x)</span>
          </motion.div>
        </div>
      </div>

      <div className="text-xs font-bold text-orange-300">
        Speed Ratio - Car A vs Car B is {val1} : {val2}
      </div>
    </div>
  );
}

/* ─── 10. Data Detective Visual (Statistics Basics) ─── */
function DataDetectiveVisual({ problem }: { problem: any }) {
  const numsString = problem.numsString || "3, 5, 4";
  const nums = useMemo(() => {
    return numsString.split(', ').map(Number);
  }, [numsString]);

  const maxVal = Math.max(...nums, 1);

  return (
    <div className="w-full h-56 bg-purple-950/20 border border-purple-500/20 rounded-3xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-2 left-4 text-xs font-bold text-purple-400/50 uppercase">Detective clipboard</div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.06),transparent)] pointer-events-none" />

      {/* Dynamic Animated Bar Chart */}
      <div className="flex gap-4 justify-center items-end h-28 w-full border-b border-white/10 pb-1 relative px-6">
        {nums.map((num: number, idx: number) => {
          const heightPct = (num / maxVal) * 100;
          return (
            <div key={idx} className="flex flex-col items-center w-10">
              <motion.div
                className="w-8 bg-gradient-to-t from-purple-600 to-indigo-400 border border-purple-400/40 rounded-t shadow-md"
                initial={{ height: 0 }}
                animate={{ height: `${heightPct * 0.7 + 10}px` }}
                transition={{ delay: idx * 0.1, type: 'spring' }}
              />
              <span className="text-[10px] font-extrabold text-purple-300 mt-1">{num}</span>
            </div>
          );
        })}

        {/* Detective Magnifying Glass scanning */}
        <motion.div 
          className="text-4xl absolute pointer-events-none z-10 opacity-70"
          animate={{
            x: [-80, 80, -80],
            y: [-10, 10, -10],
          }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        >
          🔍
        </motion.div>
      </div>

      <div className="text-xs font-bold text-purple-400 mt-2">
        Evidence Set: <span className="font-mono text-white">[{numsString}]</span>
      </div>
    </div>
  );
}

/* ─── 11. Grammar Galaxy Visual (Grammar & Syntax) ─── */
function GrammarGalaxyVisual({ problem }: { problem: any }) {
  const targetWord = problem.targetWord || "FLY";
  const sentence = problem.sentence || "The spaceship ___ through space.";

  return (
    <div className="w-full h-56 bg-indigo-950/20 border border-indigo-500/20 rounded-3xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-2 left-4 text-xs font-bold text-indigo-400/50 uppercase">Galaxy Nebula Navigation</div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.06),transparent)] pointer-events-none" />

      {/* Floating Word Nebula particles */}
      <div className="w-full h-28 relative flex items-center justify-center mb-2">
        <div className="absolute inset-0 overflow-hidden opacity-30">
          {['noun', 'verb', 'adverb', 'pronoun'].map((part: string, idx: number) => (
            <motion.span
              key={idx}
              className="text-[8px] text-indigo-300 font-mono absolute"
              style={{
                left: `${15 + idx * 22}%`,
                top: `${20 + (idx % 2) * 40}%`,
              }}
              animate={{ y: [-5, 5, -5], opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 3 + idx, ease: 'easeInOut' }}
            >
              &lt;{part}&gt;
            </motion.span>
          ))}
        </div>

        {/* Rocket ship flying through sentence portal */}
        <motion.div
          animate={{ y: [-15, 15, -15] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="text-4xl z-10 drop-shadow-[0_0_15px_rgba(99,102,241,0.4)]"
        >
          🚀
        </motion.div>
      </div>

      <div className="text-[11px] font-bold text-indigo-300 max-w-xs text-center line-clamp-1">
        🛰️ Target: <span className="text-white font-extrabold">{targetWord}</span> in sentence portal
      </div>
    </div>
  );
}

/* ─── 12. Vocab Vault Visual (Advanced Vocabulary) ─── */
function VocabVaultVisual({ problem }: { problem: any }) {
  const clue = problem.clue || "Synonym of ancient";

  return (
    <div className="w-full h-56 bg-amber-950/10 border border-amber-500/20 rounded-3xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-2 left-4 text-xs font-bold text-amber-500/50 uppercase">Gold Vault Gate</div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(234,179,8,0.05),transparent)] pointer-events-none" />

      {/* Safe Dial lock mechanism spinning */}
      <div className="relative w-28 h-28 rounded-full border-4 border-amber-600/40 bg-gradient-to-br from-amber-700/20 to-yellow-600/20 flex items-center justify-center mb-2 shadow-xl shadow-amber-950/30">
        <motion.div
          className="absolute inset-2 rounded-full border-2 border-dashed border-amber-400/40 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
        >
          <div className="w-1 h-8 bg-amber-400/60 rounded absolute top-0" />
        </motion.div>
        
        {/* Vault lock handle */}
        <motion.div
          className="text-4xl text-yellow-300 z-10 cursor-pointer"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          whileHover={{ rotate: 90 }}
        >
          🪙
        </motion.div>
      </div>

      <div className="text-[11px] font-extrabold text-amber-300 bg-amber-500/10 px-3 py-0.5 rounded-full border border-amber-400/10 max-w-xs truncate">
        🗝️ Clue: {clue}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   🕹️ MIDDLE SCHOOL UPPER GAMES
   ───────────────────────────────────────────────────────────────────────────── */

/* ─── 13. Function Forge Visual (Linear Ramp) ─── */
function FunctionForgeVisual({ problem }: { problem: any }) {
  const equation = problem.equation || '';
  const slope = equation.includes('2x') ? 1.0 : equation.includes('3x') ? 1.4 : 0.8;
  const intercept = equation.includes('+ 1') ? 10 : equation.includes('+ 2') ? 20 : 0;

  return (
    <div className="w-full h-56 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-2 left-4 text-xs font-bold text-white/30 uppercase">Mountain Ramp Visual</div>

      <div className="w-full h-28 bg-black/40 border border-white/10 rounded-xl relative overflow-hidden flex items-center justify-center mb-1">
        {/* Draw ramp */}
        <svg className="w-full h-full absolute inset-0">
          <line
            x1="0"
            y1={112 - (0 * slope + (intercept + 30))}
            x2="280"
            y2={112 - (280 * slope + (intercept + 30))}
            stroke="#a855f7"
            strokeWidth="3.5"
          />
        </svg>

        {/* Moving skater */}
        <motion.div
          animate={{
            x: [30, 220, 30],
            y: [
              112 - (30 * slope + (intercept + 30)) - 10,
              112 - (220 * slope + (intercept + 30)) - 10,
              112 - (30 * slope + (intercept + 30)) - 10,
            ],
            rotate: [
              -Math.atan(slope) * (180 / Math.PI),
              -Math.atan(slope) * (180 / Math.PI),
              -Math.atan(slope) * (180 / Math.PI),
            ],
          }}
          transition={{
            repeat: Infinity,
            duration: 5,
            ease: 'easeInOut',
          }}
          className="absolute text-2xl pointer-events-none"
        >
          🛹
        </motion.div>
      </div>

      <div className="text-xs font-bold text-purple-300">
        Skateboarder riding the function ramp
      </div>
    </div>
  );
}

/* ─── 14. Proof Quest Visual (Logic & Proofs) ─── */
function ProofQuestVisual({ problem }: { problem: any }) {
  const logic = problem.logic || "P ∧ Q";

  return (
    <div className="w-full h-56 bg-rose-950/10 border border-rose-500/20 rounded-3xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-2 left-4 text-xs font-bold text-rose-400/50 uppercase">Logic Gate Path</div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(244,63,94,0.05),transparent)] pointer-events-none" />

      {/* Logic Gate Network diagram with flowing light beam */}
      <div className="w-full h-28 relative flex items-center justify-center mb-1">
        <svg className="w-full h-full max-w-[260px] text-rose-400" viewBox="0 0 100 60">
          {/* Input paths */}
          <path d="M 10 20 L 40 20 M 10 40 L 40 40" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" fill="none" />
          
          {/* AND/OR gate shape */}
          <path d="M 40 15 C 50 15 55 20 55 30 C 55 40 50 45 40 45 L 40 15 Z" fill="rgba(244,63,94,0.15)" stroke="currentColor" strokeWidth="2" />
          <text x="44" y="33" fill="currentColor" fontSize="7" fontWeight="bold">GATE</text>

          {/* Output path */}
          <path d="M 55 30 L 80 30" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" fill="none" />
          
          {/* Flowing light dot */}
          <motion.circle
            r="3"
            fill="#f43f5e"
            animate={{
              cx: [10, 40, 55, 80],
              cy: [20, 20, 30, 30],
              opacity: [0, 1, 1, 0]
            }}
            transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
          />

          {/* Input labels */}
          <text x="5" y="22" fill="white" fontSize="5" fontWeight="bold">P</text>
          <text x="5" y="42" fill="white" fontSize="5" fontWeight="bold">Q</text>
          <text x="83" y="32" fill="white" fontSize="5" fontWeight="bold">TRUE</text>
        </svg>
      </div>

      <div className="text-xs font-bold text-rose-300">
        Logic Flow: <span className="font-mono text-white">{logic}</span>
      </div>
    </div>
  );
}

/* ─── 15. Probability Pinball Visual (Probability) ─── */
function ProbabilityPinballVisual({ problem }: { problem: any }) {
  return (
    <div className="w-full h-56 bg-emerald-950/20 border border-emerald-500/20 rounded-3xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-2 left-4 text-xs font-bold text-emerald-400/50 uppercase">Plinko Probability Board</div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06),transparent)] pointer-events-none" />

      {/* Board layout with dropping marble */}
      <div className="w-full h-32 relative flex justify-center items-center overflow-hidden border border-white/5 rounded-2xl bg-black/40">
        <svg className="w-full h-full max-w-[200px]" viewBox="0 0 100 80">
          {/* Pegs */}
          <g fill="rgba(255,255,255,0.3)">
            <circle cx="50" cy="15" r="1.5" />
            <circle cx="40" cy="28" r="1.5" /><circle cx="60" cy="28" r="1.5" />
            <circle cx="30" cy="41" r="1.5" /><circle cx="50" cy="41" r="1.5" /><circle cx="70" cy="41" r="1.5" />
            <circle cx="20" cy="54" r="1.5" /><circle cx="40" cy="54" r="1.5" /><circle cx="60" cy="54" r="1.5" /><circle cx="80" cy="54" r="1.5" />
          </g>

          {/* Drop paths */}
          <motion.circle
            r="2.5"
            fill="#10b981"
            animate={{
              cx: [50, 40, 50, 40, 30],
              cy: [5, 15, 28, 41, 54],
              opacity: [0, 1, 1, 1, 0]
            }}
            transition={{ repeat: Infinity, duration: 4.5, ease: 'linear' }}
          />

          <motion.circle
            r="2.5"
            fill="#34d399"
            animate={{
              cx: [50, 60, 50, 60, 70],
              cy: [5, 15, 28, 41, 54],
              opacity: [0, 1, 1, 1, 0]
            }}
            transition={{ repeat: Infinity, duration: 4.5, ease: 'linear', delay: 2.25 }}
          />
        </svg>

        {/* Bottom Bins representing frequency */}
        <div className="absolute bottom-0 inset-x-0 h-4 flex justify-around px-4 border-t border-white/10 bg-emerald-500/10">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="w-[12px] h-full bg-emerald-400/30 rounded-t-sm" />
          ))}
        </div>
      </div>

      <div className="text-[10px] font-bold text-emerald-400 mt-1">
        Galton Board: Binomial distribution converging
      </div>
    </div>
  );
}

/* ─── 16. Coordinate Clash Visual (Coordinate Geometry) ─── */
function CoordinateClashVisual({ problem }: { problem: any }) {
  // Try parsing coordinates from points p1/p2 or equation
  const p1 = problem.p1 || [3, 2];
  const p2 = problem.p2 || [-2, -3];

  return (
    <div className="w-full h-56 bg-sky-950/15 border border-sky-500/20 rounded-3xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-2 left-4 text-xs font-bold text-sky-400/50 uppercase">Grid Target Sweep</div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.06),transparent)] pointer-events-none" />

      {/* Grid Canvas with Coordinate Axes and target locked crosshair */}
      <div className="w-32 h-32 rounded-full border border-sky-500/30 bg-black/40 relative flex items-center justify-center mb-1 overflow-hidden">
        {/* Radar concentric circles */}
        <div className="absolute w-28 h-28 rounded-full border border-sky-500/10" />
        <div className="absolute w-16 h-16 rounded-full border border-sky-500/15" />
        <div className="absolute w-8 h-8 rounded-full border border-sky-500/20" />

        {/* Coordinate Axes */}
        <div className="absolute w-full h-[1px] bg-sky-500/30" />
        <div className="absolute h-full w-[1px] bg-sky-500/30" />

        {/* Radar Sweeping line */}
        <motion.div 
          className="absolute w-1/2 h-[1.5px] bg-sky-400 origin-left left-1/2 top-1/2"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
          style={{ transformOrigin: '0% 0%' }}
        />

        {/* Target locked point */}
        <motion.div
          className="w-3.5 h-3.5 rounded-full border-2 border-red-500 absolute flex items-center justify-center"
          style={{
            left: `${50 + p1[0] * 8 - 7}px`,
            bottom: `${50 + p1[1] * 8 - 7}px`,
          }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <div className="w-1 h-1 bg-red-400 rounded-full" />
        </motion.div>
      </div>

      <div className="text-[10px] font-extrabold text-sky-300">
        Radar Target Lock coordinates: <span className="text-white">({p1[0]}, {p1[1]})</span>
      </div>
    </div>
  );
}

/* ─── 17. Essay Engine Visual (Writing Structure) ─── */
function EssayEngineVisual({ problem }: { problem: any }) {
  return (
    <div className="w-full h-56 bg-orange-950/10 border border-orange-500/20 rounded-3xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-2 left-4 text-xs font-bold text-orange-400/50 uppercase">Paragraph Structurer</div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.04),transparent)] pointer-events-none" />

      <div className="flex gap-4 items-center justify-center w-full h-28 mb-1">
        {/* Paragraph Blocks stacking */}
        <div className="flex flex-col gap-1.5 w-24">
          {['Introduction', 'Body Paragraph', 'Conclusion'].map((block: string, idx: number) => (
            <motion.div
              key={idx}
              className="py-1 bg-orange-500/15 border border-orange-400/30 rounded text-[9px] font-extrabold text-white text-center shadow"
              initial={{ scale: 0.8, x: -20, opacity: 0 }}
              animate={{ scale: 1, x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.2 + 0.4, type: 'spring' }}
            >
              {block}
            </motion.div>
          ))}
        </div>

        {/* Rotating Mechanical Gears */}
        <div className="relative w-16 h-16">
          <motion.div
            className="text-4xl absolute -top-1 -left-1 opacity-40 select-none"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
          >
            ⚙️
          </motion.div>
          <motion.div
            className="text-3xl absolute -bottom-1 -right-1 opacity-40 select-none"
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
          >
            ⚙️
          </motion.div>
        </div>
      </div>

      <div className="text-xs font-bold text-orange-400 mt-2">
        Paragraph layout engine aligning structure
      </div>
    </div>
  );
}

/* ─── 18. Rhetoric Arena Visual (Persuasive Writing) ─── */
function RhetoricArenaVisual({ problem }: { problem: any }) {
  return (
    <div className="w-full h-56 bg-red-950/10 border border-red-500/20 rounded-3xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-2 left-4 text-xs font-bold text-red-400/50 uppercase">Debate Arena Podium</div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.05),transparent)] pointer-events-none" />

      {/* Roman pillars and balance scale */}
      <div className="flex justify-around items-end w-full max-w-[240px] h-28 border-b-2 border-stone-400 pb-0.5 relative">
        {/* Roman Pillar Left */}
        <div className="w-5 h-20 bg-stone-300 border border-stone-400 flex flex-col justify-between p-[1px] rounded-t-sm shadow">
          <div className="h-1 bg-stone-400 w-full" />
          <div className="h-1 bg-stone-400 w-full" />
        </div>

        {/* Rhetoric Balance Scale */}
        <div className="flex flex-col items-center relative w-24 h-24 mb-1">
          <div className="w-0.5 h-16 bg-white/30" />
          {/* Balanced Beam */}
          <motion.div 
            className="w-18 h-0.5 bg-red-400 absolute top-4 flex justify-between px-1"
            animate={{ rotate: [-4, 4, -4] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          >
            {/* Left plate */}
            <div className="w-4 h-6 border-x border-b border-red-500/50 bg-red-500/10 rounded-b-md -mt-0.5 flex items-center justify-center text-[6px]">Ethos</div>
            {/* Right plate */}
            <div className="w-4 h-6 border-x border-b border-red-500/50 bg-red-500/10 rounded-b-md -mt-0.5 flex items-center justify-center text-[6px]">Logos</div>
          </motion.div>
        </div>

        {/* Roman Pillar Right */}
        <div className="w-5 h-20 bg-stone-300 border border-stone-400 flex flex-col justify-between p-[1px] rounded-t-sm shadow">
          <div className="h-1 bg-stone-400 w-full" />
          <div className="h-1 bg-stone-400 w-full" />
        </div>
      </div>

      <div className="text-xs font-bold text-red-300 mt-2">
        Persuasive Balance: Balancing logical and ethical appeal
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ⚡ HIGH SCHOOL GAMES
   ───────────────────────────────────────────────────────────────────────────── */

/* ─── 19. Trig Tower Visual (Trigonometry) ─── */
function TrigTowerVisual({ problem }: { problem: any }) {
  return (
    <div className="w-full h-56 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-2 left-4 text-xs font-bold text-white/30 uppercase">Trigonometry wheel</div>

      <div className="flex gap-4 items-center justify-center w-full h-28 mb-1">
        {/* Rotating Wheel */}
        <div className="w-24 h-24 rounded-full border border-white/20 bg-white/5 relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-dashed border-white/10" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
            className="w-full h-full absolute inset-0 flex items-center justify-center"
          >
            {/* Spoke line */}
            <div className="w-1/2 h-[1.5px] bg-white/30 absolute left-1/2 origin-left" />
            {/* Rider */}
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 absolute right-0 shadow-[0_0_8px_cyan]" />
          </motion.div>
        </div>

        {/* Traced sine wave */}
        <div className="w-32 h-24 bg-black/40 border border-white/10 rounded-xl relative overflow-hidden flex items-center justify-center">
          <svg className="w-full h-full absolute inset-0">
            <path
              d={Array.from({ length: 60 }).map((_, idx) => {
                const t = idx / 60;
                const x = t * 120 + 4;
                const y = 48 - 24 * Math.sin(t * Math.PI * 4);
                return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              stroke="cyan"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
      </div>

      <div className="text-xs font-bold text-cyan-300">
        Sine wave height mapped continuously
      </div>
    </div>
  );
}

/* ─── 20. Matrix Maze Visual (Matrices & Linear Algebra) ─── */
function MatrixMazeVisual({ problem }: { problem: any }) {
  return (
    <div className="w-full h-56 bg-purple-950/20 border border-purple-500/20 rounded-3xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-2 left-4 text-xs font-bold text-purple-400/50 uppercase">Matrix Basis Transformation</div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.06),transparent)] pointer-events-none" />

      {/* Coordinate Grid with basis vectors transforming */}
      <div className="w-28 h-28 bg-black/50 border border-white/10 rounded-xl relative flex items-center justify-center mb-1">
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 opacity-[0.06]">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="border border-white" />
          ))}
        </div>

        <svg className="w-full h-full absolute inset-0 text-purple-400" viewBox="0 0 100 100">
          <g stroke="currentColor" strokeWidth="2.5">
            {/* Transformed basis i_hat (rotating) */}
            <motion.line
              x1="50" y1="50"
              animate={{
                x2: [50 + 25, 50 + 15, 50 - 15, 50 + 25],
                y2: [50, 50 - 20, 50 + 20, 50]
              }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              stroke="#fbbf24"
            />
            {/* Transformed basis j_hat */}
            <motion.line
              x1="50" y1="50"
              animate={{
                x2: [50, 50 + 20, 50 - 10, 50],
                y2: [50 - 25, 50 - 15, 50 + 15, 50 - 25]
              }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              stroke="#0ea5e9"
            />
          </g>
          {/* Dot at origin */}
          <circle cx="50" cy="50" r="2" fill="white" />
        </svg>
      </div>

      <div className="text-[10px] font-bold text-purple-300">
        Linear Map: transforming standard basis vectors
      </div>
    </div>
  );
}

/* ─── 21. Limit Launcher Visual (Limits & Continuity) ─── */
function LimitLauncherVisual({ problem }: { problem: any }) {
  return (
    <div className="w-full h-56 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-2 left-4 text-xs font-bold text-white/30 uppercase">Limit Convergence</div>

      <div className="relative w-full h-28 bg-black/40 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center mb-1">
        {/* Draw bridge curves with a missing gap in center */}
        <svg className="w-full h-full absolute inset-0">
          <path d="M 10 70 Q 70 30 115 50" stroke="#f43f5e" strokeWidth="3.5" fill="none" />
          <path d="M 125 50 Q 170 70 270 30" stroke="#f43f5e" strokeWidth="3.5" fill="none" />
          <circle cx="120" cy="50" r="4" fill="black" stroke="#f43f5e" strokeWidth="2" />
        </svg>

        {/* Two rockets flying to the gap from opposite sides */}
        <motion.div
          animate={{ x: [0, 85, 0], y: [0, -16, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="absolute left-10 bottom-8 text-xl"
        >
          🚀
        </motion.div>
        <motion.div
          animate={{ x: [0, -95, 0], y: [0, 16, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="absolute right-10 top-6 text-xl rotate-180"
        >
          🚀
        </motion.div>
      </div>

      <div className="text-xs font-bold text-rose-300">
        Rockets approaching the limit gap from both sides
      </div>
    </div>
  );
}

/* ─── 22. Stats Showdown Visual (Advanced Statistics) ─── */
function StatsShowdownVisual({ problem }: { problem: any }) {
  return (
    <div className="w-full h-56 bg-emerald-950/20 border border-emerald-500/20 rounded-3xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-2 left-4 text-xs font-bold text-emerald-400/50 uppercase">Gaussian Shading</div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06),transparent)] pointer-events-none" />

      {/* Bell curve graphic */}
      <div className="w-full h-28 relative flex items-center justify-center overflow-hidden mb-1">
        <svg className="w-full h-full max-w-[260px] text-emerald-400" viewBox="0 0 100 60">
          {/* Shaded standard deviation area */}
          <motion.path
            d="M 35 50 Q 50 15 65 50 Z"
            fill="rgba(16,185,129,0.25)"
            stroke="none"
            animate={{ opacity: [0.15, 0.4, 0.15] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          />

          {/* Normal Curve Line */}
          <path
            d="M 10 50 Q 30 50 35 50 Q 50 15 65 50 Q 70 50 90 50"
            stroke="currentColor"
            strokeWidth="2.5"
            fill="none"
          />

          {/* Mean divider */}
          <line x1="50" y1="18" x2="50" y2="50" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeDasharray="2,2" />
          <text x="48" y="14" fill="white" fontSize="4.5" fontWeight="bold">μ</text>
        </svg>
      </div>

      <div className="text-xs font-bold text-emerald-300">
        Normal distribution standard deviations shaded
      </div>
    </div>
  );
}

/* ─── 23. Lit Labyrinth Visual (Literary Analysis) ─── */
function LitLabyrinthVisual({ problem }: { problem: any }) {
  return (
    <div className="w-full h-56 bg-purple-950/10 border border-purple-500/20 rounded-3xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-2 left-4 text-xs font-bold text-purple-400/50 uppercase">Labyrinth passage</div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.04),transparent)] pointer-events-none" />

      {/* Top down bookshelf maze pathway */}
      <div className="w-28 h-28 bg-black/40 border border-white/10 rounded-xl relative overflow-hidden flex items-center justify-center mb-1">
        {/* Draw maze walls */}
        <div className="absolute inset-x-2 top-2 h-[2px] bg-purple-900/40" />
        <div className="absolute inset-x-6 top-8 h-[2px] bg-purple-900/40" />
        <div className="absolute inset-x-2 bottom-2 h-[2px] bg-purple-900/40" />
        <div className="absolute left-6 inset-y-6 w-[2px] bg-purple-900/40" />
        <div className="absolute right-6 inset-y-6 w-[2px] bg-purple-900/40" />

        {/* Glowing Lantern sprite floating along pathway */}
        <motion.div
          animate={{
            x: [-35, 35, 35, -35, -35],
            y: [-35, -35, 35, 35, -35],
          }}
          transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
          className="absolute text-2xl drop-shadow-[0_0_8px_#a855f7] pointer-events-none select-none"
        >
          🏮
        </motion.div>
      </div>

      <div className="text-[10px] font-bold text-purple-300">
        Navigating context clues inside literary labyrinth
      </div>
    </div>
  );
}

/* ─── 24. Debate Dojo Visual (Argumentation) ─── */
function DebateDojoVisual({ problem }: { problem: any }) {
  return (
    <div className="w-full h-56 bg-red-950/10 border border-red-500/20 rounded-3xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-2 left-4 text-xs font-bold text-red-400/50 uppercase">Debate Shield Dojo</div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.05),transparent)] pointer-events-none" />

      {/* Dojo mat with training dummy hit by scroll */}
      <div className="w-full h-28 relative flex items-center justify-center overflow-hidden mb-1">
        {/* Dojo Training Dummy */}
        <motion.div 
          className="text-6xl z-10"
          animate={{
            rotate: [-2, 2, -2],
          }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          🥋
        </motion.div>

        {/* Scroll throwing impact */}
        <motion.div
          className="text-3xl absolute z-20"
          animate={{
            x: [-120, 0, 120],
            y: [30, -5, -40],
            opacity: [0, 1, 0],
            rotate: [0, 360, 720]
          }}
          transition={{ repeat: Infinity, duration: 3.5, ease: 'easeOut' }}
        >
          📜
        </motion.div>
      </div>

      <div className="text-xs font-bold text-red-300">
        Deconstruct opposing rhetoric arguments
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   🎓 UNIVERSITY GAMES
   ───────────────────────────────────────────────────────────────────────────── */

/* ─── 25. Calculus Cascade Visual (Riemann Area Sum) ─── */
function CalculusCascadeVisual({ problem }: { problem: any }) {
  return (
    <div className="w-full h-56 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-2 left-4 text-xs font-bold text-white/30 uppercase">Riemann Area Sum</div>

      <div className="flex gap-4 items-center justify-center w-full h-28 mb-1">
        {/* Graph */}
        <div className="w-36 h-24 bg-black/40 border border-white/10 rounded-xl relative overflow-hidden">
          <svg className="w-full h-full absolute inset-0">
            {/* Draw Riemann rects */}
            {Array.from({ length: 8 }).map((_, i) => {
              const rectWidth = 12;
              const xStart = 10 + i * 15;
              const height = 15 + Math.sin(i * 0.8) * 15 + 10;
              return (
                <motion.rect
                  key={i}
                  x={xStart}
                  y={80 - height}
                  width={rectWidth}
                  height={height}
                  fill="rgba(14, 165, 233, 0.3)"
                  stroke="rgba(14, 165, 233, 0.6)"
                  strokeWidth="1.5"
                  animate={{ height: [height, height * 1.3, height] }}
                  transition={{ repeat: Infinity, duration: 4, delay: i * 0.2 }}
                />
              );
            })}
            {/* Limit Curve */}
            <path d="M 10 65 Q 60 30 130 50" stroke="#0ea5e9" strokeWidth="2.5" fill="none" />
          </svg>
        </div>

        {/* Vase filler */}
        <div className="w-14 h-24 bg-white/5 border border-white/10 rounded-b-xl relative overflow-hidden flex flex-col justify-end">
          <motion.div
            animate={{ height: ['20%', '80%', '20%'] }}
            transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
            className="w-full bg-cyan-500/30 border-t border-cyan-400"
          />
        </div>
      </div>

      <div className="text-xs font-bold text-sky-300">
        Integration area maps to volume accumulation
      </div>
    </div>
  );
}

/* ─── 26. Proof Architect Visual (Formal Proofs) ─── */
function ProofArchitectVisual({ problem }: { problem: any }) {
  return (
    <div className="w-full h-56 bg-indigo-950/10 border border-indigo-500/20 rounded-3xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-2 left-4 text-xs font-bold text-indigo-400/50 uppercase">Architect blueprint</div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.04),transparent)] pointer-events-none" />

      {/* Blueprint drawing geometric proofs */}
      <div className="w-28 h-28 bg-blue-900/30 border border-indigo-500/30 rounded-xl relative overflow-hidden flex items-center justify-center mb-1">
        <svg className="w-full h-full text-indigo-300" viewBox="0 0 100 100">
          {/* Concentric blueprint lines */}
          <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <circle cx="50" cy="50" r="25" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          
          {/* Right triangle proofs */}
          <motion.polygon
            points="25,75 75,75 75,25"
            fill="rgba(99,102,241,0.1)"
            stroke="currentColor"
            strokeWidth="1.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ repeat: Infinity, duration: 5, ease: 'linear' }}
          />

          {/* Mechanical compass needle tracing */}
          <motion.line
            x1="50" y1="50"
            animate={{
              x2: [25, 75, 75, 25],
              y2: [75, 75, 25, 75]
            }}
            transition={{ repeat: Infinity, duration: 5, ease: 'linear' }}
            stroke="yellow"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      <div className="text-xs font-bold text-indigo-300">
        Theorem constructions rendered dynamically
      </div>
    </div>
  );
}

/* ─── 27. Abstract Arena Visual (Rotating Triangle) ─── */
function AbstractArenaVisual({ problem }: { problem: any }) {
  return (
    <div className="w-full h-56 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-2 left-4 text-xs font-bold text-white/30 uppercase">Group Symmetry Symmetries</div>

      <div className="w-28 h-28 bg-black/40 border border-white/10 rounded-xl relative flex items-center justify-center mb-1">
        {/* Silhouette */}
        <div className="absolute w-20 h-20 border-2 border-dashed border-white/15 rotate-[180deg]" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />

        {/* Rotating equilateral triangle */}
        <motion.div
          animate={{ rotate: [0, 120, 240, 360] }}
          transition={{
            repeat: Infinity,
            duration: 9,
            ease: 'easeInOut',
          }}
          className="w-20 h-20 bg-orange-500/30 border-2 border-orange-400 relative flex items-center justify-center"
          style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
        >
          <span className="absolute top-0 text-[10px] font-extrabold text-white">A</span>
          <span className="absolute bottom-0 left-1 text-[10px] font-extrabold text-white">B</span>
          <span className="absolute bottom-0 right-1 text-[10px] font-extrabold text-white">C</span>
        </motion.div>
      </div>

      <div className="text-xs font-bold text-orange-300">
        Rotations of 120° preserve triangular symmetry
      </div>
    </div>
  );
}

/* ─── 28. Diff Eq Duel Visual (Differential Equations) ─── */
function DiffEqDuelVisual({ problem }: { problem: any }) {
  return (
    <div className="w-full h-56 bg-red-950/10 border border-red-500/20 rounded-3xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-2 left-4 text-xs font-bold text-red-400/50 uppercase">Oscillating spring duel</div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.05),transparent)] pointer-events-none" />

      {/* Two spring-mass oscillators bouncing at different frequencies */}
      <div className="flex gap-8 justify-center items-start w-full h-28 pt-2 mb-1">
        {/* Oscillator 1 */}
        <div className="flex flex-col items-center relative w-12 h-24">
          <svg className="w-full h-16 text-red-400" viewBox="0 0 20 60">
            {/* Draw a coiled spring */}
            <motion.path
              d="M 10 0 L 10 5 L 5 10 L 15 15 L 5 20 L 15 25 L 5 30 L 15 35 L 10 40 L 10 45"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              animate={{
                scaleY: [0.7, 1.3, 0.7],
              }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              style={{ originY: 0 }}
            />
          </svg>
          {/* Mass block */}
          <motion.div
            className="w-8 h-6 bg-red-600/35 border border-red-400 rounded flex items-center justify-center text-[8px] font-bold"
            animate={{
              y: [-12, 12, -12],
            }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            y1(t)
          </motion.div>
        </div>

        {/* Oscillator 2 */}
        <div className="flex flex-col items-center relative w-12 h-24">
          <svg className="w-full h-16 text-yellow-400" viewBox="0 0 20 60">
            {/* Spring 2 */}
            <motion.path
              d="M 10 0 L 10 5 L 5 10 L 15 15 L 5 20 L 15 25 L 5 30 L 15 35 L 10 40 L 10 45"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              animate={{
                scaleY: [1.2, 0.8, 1.2],
              }}
              transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
              style={{ originY: 0 }}
            />
          </svg>
          {/* Mass block 2 */}
          <motion.div
            className="w-8 h-6 bg-yellow-600/35 border border-yellow-400 rounded flex items-center justify-center text-[8px] font-bold"
            animate={{
              y: [10, -10, 10],
            }}
            transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
          >
            y2(t)
          </motion.div>
        </div>
      </div>

      <div className="text-xs font-bold text-red-300">
        Coupled spring-mass harmonic displacement curves
      </div>
    </div>
  );
}

/* ─── 29. Thesis Forge Visual (Academic Writing) ─── */
function ThesisForgeVisual({ problem }: { problem: any }) {
  return (
    <div className="w-full h-56 bg-amber-950/10 border border-amber-500/20 rounded-3xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-2 left-4 text-xs font-bold text-amber-500/50 uppercase">Academic Paper Forge</div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(234,179,8,0.05),transparent)] pointer-events-none" />

      {/* Blacksmith anvil with hammer striking it */}
      <div className="w-full h-28 relative flex items-center justify-center mb-1">
        {/* Anvil shape */}
        <div className="text-6xl z-10 select-none pointer-events-none">🧱</div>
        
        {/* Sheet of paper being forged */}
        <motion.div
          className="absolute w-12 h-16 bg-white/10 border border-white/20 rounded shadow p-1 flex flex-col gap-0.5 justify-around"
          animate={{ scale: [0.95, 1.05, 0.95] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          style={{ transform: 'rotate(15deg) translateY(-8px)' }}
        >
          <div className="h-1 bg-white/30 w-full" />
          <div className="h-1 bg-white/30 w-4/5" />
          <div className="h-1 bg-white/30 w-full" />
        </motion.div>

        {/* Hammer striking */}
        <motion.span
          className="text-4xl absolute z-20 pointer-events-none select-none"
          animate={{
            rotate: [0, -35, 0],
            y: [-15, -25, -15],
            x: [15, 20, 15]
          }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          style={{ transformOrigin: 'bottom left' }}
        >
          🔨
        </motion.span>
      </div>

      <div className="text-xs font-bold text-amber-300">
        Forging academic argument structures
      </div>
    </div>
  );
}

/* ─── 30. Critical Lens Visual (Critical Theory) ─── */
function CriticalLensVisual({ problem }: { problem: any }) {
  return (
    <div className="w-full h-56 bg-teal-950/10 border border-teal-500/20 rounded-3xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-2 left-4 text-xs font-bold text-teal-400/50 uppercase">Thematic Prism Lens</div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.05),transparent)] pointer-events-none" />

      {/* Light prism refracting white beam into layered spectrum */}
      <div className="w-full h-28 relative flex items-center justify-center mb-1">
        <svg className="w-full h-full max-w-[260px] text-teal-400" viewBox="0 0 100 60">
          {/* White light beam entering */}
          <line x1="5" y1="30" x2="40" y2="30" stroke="white" strokeWidth="2" />

          {/* Prism shape */}
          <polygon points="50,10 35,45 65,45" fill="rgba(20,184,166,0.15)" stroke="currentColor" strokeWidth="1.5" />
          
          {/* Refracted spectrum beams exit */}
          <g opacity="0.6">
            <line x1="52" y1="31" x2="90" y2="15" stroke="#ec4899" strokeWidth="1.5" /> {/* Gender */}
            <line x1="52" y1="32" x2="90" y2="30" stroke="#f59e0b" strokeWidth="1.5" /> {/* Class */}
            <line x1="52" y1="33" x2="90" y2="45" stroke="#3b82f6" strokeWidth="1.5" /> {/* Race */}
          </g>

          {/* Lens labels */}
          <text x="76" y="12" fill="#ec4899" fontSize="4.5" fontWeight="bold">Gender</text>
          <text x="76" y="27" fill="#f59e0b" fontSize="4.5" fontWeight="bold">Class</text>
          <text x="76" y="42" fill="#3b82f6" fontSize="4.5" fontWeight="bold">Race</text>
        </svg>
      </div>

      <div className="text-[10px] font-bold text-teal-300">
        Refracting literary passages through critical theoretical lenses
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   🚂 DEFAULT GENERIC VISUALIZER
   ───────────────────────────────────────────────────────────────────────────── */

/* ─── Default Sentence Train Visual (English / Generic) ─── */
function SentenceTrainVisual({ problem }: { problem: any }) {
  return (
    <div className="w-full h-56 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-2 left-4 text-xs font-bold text-white/30 uppercase">Grammar Train</div>

      <div className="w-full h-20 bg-black/40 border border-white/10 rounded-xl relative overflow-hidden flex items-center px-4 mb-2">
        {/* Tracks */}
        <div className="absolute inset-x-0 h-1 border-y border-dashed border-white/20 top-1/2 -translate-y-1/2" />

        {/* Steam train moving across tracks */}
        <motion.div
          animate={{ x: [-40, 240, -40] }}
          transition={{
            repeat: Infinity,
            duration: 8,
            ease: 'easeInOut',
          }}
          className="text-3xl z-10 pointer-events-none select-none"
        >
          🚂
        </motion.div>
      </div>

      <div className="text-xs font-bold text-cyan-300">
        Conjunction slots complete the train tracks
      </div>
    </div>
  );
}
