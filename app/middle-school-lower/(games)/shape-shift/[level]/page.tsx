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

  const difficulty = zoneDifficulties["shapeShift"] || 'easy';
  const learnerState = zoneLearnerStates["shapeShift"] || { skillLevel: 10, recentSuccessStreak: 0, recentFailureStreak: 0 };

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
    let shape, width, height, radius, answer, options, equation, shapeType;
  if (levelNum <= 5) {
    // Rectangles
    width = Math.floor(Math.random() * 6) + 4;
    height = Math.floor(Math.random() * 5) + 3;
    shapeType = 'rectangle';
    if (Math.random() > 0.5) {
      answer = width * height;
      equation = "Find the Area of the Rectangle";
    } else {
      answer = 2 * (width + height);
      equation = "Find the Perimeter of the Rectangle";
    }
  } else if (levelNum <= 10) {
    // Triangles
    width = Math.floor(Math.random() * 6) + 4; // base
    height = Math.floor(Math.random() * 5) + 4; // height
    shapeType = 'triangle';
    answer = 0.5 * width * height;
    equation = "Find the Area of the Triangle";
  } else {
    // Missing angle in triangle
    const angle1 = Math.floor(Math.random() * 40) + 30;
    const angle2 = Math.floor(Math.random() * 40) + 30;
    answer = 180 - angle1 - angle2;
    shapeType = 'angle';
    equation = "Find the Missing Angle (θ)";
    width = angle1;
    height = angle2;
  }
  options = [answer, answer + 5, answer - 3].sort(() => Math.random() - 0.5);
  return { equation, answer, options, shapeType, width, height };
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
        setStarRating("shapeShift", levelNum, starRating.stars);
        unlockNextLevel("shapeShift", levelNum);
        updateZoneLearnerState("shapeShift", rlResult.nextState);
        updateZoneDifficulty("shapeShift", rlResult.nextDifficulty);

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
        backHref="/middle-school-lower/shape-shift"
        title="Shape Shift"
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
        slug="shape-shift"
        ageRange="middle-school-lower"
        problem={problem} >
        <WrongShake trigger={showWrong}>
          <div className="w-full max-w-md flex flex-col items-center">
            {/* Custom Interactive UI for Theme/Visual representation */}
            <div className="w-full flex flex-col items-center p-6 bg-white/5 border border-white/10 rounded-3xl mb-4">
                  {problem.shapeType === 'rectangle' && (
                    <div className="flex flex-col items-center justify-center p-4">
                      <div 
                        className="bg-teal-500/20 border-3 border-teal-400 rounded-lg flex items-center justify-center shadow-lg relative"
                        style={{ width: `${problem.width * 14}px`, height: `${problem.height * 14}px` }}
                      >
                        <span className="absolute -left-8 font-bold text-teal-300">{problem.height}</span>
                        <span className="absolute -bottom-6 font-bold text-teal-300">{problem.width}</span>
                        <span className="text-white/60 font-semibold text-xs">Rectangle</span>
                      </div>
                    </div>
                  )}
                  {problem.shapeType === 'triangle' && (
                    <div className="flex flex-col items-center justify-center p-4">
                      <div className="w-32 h-24 relative flex items-center justify-center">
                        <svg className="w-full h-full text-teal-400" viewBox="0 0 100 80">
                          <polygon points="50,10 10,70 90,70" fill="rgba(20, 184, 166, 0.15)" stroke="currentColor" strokeWidth="3" />
                          <line x1="50" y1="10" x2="50" y2="70" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeDasharray="4,4" />
                          <text x="55" y="45" fill="white" fontSize="8" fontWeight="bold">h = {problem.height}</text>
                          <text x="40" y="78" fill="currentColor" fontSize="8" fontWeight="bold">b = {problem.width}</text>
                        </svg>
                      </div>
                    </div>
                  )}
                  {problem.shapeType === 'angle' && (
                    <div className="flex flex-col items-center justify-center p-4">
                      <div className="w-32 h-24 relative flex items-center justify-center">
                        <svg className="w-full h-full text-teal-400" viewBox="0 0 100 80">
                          <polygon points="10,70 90,70 50,20" fill="none" stroke="currentColor" strokeWidth="3" />
                          <text x="15" y="65" fill="white" fontSize="8">{problem.width}°</text>
                          <text x="75" y="65" fill="white" fontSize="8">{problem.height}°</text>
                          <text x="46" y="32" fill="yellow" fontSize="10" fontWeight="bold">θ</text>
                        </svg>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-white/40 mt-6 uppercase tracking-wider font-bold">Use the formulas to solve</p>
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
                accentColor="#14b8a6"
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
          onNext={() => router.push(`/middle-school-lower/shape-shift/${levelNum + 1}`)}
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
