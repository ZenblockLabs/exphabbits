import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Calendar, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  getGameBySlug,
  writeBestScore,
  writeProgress,
  clearProgress,
  recordLeaderboardScore,
  readDailyResult,
  writeDailyResult,
  seededRng,
  todayKey,
} from '@/data/gamesRegistry';

const gameMeta = getGameBySlug('mind-puzzle')!;

type GameStatus = 'ready' | 'showing' | 'input' | 'success' | 'failed';
type Mode = 'normal' | 'daily';

interface Difficulty {
  id: 'easy' | 'medium' | 'hard';
  label: string;
  tiles: 4 | 9 | 16;
  cols: 2 | 3 | 4;
  speed: number; // ms per step
}

const DIFFICULTIES: Difficulty[] = [
  { id: 'easy', label: 'Easy · 2×2 · slow', tiles: 4, cols: 2, speed: 800 },
  { id: 'medium', label: 'Medium · 3×3', tiles: 9, cols: 3, speed: 650 },
  { id: 'hard', label: 'Hard · 4×4 · fast', tiles: 16, cols: 4, speed: 420 },
];

const DIFFICULTY_KEY = 'habex-mind-puzzle-difficulty';

const MindPuzzleGame: React.FC = () => {
  const [difficultyId, setDifficultyId] = useState<Difficulty['id']>(() => {
    const saved = localStorage.getItem(DIFFICULTY_KEY);
    return (saved === 'easy' || saved === 'medium' || saved === 'hard' ? saved : 'medium') as Difficulty['id'];
  });
  const difficulty = useMemo(
    () => DIFFICULTIES.find(d => d.id === difficultyId) ?? DIFFICULTIES[1],
    [difficultyId]
  );

  const [mode, setMode] = useState<Mode>('normal');
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [activeTile, setActiveTile] = useState<number | null>(null);
  const [status, setStatus] = useState<GameStatus>('ready');
  const [bestScore, setBestScore] = useState(
    () => Number(localStorage.getItem(gameMeta.bestScoreKey) || 0)
  );
  const [dailyResult, setDailyResult] = useState(() => readDailyResult(gameMeta));
  const tileRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const liveRef = useRef<HTMLDivElement | null>(null);

  // For daily mode, generator is seeded so the sequence is deterministic per day
  const dailyRngRef = useRef<(() => number) | null>(null);

  const level = sequence.length;

  const message = useMemo(() => {
    if (status === 'ready') return 'Choose a difficulty and start a round.';
    if (status === 'showing') return 'Watch the pattern carefully.';
    if (status === 'input') return `Repeat step ${playerIndex + 1} of ${sequence.length}.`;
    if (status === 'success') return 'Good memory. Next pattern is longer.';
    return 'Pattern missed. Restart and beat your best.';
  }, [playerIndex, sequence.length, status]);

  const announce = (text: string) => {
    if (liveRef.current) liveRef.current.textContent = text;
  };

  const persistDifficulty = (id: Difficulty['id']) => {
    setDifficultyId(id);
    localStorage.setItem(DIFFICULTY_KEY, id);
  };

  const nextStep = (): number => {
    if (mode === 'daily' && dailyRngRef.current) {
      return Math.floor(dailyRngRef.current() * difficulty.tiles);
    }
    return Math.floor(Math.random() * difficulty.tiles);
  };

  const playSequence = async (nextSequence: number[]) => {
    setStatus('showing');
    setPlayerIndex(0);
    announce(`Showing pattern of ${nextSequence.length} tiles.`);
    for (const tile of nextSequence) {
      await new Promise(resolve => setTimeout(resolve, difficulty.speed));
      setActiveTile(tile);
      await new Promise(resolve => setTimeout(resolve, difficulty.speed));
      setActiveTile(null);
    }
    setStatus('input');
    announce('Your turn. Repeat the pattern.');
  };

  const startGame = (selectedMode: Mode = mode) => {
    setMode(selectedMode);
    if (selectedMode === 'daily') {
      // Seed includes game id, date, and difficulty so daily is deterministic per difficulty
      dailyRngRef.current = seededRng(`${gameMeta.id}-${todayKey()}-${difficulty.id}`);
    } else {
      dailyRngRef.current = null;
    }
    const first = [
      selectedMode === 'daily' && dailyRngRef.current
        ? Math.floor(dailyRngRef.current() * difficulty.tiles)
        : Math.floor(Math.random() * difficulty.tiles),
    ];
    setSequence(first);
    playSequence(first);
  };

  const nextRound = (currentSequence: number[]) => {
    const next = [...currentSequence, nextStep()];
    setSequence(next);
    playSequence(next);
  };

  const finishGame = (finalScore: number) => {
    if (finalScore > bestScore) {
      setBestScore(finalScore);
    }
    writeBestScore(gameMeta, finalScore); // also records to leaderboard
    recordLeaderboardScore(gameMeta, finalScore, {
      mode,
      difficulty: difficulty.id,
    });
    if (mode === 'daily') {
      const updated = writeDailyResult(gameMeta, finalScore);
      setDailyResult(updated);
    }
  };

  const handleTilePress = (tile: number) => {
    if (status !== 'input') return;

    setActiveTile(tile);
    window.setTimeout(() => setActiveTile(null), 180);

    if (tile !== sequence[playerIndex]) {
      setStatus('failed');
      setPlayerIndex(0);
      clearProgress(gameMeta);
      finishGame(sequence.length - 1 < 0 ? 0 : sequence.length - 1);
      announce('Incorrect. Game over.');
      return;
    }

    if (playerIndex === sequence.length - 1) {
      const score = sequence.length;
      writeProgress(gameMeta, { level: score + 1, updatedAt: Date.now() });
      if (score > bestScore) {
        setBestScore(score);
      }
      // Track best as we go
      writeBestScore(gameMeta, score);
      setStatus('success');
      announce(`Correct! Level ${score} cleared.`);
      window.setTimeout(() => nextRound(sequence), 900);
      return;
    }

    setPlayerIndex(prev => prev + 1);
  };

  // Keyboard navigation across tiles
  const handleTileKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const cols = difficulty.cols;
    const total = difficulty.tiles;
    let target: number | null = null;
    switch (e.key) {
      case 'ArrowRight':
        target = (index + 1) % total;
        break;
      case 'ArrowLeft':
        target = (index - 1 + total) % total;
        break;
      case 'ArrowDown':
        target = (index + cols) % total;
        break;
      case 'ArrowUp':
        target = (index - cols + total) % total;
        break;
      case 'Home':
        target = 0;
        break;
      case 'End':
        target = total - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    if (target !== null) tileRefs.current[target]?.focus();
  };

  useEffect(() => {
    return () => setActiveTile(null);
  }, []);

  // Reset board if difficulty changes mid-idle
  useEffect(() => {
    if (status === 'ready' || status === 'failed') {
      setSequence([]);
      setPlayerIndex(0);
      setActiveTile(null);
      tileRefs.current = [];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficultyId]);

  const colsClass =
    difficulty.cols === 2
      ? 'grid-cols-2'
      : difficulty.cols === 3
        ? 'grid-cols-3'
        : 'grid-cols-4';

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
            <Brain className="h-4 w-4" aria-hidden="true" />
            Mind Puzzle
            {mode === 'daily' && (
              <Badge variant="secondary" className="ml-1 gap-1">
                <Calendar className="h-3 w-3" aria-hidden="true" /> Daily
              </Badge>
            )}
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">IQ Memory Matrix</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{message}</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="mp-difficulty" className="text-xs text-muted-foreground">
              Difficulty
            </Label>
            <Select
              value={difficultyId}
              onValueChange={v => persistDifficulty(v as Difficulty['id'])}
            >
              <SelectTrigger id="mp-difficulty" className="w-[200px]" aria-label="Difficulty">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTIES.map(d => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => startGame('normal')} className="gap-2">
            {status === 'ready' ? <Sparkles className="h-4 w-4" aria-hidden="true" /> : <RotateCcw className="h-4 w-4" aria-hidden="true" />}
            {status === 'ready' && mode !== 'daily' ? 'Start' : 'Restart'}
          </Button>
          <Button onClick={() => startGame('daily')} variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" aria-hidden="true" />
            Daily
          </Button>
        </div>
      </div>

      {/* Live region for screen readers */}
      <div ref={liveRef} aria-live="polite" aria-atomic="true" className="sr-only" />

      <div className="grid gap-4 md:grid-cols-[1fr_280px]">
        <Card className="overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div
              role="grid"
              aria-label={`Memory tile grid, ${difficulty.cols} columns`}
              className={cn('grid aspect-square max-h-[620px] gap-3 sm:gap-4', colsClass)}
            >
              {Array.from({ length: difficulty.tiles }, (_, index) => {
                const isActive = activeTile === index;
                const disabled = status !== 'input';
                const row = Math.floor(index / difficulty.cols) + 1;
                const col = (index % difficulty.cols) + 1;
                return (
                  <motion.button
                    key={index}
                    ref={el => (tileRefs.current[index] = el)}
                    type="button"
                    role="gridcell"
                    aria-label={`Tile row ${row} column ${col}${isActive ? ', highlighted' : ''}`}
                    aria-pressed={isActive}
                    aria-disabled={disabled}
                    whileTap={{ scale: disabled ? 1 : 0.96 }}
                    onClick={() => handleTilePress(index)}
                    onKeyDown={e => handleTileKeyDown(e, index)}
                    disabled={disabled}
                    tabIndex={status === 'input' ? 0 : -1}
                    className={cn(
                      'rounded-lg border border-border bg-muted/50 text-2xl font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                      isActive && 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25',
                      !disabled && 'hover:border-primary/70 hover:bg-primary/10',
                      disabled && 'cursor-default'
                    )}
                  >
                    <span aria-hidden="true">{index + 1}</span>
                  </motion.button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                Current Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">{level}</p>
              <p className="mt-1 text-sm text-muted-foreground">Pattern length</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Trophy className="h-4 w-4 text-primary" aria-hidden="true" />
                Best Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">{bestScore}</p>
              <p className="mt-1 text-sm text-muted-foreground">Saved on this device</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4 text-primary" aria-hidden="true" />
                Daily Challenge
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              {dailyResult ? (
                <>
                  <p className="text-2xl font-bold text-primary">{dailyResult.score}</p>
                  <p className="text-muted-foreground">Today's best ({todayKey()})</p>
                </>
              ) : (
                <p className="text-muted-foreground">
                  Start the daily run for today's deterministic seed.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MindPuzzleGame;
