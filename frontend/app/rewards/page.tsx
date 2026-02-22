'use client';

import { Badge } from '@/components/badge';
import { useState } from 'react';
import { Copy, CheckCircle } from 'lucide-react';

export default function RewardsPage() {
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  const handleCopyReferral = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedRef(code);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-4">
            Claim Your <span className="text-accent">Rewards</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Earn daily rewards, claim bonuses, and unlock exclusive perks as you climb the leaderboard.
          </p>
        </div>

        {/* Reward Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-lg border-2 border-primary/30 bg-card">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
              Claimable Rewards
            </p>
            <p className="text-4xl font-bold text-primary mb-2">24.5 SOL</p>
            <button className="w-full px-4 py-2 rounded bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors mt-4">
              Claim All
            </button>
          </div>

          <div className="p-6 rounded-lg border border-border bg-card">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
              This Week's Earnings
            </p>
            <p className="text-4xl font-bold text-accent">52.3 SOL</p>
            <p className="text-xs text-muted-foreground mt-2">
              12 wins, 24hr boost active
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border bg-card">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
              Next Milestone
            </p>
            <p className="text-4xl font-bold text-foreground">Sheriff Badge</p>
            <p className="text-xs text-muted-foreground mt-2">
              Need 150 SOL more
            </p>
          </div>
        </div>

        {/* Reward Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Daily Rewards */}
          <div className="p-8 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">📅</span>
              <h2 className="text-2xl font-bold text-foreground">Daily Login Rewards</h2>
            </div>

            <div className="space-y-3">
              {[
                { day: 1, reward: '1.0 SOL', claimed: true },
                { day: 2, reward: '1.5 SOL', claimed: true },
                { day: 3, reward: '2.0 SOL', claimed: true },
                { day: 4, reward: '2.5 SOL', claimed: true },
                { day: 5, reward: '3.0 SOL', claimed: false },
                { day: 6, reward: '3.5 SOL', claimed: false },
                { day: 7, reward: '5.0 SOL Bonus', claimed: false },
              ].map((item) => (
                <div
                  key={item.day}
                  className={`p-4 rounded border transition-colors ${
                    item.claimed
                      ? 'bg-muted/50 border-muted'
                      : 'border-primary/30 bg-primary/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-primary">
                        Day {item.day}
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {item.reward}
                      </span>
                    </div>
                    {item.claimed ? (
                      <CheckCircle size={20} className="text-primary" />
                    ) : (
                      <button className="px-3 py-1 rounded bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90">
                        Claim
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievement Bonuses */}
          <div className="p-8 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🏆</span>
              <h2 className="text-2xl font-bold text-foreground">Achievement Bonuses</h2>
            </div>

            <div className="space-y-3">
              {[
                {
                  title: 'First Victory',
                  description: 'Win your first match',
                  reward: '2.5 SOL',
                  claimed: true,
                },
                {
                  title: 'Winning Streak (5)',
                  description: 'Achieve 5 consecutive wins',
                  reward: '5.0 SOL',
                  claimed: true,
                },
                {
                  title: 'Gunslinger',
                  description: 'Earn 100 SOL in winnings',
                  reward: 'Badge + 2.5 SOL',
                  claimed: true,
                },
                {
                  title: 'Outlaw',
                  description: 'Earn 300 SOL in winnings',
                  reward: 'Badge + 5.0 SOL',
                  claimed: false,
                },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-accent">{item.reward}</p>
                      {item.claimed && (
                        <p className="text-xs text-primary mt-1">Claimed</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Referral Program */}
        <div className="p-8 rounded-lg border-2 border-primary/30 bg-card mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">👥</span>
            <h2 className="text-2xl font-bold text-foreground">Referral Program</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-4 rounded bg-background border border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                Referrals
              </p>
              <p className="text-3xl font-bold text-primary">18</p>
            </div>
            <div className="p-4 rounded bg-background border border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                Total Earned
              </p>
              <p className="text-3xl font-bold text-accent">45.0 SOL</p>
            </div>
            <div className="p-4 rounded bg-background border border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                This Month
              </p>
              <p className="text-3xl font-bold text-foreground">12.5 SOL</p>
            </div>
          </div>

          {/* Referral Links */}
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Share your referral code and earn 10% of your friends' winnings forever.
            </p>
            {[
              { tier: 'Standard', code: 'SHERIFF2024', bonus: '10% commission' },
              { tier: 'VIP', code: 'OUTLAW2024', bonus: '15% commission' },
              { tier: 'Legend', code: 'LEGEND2024', bonus: '20% commission' },
            ].map((ref) => (
              <div
                key={ref.code}
                className="p-4 rounded border border-border bg-background flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{ref.tier}</p>
                  <p className="text-xs text-muted-foreground">{ref.bonus}</p>
                </div>
                <button
                  onClick={() => handleCopyReferral(ref.code)}
                  className="flex items-center gap-2 px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-semibold"
                >
                  {copiedRef === ref.code ? (
                    <>
                      <CheckCircle size={16} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      {ref.code}
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Season Pass */}
        <div className="p-8 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⭐</span>
              <h2 className="text-2xl font-bold text-foreground">Season Pass</h2>
            </div>
            <Badge type="sheriff" size="md" />
          </div>

          <p className="text-muted-foreground mb-8">
            Unlock exclusive rewards and premium perks with our Season Pass. Current season ends in 12 days.
          </p>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-foreground">Level 45 / 50</span>
              <span className="text-sm text-muted-foreground">90%</span>
            </div>
            <div className="w-full h-3 bg-background rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: '90%' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="px-4 py-3 rounded border-2 border-primary bg-primary/10 text-primary hover:bg-primary/20 font-semibold transition-colors">
              View Rewards
            </button>
            <button className="px-4 py-3 rounded border border-border hover:bg-muted font-semibold transition-colors">
              Share Progress
            </button>
            <button className="px-4 py-3 rounded border border-border hover:bg-muted font-semibold transition-colors">
              Upgrade Pass
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
