'use client';

type BadgeType = 'rookie' | 'gunslinger' | 'outlaw' | 'sheriff' | 'legend';

interface BadgeProps {
  type: BadgeType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const badgeConfig = {
  rookie: {
    label: 'Rookie',
    icon: '🤠',
    color: 'bg-muted text-muted-foreground',
    borderColor: 'border-muted-foreground/30',
  },
  gunslinger: {
    label: 'Gunslinger',
    icon: '🔫',
    color: 'bg-primary/10 text-primary',
    borderColor: 'border-primary/30',
  },
  outlaw: {
    label: 'Outlaw',
    icon: '💀',
    color: 'bg-accent/10 text-accent',
    borderColor: 'border-accent/30',
  },
  sheriff: {
    label: 'Sheriff',
    icon: '⭐',
    color: 'bg-yellow-950/30 text-yellow-500',
    borderColor: 'border-yellow-500/30',
  },
  legend: {
    label: 'Legend',
    icon: '👑',
    color: 'bg-yellow-900/40 text-yellow-300',
    borderColor: 'border-yellow-300/40',
  },
};

export function Badge({ type, size = 'md', showLabel = true }: BadgeProps) {
  const badge = badgeConfig[type];

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  return (
    <div
      className={`
        inline-flex items-center gap-2 rounded-full border
        ${sizeClasses[size]}
        ${badge.color}
        ${badge.borderColor}
        font-semibold
      `}
    >
      <span className={size === 'lg' ? 'text-lg' : size === 'md' ? 'text-base' : 'text-sm'}>
        {badge.icon}
      </span>
      {showLabel && <span>{badge.label}</span>}
    </div>
  );
}
