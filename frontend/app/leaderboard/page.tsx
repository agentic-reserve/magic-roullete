'use client';

import { useState } from 'react';
import { LeaderboardTable } from '@/components/leaderboard-table';
import { Badge } from '@/components/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState('global');
  const [timeFilter, setTimeFilter] = useState('weekly');
  const [categoryFilter, setCategoryFilter] = useState('winnings');

  // Mock data
  const leaderboardData = [
    {
      rank: 1,
      playerName: 'SheriffSolana',
      badge: 'legend' as const,
      winningStreak: 12,
      totalWinnings: 524.3,
      matchesPlayed: 142,
      winRate: 78,
    },
    {
      rank: 2,
      playerName: 'OutlawWinston',
      badge: 'sheriff' as const,
      winningStreak: 8,
      totalWinnings: 487.2,
      matchesPlayed: 128,
      winRate: 71,
    },
    {
      rank: 3,
      playerName: 'RevolverRick',
      badge: 'outlaw' as const,
      winningStreak: 6,
      totalWinnings: 452.1,
      matchesPlayed: 115,
      winRate: 68,
    },
    {
      rank: 4,
      playerName: 'SaloonSally',
      badge: 'gunslinger' as const,
      winningStreak: 5,
      totalWinnings: 428.8,
      matchesPlayed: 98,
      winRate: 65,
    },
    {
      rank: 5,
      playerName: 'RevolverRandy',
      badge: 'gunslinger' as const,
      winningStreak: 4,
      totalWinnings: 398.5,
      matchesPlayed: 85,
      winRate: 62,
    },
    {
      rank: 6,
      playerName: 'GunslingingGrace',
      badge: 'rookie' as const,
      winningStreak: 3,
      totalWinnings: 365.2,
      matchesPlayed: 72,
      winRate: 58,
    },
    {
      rank: 7,
      playerName: 'DesertDan',
      badge: 'rookie' as const,
      winningStreak: 2,
      totalWinnings: 342.1,
      matchesPlayed: 65,
      winRate: 54,
    },
    {
      rank: 8,
      playerName: 'WildWesternWanda',
      badge: 'rookie' as const,
      winningStreak: 1,
      totalWinnings: 318.9,
      matchesPlayed: 52,
      winRate: 50,
    },
  ];

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl sm:text-7xl font-black text-foreground mb-4">
            <span className="text-primary">HALL OF</span><br/>
            <span className="text-accent">LEGENDS</span>
          </h1>
          <p className="text-lg text-foreground font-bold max-w-2xl mx-auto">
            Where the real degens duke it out. Rise, dominate, or fall.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="p-6 rounded-lg border-2 border-primary/30 bg-card hover:border-primary transition-all">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold mb-2">
              💰 Prize Pool
            </p>
            <p className="text-4xl font-black text-primary">$12.3M</p>
            <p className="text-xs text-muted-foreground mt-2 font-bold">TOTAL AT STAKE</p>
          </div>
          <div className="p-6 rounded-lg border-2 border-secondary/30 bg-card hover:border-secondary transition-all">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold mb-2">
              👥 Degens
            </p>
            <p className="text-4xl font-black text-secondary">47.2K</p>
            <p className="text-xs text-muted-foreground mt-2 font-bold">SPINNING NOW</p>
          </div>
          <div className="p-6 rounded-lg border-2 border-primary/30 bg-card hover:border-primary transition-all">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold mb-2">
              ⚡ Avg Speed
            </p>
            <p className="text-4xl font-black text-primary">2.3s</p>
            <p className="text-xs text-muted-foreground mt-2 font-bold">PER SPIN</p>
          </div>
          <div className="p-6 rounded-lg border-2 border-accent/30 bg-card hover:border-accent transition-all">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold mb-2">
              📈 Your Rank
            </p>
            <p className="text-4xl font-black text-accent">#42</p>
            <p className="text-xs text-muted-foreground mt-2 font-bold">TOP 0.1%</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Time Filter */}
            <div className="flex-1">
              <label className="text-sm text-muted-foreground uppercase tracking-wide mb-2 block">
                Season
              </label>
              <div className="flex gap-2">
                {['Weekly', 'Monthly', 'Season'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimeFilter(period.toLowerCase())}
                    className={`flex-1 px-4 py-2 rounded text-sm font-semibold transition-colors ${
                      timeFilter === period.toLowerCase()
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border hover:border-primary'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex-1">
              <label className="text-sm text-muted-foreground uppercase tracking-wide mb-2 block">
                Sort By
              </label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: 'winnings', label: 'Winnings' },
                  { value: 'streak', label: 'Streaks' },
                  { value: 'winrate', label: 'Win Rate' },
                ].map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategoryFilter(cat.value)}
                    className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
                      categoryFilter === cat.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border hover:border-primary'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Tabs */}
        <Tabs defaultValue="global" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="global">Global Rankings</TabsTrigger>
            <TabsTrigger value="teams">Team Rankings</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
          </TabsList>

          {/* Global Rankings */}
          <TabsContent value="global" className="space-y-6">
            <LeaderboardTable
              entries={leaderboardData}
              currentPlayerRank={24}
            />

            {/* Pagination */}
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5, '...', 10].map((page) => (
                <button
                  key={page}
                  className={`px-3 py-2 rounded text-sm font-semibold transition-colors ${
                    page === 1
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border hover:border-primary'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </TabsContent>

          {/* Team Rankings */}
          <TabsContent value="teams" className="space-y-6">
            <LeaderboardTable
              entries={leaderboardData.map((entry, i) => ({
                ...entry,
                playerName: `Team ${entry.playerName.split('').slice(0, 5).join('')}`,
              }))}
            />
          </TabsContent>

          {/* Friends */}
          <TabsContent value="friends" className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground mb-4">
                You haven't added any friends yet.
              </p>
              <button className="px-6 py-2 rounded bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
                Add Friends
              </button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Badge Information */}
        <div className="mt-16 p-8 rounded-lg border border-border bg-card">
          <h2 className="text-2xl font-bold text-foreground mb-8">Rank Progression</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { badge: 'rookie', winnings: '0 - 100 SOL' },
              { badge: 'gunslinger', winnings: '100 - 300 SOL' },
              { badge: 'outlaw', winnings: '300 - 600 SOL' },
              { badge: 'sheriff', winnings: '600 - 1000 SOL' },
              { badge: 'legend', winnings: '1000+ SOL' },
            ].map((tier) => (
              <div key={tier.badge} className="text-center">
                <Badge
                  type={tier.badge as any}
                  size="lg"
                  showLabel={true}
                />
                <p className="text-sm text-muted-foreground mt-4">{tier.winnings}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
