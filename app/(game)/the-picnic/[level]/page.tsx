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

export default function PicnicLevel() {
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

  const difficulty = zoneDifficulties.picnic;
  const learnerState = zoneLearnerStates.picnic;

  const totalRounds = getRoundsPerLevel(levelNum);
  const mechanic = getMechanicForLevel(levelNum);

  // Level Gameplay State
  const [currentRound, setCurrentRound] = useState(0);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [fedCount, setFedCount] = useState(0);
  const [eatenIds, setEatenIds] = useState<number[]>([]);
  const [flyingIds, setFlyingIds] = useState<number[]>([]);
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
      const prob = generateProblem("subtraction", levelNum, difficulty);
      setProblem(prob);
      setFedCount(0);
      setEatenIds([]);
      setFlyingIds([]);
      setFillInAnswer("");
      setShowWrong(false);
      setShowSuccessFlash(false);
      setRoundErrors(0);
      roundStartTime.current = Date.now();
    }
  }, [currentRound, gamePhase, levelNum, difficulty]);

  // Speak equation when a new problem loads
  useEffect(() => {
    if (problem && gamePhase === "playing") {
      speak(`${problem.a} minus ${problem.b}`);
    }
  }, [problem, gamePhase, speak]);

  if (!problem) return null;

  // Determine actual round mechanic
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
        setStarRating("picnic", levelNum, starRating.stars);
        unlockNextLevel("picnic", levelNum);
        updateZoneLearnerState("picnic", rlResult.nextState);
        updateZoneDifficulty("picnic", rlResult.nextDifficulty);

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

  // Drag and Drop (Fox feeding) logic: Tap-to-feed makes it slide to fox
  const handleFeedItem = (id: number) => {
    if (fedCount < problem.b && !eatenIds.includes(id) && !flyingIds.includes(id)) {
      setFlyingIds((prev) => [...prev, id]);

      // Trigger animation then munch
      setTimeout(() => {
        setFlyingIds((prev) => prev.filter((fid) => fid !== id));
        setEatenIds((prev) => [...prev, id]);
        const nextFed = fedCount + 1;
        setFedCount(nextFed);

        if (nextFed === problem.b) {
          handleCorrect();
        }
      }, 500);
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
      problem.missingPosition === "b" ? problem.b : problem.answer;

    if (ansNum === correctVal) {
      handleCorrect();
    } else {
      handleWrong();
      setFillInAnswer("");
    }
  };

  const displayEquation = () => {
    if (activeMechanic === "drag") {
      return `${problem.a} - ${fedCount} = ${problem.a - fedCount}`;
    }
    if (activeMechanic === "fillin") {
      return problem.equation;
    }
    return `${problem.a} - ${problem.b} = ?`;
  };

  return (
    <div className="flex-1 w-full relative">
      {showSuccessFlash && (
        <div className="fixed inset-0 pointer-events-none bg-green-500/20 z-30 transition-all duration-300 animate-pulse" />
      )}

      <GameShell
        zoneClass="zone-picnic text-white"
        backHref="/the-picnic"
        title="The Picnic"
        levelNum={levelNum}
        equation={displayEquation()}
        currentRound={currentRound}
        totalRounds={totalRounds}
        comboStreak={comboStreak}
      >
        <WrongShake trigger={showWrong}>
          <div className="w-full max-w-md flex flex-col items-center">
            {/* 🥪 MECHANIC: DRAG/FEED ANIMAL 🥪 */}
            {activeMechanic === "drag" && (
              <div className="w-full flex flex-col items-center">
                {/* Source Area: Picnic blanket with items */}
                <div className="h-44 w-full flex items-center justify-center flex-wrap gap-4 p-4 bg-white/5 rounded-3xl border border-white/10 mb-6 relative">
                  <div className="absolute top-2 left-4 text-xs text-white/40 font-bold">
                    Tap the sandwiches to feed the fox:
                  </div>
                  {Array.from({ length: problem.a }).map((_, i) => {
                    const isEaten = eatenIds.includes(i);
                    const isFlying = flyingIds.includes(i);

                    return (
                      <div key={i} className="w-16 h-16 relative flex items-center justify-center">
                        <AnimatePresence>
                          {!isEaten && (
                            <motion.button
                              onClick={() => handleFeedItem(i)}
                              className="text-5xl cursor-pointer hover:scale-110 drop-shadow-md select-none border-none bg-transparent"
                              animate={
                                isFlying
                                  ? {
                                      y: [0, 80, 160],
                                      scale: [1, 0.8, 0],
                                      opacity: [1, 0.9, 0],
                                    }
                                  : { scale: 1, opacity: 1 }
                              }
                              transition={{ duration: 0.5, ease: "easeInOut" }}
                            >
                              🥪
                            </motion.button>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                {/* Target Animal (Fox) Area */}
                <div className="w-full h-56 bg-white/10 backdrop-blur-md border-2 border-dashed border-white/20 rounded-3xl flex flex-col items-center justify-center relative shadow-[inset_0_4px_20px_rgba(0,0,0,0.2)]">
                  <div className="relative flex flex-col items-center">
                    {/* Fox Emojis with bubble */}
                    <div className="absolute -top-16 bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-2xl shadow-md border border-gray-100 flex items-center gap-1.5 animate-bounce">
                      <span>🦊</span>
                      <span>Feed me {problem.b} sandwiches!</span>
                    </div>

                    <div className="text-8xl drop-shadow-lg select-none mb-1">🦊</div>
                    <div className="text-xs font-bold text-white/50 bg-black/20 px-3 py-1 rounded-full">
                      Eaten: {fedCount} / {problem.b}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 🥪 MECHANIC: MULTIPLE CHOICE 🥪 */}
            {activeMechanic === "choice" && (
              <div className="w-full flex flex-col items-center justify-center py-6">
                <div className="flex justify-center gap-2 mb-8">
                  {/* Visually show the items (cross out the subtracted count) */}
                  <div className="flex flex-wrap max-w-xs justify-center gap-2.5 bg-white/5 p-6 rounded-3xl border border-white/10 shadow-inner">
                    {Array.from({ length: problem.a }).map((_, i) => {
                      const isCrossed = i >= problem.a - problem.b;
                      return (
                        <div key={i} className="relative text-4xl">
                          <span className={isCrossed ? "opacity-30 line-through" : ""}>🥪</span>
                          {isCrossed && (
                            <span className="absolute inset-0 flex items-center justify-center text-red-500 font-extrabold text-2xl drop-shadow-sm select-none">
                              ❌
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <AnswerOptions
                  options={problem.options}
                  correctAnswer={problem.answer}
                  onAnswer={(isCorrect) => {
                    if (isCorrect) handleCorrect();
                    else handleWrong();
                  }}
                  accentColor="#70a1ff"
                />
              </div>
            )}

            {/* 🥪 MECHANIC: FILL IN THE BLANK 🥪 */}
            {activeMechanic === "fillin" && (
              <div className="w-full flex flex-col items-center">
                {/* Visual Grouping */}
                <div className="flex justify-center gap-2 mb-6">
                  <div className="flex flex-wrap max-w-xs justify-center gap-2.5 bg-white/5 p-5 rounded-3xl border border-white/10">
                    {Array.from({ length: problem.a }).map((_, i) => {
                      const isCrossed = i >= problem.a - problem.b;
                      return (
                        <div key={i} className="relative text-3xl">
                          <span className={isCrossed ? "opacity-30" : ""}>🥪</span>
                          {isCrossed && (
                            <span className="absolute inset-0 flex items-center justify-center text-red-500 font-extrabold text-xl select-none">
                              ❌
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Answer Screen */}
                <div className="w-48 h-18 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 mb-6 flex items-center justify-center text-4xl font-extrabold text-[#70a1ff] shadow-inner">
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
                    className="h-14 bg-gradient-to-r from-[#70a1ff] to-[#1e90ff] text-white rounded-xl font-display text-xl font-extrabold hover:brightness-110 disabled:opacity-40 disabled:hover:scale-100 shadow-md shadow-blue-500/25"
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
          equation={`${problem.a} - ${problem.b} = ${problem.answer}`}
          onNext={() => router.push(`/the-picnic/${levelNum + 1}`)}
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
