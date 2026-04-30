import React, { useEffect, useRef, useState } from 'react';
import { Zap, RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  getGameBySlug,
  readBestScore,
  writeBestScore,
  readProgress,
  writeProgress,
} from '@/data/gamesRegistry';

type Phase = 'idle' | 'waiting' | 'go' | 'tooSoon' | 'result';

const game = getGameBySlug('reaction-time')!;

const ReactionTimeGame: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('idle');
  const [reaction, setReaction] = useState<number | null>(null);
  const [bestScore, setBestScore] = useState<number | null>(() => readBestScore(game));
  const [attempts, setAttempts] = useState(() => readProgress(game)?.level ?? 0);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  const armRound = () => {
    setReaction(null);
    setPhase('waiting');
    const delay = 1200 + Math.random() * 2300;
    timerRef.current = window.setTimeout(() => {
      startTimeRef.current = performance.now();
      setPhase('go');
    }, delay);
  };

  const handleClick = () => {
    if (phase === 'idle' || phase === 'result' || phase === 'tooSoon') {
      armRound();
      return;
    }
    if (phase === 'waiting') {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      setPhase('tooSoon');
      return;
    }
    if (phase === 'go') {
      const ms = Math.round(performance.now() - startTimeRef.current);
      setReaction(ms);
      setPhase('result');
      const next = attempts + 1;
      setAttempts(next);
      writeProgress(game, { level: next, updatedAt: Date.now() });
      if (writeBestScore(game, ms)) setBestScore(ms);
      else if (bestScore === null) setBestScore(ms);
    }
  };

  const reset = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setPhase('idle');
    setReaction(null);
  };

  const surfaceClass =
    phase === 'go'
      ? 'bg-emerald-500 text-white'
      : phase === 'waiting'
        ? 'bg-amber-500 text-white'
        : phase === 'tooSoon'
          ? 'bg-destructive text-destructive-foreground'
          : 'bg-muted hover:bg-muted/80';

  const message =
    phase === 'idle'
      ? 'Click anywhere to start.'
      : phase === 'waiting'
        ? 'Wait for green…'
        : phase === 'go'
          ? 'CLICK!'
          : phase === 'tooSoon'
            ? 'Too soon — click to retry.'
            : `${reaction} ms · click for another round`;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
            <Zap className="h-4 w-4" />
            Improvements · Reaction Time
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Reaction Time</h1>
          <p className="mt-2 text-muted-foreground">
            When the surface turns green, click as fast as you can.
          </p>
        </div>
        <Button onClick={reset} variant="outline" className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_240px]">
        <button
          type="button"
          onClick={handleClick}
          className={cn(
            'flex min-h-[320px] w-full cursor-pointer items-center justify-center rounded-lg border text-2xl font-semibold transition-colors',
            surfaceClass
          )}
        >
          {message}
        </button>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Trophy className="h-4 w-4 text-primary" />
                Best Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">
                {bestScore !== null ? `${bestScore} ms` : '—'}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Lower is better</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Attempts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{attempts}</p>
              <p className="mt-1 text-sm text-muted-foreground">Tracked on this device</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReactionTimeGame;
