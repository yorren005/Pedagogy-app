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
  processPerformance,
  calculateStarRating,
  calculateXP,
  calculateCoins,
  getRoundsPerLevel,
  getMechanicForLevel,
  Difficulty,
  LearnerState,
} from "@/lib/rlEngine";

export default function GameLevelPage() {
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

  const difficulty = zoneDifficulties["equationQuest"] || 'easy';
  const learnerState = zoneLearnerStates["equationQuest"] || { skillLevel: 10, recentSuccessStreak: 0, recentFailureStreak: 0 };

  const totalRounds = getRoundsPerLevel(levelNum);

  // Level Gameplay State
  const [currentRound, setCurrentRound] = useState(0);
  const [problem, setProblem] = useState<any | null>(null);
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

  // Internal Question Generator
  const generateInternalQuestion = () => {
    let a, b, c, equation, answer, visualScaleLeft = "", visualScaleRight = "";
  if (levelNum <= 5) {
    // x + b = c
    b = Math.floor(Math.random() * 8) + 2;
    answer = Math.floor(Math.random() * 8) + 2;
    a = 1;
    c = answer + b;
    equation = "x + " + b + " = " + c;
    visualScaleLeft = "x + " + b;
    visualScaleRight = "" + c;
  } else if (levelNum <= 10) {
    // ax + b = c
    a = Math.floor(Math.random() * 3) + 2;
    answer = Math.floor(Math.random() * 6) + 2;
    b = Math.floor(Math.random() * 8) + 1;
    c = a * answer + b;
    equation = a + "x + " + b + " = " + c;
    visualScaleLeft = a + "x + " + b;
    visualScaleRight = "" + c;
  } else {
    // ax - b = cx + d => (a-c)x = b+d
    const scaleDiff = Math.floor(Math.random() * 2) + 2; // a-c = 2 or 3
    answer = Math.floor(Math.random() * 5) + 2; // x
    const cCoeff = Math.floor(Math.random() * 2) + 1;
    a = cCoeff + scaleDiff;
    b = Math.floor(Math.random() * 6) + 2;
    const dVal = scaleDiff * answer - b;
    c = cCoeff;
    if (dVal > 0) {
      equation = a + "x - " + b + " = " + c + "x + " + dVal;
      visualScaleLeft = a + "x - " + b;
      visualScaleRight = c + "x + " + dVal;
    } else {
      // Fallback to simpler ax + b = cx + d
      a = 3;
      c = 1;
      answer = 4;
      b = 2;
      const d = (a - c) * answer + b;
      equation = "3x + 2 = x + " + d;
      visualScaleLeft = "3x + 2";
      visualScaleRight = "x + " + d;
    }
  }
  const options = [answer, answer + 2, answer - 2].sort(() => Math.random() - 0.5);
  return { equation, answer, options, visualScaleLeft, visualScaleRight };
  };

  // Load problem on mount or round change
  useEffect(() => {
    if (gamePhase === "playing") {
      const prob = generateInternalQuestion();
      setProblem(prob);
      setShowWrong(false);
      setShowSuccessFlash(false);
      setRoundErrors(0);
      roundStartTime.current = Date.now();
    }
  }, [currentRound, gamePhase, levelNum, difficulty]);

  // Speak equation when a new problem loads
  useEffect(() => {
    if (problem && gamePhase === "playing") {
      speak(problem.equation);
    }
  }, [problem, gamePhase, speak]);

  if (!problem) return null;

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
        setStarRating("equationQuest", levelNum, starRating.stars);
        unlockNextLevel("equationQuest", levelNum);
        updateZoneLearnerState("equationQuest", rlResult.nextState);
        updateZoneDifficulty("equationQuest", rlResult.nextDifficulty);

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

  // Custom text option selection logic for text choice questions
  const handleTextOptionSelect = (choice: string) => {
    if (choice === problem.answer) {
      handleCorrect();
    } else {
      handleWrong();
    }
  };

  return (
    <div className="flex-1 w-full relative">
      {showSuccessFlash && (
        <div className="fixed inset-0 pointer-events-none bg-green-500/20 z-30 transition-all duration-300 animate-pulse" />
      )}

      <GameShell
        zoneClass="zone-msl text-white"
        backHref="/middle-school-lower/equation-quest"
        title="Equation Quest"
        levelNum={levelNum}
        equation={problem.equation}
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
        slug="equation-quest"
        ageRange="middle-school-lower"
        problem={problem} >
        <WrongShake trigger={showWrong}>
          <div className="w-full max-w-md flex flex-col items-center">
            {/* Custom Interactive UI for Theme/Visual representation */}
            <div className="w-full flex flex-col items-center p-6 bg-white/5 border border-white/10 rounded-3xl shadow-lg relative overflow-hidden mb-4">
                  <div className="absolute top-2 left-4 text-xs text-white/40 font-bold uppercase tracking-wider">
                    Balance Scale Balance the equation!
                  </div>
                  <div className="flex justify-between items-center w-full max-w-sm h-40 relative px-4">
                    {/* Left Pan */}
                    <motion.div 
                      className="flex flex-col items-center justify-center bg-cyan-500/20 border-2 border-cyan-400/30 rounded-2xl p-4 w-28 h-20 shadow-lg"
                      animate={{ y: showSuccessFlash ? [0, 4, 0] : [0, -2, 0] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    >
                      <span className="text-sm font-semibold text-cyan-300">Left Side</span>
                      <span className="text-xl font-bold text-white mt-1">{problem.visualScaleLeft}</span>
                    </motion.div>
                    
                    {/* Pivot point */}
                    <div className="w-2 h-24 bg-white/20 rounded-full flex justify-center items-end">
                      <div className="w-6 h-6 bg-cyan-500 rounded-full border-2 border-white/20 shadow-md" />
                    </div>

                    {/* Right Pan */}
                    <motion.div 
                      className="flex flex-col items-center justify-center bg-cyan-500/20 border-2 border-cyan-400/30 rounded-2xl p-4 w-28 h-20 shadow-lg"
                      animate={{ y: showSuccessFlash ? [0, 4, 0] : [0, 2, 0] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 1 }}
                    >
                      <span className="text-sm font-semibold text-cyan-300">Right Side</span>
                      <span className="text-xl font-bold text-white mt-1">{problem.visualScaleRight}</span>
                    </motion.div>
                  </div>
                  <p className="text-xs text-white/50 text-center max-w-xs leading-normal mt-2">
                    Tip: Solve for <strong>x</strong> to balance the left and right pans.
                  </p>
                </div>

            {/* Answer Selector */}
            {typeof problem.options[0] === 'number' ? (
              <AnswerOptions
                options={problem.options}
                correctAnswer={problem.answer}
                onAnswer={(isCorrect) => {
                  if (isCorrect) handleCorrect();
                  else handleWrong();
                }}
                accentColor="#06b6d4"
              />
            ) : (
              <div className="flex flex-col gap-3 w-full mt-4">
                {problem.options.map((option: string, i: number) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleTextOptionSelect(option)}
                    className="w-full py-4 px-6 bg-white/10 hover:bg-white/15 active:bg-white/20 border border-white/20 hover:border-white/30 rounded-2xl text-left text-lg font-semibold text-white/90 shadow-md backdrop-blur-sm transition-all"
                  >
                    <span className="inline-block w-8 h-8 rounded-full bg-white/10 text-center leading-8 text-sm mr-3 font-bold text-white/50">{String.fromCharCode(65 + i)}</span>
                    {option}
                  </motion.button>
                ))}
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
          equation={problem.equation}
          onNext={() => router.push(`/middle-school-lower/equation-quest/${levelNum + 1}`)}
          onRetry={() => {
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
