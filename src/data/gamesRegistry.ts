import { Brain, Hash, Zap, type LucideIcon } from 'lucide-react';

export type GameCategory = 'IQ' | 'Mind Puzzle' | 'Improvements';

export interface GameMeta {
  id: string;
  slug: string;
  path: string;
  title: string;
  description: string;
  category: GameCategory;
  icon: LucideIcon;
  bestScoreKey: string;
  progressKey: string;
  scoreLabel: string;
  /** Higher is better (default true). False = lower is better (e.g. reaction time ms). */
  higherIsBetter?: boolean;
}

export const GAME_CATEGORIES: GameCategory[] = ['IQ', 'Mind Puzzle', 'Improvements'];

export const GAMES: GameMeta[] = [
  {
    id: 'mind-puzzle',
    slug: 'mind-puzzle',
    path: '/games/mind-puzzle',
    title: 'Mind Puzzle',
    description: 'Simon-style memory matrix. Repeat the glowing tile order.',
    category: 'Mind Puzzle',
    icon: Brain,
    bestScoreKey: 'habex-mind-puzzle-best-score',
    progressKey: 'habex-mind-puzzle-progress',
    scoreLabel: 'Best level',
  },
  {
    id: 'number-memory',
    slug: 'number-memory',
    path: '/games/number-memory',
    title: 'Number Memory',
    description: 'Memorise a number, then type it back. Length grows each round.',
    category: 'IQ',
    icon: Hash,
    bestScoreKey: 'habex-number-memory-best-score',
    progressKey: 'habex-number-memory-progress',
    scoreLabel: 'Best digits',
  },
  {
    id: 'reaction-time',
    slug: 'reaction-time',
    path: '/games/reaction-time',
    title: 'Reaction Time',
    description: 'Tap as fast as you can when the screen turns green.',
    category: 'Improvements',
    icon: Zap,
    bestScoreKey: 'habex-reaction-time-best-score',
    progressKey: 'habex-reaction-time-progress',
    scoreLabel: 'Best time',
    higherIsBetter: false,
  },
];

export const getGameBySlug = (slug: string) => GAMES.find(g => g.slug === slug);

export const readBestScore = (game: GameMeta): number | null => {
  const raw = localStorage.getItem(game.bestScoreKey);
  if (raw === null || raw === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
};

export const writeBestScore = (game: GameMeta, score: number) => {
  const current = readBestScore(game);
  let isBetter = false;
  if (current === null) isBetter = true;
  else isBetter = game.higherIsBetter === false ? score < current : score > current;
  if (isBetter) {
    localStorage.setItem(game.bestScoreKey, String(score));
  }
  // Always record into leaderboard regardless
  recordLeaderboardScore(game, score);
  return isBetter;
};

export interface GameProgress {
  level: number;
  updatedAt: number;
}

export const readProgress = (game: GameMeta): GameProgress | null => {
  const raw = localStorage.getItem(game.progressKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GameProgress;
  } catch {
    return null;
  }
};

export const writeProgress = (game: GameMeta, progress: GameProgress) => {
  localStorage.setItem(game.progressKey, JSON.stringify(progress));
};

export const clearProgress = (game: GameMeta) => {
  localStorage.removeItem(game.progressKey);
};

export const formatScore = (game: GameMeta, score: number) => {
  if (game.id === 'reaction-time') return `${score} ms`;
  return String(score);
};

// ============== Leaderboard ==============

export interface LeaderboardEntry {
  score: number;
  at: number;
  mode?: 'normal' | 'daily';
  difficulty?: string;
}

const leaderboardKey = (game: GameMeta) => `habex-leaderboard-${game.id}`;
const MAX_LEADERBOARD = 10;

export const readLeaderboard = (game: GameMeta): LeaderboardEntry[] => {
  try {
    const raw = localStorage.getItem(leaderboardKey(game));
    if (!raw) return [];
    const arr = JSON.parse(raw) as LeaderboardEntry[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

export const recordLeaderboardScore = (
  game: GameMeta,
  score: number,
  meta: { mode?: 'normal' | 'daily'; difficulty?: string } = {}
) => {
  const entries = readLeaderboard(game);
  entries.push({ score, at: Date.now(), mode: meta.mode ?? 'normal', difficulty: meta.difficulty });
  entries.sort((a, b) =>
    game.higherIsBetter === false ? a.score - b.score : b.score - a.score
  );
  const trimmed = entries.slice(0, MAX_LEADERBOARD);
  localStorage.setItem(leaderboardKey(game), JSON.stringify(trimmed));
};

export const clearLeaderboard = (game: GameMeta) => {
  localStorage.removeItem(leaderboardKey(game));
};

// ============== Daily Challenge ==============

export const todayKey = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/** Mulberry32 deterministic PRNG. */
export const seededRng = (seedStr: string) => {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export interface DailyResult {
  date: string;
  score: number;
  at: number;
}

const dailyKey = (game: GameMeta) => `habex-daily-${game.id}`;

export const readDailyResult = (game: GameMeta): DailyResult | null => {
  try {
    const raw = localStorage.getItem(dailyKey(game));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DailyResult;
    if (parsed.date !== todayKey()) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const writeDailyResult = (game: GameMeta, score: number) => {
  const existing = readDailyResult(game);
  if (existing) {
    const better =
      game.higherIsBetter === false ? score < existing.score : score > existing.score;
    if (!better) return existing;
  }
  const result: DailyResult = { date: todayKey(), score, at: Date.now() };
  localStorage.setItem(dailyKey(game), JSON.stringify(result));
  return result;
};
