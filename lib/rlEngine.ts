export type Difficulty = 'easy' | 'medium' | 'hard';
export type ZoneType = 'addition' | 'subtraction' | 'multiplication' | 'fractions';

export interface PerformanceMetrics {
  timeTakenMs: number;
  errorsMade: number;
  hintsUsed: number;
  isCorrect: boolean;
}

export interface LearnerState {
  skillLevel: number; // 0 to 100
  recentSuccessStreak: number;
  recentFailureStreak: number;
}

export interface RoundResult {
  nextState: LearnerState;
  nextDifficulty: Difficulty;
  reward: number;
  comboMultiplier: number;
}

export interface Problem {
  a: number;
  b: number;
  answer: number;
  equation: string;
  options: number[];       // multiple choice options (includes correct answer)
  visualCount?: number;    // for drag/count mechanics
  fractionDenominator?: number; // for fractions
  fractionNumerator?: number;
  missingPosition?: 'a' | 'b' | 'answer'; // for fill-in-the-blank
}

export interface StarRating {
  stars: number;  // 1-3
  perfect: boolean;
}

// ─── Adaptive Difficulty Engine ───────────────────────────────────────────────

export function processPerformance(
  currentState: LearnerState,
  metrics: PerformanceMetrics,
  currentCombo: number
): RoundResult {
  let reward = 0;

  if (metrics.isCorrect) {
    reward += 10;
    if (metrics.errorsMade === 0) reward += 5;
    if (metrics.hintsUsed === 0) reward += 5;
    if (metrics.timeTakenMs < 5000) reward += 3;
    if (metrics.timeTakenMs < 3000) reward += 2;
  } else {
    reward -= 5;
    reward -= metrics.errorsMade * 2;
  }

  const nextSuccessStreak = metrics.isCorrect ? currentState.recentSuccessStreak + 1 : 0;
  const nextFailureStreak = !metrics.isCorrect ? currentState.recentFailureStreak + 1 : 0;

  let nextSkillLevel = currentState.skillLevel + reward;
  nextSkillLevel = Math.max(0, Math.min(100, nextSkillLevel));

  // Combo multiplier: consecutive correct answers boost coins
  const comboMultiplier = metrics.isCorrect
    ? Math.min(5, 1 + currentCombo)
    : 1;

  // Determine next difficulty
  let nextDifficulty: Difficulty = 'easy';
  if (nextSkillLevel > 70 || nextSuccessStreak >= 4) {
    nextDifficulty = 'hard';
  } else if (nextSkillLevel > 30 || nextSuccessStreak >= 2) {
    nextDifficulty = 'medium';
  }

  // Failure protection
  if (nextFailureStreak >= 2 && nextDifficulty === 'hard') {
    nextDifficulty = 'medium';
  } else if (nextFailureStreak >= 2 && nextDifficulty === 'medium') {
    nextDifficulty = 'easy';
  }

  return {
    nextState: {
      skillLevel: nextSkillLevel,
      recentSuccessStreak: nextSuccessStreak,
      recentFailureStreak: nextFailureStreak,
    },
    nextDifficulty,
    reward,
    comboMultiplier,
  };
}

// ─── Star Rating Calculator ──────────────────────────────────────────────────

export function calculateStarRating(
  totalRounds: number,
  correctAnswers: number,
  totalErrors: number,
  totalHintsUsed: number,
  avgTimeMs: number
): StarRating {
  const accuracy = correctAnswers / totalRounds;
  const perfect = totalErrors === 0 && totalHintsUsed === 0;

  if (perfect && avgTimeMs < 6000) {
    return { stars: 3, perfect: true };
  } else if (accuracy >= 0.8 && totalErrors <= 1) {
    return { stars: 2, perfect: false };
  } else {
    return { stars: 1, perfect: false };
  }
}

// ─── XP Calculator ───────────────────────────────────────────────────────────

export function calculateXP(
  stars: number,
  difficulty: Difficulty,
  comboMax: number,
  levelNum: number
): number {
  const baseXP = 20;
  const starBonus = stars * 10;
  const difficultyBonus = difficulty === 'hard' ? 15 : difficulty === 'medium' ? 8 : 0;
  const comboBonus = Math.min(comboMax * 3, 15);
  const levelBonus = Math.floor(levelNum / 3) * 5;
  return baseXP + starBonus + difficultyBonus + comboBonus + levelBonus;
}

export function getPlayerLevel(totalXP: number): number {
  // XP thresholds: Level 1=0, 2=100, 3=250, 4=500, 5=800, 6=1200, 7=1700, 8=2300, 9=3000, 10=4000
  const thresholds = [0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 4000];
  let level = 1;
  for (let i = 1; i < thresholds.length; i++) {
    if (totalXP >= thresholds[i]) level = i + 1;
    else break;
  }
  return level;
}

