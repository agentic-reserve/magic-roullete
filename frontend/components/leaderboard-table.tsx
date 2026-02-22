'use client';

import { Badge } from './badge';

type BadgeType = 'rookie' | 'gunslinger' | 'outlaw' | 'sheriff' | 'legend';

interface LeaderboardEntry {
  rank: number;
  playerName: string;
  badge: BadgeType;
  winningStreak: number;
  totalWinnings: number;
  matchesPlayed: number;
  winRate: number;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  isLoading?: boolean;
  currentPlayerRank?: number;
}

export function LeaderboardTable({
  entries,
  isLoading = false,
  currentPlayerRank,
}: LeaderboardTableProps) {
  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '#';
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">Loading leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Table Header */}
      <div className="hidden md:grid grid-cols-6 gap-4 p-4 border-b border-border bg-muted/50 font-semibold text-sm text-muted-foreground uppercase tracking-wide">
        <div>Rank</div>
        <div className="col-span-2">Player</div>
        <div>Streak</div>
        <div>Winnings</div>
        <div>Win Rate</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-border">
        {entries.map((entry) => {
          const isCurrentPlayer = entry.rank === currentPlayerRank;

          return (
            <div
              key={entry.rank}
              className={`p-4 hover:bg-muted/50 transition-colors ${
                isCurrentPlayer ? 'bg-primary/10 border-l-4 border-primary' : ''
              }`}
            >
              {/* Mobile View */}
              <div className="md:hidden space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-primary">
                      {getMedalEmoji(entry.rank)}
                    </span>
                    <div>
                      <h3 className="font-bold text-foreground">{entry.playerName}</h3>
                      <Badge type={entry.badge} size="sm" />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-accent">{entry.totalWinnings}</p>
                    <p className="text-xs text-muted-foreground">SOL</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Streak</p>
                    <p className="font-semibold text-primary">{entry.winningStreak}🔥</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Matches</p>
                    <p className="font-semibold text-foreground">{entry.matchesPlayed}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Win Rate</p>
                    <p className="font-semibold text-foreground">{entry.winRate}%</p>
                  </div>
                </div>
              </div>

              {/* Desktop View */}
              <div className="hidden md:grid grid-cols-6 gap-4 items-center">
                {/* Rank */}
                <div className="text-2xl font-bold text-primary">
                  {getMedalEmoji(entry.rank)}
                </div>

                {/* Player Info */}
                <div className="col-span-2">
                  <h3 className="font-bold text-foreground">{entry.playerName}</h3>
                  <Badge type={entry.badge} size="sm" />
                </div>

                {/* Winning Streak */}
                <div>
                  <p className="font-bold text-primary">{entry.winningStreak}</p>
                  <p className="text-xs text-muted-foreground">🔥 streak</p>
                </div>

                {/* Winnings */}
                <div>
                  <p className="font-bold text-lg text-accent">{entry.totalWinnings}</p>
                  <p className="text-xs text-muted-foreground">SOL</p>
                </div>

                {/* Win Rate */}
                <div>
                  <p className="font-bold text-foreground">{entry.winRate}%</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.matchesPlayed} matches
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {entries.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-muted-foreground">No players yet. Be the first legend!</p>
        </div>
      )}
    </div>
  );
}
