export type AgeRange = 'elementary' | 'middle-school-lower' | 'middle-school-upper' | 'high-school' | 'university';

export type Subject = 'math' | 'english';

export interface GameDef {
  key: string;        // ZoneKey used in store
  slug: string;       // URL slug
  name: string;       // Display name
  subtitle: string;   // Topic description
  emoji: string;      // Theme emoji
  subject: Subject;
  color: string;      // Primary color
  gradient: string;   // Tailwind gradient classes
  bgGlow: string;     // Glow color
  zoneClass: string;  // CSS background class
  maxLevels: number;  // Total levels available
}

export interface AgeRangeDef {
  key: AgeRange;
  label: string;
  shortLabel: string;
  description: string;
  ageText: string;
  emoji: string;
  themeClass: string;
  color: string;
  gradient: string;
  bgGlow: string;
  games: GameDef[];
}

// ─── Elementary (Ages 5-10) ──────────────────────────────────────────────────

const elementaryGames: GameDef[] = [
  {
    key: 'fruitMarket', slug: 'fruit-market', name: 'Fruit Market', subtitle: 'Addition',
    emoji: '🍎', subject: 'math', color: '#ff6b81', gradient: 'from-[#ff6b81] to-[#ff4757]',
    bgGlow: 'rgba(255, 107, 129, 0.3)', zoneClass: 'zone-fruit', maxLevels: 10,
  },
  {
    key: 'picnic', slug: 'the-picnic', name: 'The Picnic', subtitle: 'Subtraction',
    emoji: '🥪', subject: 'math', color: '#70a1ff', gradient: 'from-[#70a1ff] to-[#1e90ff]',
    bgGlow: 'rgba(112, 161, 255, 0.3)', zoneClass: 'zone-picnic', maxLevels: 10,
  },
  {
    key: 'toyFactory', slug: 'toy-factory', name: 'Toy Factory', subtitle: 'Multiplication',
    emoji: '🧸', subject: 'math', color: '#7bed9f', gradient: 'from-[#7bed9f] to-[#2ed573]',
    bgGlow: 'rgba(123, 237, 159, 0.3)', zoneClass: 'zone-factory', maxLevels: 10,
  },
  {
    key: 'pizzaParty', slug: 'pizza-party', name: 'Pizza Party', subtitle: 'Fractions',
    emoji: '🍕', subject: 'math', color: '#ffa502', gradient: 'from-[#ffa502] to-[#ff6348]',
    bgGlow: 'rgba(255, 165, 2, 0.3)', zoneClass: 'zone-pizza', maxLevels: 10,
  },
  {
    key: 'wordSafari', slug: 'word-safari', name: 'Word Safari', subtitle: 'Spelling & Vocab',
    emoji: '🦁', subject: 'english', color: '#2ed573', gradient: 'from-[#2ed573] to-[#10ac84]',
    bgGlow: 'rgba(46, 213, 115, 0.3)', zoneClass: 'zone-safari', maxLevels: 10,
  },
  {
    key: 'storyBuilder', slug: 'story-builder', name: 'Story Builder', subtitle: 'Sentences & Reading',
    emoji: '📖', subject: 'english', color: '#a855f7', gradient: 'from-[#a855f7] to-[#7c3aed]',
    bgGlow: 'rgba(168, 85, 247, 0.3)', zoneClass: 'zone-story', maxLevels: 10,
  },
];

// ─── Middle School Lower (Ages 11-12) ────────────────────────────────────────

