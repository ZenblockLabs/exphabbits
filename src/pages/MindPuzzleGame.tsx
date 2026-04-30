import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getGameBySlug, writeBestScore, writeProgress, clearProgress } from '@/data/gamesRegistry';

const TILE_COUNT = 9;
const ROUND_DELAY = 650;
const BEST_SCORE_KEY = 'habex-mind-puzzle-best-score';
const gameMeta = getGameBySlug('mind-puzzle')!;

type GameStatus = 'ready' | 'showing' | 'input' | 'success' | 'failed';

const createNextStep = () => Math.floor(Math.random() * TILE_COUNT);

const MindPuzzleGame: React.FC = () => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [activeTile, setActiveTile] = useState<number | null>(null);
  const [status, setStatus] = useState<GameStatus>('ready');
  const [bestScore, setBestScore] = useState(() => Number(localStorage.getItem(BEST_SCORE_KEY) || 0));

  const level = sequence.length;
  const message = useMemo(() => {
    if (status === 'ready') return 'Start a round and remember the glowing tile order.';
    if (status === 'showing') return 'Watch the pattern carefully.';
    if (status === 'input') return `Repeat step ${playerIndex + 1} of ${sequence.length}.`;
    if (status === 'success') return 'Good memory. Next pattern is longer.';
    return 'Pattern missed. Restart and beat your best.';
  }, [playerIndex, sequence.length, status]);

  const playSequence = async (nextSequence: number[]) => {
    setStatus('showing');
    setPlayerIndex(0);
    for (const tile of nextSequence) {
      await new Promise(resolve => setTimeout(resolve, ROUND_DELAY));
      setActiveTile(tile);
      await new Promise(resolve => setTimeout(resolve, ROUND_DELAY));
      setActiveTile(null);
    }
    setStatus('input');
  };

  const startGame = () => {
    const firstSequence = [createNextStep()];
    setSequence(firstSequence);
    playSequence(firstSequence);
  };

  const nextRound = (currentSequence: number[]) => {
    const nextSequence = [...currentSequence, createNextStep()];
    setSequence(nextSequence);
    playSequence(nextSequence);
  };

  const handleTilePress = (tile: number) => {
    if (status !== 'input') return;

    setActiveTile(tile);
    window.setTimeout(() => setActiveTile(null), 180);

    if (tile !== sequence[playerIndex]) {
      setStatus('failed');
      setPlayerIndex(0);
      return;
    }

    if (playerIndex === sequence.length - 1) {
      const score = sequence.length;
      if (score > bestScore) {
        setBestScore(score);
        writeBestScore(gameMeta, score);
      }
      writeProgress(gameMeta, { level: score + 1, updatedAt: Date.now() });
      setStatus('success');
      window.setTimeout(() => nextRound(sequence), 900);
      return;
    }

    setPlayerIndex(prev => prev + 1);
  };

  useEffect(() => {
    return () => setActiveTile(null);
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
            <Brain className="h-4 w-4" />
            Mind Puzzle
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">IQ Memory Matrix</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{message}</p>
        </div>
        <Button onClick={startGame} className="gap-2">
          {status === 'ready' ? <Sparkles className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
          {status === 'ready' ? 'Start Game' : 'Restart'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_280px]">
        <Card className="overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="grid aspect-square max-h-[620px] grid-cols-3 gap-3 sm:gap-4">
              {Array.from({ length: TILE_COUNT }, (_, index) => {
                const isActive = activeTile === index;
                const disabled = status !== 'input';

                return (
                  <motion.button
                    key={index}
                    type="button"
                    whileTap={{ scale: disabled ? 1 : 0.96 }}
                    onClick={() => handleTilePress(index)}
                    disabled={disabled}
                    className={cn(
                      'rounded-lg border border-border bg-muted/50 text-2xl font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      isActive && 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25',
                      !disabled && 'hover:border-primary/70 hover:bg-primary/10',
                      disabled && 'cursor-default'
                    )}
                    aria-label={`Memory tile ${index + 1}`}
                  >
                    {index + 1}
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
                <Sparkles className="h-4 w-4 text-primary" />
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
                <Trophy className="h-4 w-4 text-primary" />
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
              <CardTitle className="text-base">Focus Mode</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Each round adds one tile to the sequence.</p>
              <p>Repeat the full pattern without mistakes to train short-term memory and attention.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MindPuzzleGame;
