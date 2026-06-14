"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useGameStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import GameShell from "@/components/GameShell";
import { LevelComplete, ComboIndicator } from "@/components/Celebrations";
import { WrongShake, ConfettiBurst } from "@/components/Particles";
import { useTTS } from "@/lib/useTTS";
import {
  generateProblem,
  processPerformance,
  calculateStarRating,
  calculateXP,
  calculateCoins,
  getRoundsPerLevel,
  getMechanicForLevel,
  Problem,
  Difficulty,
  LearnerState,
} from "@/lib/rlEngine";

/* ─── Premium Fraction Options Component ───────────────────────────────────── */

interface FractionOption {
  numerator: number;
  denominator: number;
}

interface FractionOptionsProps {
  options: FractionOption[];
  correctAnswer: FractionOption;
  onAnswer: (isCorrect: boolean) => void;
  disabled?: boolean;
}

function FractionOptions({
  options,
  correctAnswer,
  onAnswer,
  disabled = false,
}: FractionOptionsProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answeredIndex, setAnsweredIndex] = useState<number | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

  const handleSelect = (idx: number, opt: FractionOption) => {
    if (disabled || answeredIndex !== null) return;
    setSelectedIndex(idx);
    setAnsweredIndex(idx);

    const isCorrect =
      opt.numerator === correctAnswer.numerator &&
      opt.denominator === correctAnswer.denominator;
    setIsAnswerCorrect(isCorrect);

    setTimeout(() => {
      onAnswer(isCorrect);
      // Reset local state after delay
      setSelectedIndex(null);
      setAnsweredIndex(null);
      setIsAnswerCorrect(null);
    }, isCorrect ? 500 : 700);
  };

  return (
    <div className="flex justify-center gap-6 mt-8 w-full max-w-sm">
      {options.map((opt, i) => {
        const isSelected = selectedIndex === i;
        const statusClass =
          isSelected && isAnswerCorrect !== null
            ? isAnswerCorrect
              ? "correct bg-emerald-500 border-emerald-400 shadow-emerald-500/50"
              : "wrong bg-rose-500 border-rose-400 shadow-rose-500/50"
            : "bg-orange-500/10 border-orange-500/40 text-orange-200 hover:bg-orange-500/20";

        return (
          <motion.button
            key={i}
            onClick={() => handleSelect(i, opt)}
            disabled={disabled || answeredIndex !== null}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 250,
              damping: 15,
              delay: i * 0.1,
            }}
            className={`answer-bubble flex-1 flex flex-col items-center justify-center p-4 border-3 rounded-2xl h-24 font-display transition-all ${statusClass}`}
          >
            <span className="text-2xl font-extrabold">{opt.numerator}</span>
            <div className="w-10 h-0.5 bg-current my-0.5 opacity-80" />
            <span className="text-xl font-bold">{opt.denominator}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

/* ─── Interactive Pizza SVG Component ───────────────────────────────────────── */

interface PizzaVisualProps {
  denominator: number;
  selectedSlices: boolean[];
  onSliceClick?: (index: number) => void;
  interactive?: boolean;
}

function PizzaVisual({
  denominator,
  selectedSlices,
  onSliceClick,
  interactive = false,
}: PizzaVisualProps) {
  const cx = 100;
  const cy = 100;
  const r = 80;

  const getSlicePath = (startAngleDeg: number, endAngleDeg: number) => {
    const startRad = (startAngleDeg * Math.PI) / 180;
    const endRad = (endAngleDeg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="relative w-64 h-64 select-none drop-shadow-2xl">
      {/* Plate / Crust shadow background */}
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Plate */}
        <circle cx="100" cy="100" r="95" fill="rgba(255, 255, 255, 0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
        <circle cx="100" cy="100" r="88" fill="rgba(0, 0, 0, 0.2)" />
        {/* Outer Crust */}
        <circle cx="100" cy="100" r="83" fill="#d97706" />

        {/* Slices */}
        {Array.from({ length: denominator }).map((_, i) => {
          const startAngle = -90 + (i * 360) / denominator;
          const endAngle = -90 + ((i + 1) * 360) / denominator;
          const pathD = getSlicePath(startAngle, endAngle);
          const isSelected = selectedSlices[i];

          // Middle angle for pepperoni placing
          const midAngle = startAngle + 180 / denominator;
          const rad = (midAngle * Math.PI) / 180;

          // Pepperoni positions
          const p1x = cx + r * 0.45 * Math.cos(rad - 0.1);
          const p1y = cy + r * 0.45 * Math.sin(rad - 0.1);
          const p2x = cx + r * 0.65 * Math.cos(rad + 0.15);
          const p2y = cy + r * 0.65 * Math.sin(rad + 0.15);

          return (
            <g
              key={i}
              className={interactive ? "cursor-pointer" : "pointer-events-none"}
              onClick={() => onSliceClick?.(i)}
            >
              {/* Cheese Slice */}
              <motion.path
                d={pathD}
                fill={isSelected ? "#f59e0b" : "#fbbf24"}
                stroke="#78350f"
                strokeWidth="2.5"
                strokeLinejoin="round"
                animate={{
                  scale: isSelected ? 1.04 : 1,
                  filter: isSelected
                    ? "drop-shadow(0 0 8px rgba(245, 158, 11, 0.6))"
                    : "drop-shadow(0 0 0px rgba(0,0,0,0))",
                }}
                whileHover={interactive ? { scale: 1.05 } : {}}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              />

              {/* Pepperoni dots on slice */}
              <motion.circle
                cx={p1x}
                cy={p1y}
                r="6"
                fill="#b91c1c"
                stroke="#7f1d1d"
                strokeWidth="1"
                animate={{ scale: isSelected ? 1.08 : 1 }}
              />
              <motion.circle
                cx={p2x}
                cy={p2y}
                r="5.5"
                fill="#b91c1c"
                stroke="#7f1d1d"
                strokeWidth="1"
                animate={{ scale: isSelected ? 1.08 : 1 }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ─── Main fractions Level Component ──────────────────────────────────────── */

export default function PizzaPartyLevel() {
  const params = useParams();
  const router = useRouter();
  const levelNum = parseInt(params.level as string) || 1;

  const { speak } = useTTS();

  const {
    zoneDifficulties,
    zoneLearnerStates,
    comboStreak,
    incrementCombo,
    resetCombo,
    addStars,
    addCoins,
    addXP,
    setStarRating,
    unlockNextLevel,
    updateZoneLearnerState,
    updateZoneDifficulty,
  } = useGameStore();

  const difficulty = zoneDifficulties.pizzaParty;
  const learnerState = zoneLearnerStates.pizzaParty;

  const totalRounds = getRoundsPerLevel(levelNum);
  const mechanic = getMechanicForLevel(levelNum);

  // Level Gameplay State
  const [currentRound, setCurrentRound] = useState(0);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [selectedSlices, setSelectedSlices] = useState<boolean[]>([]);
  const [fillInAnswer, setFillInAnswer] = useState("");
  const [gamePhase, setGamePhase] = useState<"playing" | "complete">("playing");
  const [showWrong, setShowWrong] = useState(false);
  const [showSuccessFlash, setShowSuccessFlash] = useState(false);
  const [activeMechanic, setActiveMechanic] = useState<string>("drag");

  // Distractors options for fractions mode
  const [fractionOptions, setFractionOptions] = useState<FractionOption[]>([]);

  // Performance tracking
  const [roundErrors, setRoundErrors] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [comboMax, setComboMax] = useState(0);
  const [timesTaken, setTimesTaken] = useState<number[]>([]);
  const roundStartTime = useRef<number>(Date.now());
  const lastSpokenRoundRef = useRef<number>(-1);

  // End level calculations
  const [finalStars, setFinalStars] = useState(0);
  const [finalXP, setFinalXP] = useState(0);
  const [finalCoins, setFinalCoins] = useState(0);

  // Load problem
  useEffect(() => {
    if (gamePhase === "playing") {
      const prob = generateProblem("fractions", levelNum, difficulty);
      setProblem(prob);
      setFillInAnswer("");
      setShowWrong(false);
      setShowSuccessFlash(false);
      setRoundErrors(0);
      roundStartTime.current = Date.now();

      // Resolve mechanic
      const resolvedMechanic =
        mechanic === "mixed"
          ? Math.random() > 0.5
            ? "fillin"
            : "choice"
          : mechanic;
      setActiveMechanic(resolvedMechanic);

      // Initialize selected slices (all false for drag/make, or pre-highlighted for choice/fillin)
      const denom = prob.fractionDenominator || 2;
      const numer = prob.fractionNumerator || 1;

      if (resolvedMechanic === "drag") {
        setSelectedSlices(Array(denom).fill(false));
      } else {
        // Highlight first 'numer' slices
        setSelectedSlices(
          Array.from({ length: denom }, (_, i) => i < numer)
        );
      }

      // Generate Fraction Options for choice mode
      if (prob.options) {
        const opts = prob.options.map((val) => ({
          numerator: val,
          denominator: denom,
        }));
        setFractionOptions(opts);
      }
    }
  }, [currentRound, gamePhase, levelNum, difficulty, mechanic]);

  // Speak prompt when problem or activeMechanic changes
  useEffect(() => {
    if (problem && gamePhase === "playing" && lastSpokenRoundRef.current !== currentRound) {
      lastSpokenRoundRef.current = currentRound;
      if (activeMechanic === "drag") {
        speak(`Make ${problem.fractionNumerator} over ${problem.fractionDenominator}`);
      } else {
        speak("What fraction is colored?");
      }
    }
  }, [problem, activeMechanic, gamePhase, currentRound, speak]);

  if (!problem) return null;

  const handleCorrect = () => {
    speak("Correct!");
    setShowSuccessFlash(true);
    incrementCombo();
    setComboMax((prev) => Math.max(prev, comboStreak + 1));
    setCorrectAnswers((prev) => prev + 1);

    const timeTaken = Date.now() - roundStartTime.current;
    setTimesTaken((prev) => [...prev, timeTaken]);

    // Process RL
    const rlResult = processPerformance(
      learnerState,
      {
        timeTakenMs: timeTaken,
        errorsMade: roundErrors,
        hintsUsed: 0,
        isCorrect: true,
      },
      comboStreak
    );

    setTimeout(() => {
      if (currentRound + 1 >= totalRounds) {
        const avgTime = timesTaken.reduce((a, b) => a + b, 0) / totalRounds;
        const starRating = calculateStarRating(
          totalRounds,
          correctAnswers + 1,
          totalErrors + roundErrors,
          0,
          avgTime
        );
        const earnedXP = calculateXP(starRating.stars, difficulty, comboMax, levelNum);
        const earnedCoins = calculateCoins(correctAnswers + 1, rlResult.comboMultiplier, starRating.stars);

        setFinalStars(starRating.stars);
        setFinalXP(earnedXP);
        setFinalCoins(earnedCoins);

        addStars(starRating.stars);
        addCoins(earnedCoins);
        addXP(earnedXP);
        setStarRating("pizzaParty", levelNum, starRating.stars);
        unlockNextLevel("pizzaParty", levelNum);
        updateZoneLearnerState("pizzaParty", rlResult.nextState);
        updateZoneDifficulty("pizzaParty", rlResult.nextDifficulty);

        setGamePhase("complete");
      } else {
        setCurrentRound((prev) => prev + 1);
      }
    }, 1000);
  };

  const handleWrong = () => {
    speak("Try again!");
    setShowWrong(true);
    resetCombo();
    setRoundErrors((prev) => prev + 1);
    setTotalErrors((prev) => prev + 1);

    setTimeout(() => {
      setShowWrong(false);
    }, 600);
  };

  // Slice Tap Selection (for drag/make fractions)
  const handleSliceClick = (index: number) => {
    if (activeMechanic !== "drag") return;

    const nextSelected = [...selectedSlices];
    nextSelected[index] = !nextSelected[index];
    setSelectedSlices(nextSelected);

    // Count selected
    const selectedCount = nextSelected.filter(Boolean).length;
    if (selectedCount === problem.fractionNumerator) {
      handleCorrect();
    }
  };

  // Number Pad / Fill-in Logic
  const handleNumPadTap = (val: number) => {
    if (fillInAnswer.length < 2) {
      setFillInAnswer((prev) => prev + val);
    }
  };

  const handleClear = () => setFillInAnswer("");

  const handleCheckFillIn = () => {
    const ansNum = parseInt(fillInAnswer);
    if (ansNum === problem.fractionNumerator) {
      handleCorrect();
    } else {
      handleWrong();
      setFillInAnswer("");
    }
  };

  const displayEquation = () => {
    if (activeMechanic === "drag") {
      const selectedCount = selectedSlices.filter(Boolean).length;
      return `Make ${problem.fractionNumerator}/${problem.fractionDenominator} of the pizza! (${selectedCount}/${problem.fractionDenominator})`;
    }
    if (activeMechanic === "fillin") {
      return `? / ${problem.fractionDenominator}`;
    }
    return `What fraction is colored?`;
  };

  return (
    <div className="flex-1 w-full relative">
      {showSuccessFlash && (
        <div className="fixed inset-0 pointer-events-none bg-green-500/20 z-30 transition-all duration-300 animate-pulse" />
      )}

      <GameShell
        zoneClass="zone-pizza text-white"
        backHref="/pizza-party"
        title="Pizza Party"
        levelNum={levelNum}
        equation={displayEquation()}
        currentRound={currentRound}
        totalRounds={totalRounds}
        comboStreak={comboStreak}
      
        lives={Math.max(0, 3 - totalErrors)}
        onReset={() => {
          setCurrentRound(0);
          setGamePhase("playing");
          setTotalErrors(0);
          setCorrectAnswers(0);
          setComboMax(0);
          setTimesTaken([]);
          roundStartTime.current = Date.now();
        }}
        slug="pizza-party"
        ageRange="elementary"
        problem={problem} >
        <WrongShake trigger={showWrong}>
          <div className="w-full max-w-md flex flex-col items-center">
            {/* Pizza Visual Card */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-8 flex flex-col items-center shadow-inner">
              <PizzaVisual
                denominator={problem.fractionDenominator || 2}
                selectedSlices={selectedSlices}
                onSliceClick={handleSliceClick}
                interactive={activeMechanic === "drag"}
              />
            </div>

            {/* 🍕 MECHANIC: TAP SLICES TO BUILD FRACTION 🍕 */}
            {activeMechanic === "drag" && (
              <div className="w-full text-center text-sm font-semibold text-white/50 bg-black/20 py-2.5 px-6 rounded-full">
                Tap the slices to select or unselect them!
              </div>
            )}

            {/* 🍕 MECHANIC: MULTIPLE CHOICE FRACTIONS 🍕 */}
            {activeMechanic === "choice" && (
              <FractionOptions
                options={fractionOptions}
                correctAnswer={{
                  numerator: problem.fractionNumerator || 1,
                  denominator: problem.fractionDenominator || 2,
                }}
                onAnswer={(isCorrect) => {
                  if (isCorrect) handleCorrect();
                  else handleWrong();
                }}
              />
            )}

            {/* 🍕 MECHANIC: FILL IN THE NUMERATOR 🍕 */}
            {activeMechanic === "fillin" && (
              <div className="w-full flex flex-col items-center animate-in fade-in">
                {/* Input Screen */}
                <div className="w-48 h-20 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 mb-6 flex flex-col items-center justify-center text-3xl font-extrabold text-[#ffa502] shadow-inner">
                  <span>{fillInAnswer || <span className="opacity-20">?</span>}</span>
                  <div className="w-16 h-0.5 bg-[#ffa502]/40 my-1" />
                  <span>{problem.fractionDenominator}</span>
                </div>

                {/* Number Pad */}
                <div className="grid grid-cols-4 gap-2.5 w-full">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                    <motion.button
                      key={num}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleNumPadTap(num)}
                      className="h-12 bg-white/5 border border-white/10 rounded-xl font-display text-xl font-bold text-white/95 hover:bg-white/10 active:bg-white/15 transition-all shadow-md"
                    >
                      {num}
                    </motion.button>
                  ))}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClear}
                    className="h-12 bg-white/10 border border-white/15 rounded-xl font-display text-base font-bold text-white/60 hover:bg-white/15 hover:text-white transition-all shadow-md"
                  >
                    Clear
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCheckFillIn}
                    disabled={!fillInAnswer}
                    className="h-12 bg-gradient-to-r from-[#ffa502] to-[#ff6348] text-white rounded-xl font-display text-lg font-extrabold hover:brightness-110 disabled:opacity-40 disabled:hover:scale-100 shadow-md shadow-orange-500/25"
                  >
                    Go!
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </WrongShake>
      </GameShell>

      <ComboIndicator combo={comboStreak} visible={comboStreak >= 2} />

      {/* Completion Celebration Overlay */}
      {gamePhase === "complete" && (
        <LevelComplete
          stars={finalStars}
          xpEarned={finalXP}
          coinsEarned={finalCoins}
          equation={`${problem.fractionNumerator}/${problem.fractionDenominator} Pizza Slices`}
          onNext={() => router.push(`/pizza-party/${levelNum + 1}`)}
          onRetry={() => {
            setCurrentRound(0);
            setGamePhase("playing");
            setTotalErrors(0);
            setCorrectAnswers(0);
            setComboMax(0);
            setTimesTaken([]);
            lastSpokenRoundRef.current = -1;
            roundStartTime.current = Date.now();
          }}
        />
      )}
    </div>
  );
}
