'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface AnswerOptionsProps {
  options: number[];
  correctAnswer: number;
  onAnswer: (isCorrect: boolean) => void;
  disabled?: boolean;
  accentColor?: string;
}

/**
 * Renders 3 large circular answer bubbles in a row.
 * On tap: correct → green glow + bounce, wrong → red flash + shake.
 * After answering all bubbles become disabled.
 */
export function AnswerOptions({
  options,
  correctAnswer,
  onAnswer,
  disabled = false,
  accentColor = '#8b5cf6',
}: AnswerOptionsProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  /** Lighten a hex colour for the bubble gradient */
  const lighten = (hex: string, amount: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + Math.round(255 * amount));
    const g = Math.min(255, ((num >> 8) & 0x00ff) + Math.round(255 * amount));
    const b = Math.min(255, (num & 0x0000ff) + Math.round(255 * amount));
    return `rgb(${r}, ${g}, ${b})`;
  };

  const gradientBg = `linear-gradient(135deg, ${lighten(accentColor, 0.15)}, ${accentColor})`;

  const handleSelect = useCallback(
    (index: number) => {
      if (isAnswered || disabled) return;

      const value = options[index];
      const correct = value === correctAnswer;

      setSelectedIndex(index);
      setIsCorrect(correct);
      setIsAnswered(true);

      if (correct) {
        // Correct: call after 400 ms so the bounce animation plays
        setTimeout(() => onAnswer(true), 400);
      } else {
        // Wrong: call after 600 ms so the shake animation plays
        setTimeout(() => onAnswer(false), 600);
      }
    },
    [isAnswered, disabled, options, correctAnswer, onAnswer],
  );

  /** CSS class name for a bubble after the player has answered */
  const bubbleStateClass = (index: number): string => {
    if (selectedIndex === null) return '';
    if (index === selectedIndex) {
      return isCorrect ? 'correct' : 'wrong';
    }
    return '';
  };

  // Container staggers children in
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  // Each bubble scales in with a spring
  const bubbleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 400, damping: 15 },
    },
  };

  return (
    <motion.div
      className="flex items-center justify-center gap-5 py-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {options.map((value, index) => {
        const stateClass = bubbleStateClass(index);
        const isDisabledBubble = isAnswered || disabled;

        return (
          <motion.button
            key={`${value}-${index}`}
            variants={bubbleVariants}
            whileHover={
              isDisabledBubble
                ? undefined
                : { scale: 1.12, y: -4, transition: { type: 'spring' as const, stiffness: 300 } }
            }
            whileTap={isDisabledBubble ? undefined : { scale: 0.92 }}
            className={`answer-bubble select-none font-display text-white ${stateClass}`}
            style={{
              background: stateClass ? undefined : gradientBg,
              cursor: isDisabledBubble ? 'default' : 'pointer',
              opacity: isAnswered && selectedIndex !== index ? 0.45 : 1,
            }}
            disabled={isDisabledBubble}
            onClick={() => handleSelect(index)}
            aria-label={`Answer ${value}`}
          >
            {value}
          </motion.button>
        );
      })}
    </motion.div>
  );
}
