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

  const difficulty = zoneDifficulties["statsShowdown"] || 'easy';
  const learnerState = zoneLearnerStates["statsShowdown"] || { skillLevel: 10, recentSuccessStreak: 0, recentFailureStreak: 0 };

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
    let equation, answer, options, mu, sigma, x;
  mu = 100;
  sigma = 15;
  x = 130;
  answer = "2.0"; // (130-100)/15
  equation = `Find the z-score for x = ${x} given mu = ${mu} and sigma = ${sigma}`;
  options = ["2.0", "1.5", "1.0", "-2.0", "0.0"].sort(() => Math.random() - 0.5);
  return { equation, answer, options };
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
        setStarRating("statsShowdown", levelNum, starRating.stars);
        unlockNextLevel("statsShowdown", levelNum);
        updateZoneLearnerState("statsShowdown", rlResult.nextState);
        updateZoneDifficulty("statsShowdown", rlResult.nextDifficulty);

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
        zoneClass="zone-hs text-white"
        backHref="/high-school/stats-showdown"
        title="Stats Showdown"
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
        slug="stats-showdown"
        ageRange="high-school"
        problem={problem} >
        <WrongShake trigger={showWrong}>
          <div className="w-full max-w-md flex flex-col items-center">
            {/* Custom Interactive UI for Theme/Visual representation */}
            <div className="w-full flex flex-col items-center p-6 bg-white/5 border border-white/10 rounded-3xl mb-4 relative overflow-hidden">
                  <div className="absolute top-2 left-4 text-xs text-white/40 font-bold uppercase tracking-wider">
                    Normal Bell Curve Distribution
                  </div>
                  <div className="w-32 h-24 relative flex items-center justify-center mt-2">
                    <svg className="w-full h-full text-emerald-400" viewBox="0 0 120 80">
                      <path d="M10,70 Q60,10 110,70" fill="rgba(16,185,129,0.15)" stroke="currentColor" strokeWidth="2.5" />
                      <line x1="60" y1="10" x2="60" y2="70" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeDasharray="3,3" />
                      <circle cx="85" cy="40" r="4" fill="yellow" />
                    </svg>
                  </div>
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
                accentColor="#10b981"
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
          onNext={() => router.push(`/high-school/stats-showdown/${levelNum + 1}`)}
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
