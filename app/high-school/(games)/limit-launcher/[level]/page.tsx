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

  const difficulty = zoneDifficulties["limitLauncher"] || 'easy';
  const learnerState = zoneLearnerStates["limitLauncher"] || { skillLevel: 10, recentSuccessStreak: 0, recentFailureStreak: 0 };

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
    let equation, answer, options;
  if (levelNum <= 10) {
    const list = [
      { q: "lim (x → 3) [x² - 2x]", a: "3" },
      { q: "lim (x → 2) [3x + 1]", a: "7" },
      { q: "lim (x → 1) [x³ + x]", a: "2" }
    ];
    const choice = list[Math.floor(Math.random() * list.length)];
    equation = choice.q;
    answer = choice.a;
  } else {
    const list = [
      { q: "d/dx [x² + 5x]", a: "2x + 5" },
      { q: "d/dx [3x²]", a: "6x" },
      { q: "d/dx [x³]", a: "3x²" }
    ];
    const choice = list[Math.floor(Math.random() * list.length)];
    equation = choice.q;
    answer = choice.a;
  }
  options = [answer, "0", "3", "2x + 5", "6x", "3x²", "7"].filter((x, idx, self) => self.indexOf(x) === idx).slice(0, 3);
  if (!options.includes(answer)) options[0] = answer;
  options = options.sort(() => Math.random() - 0.5);
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
        setStarRating("limitLauncher", levelNum, starRating.stars);
        unlockNextLevel("limitLauncher", levelNum);
        updateZoneLearnerState("limitLauncher", rlResult.nextState);
        updateZoneDifficulty("limitLauncher", rlResult.nextDifficulty);

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
        backHref="/high-school/limit-launcher"
        title="Limit Launcher"
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
        slug="limit-launcher"
        ageRange="high-school"
        problem={problem} >
        <WrongShake trigger={showWrong}>
          <div className="w-full max-w-md flex flex-col items-center">
            

            {/* Answer Selector */}
            {typeof problem.options[0] === 'number' ? (
              <AnswerOptions
                options={problem.options}
                correctAnswer={problem.answer}
                onAnswer={(isCorrect) => {
                  if (isCorrect) handleCorrect();
                  else handleWrong();
                }}
                accentColor="#f43f5e"
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
          onNext={() => router.push(`/high-school/limit-launcher/${levelNum + 1}`)}
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
