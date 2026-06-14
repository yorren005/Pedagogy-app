'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { LearnerState, Difficulty } from './rlEngine';
import { AgeRange, getAllZoneKeys, getMaxLevelsForZone } from './gameConfig';

// Dynamic zone key - supports all games across all age ranges
export type ZoneKey = string;

export interface GameState {
  stars: number;
  coins: number;
  xp: number;
  playerLevel: number;
  currentLevel: number;
  badges: string[];
  comboStreak: number;
  maxCombo: number;
  selectedAgeRange: AgeRange;
  unlockedLevels: Record<string, number>;
  starRatings: Record<string, number[]>;
  zoneLearnerStates: Record<string, LearnerState>;
  zoneDifficulties: Record<string, Difficulty>;
}

export interface GameStoreContextType extends GameState {
  addStars: (amount: number) => void;
  addCoins: (amount: number) => void;
  addXP: (amount: number) => void;
  setLevel: (level: number) => void;
  earnBadge: (badgeId: string) => void;
  setStarRating: (zone: ZoneKey, level: number, stars: number) => void;
  updateZoneLearnerState: (zone: ZoneKey, state: LearnerState) => void;
  updateZoneDifficulty: (zone: ZoneKey, difficulty: Difficulty) => void;
  unlockNextLevel: (zone: ZoneKey, currentLevelCompleted: number) => void;
  incrementCombo: () => void;
  resetCombo: () => void;
  resetProgress: () => void;
  setSelectedAgeRange: (ageRange: AgeRange) => void;
}

const initialLearnerState: LearnerState = {
  skillLevel: 10,
  recentSuccessStreak: 0,
  recentFailureStreak: 0,
};

function buildDefaults() {
  const allKeys = getAllZoneKeys();
  const unlockedLevels: Record<string, number> = {};
  const starRatings: Record<string, number[]> = {};
  const zoneLearnerStates: Record<string, LearnerState> = {};
  const zoneDifficulties: Record<string, Difficulty> = {};

  for (const key of allKeys) {
    unlockedLevels[key] = 1;
    starRatings[key] = Array(getMaxLevelsForZone(key)).fill(0);
    zoneLearnerStates[key] = { ...initialLearnerState };
    zoneDifficulties[key] = 'easy';
  }

  return { unlockedLevels, starRatings, zoneLearnerStates, zoneDifficulties };
}

const defaults = buildDefaults();

const defaultState: GameState = {
  stars: 0,
  coins: 0,
  xp: 0,
  playerLevel: 1,
  currentLevel: 1,
  badges: [],
  comboStreak: 0,
  maxCombo: 0,
  selectedAgeRange: 'elementary',
  unlockedLevels: defaults.unlockedLevels,
  starRatings: defaults.starRatings,
  zoneLearnerStates: defaults.zoneLearnerStates,
  zoneDifficulties: defaults.zoneDifficulties,
};

const GameStoreContext = createContext<GameStoreContextType | undefined>(undefined);

function getPlayerLevelFromXP(xp: number): number {
  const thresholds = [0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 4000];
  let level = 1;
  for (let i = 1; i < thresholds.length; i++) {
    if (xp >= thresholds[i]) level = i + 1;
    else break;
  }
  return level;
}

