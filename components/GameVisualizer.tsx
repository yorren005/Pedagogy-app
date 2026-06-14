'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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
    case 'fruit-market':
      return <FruitMarketVisual key={animationTick} problem={problem} />;
    case 'the-picnic':
      return <PicnicVisual key={animationTick} problem={problem} />;
    case 'toy-factory':
      return <ToyFactoryVisual key={animationTick} problem={problem} />;
    case 'pizza-party':
      return <PizzaPartyVisual key={animationTick} problem={problem} />;
    case 'equation-quest':
      return <EquationQuestVisual key={animationTick} problem={problem} />;
    case 'shape-shift':
      return <ShapeShiftVisual key={animationTick} problem={problem} />;
    case 'ratio-rally':
      return <RatioRallyVisual key={animationTick} problem={problem} />;
    case 'function-forge':
      return <FunctionForgeVisual key={animationTick} problem={problem} />;
    case 'trig-tower':
      return <TrigTowerVisual key={animationTick} problem={problem} />;
    case 'limit-launcher':
      return <LimitLauncherVisual key={animationTick} problem={problem} />;
    case 'calculus-cascade':
      return <CalculusCascadeVisual key={animationTick} problem={problem} />;
    case 'abstract-arena':
      return <AbstractArenaVisual key={animationTick} problem={problem} />;
    default:
      return <SentenceTrainVisual key={animationTick} problem={problem} />;
  }
}

/* ─── 1. Fruit Market Visual (Addition) ─── */
function FruitMarketVisual({ problem }: { problem: any }) {
  const a = problem.a || 3;
  const b = problem.b || 2;

  return (
    <div className="w-full h-56 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-2 left-4 text-xs font-bold text-white/30 uppercase">Addition Visual</div>
      <div className="flex gap-2 mb-4 justify-center items-end h-28 relative w-full">
        {/* Render base apples (problem.a) already sitting in the basket */}
        {Array.from({ length: a }).map((_, i) => (
          <motion.span
            key={`base-${i}`}
            className="text-4xl drop-shadow-md select-none"
            initial={{ scale: 0, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: 'spring' }}
          >
            🍎
          </motion.span>
        ))}

        {/* Render adding apples (problem.b) dropping in sequentially */}
        {Array.from({ length: b }).map((_, i) => (
          <motion.span
            key={`drop-${i}`}
            className="text-4xl drop-shadow-md absolute select-none"
            initial={{ y: -120, x: i * 35 - (b * 17), opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              delay: a * 0.1 + i * 0.5 + 0.5,
              type: 'spring',
              stiffness: 100,
              damping: 10,
            }}
          >
            🍎
          </motion.span>
        ))}
      </div>
      <div className="text-6xl drop-shadow-lg select-none">🧺</div>
      <div className="mt-2 text-xs font-bold text-cyan-300">
        {a} + {b} = {a + b} Apples
      </div>
    </div>
  );
}

/* ─── 2. Picnic Visual (Subtraction) ─── */
function PicnicVisual({ problem }: { problem: any }) {
  const a = problem.a || 5;
  const b = problem.b || 2;
  const remaining = a - b;

  return (
    <div className="w-full h-56 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-2 left-4 text-xs font-bold text-white/30 uppercase">Subtraction Visual</div>
      
      <div className="flex gap-2.5 justify-center items-center h-28 w-full relative">
        {/* Remaining sandwiches */}
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

        {/* Sandwiches being stolen by ants */}
        {Array.from({ length: b }).map((_, i) => (
          <div key={`stolen-${i}`} className="relative flex flex-col items-center">
            {/* The sandwich */}
            <motion.span
              className="text-4xl drop-shadow-md absolute"
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{ x: 140, y: 0, opacity: 0 }}
              transition={{ delay: i * 0.6 + 1.2, duration: 1.5, ease: 'easeInOut' }}
            >
              🥪
            </motion.span>
            {/* The ant crawling in, grabbing, and walking off */}
            <motion.span
              className="text-2xl absolute"
              initial={{ x: 140, y: 15 }}
              animate={{ x: [140, 0, 140] }}
              transition={{ delay: i * 0.6 + 0.2, duration: 2.5, ease: 'easeInOut' }}
            >
              🐜
            </motion.span>
          </div>
        ))}
      </div>

      <div className="mt-2 text-xs font-bold text-red-300">
        {a} 🥪 minus {b} taken away = {remaining} remaining
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
                    delay: boxIdx * 0.4 + toyIdx * 0.15 + 0.5,
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
              transition={{ delay: boxIdx * 0.2 }}
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
                fill={isFilled ? 'rgba(239, 68, 68, 0.75)' : 'transparent'}
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.15 }}
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

