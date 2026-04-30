import React, { useEffect, useRef, useState } from 'react';
import { Calendar, Zap, RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  getGameBySlug,
  readBestScore,
  writeBestScore,
  readProgress,
  writeProgress,
  recordLeaderboardScore,
  readDailyResult,
  writeDailyResult,
  seededRng,
  todayKey,
} from '@/data/gamesRegistry';

type Phase = 'idle' | 'waiting' | 'go' | 'tooSoon' | 'result';
type Mode = 'normal' | 'daily';

const game = getGameBySlug('reaction-time')!;

const ReactionTimeGame: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('idle');
  const [mode, setMode] = useState<Mode>('normal');
  const [reaction, setReaction] = useState<number | null>(null);
  const [bestScore, setBestScore] = useState<number | null>(() => readBestScore(game));
  const [attempts, setAttempts] = useState(() => readProgress(game)?.level ?? 0);
  const [dailyResult, setDailyResult] = useState(() => readDailyResult(game));
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const surfaceRef = useRef<HTMLButtonElement | null>(null);
  const dailyRngRef = useRef<(() => number) | null>(null);
  const liveRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  const announce = (t: string) => {
    if (liveRef.current) liveRef.current.textContent = t;
  };

  const armRound = (currentMode: Mode = mode) => {
    setReaction(null);
    setPhase('waiting');
    announce('Wait for green.');
    const rng =
      currentMode === 'daily' && dailyRngRef.current ? dailyRngRef.current : Math.random;
    const delay = 1200 + rng() * 2300;
    timerRef.current = window.setTimeout(() => {
      startTimeRef.current = performance.now();
      setPhase('go');
      announce('Click now!');
    }, delay);
  };

  const startMode = (selectedMode: Mode) => {
    setMode(selectedMode);
    if (selectedMode === 'daily') {
      dailyRngRef.current = seededRng(`${game.id}-${todayKey()}`);
    } else {
      dailyRngRef.current = null;
    }
    armRound(selectedMode);
  };

  const handleClick = () => {
    if (phase === 'idle' || phase === 'result' || phase === 'tooSoon') {
      armRound();
      return;
    }
    if (phase === 'waiting') {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      setPhase('tooSoon');
      announce('Too soon. Click to retry.');
      return;
    }
    if (phase === 'go') {
      const ms = Math.round(performance.now() - startTimeRef.current);
      setReaction(ms);
      setPhase('result');
      announce(`${ms} milliseconds.`);
      const next = attempts + 1;
      setAttempts(next);
      writeProgress(game, { level: next, updatedAt: Date.now() });
      const isBetter = writeBestScore(game, ms);
      if (isBetter) setBestScore(ms);
      else if (bestScore === null) setBestScore(ms);
      recordLeaderboardScore(game, ms, { mode });
      if (mode === 'daily') {
        setDailyResult(writeDailyResult(game, ms));
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleClick();
    }
  };

  const reset = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setPhase('idle');
    setReaction(null);
    setMode('normal');
    dailyRngRef.current = null;
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
      ? 'Click or press Space to start.'
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
            <Zap className="h-4 w-4" aria-hidden="true" />
            Improvements · Reaction Time
            {mode === 'daily' && (
              <Badge variant="secondary" className="ml-1 gap-1">
                <Calendar className="h-3 w-3" aria-hidden="true" /> Daily
              </Badge>
            )}
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Reaction Time</h1>
          <p className="mt-2 text-muted-foreground">
            When the surface turns green, click as fast as you can.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => startMode('daily')} variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" aria-hidden="true" />
            Daily
          </Button>
          <Button onClick={reset} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </Button>
        </div>
      </div>

      <div ref={liveRef} aria-live="assertive" aria-atomic="true" className="sr-only" />

      <div className="grid gap-4 md:grid-cols-[1fr_240px]">
        <button
          ref={surfaceRef}
          type="button"
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          aria-label={`Reaction surface: ${message}`}
          aria-pressed={phase === 'go'}
          className={cn(
            'flex min-h-[320px] w-full cursor-pointer items-center justify-center rounded-lg border text-2xl font-semibold transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            surfaceClass
          )}
        >
          {message}
        </button>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Trophy className="h-4 w-4 text-primary" aria-hidden="true" />
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
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4 text-primary" aria-hidden="true" />
                Daily
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {dailyResult ? (
                <>
                  <p className="text-2xl font-bold text-primary">{dailyResult.score} ms</p>
                  <p className="text-muted-foreground">Today's best ({todayKey()})</p>
                </>
              ) : (
                <p className="text-muted-foreground">Run today's seeded delay.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReactionTimeGame;
