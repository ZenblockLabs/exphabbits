import React, { useEffect, useRef, useState } from 'react';
import { Hash, RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  getGameBySlug,
  readBestScore,
  writeBestScore,
  readProgress,
  writeProgress,
  clearProgress,
} from '@/data/gamesRegistry';

type Phase = 'ready' | 'showing' | 'input' | 'success' | 'failed';

const game = getGameBySlug('number-memory')!;

const randomDigits = (length: number) =>
  Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');

const NumberMemoryGame: React.FC = () => {
  const [length, setLength] = useState(() => readProgress(game)?.level ?? 3);
  const [target, setTarget] = useState('');
  const [guess, setGuess] = useState('');
  const [phase, setPhase] = useState<Phase>('ready');
  const [bestScore, setBestScore] = useState(() => readBestScore(game) ?? 0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  const startRound = (len: number) => {
    const digits = randomDigits(len);
    setTarget(digits);
    setGuess('');
    setPhase('showing');
    const showMs = 1500 + len * 400;
    timerRef.current = window.setTimeout(() => setPhase('input'), showMs);
  };

  const handleStart = () => startRound(length);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phase !== 'input') return;
    if (guess === target) {
      const nextLen = length + 1;
      if (length > bestScore) {
        setBestScore(length);
        writeBestScore(game, length);
      }
      writeProgress(game, { level: nextLen, updatedAt: Date.now() });
      setLength(nextLen);
      setPhase('success');
      timerRef.current = window.setTimeout(() => startRound(nextLen), 900);
    } else {
      setPhase('failed');
      clearProgress(game);
    }
  };

  const handleRestart = () => {
    clearProgress(game);
    setLength(3);
    setGuess('');
    setTarget('');
    setPhase('ready');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
            <Hash className="h-4 w-4" />
            IQ · Number Memory
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Number Memory</h1>
          <p className="mt-2 text-muted-foreground">
            Memorise the number, then type it back when prompted.
          </p>
        </div>
        <Button onClick={handleRestart} variant="outline" className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Restart
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_240px]">
        <Card>
          <CardContent className="flex min-h-[280px] flex-col items-center justify-center gap-4 p-8">
            {phase === 'ready' && (
              <>
                <p className="text-muted-foreground">Resume at length {length} digits.</p>
                <Button onClick={handleStart} size="lg">
                  Start round
                </Button>
              </>
            )}
            {phase === 'showing' && (
              <div className="font-display text-5xl font-bold tracking-widest tabular-nums">
                {target}
              </div>
            )}
            {phase === 'input' && (
              <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-3">
                <p className="text-center text-sm text-muted-foreground">
                  Type the {length}-digit number you saw.
                </p>
                <Input
                  autoFocus
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={guess}
                  onChange={e => setGuess(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-2xl tracking-widest"
                  maxLength={length}
                />
                <Button type="submit" disabled={guess.length !== length}>
                  Submit
                </Button>
              </form>
            )}
            {phase === 'success' && (
              <p className="text-lg font-medium text-primary">Correct! Next length: {length}</p>
            )}
            {phase === 'failed' && (
              <div className="space-y-3 text-center">
                <p className="text-lg font-medium text-destructive">
                  Missed. The number was {target}.
                </p>
                <Button onClick={handleRestart}>Try again</Button>
              </div>
            )}
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
            <p className="mt-1 text-sm text-muted-foreground">Longest digits remembered</p>
            <div className="mt-4 border-t pt-4 text-sm text-muted-foreground">
              Current length: <span className="font-semibold text-foreground">{length}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NumberMemoryGame;
