"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useGameStore } from "@/lib/store";
import { useTTS } from "@/lib/useTTS";
import { motion, AnimatePresence } from "framer-motion";
import GameShell from "@/components/GameShell";
import { LevelComplete, ComboIndicator } from "@/components/Celebrations";
import { WrongShake } from "@/components/Particles";
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
} from "@/lib/rlEngine";

/* ─── Premium Text Options Component ───────────────────────────────────────── */

interface TextAnswerOptionsProps {
  options: string[];
  correctAnswer: string;
  onAnswer: (isCorrect: boolean) => void;
  disabled?: boolean;
  accentColor?: string;
}

function TextAnswerOptions({
  options,
  correctAnswer,
  onAnswer,
  disabled = false,
  accentColor = "#2ed573",
}: TextAnswerOptionsProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleSelect = (idx: number) => {
    if (isAnswered || disabled) return;
    const value = options[idx];
    const correct = value === correctAnswer;

    setSelectedIndex(idx);
    setIsCorrect(correct);
    setIsAnswered(true);

    setTimeout(() => {
      onAnswer(correct);
      setSelectedIndex(null);
      setIsCorrect(null);
      setIsAnswered(false);
    }, correct ? 400 : 600);
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-sm mt-6">
      {options.map((opt, i) => {
        const isSelected = selectedIndex === i;
        let btnBg = "bg-white/5 border-white/10 hover:bg-white/10";
        if (isSelected && isCorrect !== null) {
          btnBg = isCorrect
            ? "bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-500/30 text-white"
            : "bg-rose-500 border-rose-400 shadow-lg shadow-rose-500/30 text-white";
        }

        return (
          <motion.button
            key={i}
            onClick={() => handleSelect(i)}
            disabled={isAnswered || disabled}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.08 }}
            className={`w-full py-4 px-6 border-2 rounded-2xl font-display font-extrabold text-lg text-left flex items-center justify-between transition-all ${btnBg}`}
          >
            <span>{opt}</span>
            {isSelected && isCorrect !== null && (
              <span>{isCorrect ? "✅" : "❌"}</span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

/* ─── Main Game Level Component ───────────────────────────────────────────── */

export default function WordSafariLevel() {
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

  const difficulty = zoneDifficulties.wordSafari;
  const learnerState = zoneLearnerStates.wordSafari;

  const totalRounds = getRoundsPerLevel(levelNum);
  const mechanic = getMechanicForLevel(levelNum);

  const { speak } = useTTS();

  // Game Play States
  const [currentRound, setCurrentRound] = useState(0);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [spelledLetters, setSpelledLetters] = useState<string[]>([]);
  const [usedLetterIndices, setUsedLetterIndices] = useState<number[]>([]);
  const [typedAnswer, setTypedAnswer] = useState("");
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

  // Rewards values
  const [finalStars, setFinalStars] = useState(0);
  const [finalXP, setFinalXP] = useState(0);
  const [finalCoins, setFinalCoins] = useState(0);

  // Load problem
  useEffect(() => {
    if (gamePhase === "playing") {
      const prob = generateProblem("english", levelNum, difficulty);
      setProblem(prob);
      setSpelledLetters([]);
      setUsedLetterIndices([]);
      setTypedAnswer("");
      setShowWrong(false);
      setShowSuccessFlash(false);
      setRoundErrors(0);
      roundStartTime.current = Date.now();
    }
  }, [currentRound, gamePhase, levelNum, difficulty]);

  // Speak problem on load/change
  useEffect(() => {
    if (problem && gamePhase === "playing") {
      if (problem.equation.includes("___")) {
        speak(problem.equation);
      } else if (problem.word) {
        speak(`Spell ${problem.word}`);
      } else {
        speak(problem.equation);
      }
    }
  }, [problem, gamePhase, speak]);

  if (!problem) return null;

  const activeMechanic =
    mechanic === "mixed"
      ? problem.letters
        ? "drag"
        : problem.choices
        ? "choice"
        : "fillin"
      : mechanic;

  const handleCorrect = () => {
    speak("Correct!");
    setShowSuccessFlash(true);
    incrementCombo();
    setComboMax((prev) => Math.max(prev, comboStreak + 1));
    setCorrectAnswers((prev) => prev + 1);

    const timeTaken = Date.now() - roundStartTime.current;
    setTimesTaken((prev) => [...prev, timeTaken]);

    // Process RL metrics
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
        // End level
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
        setStarRating("wordSafari", levelNum, starRating.stars);
        unlockNextLevel("wordSafari", levelNum);
        updateZoneLearnerState("wordSafari", rlResult.nextState);
        updateZoneDifficulty("wordSafari", rlResult.nextDifficulty);

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

  // Letter Bank Tap Handler (levels 1-2)
  const handleTapLetter = (letter: string, index: number) => {
    if (usedLetterIndices.includes(index)) return;
    speak(letter);

    const nextSpelled = [...spelledLetters, letter];
    const nextUsed = [...usedLetterIndices, index];
    setSpelledLetters(nextSpelled);
    setUsedLetterIndices(nextUsed);

    const targetWord = problem.word || "";
    if (nextSpelled.length === targetWord.length) {
      const spelledWord = nextSpelled.join("");
      if (spelledWord === targetWord) {
        handleCorrect();
      } else {
        handleWrong();
        // Clear slots on wrong
        setTimeout(() => {
          setSpelledLetters([]);
          setUsedLetterIndices([]);
        }, 500);
      }
    }
  };

  // Keyboard Typing Tap Handler (levels 5-6)
  const handleKeyboardTap = (char: string) => {
    speak(char);
    const targetWord = problem.word || "";
    if (typedAnswer.length < targetWord.length) {
      setTypedAnswer((prev) => prev + char);
    }
  };

  const handleBackspace = () => {
    setTypedAnswer((prev) => prev.slice(0, -1));
  };

  const handleCheckSpelling = () => {
    const targetWord = problem.word || "";
    if (typedAnswer.toUpperCase() === targetWord.toUpperCase()) {
      handleCorrect();
    } else {
      handleWrong();
      setTypedAnswer("");
    }
  };

  const displayEquation = () => {
    if (activeMechanic === "drag" && problem.word) {
      return Array(problem.word.length)
        .fill(0)
        .map((_, i) => spelledLetters[i] || "_")
        .join(" ");
    }
    if (activeMechanic === "fillin" && problem.word) {
      return Array(problem.word.length)
        .fill(0)
        .map((_, i) => typedAnswer[i] || "_")
        .join(" ");
    }
    return problem.equation;
  };

  return (
    <div className="flex-1 w-full relative">
      {showSuccessFlash && (
        <div className="fixed inset-0 pointer-events-none bg-green-500/20 z-30 transition-all duration-300 animate-pulse" />
      )}

      <GameShell
        zoneClass="bg-gradient-to-br from-[#051c14] via-[#0a3022] to-[#0f4a34] text-white"
        backHref="/word-safari"
        title="Word Safari"
        levelNum={levelNum}
        equation={displayEquation()}
        currentRound={currentRound}
        totalRounds={totalRounds}
        comboStreak={comboStreak}
      >
        <WrongShake trigger={showWrong}>
          <div className="w-full max-w-md flex flex-col items-center">
            {/* Visual card showing emoji / hint */}
            {problem.emoji && (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-6 flex items-center justify-center text-7xl shadow-inner select-none"
              >
                {problem.emoji}
              </motion.div>
            )}

            {/* 🦁 MECHANIC: LETTER BANK TAP SPELLING 🦁 */}
            {activeMechanic === "drag" && problem.letters && (
              <div className="w-full flex flex-col items-center">
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {problem.letters.map((letter, idx) => {
                    const isUsed = usedLetterIndices.includes(idx);
                    return (
                      <motion.button
                        key={idx}
                        disabled={isUsed}
                        onClick={() => handleTapLetter(letter, idx)}
                        whileHover={isUsed ? {} : { scale: 1.1 }}
                        whileTap={isUsed ? {} : { scale: 0.9 }}
                        className={`w-14 h-14 border-2 font-display text-2xl font-black rounded-full flex items-center justify-center transition-all ${
                          isUsed
                            ? "bg-black/20 border-white/5 text-white/10 cursor-default"
                            : "bg-gradient-to-br from-[#2ed573] to-[#10ac84] border-white/20 text-white cursor-pointer shadow-md"
                        }`}
                      >
                        {letter}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 🦁 MECHANIC: TEXT MULTIPLE CHOICE 🦁 */}
            {activeMechanic === "choice" && problem.choices && (
              <TextAnswerOptions
                options={problem.choices}
                correctAnswer={problem.correctChoice || problem.word || ""}
                onAnswer={(isCorrect) => {
                  if (isCorrect) handleCorrect();
                  else handleWrong();
                }}
              />
            )}

            {/* 🦁 MECHANIC: KEYBOARD SPELLING INPUT 🦁 */}
            {activeMechanic === "fillin" && problem.word && (
              <div className="w-full flex flex-col items-center">
                {/* On-screen alphabet keyboard */}
                <div className="grid grid-cols-7 gap-1.5 w-full mt-4 bg-white/5 p-4 rounded-3xl border border-white/10">
                  {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
                    <motion.button
                      key={letter}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleKeyboardTap(letter)}
                      className="h-10 bg-white/5 border border-white/10 rounded-lg font-display text-base font-extrabold text-white/90 hover:bg-white/10"
                    >
                      {letter}
                    </motion.button>
                  ))}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleBackspace}
                    className="h-10 col-span-2 bg-white/10 border border-white/15 rounded-lg font-display text-xs font-bold text-white/80 hover:bg-white/15"
                  >
                    Delete
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!typedAnswer}
                    onClick={handleCheckSpelling}
                    className="h-10 col-span-5 bg-gradient-to-r from-[#2ed573] to-[#10ac84] text-white rounded-lg font-display text-sm font-black hover:brightness-110 disabled:opacity-40"
                  >
                    Enter
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </WrongShake>
      </GameShell>

      <ComboIndicator combo={comboStreak} visible={comboStreak >= 2} />

      {/* Level Complete Celebration Overlay */}
      {gamePhase === "complete" && (
        <LevelComplete
          stars={finalStars}
          xpEarned={finalXP}
          coinsEarned={finalCoins}
          equation={`Word Spelled: ${problem.word}`}
          onNext={() => router.push(`/word-safari/${levelNum + 1}`)}
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