/* ─── 5. Equation Quest Visual (Algebra) ─── */
function EquationQuestVisual({ problem }: { problem: any }) {
  const [solved, setSolved] = useState(false);
  const left = problem.visualScaleLeft || 'x + 3';
  const right = problem.visualScaleRight || '7';

  return (
    <div className="w-full h-56 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-2 left-4 text-xs font-bold text-white/30 uppercase">Algebra scale</div>

      <div className="flex justify-between items-center w-full max-w-sm h-32 relative px-4">
        {/* Left Side Pan */}
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="flex flex-col items-center justify-center bg-cyan-500/20 border-2 border-cyan-400/30 rounded-2xl p-2 w-28 h-18 shadow-lg"
        >
          <span className="text-[10px] font-bold text-cyan-300">Left Pan</span>
          <span className="text-sm font-extrabold text-white mt-0.5">{left}</span>
          <div className="flex gap-0.5 mt-1">
            📦
            {left.includes('+') && <span className="text-xs">⬜⬜</span>}
          </div>
        </motion.div>

        {/* Scale Pivot */}
        <div className="w-1.5 h-20 bg-white/20 rounded flex items-end justify-center">
          <div className="w-5 h-5 bg-cyan-500 rounded-full border-2 border-white/20 shadow-md" />
        </div>

        {/* Right Side Pan */}
        <motion.div
          animate={{ y: [0, 3, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', delay: 1.5 }}
          className="flex flex-col items-center justify-center bg-cyan-500/20 border-2 border-cyan-400/30 rounded-2xl p-2 w-28 h-18 shadow-lg"
        >
          <span className="text-[10px] font-bold text-cyan-300">Right Pan</span>
          <span className="text-sm font-extrabold text-white mt-0.5">{right}</span>
          <div className="flex gap-0.5 mt-1 flex-wrap justify-center max-w-[70px]">
            {Array.from({ length: Math.min(parseInt(right) || 5, 8) }).map((_, i) => (
              <span key={i} className="text-[8px]">⬜</span>
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

/* ─── 6. Shape Shift Visual (Geometry) ─── */
function ShapeShiftVisual({ problem }: { problem: any }) {
  return (
    <div className="w-full h-56 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-2 left-4 text-xs font-bold text-white/30 uppercase">Transformation loop</div>

      <div className="w-32 h-32 bg-black/40 border border-white/10 rounded-xl relative overflow-hidden flex items-center justify-center mb-1">
        {/* Draw a grid background */}
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-10">
          {Array.from({ length: 36 }).map((_, i) => (
            <div key={i} className="border border-white" />
          ))}
        </div>
        {/* Transforming triangle looping spin & translation */}
        <motion.div
          animate={{
            x: [0, 20, -20, 0],
            y: [0, -20, 20, 0],
            rotate: [0, 90, 270, 360],
          }}
          transition={{
            repeat: Infinity,
            duration: 8,
            ease: 'easeInOut',
          }}
          className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[24px] border-b-teal-400 relative"
        >
          <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[8px] font-bold text-black pointer-events-none">A</div>
        </motion.div>
      </div>

      <div className="text-xs font-bold text-teal-300">
        Slow-motion transformations loop
      </div>
    </div>
  );
}

/* ─── 7. Ratio Rally Visual (Ratios) ─── */
function RatioRallyVisual({ problem }: { problem: any }) {
  // Try to parse speed ratios, e.g. 3:5
  const ratioText = problem.equation?.includes('ratio') ? '3:5' : '2:3';
  const val1 = 2;
  const val2 = 3;

  return (
    <div className="w-full h-56 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-2 left-4 text-xs font-bold text-white/30 uppercase">Ratio Rally race</div>

      <div className="w-full h-24 bg-black/40 border border-white/10 rounded-xl relative flex flex-col justify-around p-2 mb-2">
        {/* Car 1 */}
        <div className="w-full h-8 relative border-b border-white/5 flex items-center">
          <motion.div
            animate={{ x: [0, 220, 0] }}
            transition={{
              repeat: Infinity,
              duration: 6 / val1,
              ease: 'linear',
            }}
            className="text-2xl absolute"
          >
            🏎️ <span className="text-[8px] text-orange-400 font-bold bg-black/60 px-1 rounded">Car A</span>
          </motion.div>
        </div>

        {/* Car 2 */}
        <div className="w-full h-8 relative flex items-center">
          <motion.div
            animate={{ x: [0, 220, 0] }}
            transition={{
              repeat: Infinity,
              duration: 6 / val2,
              ease: 'linear',
            }}
            className="text-2xl absolute"
          >
            🏎️ <span className="text-[8px] text-cyan-400 font-bold bg-black/60 px-1 rounded">Car B</span>
          </motion.div>
        </div>
      </div>

      <div className="text-xs font-bold text-orange-300">
        Speed Ratio - Car A vs Car B is {val1} : {val2}
      </div>
    </div>
  );
}

/* ─── 8. Function Forge Visual (Linear Ramp) ─── */
function FunctionForgeVisual({ problem }: { problem: any }) {
  // Parse slope and intercept if possible
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

/* ─── 9. Trig Tower Visual (Ferris Wheel) ─── */
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

/* ─── 10. Limit Launcher Visual (Broken Bridge) ─── */
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

/* ─── 11. Calculus Cascade Visual (Riemann Vase Filler) ─── */
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

/* ─── 12. Abstract Arena Visual (Rotating Triangle) ─── */
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

/* ─── 13. Default Sentence Train Visual (English / Generic) ─── */
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