const mslGames: GameDef[] = [
  {
    key: 'equationQuest', slug: 'equation-quest', name: 'Equation Quest', subtitle: 'Algebra Basics',
    emoji: '⚖️', subject: 'math', color: '#06b6d4', gradient: 'from-[#06b6d4] to-[#0891b2]',
    bgGlow: 'rgba(6, 182, 212, 0.3)', zoneClass: 'zone-msl', maxLevels: 15,
  },
  {
    key: 'shapeShift', slug: 'shape-shift', name: 'Shape Shift', subtitle: 'Geometry',
    emoji: '📐', subject: 'math', color: '#14b8a6', gradient: 'from-[#14b8a6] to-[#0d9488]',
    bgGlow: 'rgba(20, 184, 166, 0.3)', zoneClass: 'zone-msl', maxLevels: 15,
  },
  {
    key: 'ratioRally', slug: 'ratio-rally', name: 'Ratio Rally', subtitle: 'Ratios & Proportions',
    emoji: '🏎️', subject: 'math', color: '#f97316', gradient: 'from-[#f97316] to-[#ea580c]',
    bgGlow: 'rgba(249, 115, 22, 0.3)', zoneClass: 'zone-msl', maxLevels: 15,
  },
  {
    key: 'dataDetective', slug: 'data-detective', name: 'Data Detective', subtitle: 'Statistics Basics',
    emoji: '🔍', subject: 'math', color: '#8b5cf6', gradient: 'from-[#8b5cf6] to-[#7c3aed]',
    bgGlow: 'rgba(139, 92, 246, 0.3)', zoneClass: 'zone-msl', maxLevels: 15,
  },
  {
    key: 'grammarGalaxy', slug: 'grammar-galaxy', name: 'Grammar Galaxy', subtitle: 'Grammar & Syntax',
    emoji: '🚀', subject: 'english', color: '#ec4899', gradient: 'from-[#ec4899] to-[#db2777]',
    bgGlow: 'rgba(236, 72, 153, 0.3)', zoneClass: 'zone-msl', maxLevels: 15,
  },
  {
    key: 'vocabVault', slug: 'vocab-vault', name: 'Vocab Vault', subtitle: 'Advanced Vocabulary',
    emoji: '🏦', subject: 'english', color: '#eab308', gradient: 'from-[#eab308] to-[#ca8a04]',
    bgGlow: 'rgba(234, 179, 8, 0.3)', zoneClass: 'zone-msl', maxLevels: 15,
  },
];

// ─── Middle School Upper (Ages 13-14) ────────────────────────────────────────

const msuGames: GameDef[] = [
  {
    key: 'functionForge', slug: 'function-forge', name: 'Function Forge', subtitle: 'Functions & Graphing',
    emoji: '⚒️', subject: 'math', color: '#a855f7', gradient: 'from-[#a855f7] to-[#9333ea]',
    bgGlow: 'rgba(168, 85, 247, 0.3)', zoneClass: 'zone-msu', maxLevels: 15,
  },
  {
    key: 'proofQuest', slug: 'proof-quest', name: 'Proof Quest', subtitle: 'Logic & Proofs',
    emoji: '🗝️', subject: 'math', color: '#f43f5e', gradient: 'from-[#f43f5e] to-[#e11d48]',
    bgGlow: 'rgba(244, 63, 94, 0.3)', zoneClass: 'zone-msu', maxLevels: 15,
  },
  {
    key: 'probabilityPinball', slug: 'probability-pinball', name: 'Probability Pinball', subtitle: 'Probability',
    emoji: '🎰', subject: 'math', color: '#10b981', gradient: 'from-[#10b981] to-[#059669]',
    bgGlow: 'rgba(16, 185, 129, 0.3)', zoneClass: 'zone-msu', maxLevels: 15,
  },
  {
    key: 'coordinateClash', slug: 'coordinate-clash', name: 'Coordinate Clash', subtitle: 'Coordinate Geometry',
    emoji: '📍', subject: 'math', color: '#3b82f6', gradient: 'from-[#3b82f6] to-[#2563eb]',
    bgGlow: 'rgba(59, 130, 246, 0.3)', zoneClass: 'zone-msu', maxLevels: 15,
  },
  {
    key: 'essayEngine', slug: 'essay-engine', name: 'Essay Engine', subtitle: 'Writing Structure',
    emoji: '✍️', subject: 'english', color: '#f59e0b', gradient: 'from-[#f59e0b] to-[#d97706]',
    bgGlow: 'rgba(245, 158, 11, 0.3)', zoneClass: 'zone-msu', maxLevels: 15,
  },
  {
    key: 'rhetoricArena', slug: 'rhetoric-arena', name: 'Rhetoric Arena', subtitle: 'Persuasive Writing',
    emoji: '🏟️', subject: 'english', color: '#ef4444', gradient: 'from-[#ef4444] to-[#dc2626]',
    bgGlow: 'rgba(239, 68, 68, 0.3)', zoneClass: 'zone-msu', maxLevels: 15,
  },
];