export function getXPForNextLevel(totalXP: number): { current: number; needed: number; progress: number } {
  const thresholds = [0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 4000];
  const level = getPlayerLevel(totalXP);
  if (level >= thresholds.length) {
    return { current: totalXP, needed: totalXP, progress: 1 };
  }
  const currentThreshold = thresholds[level - 1];
  const nextThreshold = thresholds[level] || thresholds[thresholds.length - 1];
  const progress = (totalXP - currentThreshold) / (nextThreshold - currentThreshold);
  return { current: totalXP - currentThreshold, needed: nextThreshold - currentThreshold, progress: Math.min(1, progress) };
}

// ─── Coin Calculator ─────────────────────────────────────────────────────────

export function calculateCoins(
  correctAnswers: number,
  comboMultiplier: number,
  stars: number
): number {
  const base = correctAnswers * 5;
  const comboBonus = Math.floor(base * (comboMultiplier - 1) * 0.3);
  const starBonus = stars === 3 ? 15 : stars === 2 ? 8 : 0;
  return base + comboBonus + starBonus;
}

// ─── Problem Generator ───────────────────────────────────────────────────────

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateDistractors(correct: number, count: number, min: number, max: number): number[] {
  const distractors = new Set<number>();
  // Add close distractors first (±1, ±2)
  const nearby = [correct - 1, correct + 1, correct - 2, correct + 2].filter(
    n => n >= min && n <= max && n !== correct
  );
  for (const n of nearby) {
    if (distractors.size < count) distractors.add(n);
  }
  // Fill remaining with random
  let attempts = 0;
  while (distractors.size < count && attempts < 50) {
    const n = randInt(min, max);
    if (n !== correct) distractors.add(n);
    attempts++;
  }
  return Array.from(distractors).slice(0, count);
}

export function generateAdditionProblem(levelNum: number, difficulty: Difficulty): Problem {
  let aMin: number, aMax: number, bMin: number, bMax: number;

  if (difficulty === 'easy' || levelNum <= 2) {
    aMin = 1; aMax = 5; bMin = 1; bMax = 5;
  } else if (difficulty === 'medium' || levelNum <= 6) {
    aMin = 1; aMax = 9; bMin = 1; bMax = 9;
  } else {
    aMin = 5; aMax = 15; bMin = 5; bMax = 15;
  }

  const a = randInt(aMin, aMax);
  const b = randInt(bMin, bMax);
  const answer = a + b;

  // Decide if it's a missing-number problem (levels 5-6)
  let missingPosition: 'a' | 'b' | 'answer' | undefined;
  if (levelNum >= 5 && levelNum <= 6) {
    missingPosition = Math.random() > 0.5 ? 'a' : 'b';
  }

  const distractors = generateDistractors(
    missingPosition === 'a' ? a : missingPosition === 'b' ? b : answer,
    2,
    0,
    Math.max(answer + 5, 20)
  );
  const correctVal = missingPosition === 'a' ? a : missingPosition === 'b' ? b : answer;
  const options = shuffleArray([correctVal, ...distractors]);

  let equation: string;
  if (missingPosition === 'a') equation = `? + ${b} = ${answer}`;
  else if (missingPosition === 'b') equation = `${a} + ? = ${answer}`;
  else equation = `${a} + ${b} = ?`;

  return { a, b, answer, equation, options, missingPosition, visualCount: b };
}

export function generateSubtractionProblem(levelNum: number, difficulty: Difficulty): Problem {
  let aMin: number, aMax: number;

  if (difficulty === 'easy' || levelNum <= 2) {
    aMin = 3; aMax = 6;
  } else if (difficulty === 'medium' || levelNum <= 6) {
    aMin = 5; aMax = 12;
  } else {
    aMin = 10; aMax = 20;
  }

  const a = randInt(aMin, aMax);
  const b = randInt(1, a - 1);
  const answer = a - b;

  let missingPosition: 'a' | 'b' | 'answer' | undefined;
  if (levelNum >= 5 && levelNum <= 6) {
    missingPosition = 'b';
  }

  const correctVal = missingPosition === 'b' ? b : answer;
  const distractors = generateDistractors(correctVal, 2, 0, a);
  const options = shuffleArray([correctVal, ...distractors]);

  let equation: string;
  if (missingPosition === 'b') equation = `${a} - ? = ${answer}`;
  else equation = `${a} - ${b} = ?`;

  return { a, b, answer, equation, options, missingPosition, visualCount: a };
}

