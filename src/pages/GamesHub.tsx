import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gamepad2, Play, RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  GAMES,
  GAME_CATEGORIES,
  type GameCategory,
  formatScore,
  readBestScore,
  readProgress,
  clearProgress,
} from '@/data/gamesRegistry';
import GamesLeaderboard from '@/components/GamesLeaderboard';

const GamesHub: React.FC = () => {
  const [filter, setFilter] = useState<'All' | GameCategory>('All');
  const [tick, setTick] = useState(0); // forces re-read of localStorage after reset

  const games = useMemo(
    () => (filter === 'All' ? GAMES : GAMES.filter(g => g.category === filter)),
    [filter]
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
          <Gamepad2 className="h-4 w-4" />
          Games
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Train your brain</h1>
        <p className="mt-2 text-muted-foreground">
          Quick games to sharpen memory, reflexes, and focus. Your scores save on this device.
        </p>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter games by category">
        {(['All', ...GAME_CATEGORIES] as const).map(cat => (
          <Button
            key={cat}
            variant={filter === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(cat)}
            aria-pressed={filter === cat}
          >
            {cat}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game, i) => {
          const Icon = game.icon;
          const best = readBestScore(game);
          const progress = readProgress(game);
          void tick;
          return (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="group h-full overflow-hidden transition-all hover:border-primary/60 hover:shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-lg">{game.title}</CardTitle>
                    </div>
                    <Badge variant="secondary">{game.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{game.description}</p>

                  <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/30 p-3 text-sm">
                    <div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Trophy className="h-3 w-3" />
                        {game.scoreLabel}
                      </div>
                      <div className="mt-1 font-semibold">
                        {best !== null ? formatScore(game, best) : '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Resume</div>
                      <div className="mt-1 font-semibold">
                        {progress ? `Lvl ${progress.level}` : 'New game'}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button asChild className="flex-1 gap-2">
                      <Link to={game.path}>
                        <Play className="h-4 w-4" />
                        {progress ? 'Resume' : 'Play'}
                      </Link>
                    </Button>
                    {progress && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Reset progress"
                        onClick={() => {
                          clearProgress(game);
                          setTick(t => t + 1);
                        }}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {games.length === 0 && (
        <div className={cn('rounded-lg border border-dashed p-10 text-center text-muted-foreground')}>
          No games in this category yet.
        </div>
      )}
    </div>
  );
};

export default GamesHub;