// ─── High School (Ages 15-18) ────────────────────────────────────────────────

const hsGames: GameDef[] = [
  {
    key: 'trigTower', slug: 'trig-tower', name: 'Trig Tower', subtitle: 'Trigonometry',
    emoji: '🗼', subject: 'math', color: '#06b6d4', gradient: 'from-[#06b6d4] to-[#0e7490]',
    bgGlow: 'rgba(6, 182, 212, 0.3)', zoneClass: 'zone-hs', maxLevels: 20,
  },
  {
    key: 'matrixMaze', slug: 'matrix-maze', name: 'Matrix Maze', subtitle: 'Matrices & Linear Algebra',
    emoji: '🧩', subject: 'math', color: '#8b5cf6', gradient: 'from-[#8b5cf6] to-[#6d28d9]',
    bgGlow: 'rgba(139, 92, 246, 0.3)', zoneClass: 'zone-hs', maxLevels: 20,
  },
  {
    key: 'limitLauncher', slug: 'limit-launcher', name: 'Limit Launcher', subtitle: 'Limits & Continuity',
    emoji: '🚀', subject: 'math', color: '#f43f5e', gradient: 'from-[#f43f5e] to-[#be123c]',
    bgGlow: 'rgba(244, 63, 94, 0.3)', zoneClass: 'zone-hs', maxLevels: 20,
  },
  {
    key: 'statsShowdown', slug: 'stats-showdown', name: 'Stats Showdown', subtitle: 'Advanced Statistics',
    emoji: '📊', subject: 'math', color: '#10b981', gradient: 'from-[#10b981] to-[#047857]',
    bgGlow: 'rgba(16, 185, 129, 0.3)', zoneClass: 'zone-hs', maxLevels: 20,
  },
  {
    key: 'litLabyrinth', slug: 'lit-labyrinth', name: 'Lit Labyrinth', subtitle: 'Literary Analysis',
    emoji: '📚', subject: 'english', color: '#a855f7', gradient: 'from-[#a855f7] to-[#7e22ce]',
    bgGlow: 'rgba(168, 85, 247, 0.3)', zoneClass: 'zone-hs', maxLevels: 20,
  },
  {
    key: 'debateDojo', slug: 'debate-dojo', name: 'Debate Dojo', subtitle: 'Argumentation',
    emoji: '🥋', subject: 'english', color: '#ef4444', gradient: 'from-[#ef4444] to-[#b91c1c]',
    bgGlow: 'rgba(239, 68, 68, 0.3)', zoneClass: 'zone-hs', maxLevels: 20,
  },
];

// ─── University (Ages 18+) ───────────────────────────────────────────────────

const uniGames: GameDef[] = [
  {
    key: 'calculusCascade', slug: 'calculus-cascade', name: 'Calculus Cascade', subtitle: 'Integration & Series',
    emoji: '🌊', subject: 'math', color: '#0ea5e9', gradient: 'from-[#0ea5e9] to-[#0369a1]',
    bgGlow: 'rgba(14, 165, 233, 0.3)', zoneClass: 'zone-uni', maxLevels: 25,
  },
  {
    key: 'proofArchitect', slug: 'proof-architect', name: 'Proof Architect', subtitle: 'Formal Proofs',
    emoji: '🏛️', subject: 'math', color: '#8b5cf6', gradient: 'from-[#8b5cf6] to-[#5b21b6]',
    bgGlow: 'rgba(139, 92, 246, 0.3)', zoneClass: 'zone-uni', maxLevels: 25,
  },
  {
    key: 'abstractArena', slug: 'abstract-arena', name: 'Abstract Arena', subtitle: 'Abstract Algebra',
    emoji: '♾️', subject: 'math', color: '#f97316', gradient: 'from-[#f97316] to-[#c2410c]',
    bgGlow: 'rgba(249, 115, 22, 0.3)', zoneClass: 'zone-uni', maxLevels: 25,
  },
  {
    key: 'diffEqDuel', slug: 'diff-eq-duel', name: 'Diff-Eq Duel', subtitle: 'Differential Equations',
    emoji: '⚔️', subject: 'math', color: '#ef4444', gradient: 'from-[#ef4444] to-[#991b1b]',
    bgGlow: 'rgba(239, 68, 68, 0.3)', zoneClass: 'zone-uni', maxLevels: 25,
  },
  {
    key: 'thesisForge', slug: 'thesis-forge', name: 'Thesis Forge', subtitle: 'Academic Writing',
    emoji: '🔨', subject: 'english', color: '#eab308', gradient: 'from-[#eab308] to-[#a16207]',
    bgGlow: 'rgba(234, 179, 8, 0.3)', zoneClass: 'zone-uni', maxLevels: 25,
  },
  {
    key: 'criticalLens', slug: 'critical-lens', name: 'Critical Lens', subtitle: 'Critical Theory',
    emoji: '🔎', subject: 'english', color: '#14b8a6', gradient: 'from-[#14b8a6] to-[#0f766e]',
    bgGlow: 'rgba(20, 184, 166, 0.3)', zoneClass: 'zone-uni', maxLevels: 25,
  },
];

