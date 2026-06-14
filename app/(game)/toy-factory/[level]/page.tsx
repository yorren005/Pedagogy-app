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

export default function ToyFactoryLevel() {
  const { speak } = useTTS();
  const params = useParams();
  const router = useRouter();
  const levelNum = parseInt(params.level as string) || 1;

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

  const difficulty = zoneDifficulties.toyFactory;
  const learnerState = zoneLearnerStates.toyFactory;

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

  // Load problem
  useEffect(() => {
    if (gamePhase === "playing") {
      const prob = generateProblem("multiplication", levelNum, difficulty);
      setProblem(prob);
      setDraggedCount(0);
      setDraggedIds([]);
      setFillInAnswer("");
      setShowWrong(false);
      setShowSuccessFlash(false);
      setRoundErrors(0);
      roundStartTime.current = Date.now();
      speak(`${prob.a} times ${prob.b}`);
    }
  }, [currentRound, gamePhase, levelNum, difficulty, speak]);

  if (!problem) return null;

  // Determine active mechanic
  const activeMechanic =
    mechanic === "mixed"
      ? (Math.random() > 0.5 ? "fillin" : "choice")
      : mechanic;

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

        // Save
        addStars(starRating.stars);
        addCoins(earnedCoins);
        addXP(earnedXP);
        setStarRating("toyFactory", levelNum, starRating.stars);
        unlockNextLevel("toyFactory", levelNum);
        updateZoneLearnerState("toyFactory", rlResult.nextState);
        updateZoneDifficulty("toyFactory", rlResult.nextDifficulty);

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

  // Drag box logic
  const handleDragEnd = (event: any, info: any, id: number) => {
    const dropZoneY = window.innerHeight * 0.55;
    if (info.point.y > dropZoneY) {
      if (!draggedIds.includes(id)) {
        const nextIds = [...draggedIds, id];
        setDraggedIds(nextIds);
        const nextCount = draggedCount + 1;
        setDraggedCount(nextCount);

        if (nextCount === problem.a) {
          handleCorrect();
        }
      }
    }
  };

  // Pad logic
  const handleNumPadTap = (val: number) => {
    if (fillInAnswer.length < 3) {
      setFillInAnswer((prev) => prev + val);
    }
  };

  const handleClear = () => setFillInAnswer("");

  const handleCheckFillIn = () => {
    const ansNum = parseInt(fillInAnswer);
    if (ansNum === problem.answer) {
      handleCorrect();
    } else {
      handleWrong();
      setFillInAnswer("");
    }
  };

  const displayEquation = () => {
    if (activeMechanic === "drag") {
      return `${problem.a} × ${problem.b} = ${draggedCount * problem.b}`;
    }
    return `${problem.a} × ${problem.b} = ?`;
  };

  return (
    <div className="flex-1 w-full relative">
      {showSuccessFlash && (
        <div className="fixed inset-0 pointer-events-none bg-green-500/20 z-30 transition-all duration-300 animate-pulse" />
      )}

      <GameShell
        zoneClass="zone-factory text-white"
        backHref="/toy-factory"
        title="Toy Factory"
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
        slug="toy-factory"
        ageRange="elementary"
        problem={problem} >
        <WrongShake trigger={showWrong}>
          <div className="w-full max-w-md flex flex-col items-center">
            {/* 🧸 MECHANIC: DRAG TOY BOXES 🧸 */}
            {activeMechanic === "drag" && (
              <div className="w-full flex flex-col items-center animate-in fade-in">
                {/* Conveyor Belt / Source Area */}
                <div className="h-44 w-full flex items-center justify-center flex-wrap gap-4 p-4 bg-white/5 rounded-3xl border border-white/10 mb-6 relative">
                  <div className="absolute top-2 left-4 text-xs text-white/40 font-bold">
                    Load the boxes onto the truck:
                  </div>
                  {Array.from({ length: problem.a }).map((_, i) => {
                    const isDragged = draggedIds.includes(i);
                    return (
                      <AnimatePresence key={i}>
                        {!isDragged && (
                          <motion.div
                            drag
                            dragSnapToOrigin
                            onDragEnd={(e, info) => handleDragEnd(e, info, i)}
                            className="bg-amber-800/80 border border-amber-600 px-4 py-2.5 rounded-xl cursor-grab active:cursor-grabbing hover:scale-105 shadow-md z-20 flex flex-col items-center justify-center"
                            whileDrag={{ scale: 1.15 }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                          >
                            <span className="text-3xl">📦</span>
                            <span className="text-[10px] font-extrabold text-amber-200 mt-1 uppercase tracking-wider">
                              {problem.b} Toys
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    );
                  })}
                </div>

                {/* Truck area */}
                <div className="w-full h-56 bg-white/10 backdrop-blur-md border-2 border-dashed border-white/20 rounded-3xl flex flex-col items-center justify-center relative shadow-[inset_0_4px_20px_rgba(0,0,0,0.2)]">
                  <div className="flex flex-col items-center mb-2 z-10">
                    <div className="text-8xl drop-shadow-xl select-none mb-1 animate-pulse">🚚</div>
                    <div className="flex gap-2">
                      {Array.from({ length: draggedCount }).map((_, i) => (
                        <motion.span
                          key={i}
                          initial={{ scale: 0, x: -30 }}
                          animate={{ scale: 1, x: 0 }}
                          className="bg-amber-700 text-[10px] font-extrabold text-amber-200 border border-amber-500/30 px-2 py-1 rounded-lg"
                        >
                          {(i + 1) * problem.b}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                  <div className="absolute bottom-3 text-xs font-bold text-white/50 bg-black/20 px-3 py-1 rounded-full">
                    Loaded: {draggedCount} / {problem.a} boxes
                  </div>
                </div>
              </div>
            )}

            {/* 🧸 MECHANIC: MULTIPLE CHOICE WITH GRID ARRAY 🧸 */}
            {activeMechanic === "choice" && (
              <div className="w-full flex flex-col items-center justify-center py-4 animate-in fade-in">
                {/* Array Grid Visual */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-5 mb-6 flex flex-col items-center shadow-inner">
                  <div className="flex flex-col gap-2">
                    {Array.from({ length: problem.a }).map((_, rIdx) => (
                      <div
                        key={rIdx}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5"
                      >
                        <span className="text-[10px] text-white/40 font-bold uppercase w-12 text-left">
                          Row {rIdx + 1}:
                        </span>
                        {Array.from({ length: problem.b }).map((_, cIdx) => (
                          <span key={cIdx} className="text-3xl">🧸</span>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-white/40 font-bold mt-4 uppercase tracking-widest">
                    {problem.a} rows of {problem.b} = ?
                  </div>
                </div>

                <AnswerOptions
                  options={problem.options}
                  correctAnswer={problem.answer}
                  onAnswer={(isCorrect) => {
                    if (isCorrect) handleCorrect();
                    else handleWrong();
                  }}
                  accentColor="#7bed9f"
                />
              </div>
            )}

            {/* 🧸 MECHANIC: FILL IN THE BLANK WITH ARRAY 🧸 */}
            {activeMechanic === "fillin" && (
              <div className="w-full flex flex-col items-center animate-in fade-in">
                {/* Array Grid Visual */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-4 mb-4 flex flex-col items-center">
                  <div className="flex flex-col gap-1.5">
                    {Array.from({ length: problem.a }).map((_, rIdx) => (
                      <div
                        key={rIdx}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white/5"
                      >
                        <span className="text-[9px] text-white/30 font-bold uppercase w-10 text-left">
                          Row {rIdx + 1}:
                        </span>
                        {Array.from({ length: problem.b }).map((_, cIdx) => (
                          <span key={cIdx} className="text-2xl">🧸</span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Input Screen */}
                <div className="w-48 h-16 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 mb-4 flex items-center justify-center text-4xl font-extrabold text-[#7bed9f] shadow-inner">
                  {fillInAnswer || <span className="opacity-20">?</span>}
                </div>

                {/* Number Pad */}
                <div className="grid grid-cols-4 gap-2 w-full">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                    <motion.button
                      key={num}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleNumPadTap(num)}
                      className="h-12 bg-white/5 border border-white/10 rounded-xl font-display text-2xl font-bold text-white/95 hover:bg-white/10 active:bg-white/15 transition-all shadow-md"
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
                    className="h-12 bg-gradient-to-r from-[#7bed9f] to-[#2ed573] text-white rounded-xl font-display text-lg font-extrabold hover:brightness-110 disabled:opacity-40 disabled:hover:scale-100 shadow-md shadow-green-500/25"
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

      {/* Completion Overlay */}
      {gamePhase === "complete" && (
        <LevelComplete
          stars={finalStars}
          xpEarned={finalXP}
          coinsEarned={finalCoins}
          equation={`${problem.a} × ${problem.b} = ${problem.answer}`}
          onNext={() => router.push(`/toy-factory/${levelNum + 1}`)}
          onRetry={() => {
            // Reset
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