export const GameStoreProvider = ({ children }: { children: ReactNode }) => {
  const [isClient, setIsClient] = useState(false);

  const [stars, setStars] = useState(defaultState.stars);
  const [coins, setCoins] = useState(defaultState.coins);
  const [xp, setXP] = useState(defaultState.xp);
  const [playerLevel, setPlayerLevel] = useState(defaultState.playerLevel);
  const [currentLevel, setCurrentLevel] = useState(defaultState.currentLevel);
  const [badges, setBadges] = useState<string[]>(defaultState.badges);
  const [comboStreak, setComboStreak] = useState(defaultState.comboStreak);
  const [maxCombo, setMaxCombo] = useState(defaultState.maxCombo);
  const [selectedAgeRange, setSelectedAgeRange] = useState<AgeRange>(defaultState.selectedAgeRange);
  const [unlockedLevels, setUnlockedLevels] = useState<Record<string, number>>(defaultState.unlockedLevels);
  const [starRatings, setStarRatings] = useState<Record<string, number[]>>(defaultState.starRatings);
  const [zoneLearnerStates, setZoneLearnerStates] = useState<Record<string, LearnerState>>(defaultState.zoneLearnerStates);
  const [zoneDifficulties, setZoneDifficulties] = useState<Record<string, Difficulty>>(defaultState.zoneDifficulties);

  // Load from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('mak_progress_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.unlockedLevels) setUnlockedLevels({ ...defaultState.unlockedLevels, ...parsed.unlockedLevels });
        if (parsed.stars != null) setStars(parsed.stars);
        if (parsed.coins != null) setCoins(parsed.coins);
        if (parsed.xp != null) {
          setXP(parsed.xp);
          setPlayerLevel(getPlayerLevelFromXP(parsed.xp));
        }
        if (parsed.badges) setBadges(parsed.badges);
        if (parsed.starRatings) setStarRatings({ ...defaultState.starRatings, ...parsed.starRatings });
        if (parsed.zoneLearnerStates) setZoneLearnerStates({ ...defaultState.zoneLearnerStates, ...parsed.zoneLearnerStates });
        if (parsed.zoneDifficulties) setZoneDifficulties({ ...defaultState.zoneDifficulties, ...parsed.zoneDifficulties });
        if (parsed.maxCombo) setMaxCombo(parsed.maxCombo);
        if (parsed.selectedAgeRange) setSelectedAgeRange(parsed.selectedAgeRange);
      } catch (e) {
        console.error("Failed to parse save data", e);
      }
    } else {
      // Try migrating from v2
      const v2 = localStorage.getItem('mak_progress_v2');
      if (v2) {
        try {
          const parsed = JSON.parse(v2);
          if (parsed.unlockedLevels) setUnlockedLevels({ ...defaultState.unlockedLevels, ...parsed.unlockedLevels });
          if (parsed.stars != null) setStars(parsed.stars);
          if (parsed.coins != null) setCoins(parsed.coins);
          if (parsed.xp != null) {
            setXP(parsed.xp);
            setPlayerLevel(getPlayerLevelFromXP(parsed.xp));
          }
          if (parsed.badges) setBadges(parsed.badges);
          if (parsed.starRatings) setStarRatings({ ...defaultState.starRatings, ...parsed.starRatings });
          if (parsed.zoneLearnerStates) setZoneLearnerStates({ ...defaultState.zoneLearnerStates, ...parsed.zoneLearnerStates });
          if (parsed.zoneDifficulties) setZoneDifficulties({ ...defaultState.zoneDifficulties, ...parsed.zoneDifficulties });
        } catch (e) {
          console.error("Failed to migrate from v2", e);
        }
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('mak_progress_v3', JSON.stringify({
        unlockedLevels,
        stars,
        coins,
        xp,
        badges,
        starRatings,
        zoneLearnerStates,
        zoneDifficulties,
        maxCombo,
        selectedAgeRange,
      }));
    }
  }, [unlockedLevels, stars, coins, xp, badges, starRatings, zoneLearnerStates, zoneDifficulties, maxCombo, selectedAgeRange, isClient]);

  // Recalculate player level when XP changes
  useEffect(() => {
    const newLevel = getPlayerLevelFromXP(xp);
    if (newLevel !== playerLevel) {
      setPlayerLevel(newLevel);
    }
  }, [xp, playerLevel]);

  const addStars = useCallback((amount: number) => setStars(prev => Math.max(0, prev + amount)), []);
  const addCoins = useCallback((amount: number) => setCoins(prev => Math.max(0, prev + amount)), []);
  const addXP = useCallback((amount: number) => setXP(prev => Math.max(0, prev + amount)), []);
  const setLevel = useCallback((level: number) => setCurrentLevel(level), []);

  const earnBadge = useCallback((badgeId: string) => {
    setBadges(prev => {
      if (prev.includes(badgeId)) return prev;
      return [...prev, badgeId];
    });
  }, []);

  const setStarRatingFn = useCallback((zone: ZoneKey, level: number, newStars: number) => {
    setStarRatings(prev => {
      const zoneRatings = [...(prev[zone] || Array(getMaxLevelsForZone(zone)).fill(0))];
      // Only update if new rating is better
      if (newStars > (zoneRatings[level - 1] || 0)) {
        zoneRatings[level - 1] = newStars;
        return { ...prev, [zone]: zoneRatings };
      }
      return prev;
    });
  }, []);

  const updateZoneLearnerState = useCallback((zone: ZoneKey, state: LearnerState) => {
    setZoneLearnerStates(prev => ({ ...prev, [zone]: state }));
  }, []);

  const updateZoneDifficulty = useCallback((zone: ZoneKey, difficulty: Difficulty) => {
    setZoneDifficulties(prev => ({ ...prev, [zone]: difficulty }));
  }, []);

  const unlockNextLevel = useCallback((zone: ZoneKey, currentLevelCompleted: number) => {
    setUnlockedLevels(prev => {
      const maxLevels = getMaxLevelsForZone(zone);
      if (currentLevelCompleted >= (prev[zone] || 1)) {
        return { ...prev, [zone]: Math.min(maxLevels, currentLevelCompleted + 1) };
      }
      return prev;
    });
  }, []);

  const incrementCombo = useCallback(() => {
    setComboStreak(prev => {
      const next = prev + 1;
      setMaxCombo(prevMax => Math.max(prevMax, next));
      return next;
    });
  }, []);

  const resetCombo = useCallback(() => setComboStreak(0), []);

  const resetProgress = useCallback(() => {
    setStars(defaultState.stars);
    setCoins(defaultState.coins);
    setXP(defaultState.xp);
    setPlayerLevel(defaultState.playerLevel);
    setCurrentLevel(defaultState.currentLevel);
    setBadges(defaultState.badges);
    setComboStreak(defaultState.comboStreak);
    setMaxCombo(defaultState.maxCombo);
    setUnlockedLevels(defaultState.unlockedLevels);
    setStarRatings(defaultState.starRatings);
    setZoneLearnerStates(defaultState.zoneLearnerStates);
    setZoneDifficulties(defaultState.zoneDifficulties);
    localStorage.removeItem('mak_progress_v3');
    localStorage.removeItem('mak_progress_v2');
    localStorage.removeItem('mak_progress');
  }, []);

  return React.createElement(
    GameStoreContext.Provider,
    {
      value: {
        stars,
        coins,
        xp,
        playerLevel,
        currentLevel,
        badges,
        comboStreak,
        maxCombo,
        selectedAgeRange,
        unlockedLevels,
        starRatings,
        zoneLearnerStates,
        zoneDifficulties,
        addStars,
        addCoins,
        addXP,
        setLevel,
        earnBadge,
        setStarRating: setStarRatingFn,
        updateZoneLearnerState,
        updateZoneDifficulty,
        unlockNextLevel,
        incrementCombo,
        resetCombo,
        resetProgress,
        setSelectedAgeRange,
      },
    },
    children
  );
};

export const useGameStore = () => {
  const context = useContext(GameStoreContext);
  if (context === undefined) {
    throw new Error('useGameStore must be used within a GameStoreProvider');
  }
  return context;
};