// ─── Age Range Definitions ───────────────────────────────────────────────────

export const AGE_RANGES: AgeRangeDef[] = [
  {
    key: 'elementary', label: 'Elementary', shortLabel: 'Elem', description: 'Build a strong foundation with fun, colorful games!',
    ageText: 'Ages 5–10', emoji: '🎨', themeClass: 'theme-elementary',
    color: '#fbbf24', gradient: 'from-[#fbbf24] to-[#f59e0b]', bgGlow: 'rgba(251, 191, 36, 0.3)',
    games: elementaryGames,
  },
  {
    key: 'middle-school-lower', label: 'Middle School', shortLabel: 'MS Lower', description: 'Explore algebra, geometry, and vocabulary adventures!',
    ageText: 'Ages 11–12', emoji: '🧭', themeClass: 'theme-msl',
    color: '#06b6d4', gradient: 'from-[#06b6d4] to-[#0891b2]', bgGlow: 'rgba(6, 182, 212, 0.3)',
    games: mslGames,
  },
  {
    key: 'middle-school-upper', label: 'Middle School +', shortLabel: 'MS Upper', description: 'Master functions, probability, and persuasive writing!',
    ageText: 'Ages 13–14', emoji: '🕹️', themeClass: 'theme-msu',
    color: '#a855f7', gradient: 'from-[#a855f7] to-[#9333ea]', bgGlow: 'rgba(168, 85, 247, 0.3)',
    games: msuGames,
  },
  {
    key: 'high-school', label: 'High School', shortLabel: 'HS', description: 'Challenge yourself with trig, calculus, and critical analysis!',
    ageText: 'Ages 15–18', emoji: '⚡', themeClass: 'theme-hs',
    color: '#06b6d4', gradient: 'from-[#06b6d4] to-[#ec4899]', bgGlow: 'rgba(236, 72, 153, 0.3)',
    games: hsGames,
  },
  {
    key: 'university', label: 'University', shortLabel: 'Uni', description: 'Tackle advanced mathematics and academic writing!',
    ageText: 'Ages 18+', emoji: '🎓', themeClass: 'theme-uni',
    color: '#14b8a6', gradient: 'from-[#14b8a6] to-[#eab308]', bgGlow: 'rgba(20, 184, 166, 0.3)',
    games: uniGames,
  },
];

// ─── Helper Functions ────────────────────────────────────────────────────────

export function getAgeRange(key: AgeRange): AgeRangeDef {
  return AGE_RANGES.find(ar => ar.key === key)!;
}

export function getGameConfig(zoneKey: string): GameDef | undefined {
  for (const ar of AGE_RANGES) {
    const game = ar.games.find(g => g.key === zoneKey);
    if (game) return game;
  }
  return undefined;
}

export function getAgeRangeForGame(zoneKey: string): AgeRangeDef | undefined {
  for (const ar of AGE_RANGES) {
    if (ar.games.find(g => g.key === zoneKey)) return ar;
  }
  return undefined;
}

export function getAllZoneKeys(): string[] {
  return AGE_RANGES.flatMap(ar => ar.games.map(g => g.key));
}

export function getMaxLevelsForZone(zoneKey: string): number {
  const game = getGameConfig(zoneKey);
  return game?.maxLevels ?? 10;
}