export function generateMultiplicationProblem(levelNum: number, difficulty: Difficulty): Problem {
  let aMin: number, aMax: number, bMin: number, bMax: number;

  if (difficulty === 'easy' || levelNum <= 2) {
    aMin = 1; aMax = 3; bMin = 1; bMax = 3;
  } else if (difficulty === 'medium' || levelNum <= 6) {
    aMin = 2; aMax = 5; bMin = 2; bMax = 5;
  } else {
    aMin = 3; aMax = 9; bMin = 2; bMax = 9;
  }

  const a = randInt(aMin, aMax);
  const b = randInt(bMin, bMax);
  const answer = a * b;

  const distractors = generateDistractors(answer, 2, 1, answer + 10);
  const options = shuffleArray([answer, ...distractors]);

  const equation = `${a} × ${b} = ?`;

  return { a, b, answer, equation, options, visualCount: a };
}

export function generateFractionProblem(levelNum: number, difficulty: Difficulty): Problem {
  let denominator: number;

  if (difficulty === 'easy' || levelNum <= 2) {
    denominator = 2;
  } else if (levelNum <= 4) {
    denominator = 4;
  } else if (levelNum <= 6) {
    denominator = Math.random() > 0.5 ? 3 : 4;
  } else {
    denominator = [2, 3, 4][randInt(0, 2)];
  }

  const numerator = randInt(1, denominator);
  const answer = numerator; // The answer is the numerator count

  // For comparison levels (7-8), generate two fractions
  const distractors = generateDistractors(numerator, 2, 0, denominator + 2);
  const options = shuffleArray([numerator, ...distractors]);

  const equation = `How many ${denominator === 2 ? 'halves' : denominator === 3 ? 'thirds' : 'quarters'}?`;

  return {
    a: numerator,
    b: denominator,
    answer: numerator,
    equation,
    options,
    fractionDenominator: denominator,
    fractionNumerator: numerator,
  };
}

export function generateProblem(zone: ZoneType, levelNum: number, difficulty: Difficulty): Problem {
  switch (zone) {
    case 'addition': return generateAdditionProblem(levelNum, difficulty);
    case 'subtraction': return generateSubtractionProblem(levelNum, difficulty);
    case 'multiplication': return generateMultiplicationProblem(levelNum, difficulty);
    case 'fractions': return generateFractionProblem(levelNum, difficulty);
  }
}

// ─── Rounds per Level ────────────────────────────────────────────────────────

export function getRoundsPerLevel(levelNum: number): number {
  if (levelNum <= 2) return 4;
  if (levelNum <= 5) return 5;
  return 6;
}

// ─── Badge Definitions ───────────────────────────────────────────────────────

export interface BadgeDefinition {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export const BADGES: BadgeDefinition[] = [
  { id: 'first_star', name: 'First Star', emoji: '⭐', description: 'Earn your first star' },
  { id: 'perfect_round', name: 'Perfect!', emoji: '💎', description: 'Complete a level with 3 stars' },
  { id: 'combo_king', name: 'Combo King', emoji: '🔥', description: 'Get a 5x combo streak' },
  { id: 'addition_master', name: 'Addition Master', emoji: '🍎', description: 'Complete all Fruit Market levels' },
  { id: 'subtraction_master', name: 'Subtraction Star', emoji: '🥪', description: 'Complete all Picnic levels' },
  { id: 'multiplication_master', name: 'Factory Boss', emoji: '🧸', description: 'Complete all Toy Factory levels' },
  { id: 'fraction_master', name: 'Pizza Chef', emoji: '🍕', description: 'Complete all Pizza Party levels' },
  { id: 'ten_stars', name: 'Star Collector', emoji: '🌟', description: 'Earn 10 stars total' },
  { id: 'fifty_coins', name: 'Coin Hoarder', emoji: '💰', description: 'Earn 50 coins total' },
  { id: 'level_5', name: 'Math Explorer', emoji: '🗺️', description: 'Reach player level 5' },
  { id: 'speed_demon', name: 'Speed Demon', emoji: '⚡', description: 'Answer 3 questions under 3 seconds each' },
  { id: 'all_zones', name: 'World Champion', emoji: '🏆', description: 'Complete level 1 in all zones' },
];

// ─── Level Mechanic Types ────────────────────────────────────────────────────

export type GameMechanic = 'drag' | 'choice' | 'fillin' | 'mixed';

export function getMechanicForLevel(levelNum: number): GameMechanic {
  if (levelNum <= 2) return 'drag';
  if (levelNum <= 4) return 'choice';
  if (levelNum <= 6) return 'fillin';
  if (levelNum <= 8) return 'choice';
  return 'mixed';
}
