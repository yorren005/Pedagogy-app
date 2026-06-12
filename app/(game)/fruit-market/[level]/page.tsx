"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useGameStore } from "@/lib/store";
import { useTTS } from "@/lib/useTTS";
import { motion, AnimatePresence } from "framer-motion";
import GameShell from "@/components/GameShell";
import { AnswerOptions } from "@/components/AnswerOptions";
import { LevelComplete, ComboIndicator } from "@/components/Celebrations";
import { WrongShake, ConfettiBurst } from "@/components/Particles";
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

export default function FruitMarketLevel() {
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

  const difficulty = zoneDifficulties.fruitMarket;
  const learnerState = zoneLearnerStates.fruitMarket;

  const totalRounds = getRoundsPerLevel(levelNum);
  const mechanic = getMechanicForLevel(levelNum);

  // Level Gameplay State
  const [currentRound, setCurrentRound] = useState(0);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [draggedCount, setDraggedCount] = useState(0);
  const [draggedIds, setDraggedIds] = useState<number[]>([]);
  const [fillInAnswer, setFillInAnswer] = useState("");
  const [gamePhase, setGamePhase] = useState<"playing" | "complete">("playing");
  const [showWrong, setShowWrong] = useState(false);
  const [showSuccessFlash, setShowSuccessFlash] = useState(false);

  // Performance tracking
  const [roundErrors, setRoundErrors] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [comboMax, setComboMax] = useState(0);
  const [timesTaken, setTimesTaken] = useState<number[]>([]);
  const roundStartTime = useRef<number>(Date.now());

  // End level calculations
  const [finalStars, setFinalStars] = useState(0);
  const [finalXP, setFinalXP] = useState(0);
  const [finalCoins, setFinalCoins] = useState(0);

  // Load problem on mount or round change
  useEffect(() => {
    if (gamePhase === "playing") {
      const prob = generateProblem("addition", levelNum, difficulty);
      setProblem(prob);
      setDraggedCount(0);
      setDraggedIds([]);
      setFillInAnswer("");
      setShowWrong(false);
      setShowSuccessFlash(false);
      setRoundErrors(0);
      roundStartTime.current = Date.now();
    }
  }, [currentRound, gamePhase, levelNum, difficulty]);

  const speakRef = useRef(speak);
  useEffect(() => {
    speakRef.current = speak;
  }, [speak]);

  useEffect(() => {
    if (problem) {
      speakRef.current(`${problem.a} plus ${problem.b}`);
    }
  }, [problem]);

  if (!problem) return null;

  // Determine actual round mechanic (mixed can be choice or fillin)
  const activeMechanic =
    mechanic === "mixed"
      ? (problem.missingPosition ? "fillin" : "choice")
      : mechanic;

  const handleCorrect = () => {
    speak("Correct!");
    setShowSuccessFlash(true);
    incrementCombo();
    setComboMax((prev) => Math.max(prev, comboStreak + 1));
    setCorrectAnswers((prev) => prev + 1);

    const timeTaken = Date.now() - roundStartTime.current;
    setTimesTaken((prev) => [...prev, timeTaken]);

    // Process RL Engine update
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

    // Temporarily apply next difficulty/state updates at the end of the level
    setTimeout(() => {
      if (currentRound + 1 >= totalRounds) {
        // End Level
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

        // Save progress to store
        addStars(starRating.stars);
        addCoins(earnedCoins);
        addXP(earnedXP);
        setStarRating("fruitMarket", levelNum, starRating.stars);
        unlockNextLevel("fruitMarket", levelNum);
        updateZoneLearnerState("fruitMarket", rlResult.nextState);
        updateZoneDifficulty("fruitMarket", rlResult.nextDifficulty);

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

  // Drag and Drop Logic
  const handleDragEnd = (event: any, info: any, id: number) => {
    const dropZoneY = window.innerHeight * 0.55;
    if (info.point.y > dropZoneY) {
      if (!draggedIds.includes(id)) {
        const nextIds = [...draggedIds, id];
        setDraggedIds(nextIds);
        const nextCount = draggedCount + 1;
        setDraggedCount(nextCount);

        if (nextCount === problem.b) {
          handleCorrect();
        }
      }
    }
  };

  // Number Pad / Fill-in Logic
  const handleNumPadTap = (val: number) => {
    if (fillInAnswer.length < 3) {
      setFillInAnswer((prev) => prev + val);
    }
  };

  const handleClear = () => setFillInAnswer("");

  const handleCheckFillIn = () => {
    const ansNum = parseInt(fillInAnswer);
    const correctVal =
      problem.missingPosition === "a"
        ? problem.a
        : problem.missingPosition === "b"
        ? problem.b
        : problem.answer;

    if (ansNum === correctVal) {
      handleCorrect();
    } else {
      handleWrong();
      setFillInAnswer("");
    }
  };

  const displayEquation = () => {
    if (activeMechanic === "fillin") {
      return problem.equation;
    }
    return `${problem.a} + ${problem.b} = ?`;
  };

  return (
    <div className="flex-1 w-full relative">
      {showSuccessFlash && (
        <div className="fixed inset-0 pointer-events-none bg-green-500/20 z-30 transition-all duration-300 animate-pulse" />
      )}

      <GameShell
        zoneClass="zone-fruit text-white"
        backHref="/fruit-market"
        title="Fruit Market"
        levelNum={levelNum}
        equation={displayEquation()}
        currentRound={currentRound}
        totalRounds={totalRounds}
        comboStreak={comboStreak}
      >
        <WrongShake trigger={showWrong}>
          <div className="w-full max-w-md flex flex-col items-center">
            {/* 🍎 MECHANIC: DRAG AND DROP 🍎 */}
            {activeMechanic === "drag" && (
              <div className="w-full flex flex-col items-center">
                {/* Source Area: draggable fruits */}
                <div className="h-44 w-full flex items-center justify-center flex-wrap gap-4 p-4 bg-white/5 rounded-3xl border border-white/10 mb-6 relative">
                  <div className="absolute top-2 left-4 text-xs text-white/40 font-bold">
                    Drag the fruits to the basket below:
                  </div>
                  {Array.from({ length: problem.b }).map((_, i) => {
                    const isDragged = draggedIds.includes(i);
                    return (
                      <AnimatePresence key={i}>
                        {!isDragged && (
                          <motion.div
                            drag
                            dragSnapToOrigin
                            onDragEnd={(e, info) => handleDragEnd(e, info, i)}
                            className="text-6xl cursor-grab active:cursor-grabbing hover:scale-110 drop-shadow-md z-20"
                            whileDrag={{ scale: 1.2 }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                          >
                            🍎
                          </motion.div>
                        )}
                      </AnimatePresence>
                    );
                  })}
                </div>

                {/* Target Basket Area */}
                <div className="w-full h-56 bg-white/10 backdrop-blur-md border-2 border-dashed border-white/20 rounded-3xl flex flex-col items-center justify-center relative shadow-[inset_0_4px_20px_rgba(0,0,0,0.2)]">
                  <div className="flex flex-wrap justify-center gap-1.5 max-w-xs px-6 mb-2">
                    {/* Base items in basket (problem.a) */}
                    {Array.from({ length: problem.a }).map((_, i) => (
                      <span key={`base-${i}`} className="text-4xl opacity-40">
                        🍎
                      </span>
                    ))}
                    {/* Dropped items */}
                    {Array.from({ length: draggedCount }).map((_, i) => (
                      <motion.span
                        key={`dropped-${i}`}
                        initial={{ scale: 0, y: -40 }}
                        animate={{ scale: 1, y: 0 }}
                        className="text-4xl drop-shadow-md"
                      >
                        🍎
                      </motion.span>
                    ))}
                  </div>
                  <div className="text-8xl drop-shadow-lg select-none">🧺</div>
                  <div className="absolute bottom-3 text-xs font-bold text-white/50 bg-black/20 px-3 py-1 rounded-full">
                    Dropped: {draggedCount} / {problem.b}
                  </div>
                </div>
              </div>
            )}

            {/* 🍎 MECHANIC: MULTIPLE CHOICE 🍎 */}
            {activeMechanic === "choice" && (
              <div className="w-full flex flex-col items-center justify-center py-6">
                <div className="flex justify-center gap-2 mb-8">
                  {/* Visually show the items */}
                  <div className="flex flex-wrap max-w-xs justify-center gap-2 bg-white/5 p-6 rounded-3xl border border-white/10 shadow-inner">
                    {Array.from({ length: problem.a }).map((_, i) => (
                      <span key={`a-${i}`} className="text-4xl">🍎</span>
                    ))}
                    <span className="text-3xl text-white/40 self-center mx-1">+</span>
                    {Array.from({ length: problem.b }).map((_, i) => (
                      <span key={`b-${i}`} className="text-4xl">🍎</span>
                    ))}
                  </div>
                </div>

                <AnswerOptions
                  options={problem.options}
                  correctAnswer={problem.answer}
                  onAnswer={(isCorrect) => {
                    if (isCorrect) handleCorrect();
                    else handleWrong();
                  }}
                  accentColor="#ff6b81"
                />
              </div>
            )}

            {/* 🍎 MECHANIC: FILL IN THE BLANK 🍎 */}
            {activeMechanic === "fillin" && (
              <div className="w-full flex flex-col items-center">
                {/* Visual Grouping */}
                <div className="flex justify-center gap-2 mb-6">
                  <div className="flex flex-wrap max-w-xs justify-center gap-2 bg-white/5 p-4 rounded-3xl border border-white/10">
                    {Array.from({ length: problem.a }).map((_, i) => (
                      <span key={`a-${i}`} className="text-3xl">🍎</span>
                    ))}
                    <span className="text-2xl text-white/30 self-center">+</span>
                    {Array.from({ length: problem.b }).map((_, i) => (
                      <span key={`b-${i}`} className="text-3xl">🍎</span>
                    ))}
                  </div>
                </div>

                {/* Answer Screen */}
                <div className="w-48 h-18 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 mb-6 flex items-center justify-center text-4xl font-extrabold text-[#ff6b81] shadow-inner">
                  {fillInAnswer || <span className="opacity-20">?</span>}
                </div>

                {/* Number Pad */}
                <div className="grid grid-cols-4 gap-2.5 w-full">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                    <motion.button
                      key={num}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleNumPadTap(num)}
                      className="h-14 bg-white/5 border border-white/10 rounded-xl font-display text-2xl font-bold text-white/95 hover:bg-white/10 active:bg-white/15 transition-all shadow-md"
                    >
                      {num}
                    </motion.button>
                  ))}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClear}
                    className="h-14 bg-white/10 border border-white/15 rounded-xl font-display text-lg font-bold text-white/60 hover:bg-white/15 hover:text-white transition-all shadow-md"
                  >
                    Clear
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCheckFillIn}
                    disabled={!fillInAnswer}
                    className="h-14 bg-gradient-to-r from-[#ff6b81] to-[#ff4757] text-white rounded-xl font-display text-xl font-extrabold hover:brightness-110 disabled:opacity-40 disabled:hover:scale-100 shadow-md shadow-red-500/25"
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
          equation={`${problem.a} + ${problem.b} = ${problem.answer}`}
          onNext={() => router.push(`/fruit-market/${levelNum + 1}`)}
          onRetry={() => {
            // Reset level state
            setCurrentRound(0);
            setGamePhase("playing");
            setTotalErrors(0);
            setCorrectAnswers(0);
            setComboMax(0);
            setTimesTaken([]);
            roundStartTime.current = Date.now();
          }}
        />
      )}
    </div>
  );
}
