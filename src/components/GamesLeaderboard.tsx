import React, { useMemo, useState } from 'react';
import { Trophy, Calendar, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GAMES, formatScore, readLeaderboard, readDailyResult } from '@/data/gamesRegistry';

const GamesLeaderboard: React.FC = () => {
  const [tick] = useState(0);
  void tick;

  const data = useMemo(
    () =>
      GAMES.map(game => ({
        game,
        entries: readLeaderboard(game),
        daily: readDailyResult(game),
      })),
    []
  );

  return (
    <Card aria-labelledby="leaderboard-heading">
      <CardHeader>
        <CardTitle id="leaderboard-heading" className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-primary" aria-hidden="true" />
          Leaderboard
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Top scores stored on this device. Includes daily challenge results.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {data.map(({ game, entries, daily }) => {
            const Icon = game.icon;
            return (
              <div
                key={game.id}
                className="rounded-lg border bg-muted/20 p-4"
                aria-labelledby={`lb-${game.id}-title`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                    <h3 id={`lb-${game.id}-title`} className="font-semibold">
                      {game.title}
                    </h3>
                  </div>
                  {daily && (
                    <Badge variant="secondary" className="gap-1">
                      <Calendar className="h-3 w-3" aria-hidden="true" />
                      Daily {formatScore(game, daily.score)}
                    </Badge>
                  )}
                </div>

                {entries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No scores yet — play to enter.</p>
                ) : (
                  <ol className="space-y-1.5 text-sm" aria-label={`${game.title} top scores`}>
                    {entries.slice(0, 5).map((e, i) => (
                      <li
                        key={`${e.at}-${i}`}
                        className="flex items-center justify-between gap-2 rounded px-2 py-1 odd:bg-background/60"
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={
                              i === 0
                                ? 'inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary'
                                : 'inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground'
                            }
                            aria-label={`Rank ${i + 1}`}
                          >
                            {i === 0 ? <Star className="h-3 w-3" aria-hidden="true" /> : i + 1}
                          </span>
                          <span className="font-medium">{formatScore(game, e.score)}</span>
                          {e.mode === 'daily' && (
                            <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                              daily
                            </Badge>
                          )}
                          {e.difficulty && (
                            <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                              {e.difficulty}
                            </Badge>
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(e.at).toLocaleDateString()}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default GamesLeaderboard;
