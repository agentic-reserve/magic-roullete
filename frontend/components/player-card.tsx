'use client';

interface PlayerCardProps {
  playerName: string;
  team?: string;
  health: number;
  balance: number;
  rank?: number;
  badge?: 'rookie' | 'gunslinger' | 'outlaw' | 'sheriff' | 'legend';
  isActive?: boolean;
  isWinner?: boolean;
}

const badgeConfig = {
  rookie: { label: 'Rookie', color: 'text-muted-foreground' },
  gunslinger: { label: 'Gunslinger', color: 'text-primary' },
  outlaw: { label: 'Outlaw', color: 'text-accent' },
  sheriff: { label: 'Sheriff', color: 'text-primary' },
  legend: { label: 'Legend', color: 'text-yellow-500' },
};

export function PlayerCard({
  playerName,
  team,
  health,
  balance,
  rank,
  badge = 'rookie',
  isActive = false,
  isWinner = false,
}: PlayerCardProps) {
  const badgeInfo = badgeConfig[badge];

  return (
    <div
      className={`p-6 rounded-lg border-2 transition-all ${
        isActive
          ? 'border-primary bg-muted shadow-lg shadow-primary/20'
          : 'border-border bg-card'
      } ${isWinner ? 'ring-2 ring-accent ring-offset-2 ring-offset-background' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg text-foreground">{playerName}</h3>
          {team && (
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Team: {team}
            </p>
          )}
        </div>
        {rank && (
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">#{rank}</p>
          </div>
        )}
      </div>

      {/* Badge */}
      {badge && (
        <p className={`text-xs font-semibold uppercase tracking-wide mb-4 ${badgeInfo.color}`}>
          ⭐ {badgeInfo.label}
        </p>
      )}

      {/* Health Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">
            Health
          </label>
          <span className="text-sm font-semibold text-foreground">{health}%</span>
        </div>
        <div className="w-full h-2 bg-background rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              health > 50
                ? 'bg-primary'
                : health > 25
                ? 'bg-yellow-600'
                : 'bg-accent'
            }`}
            style={{ width: `${health}%` }}
          />
        </div>
      </div>

      {/* Balance */}
      <div className="p-3 rounded bg-background border border-border">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
          Balance
        </p>
        <p className="font-bold text-lg text-primary">{balance} SOL</p>
      </div>

      {/* Status Badge */}
      {isWinner && (
        <div className="mt-4 p-2 rounded bg-accent/10 border border-accent text-center">
          <p className="text-xs font-bold text-accent uppercase">🏆 Winner</p>
        </div>
      )}
    </div>
  );
}
