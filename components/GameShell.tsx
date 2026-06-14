'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useState, useEffect, useRef } from 'react';
import { useAudio } from '@/lib/useAudio';
import { AgeRange, getGameConfig } from '@/lib/gameConfig';
import ConceptVisualizer from './ConceptVisualizer';
import GameVisualizer from './GameVisualizer';

interface GameShellProps {
  zoneClass: string;
  backHref: string;
  title: string;
  levelNum: number;
  equation: string;
  currentRound: number;
  totalRounds: number;
  comboStreak: number;
  children: ReactNode;
  topRight?: ReactNode;
  // Added props for enhanced gameplay loops
  lives?: number;
  onReset?: () => void;
  slug?: string;
  ageRange?: AgeRange;
  problem?: any;
}

export default function GameShell({
  zoneClass,
  backHref,
  title,
  levelNum,
  equation,
  currentRound,
  totalRounds,
  comboStreak,
  children,
  topRight,
  lives = 3,
  onReset,
  slug,
  ageRange = 'elementary',
  problem,
}: GameShellProps) {
  const { playSound, playMusic, musicMuted, sfxMuted, toggleMusic, toggleSFX } = useAudio();
  const [showTutorial, setShowTutorial] = useState(false);
  const [showFailedOverlay, setShowFailedOverlay] = useState(false);

  const prevRound = useRef(currentRound);
  const prevLives = useRef(lives);
  const prevCombo = useRef(comboStreak);

  // Play background music on mount
  useEffect(() => {
    playMusic(ageRange);
  }, [ageRange, playMusic]);

  // Automatically trigger Concept Visualizer on mount if Level 1 and never seen before
  useEffect(() => {
    if (slug && levelNum === 1) {
      const seenKey = `pedagogy_seen_${slug}`;
      const hasSeen = localStorage.getItem(seenKey);
      if (!hasSeen) {
        setShowTutorial(true);
        localStorage.setItem(seenKey, 'true');
      }
    }
  }, [slug, levelNum]);

  // Audio Event Hooks (Triggers on prop state changes)
  useEffect(() => {
    // Round won!
    if (currentRound > prevRound.current && currentRound < totalRounds) {
      playSound('success');
    }
    prevRound.current = currentRound;
  }, [currentRound, totalRounds, playSound]);

  useEffect(() => {
    // Loss of life!
    if (lives < prevLives.current) {
      playSound('error');
      if (lives <= 0) {
        setShowFailedOverlay(true);
      }
    }
    prevLives.current = lives;
  }, [lives, playSound]);

  useEffect(() => {
    // Combo scaling pitch sounds!
    if (comboStreak > prevCombo.current && comboStreak >= 2) {
      const pitch = Math.min(1.0 + comboStreak * 0.15, 2.0);
      playSound('streak', { pitch });
    }
    prevCombo.current = comboStreak;
  }, [comboStreak, playSound]);

  const progress = totalRounds > 0 ? (currentRound / totalRounds) * 100 : 0;

  const handleRetry = () => {
    playSound('click');
    setShowFailedOverlay(false);
    if (onReset) {
      onReset();
    }
  };

  return (
    <div className={`flex flex-col min-h-screen ${zoneClass} relative overflow-hidden select-none`}>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 z-20">
        <Link
          href={backHref}
          className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-2xl hover:scale-105 transition-transform"
          onClick={() => playSound('click')}
        >
          ⬅️
        </Link>

        {/* Level Title Indicator */}
        <div className="glass-card px-4 py-2 rounded-full">
          <span className="font-display text-lg font-bold text-white/90">
            {title} · Lv {levelNum}
          </span>
        </div>

        {/* Audio Toggles & Tutorial Info */}
        <div className="flex gap-2">
          {slug && (
            <button
              onClick={() => {
                playSound('click');
                setShowTutorial(true);
              }}
              className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-lg hover:scale-105 transition-transform font-bold text-yellow-300"
              title="Show Concept Tutorial"
            >
              💡
            </button>
          )}
          <button
            onClick={toggleMusic}
            className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-lg hover:scale-105 transition-transform"
            title="Toggle Background Music"
          >
            {musicMuted ? '🔕' : '🎵'}
          </button>
          <button
            onClick={toggleSFX}
            className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-lg hover:scale-105 transition-transform"
            title="Toggle Sound Effects"
          >
            {sfxMuted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      {/* Progress & Lives Bar */}
      <div className="px-6 py-2 z-20 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          {/* Progress Bar */}
          <div className="progress-bar flex-1 mr-4">
            <motion.div
              className="progress-bar-fill xp-bar"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          {/* Hearts Display */}
          <div className="flex gap-1 bg-black/30 px-3 py-1 rounded-full border border-white/10 shrink-0">
            {[1, 2, 3].map((heart) => (
              <motion.span
                key={heart}
                className="text-lg"
                animate={
                  heart <= lives
                    ? { scale: [1, 1.2, 1] }
                    : { scale: 0.8, opacity: 0.3 }
                }
                transition={{ duration: 0.3 }}
              >
                {heart <= lives ? '❤️' : '🤍'}
              </motion.span>
            ))}
          </div>
        </div>

        <div className="flex justify-between mt-1 text-xs text-white/50 font-bold">
          <span>
            Round {Math.min(currentRound + 1, totalRounds)}/{totalRounds}
          </span>
          {comboStreak > 1 && (
            <motion.span
              className="combo-fire text-warning font-extrabold"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              key={comboStreak}
            >
              🔥 {comboStreak}x Combo!
            </motion.span>
          )}
        </div>
      </div>

      {/* Equation Display */}
      <div className="flex justify-center px-4 py-4 z-20">
        <motion.div
          className="glass-card px-8 py-5 flex items-center gap-3 text-4xl font-extrabold text-white font-display"
          key={equation}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {equation}
        </motion.div>
      </div>

      {/* Game Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 z-10 w-full max-w-5xl mx-auto">
        {slug ? (
          <div className="flex flex-col md:flex-row items-center md:items-stretch justify-center gap-8 w-full">
            {/* Left side: options / question inputs */}
            <div className="flex-1 w-full max-w-md flex flex-col items-center justify-center">
              {children}
            </div>
            
            {/* Right side: premium animated moving concept visualizer */}
            <div className="flex-1 w-full max-w-md flex flex-col items-center justify-center">
              <GameVisualizer slug={slug} problem={problem} />
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md flex flex-col items-center justify-center">
            {children}
          </div>
        )}
      </div>

      {/* Concept Visualizer Overlay */}
      <AnimatePresence>
        {showTutorial && slug && (
          <ConceptVisualizer
            slug={slug}
            ageRange={ageRange}
            onClose={() => setShowTutorial(false)}
          />
        )}
      </AnimatePresence>

      {/* Failed Level Overlay */}
      <AnimatePresence>
        {showFailedOverlay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#060413]/90 backdrop-blur-md px-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full max-w-sm glass-card p-8 flex flex-col items-center text-center border border-red-500/25 shadow-2xl"
            >
              <span className="text-7xl mb-4">😢</span>
              <h2 className="font-display text-3xl font-extrabold text-white mb-2">
                Level Failed!
              </h2>
              <p className="text-white/60 font-semibold text-sm mb-6 leading-relaxed">
                Oh no! You ran out of hearts. Let's try again and master the concept!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRetry}
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-extrabold text-lg py-3.5 rounded-full shadow-lg shadow-red-500/25"
              >
                Try Again 🔄
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
