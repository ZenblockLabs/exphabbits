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
  if (current === null) {
    localStorage.setItem(game.bestScoreKey, String(score));
    return true;
  }
  const better = game.higherIsBetter === false ? score < current : score > current;
  if (better) {
    localStorage.setItem(game.bestScoreKey, String(score));
    return true;
  }
  return false;
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
