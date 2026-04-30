import React, { useEffect, useRef, useState } from 'react';
import { Calendar, Hash, RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  getGameBySlug,
  readBestScore,
  writeBestScore,
  readProgress,
  writeProgress,
  clearProgress,
  recordLeaderboardScore,
  readDailyResult,
  writeDailyResult,
  seededRng,
  todayKey,
} from '@/data/gamesRegistry';

type Phase = 'ready' | 'showing' | 'input' | 'success' | 'failed';
type Mode = 'normal' | 'daily';

const game = getGameBySlug('number-memory')!;

const randomDigits = (length: number, rng: () => number = Math.random) =>
  Array.from({ length }, () => Math.floor(rng() * 10)).join('');

const NumberMemoryGame: React.FC = () => {
  const [length, setLength] = useState(() => readProgress(game)?.level ?? 3);
  const [target, setTarget] = useState('');
  const [guess, setGuess] = useState('');
  const [phase, setPhase] = useState<Phase>('ready');
  const [mode, setMode] = useState<Mode>('normal');
  const [bestScore, setBestScore] = useState(() => readBestScore(game) ?? 0);
  const [dailyResult, setDailyResult] = useState(() => readDailyResult(game));
  const timerRef = useRef<number | null>(null);
  const dailyRngRef = useRef<(() => number) | null>(null);
  const liveRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  const announce = (t: string) => {
    if (liveRef.current) liveRef.current.textContent = t;
  };

  const startRound = (len: number, currentMode: Mode = mode) => {
    const rng =
      currentMode === 'daily' && dailyRngRef.current ? dailyRngRef.current : Math.random;
    const digits = randomDigits(len, rng);
    setTarget(digits);
    setGuess('');
    setPhase('showing');
    announce(`Memorise a ${len}-digit number.`);
    const showMs = 1500 + len * 400;
    timerRef.current = window.setTimeout(() => {
      setPhase('input');
      announce('Type the number you saw.');
    }, showMs);
  };

  const handleStart = (selectedMode: Mode = 'normal') => {
    setMode(selectedMode);
    if (selectedMode === 'daily') {
      dailyRngRef.current = seededRng(`${game.id}-${todayKey()}`);
      setLength(3);
      startRound(3, 'daily');
    } else {
      dailyRngRef.current = null;
      startRound(length, 'normal');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phase !== 'input') return;
    if (guess === target) {
      const nextLen = length + 1;
      if (length > bestScore) {
        setBestScore(length);
        writeBestScore(game, length);
      } else {
        writeBestScore(game, length); // still record to leaderboard
      }
      recordLeaderboardScore(game, length, { mode, difficulty: undefined });
      if (mode === 'daily') {
        setDailyResult(writeDailyResult(game, length));
      } else {
        writeProgress(game, { level: nextLen, updatedAt: Date.now() });
      }
      setLength(nextLen);
      setPhase('success');
      announce(`Correct. Next length ${nextLen}.`);
      timerRef.current = window.setTimeout(() => startRound(nextLen, mode), 900);
    } else {
      setPhase('failed');
      announce(`Incorrect. The number was ${target}.`);
      if (mode === 'normal') clearProgress(game);
    }
  };

  const handleRestart = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    clearProgress(game);
    setLength(3);
    setGuess('');
    setTarget('');
    setPhase('ready');
    setMode('normal');
    dailyRngRef.current = null;
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
            <Hash className="h-4 w-4" aria-hidden="true" />
            IQ · Number Memory
            {mode === 'daily' && (
              <Badge variant="secondary" className="ml-1 gap-1">
                <Calendar className="h-3 w-3" aria-hidden="true" /> Daily
              </Badge>
            )}
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Number Memory</h1>
          <p className="mt-2 text-muted-foreground">
            Memorise the number, then type it back when prompted.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => handleStart('daily')} variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" aria-hidden="true" />
            Daily
          </Button>
          <Button onClick={handleRestart} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Restart
          </Button>
        </div>
      </div>

      <div ref={liveRef} aria-live="polite" aria-atomic="true" className="sr-only" />

      <div className="grid gap-4 md:grid-cols-[1fr_240px]">
        <Card>
          <CardContent className="flex min-h-[280px] flex-col items-center justify-center gap-4 p-8">
            {phase === 'ready' && (
              <>
                <p className="text-muted-foreground">
                  {mode === 'daily'
                    ? 'Daily seed loaded.'
                    : `Resume at length ${length} digits.`}
                </p>
                <Button onClick={() => handleStart('normal')} size="lg" autoFocus>
                  Start round
                </Button>
              </>
            )}
            {phase === 'showing' && (
              <div
                className="font-display text-5xl font-bold tracking-widest tabular-nums"
                role="status"
                aria-label={`Number to memorise: ${target.split('').join(' ')}`}
              >
                {target}
              </div>
            )}
            {phase === 'input' && (
              <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-3">
                <label htmlFor="nm-guess" className="text-center text-sm text-muted-foreground">
                  Type the {length}-digit number you saw.
                </label>
                <Input
                  id="nm-guess"
                  autoFocus
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={guess}
                  onChange={e => setGuess(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-2xl tracking-widest"
                  maxLength={length}
                  aria-label={`Enter the ${length} digit number`}
                />
                <Button type="submit" disabled={guess.length !== length}>
                  Submit
                </Button>
              </form>
            )}
            {phase === 'success' && (
              <p className="text-lg font-medium text-primary" role="status">
                Correct! Next length: {length}
              </p>
            )}
            {phase === 'failed' && (
              <div className="space-y-3 text-center" role="alert">
                <p className="text-lg font-medium text-destructive">
                  Missed. The number was {target}.
                </p>
                <Button onClick={handleRestart} autoFocus>
                  Try again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Trophy className="h-4 w-4 text-primary" aria-hidden="true" />
                Best Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">{bestScore}</p>
              <p className="mt-1 text-sm text-muted-foreground">Longest digits remembered</p>
              <div className="mt-4 border-t pt-4 text-sm text-muted-foreground">
                Current length: <span className="font-semibold text-foreground">{length}</span>
              </div>
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
                  <p className="text-2xl font-bold text-primary">{dailyResult.score}</p>
                  <p className="text-muted-foreground">Today's best ({todayKey()})</p>
                </>
              ) : (
                <p className="text-muted-foreground">Run today's daily seed.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NumberMemoryGame;
