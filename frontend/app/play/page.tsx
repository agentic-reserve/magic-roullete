'use client';

import Link from 'next/link';
import { ArrowRight, Users, Zap } from 'lucide-react';

export default function PlayPage() {
  return (
    <main className="min-h-screen bg-background py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl sm:text-7xl font-black text-foreground mb-4">
            <span className="text-primary">PICK YOUR</span><br/>
            POISON
          </h1>
          <p className="text-xl text-foreground font-bold max-w-2xl mx-auto">
            Solo duel or squad up. Either way, someone's gonna lose big.
          </p>
        </div>

        {/* Game Modes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* 1v1 Mode */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/0 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-8 rounded-lg border-2 border-primary/50 bg-card hover:bg-muted transition-colors">
              <div className="mb-6">
                <div className="text-5xl mb-4">
                  🔫
                </div>
                <h2 className="text-4xl font-black text-foreground mb-2">GUNSLINGER</h2>
                <p className="text-muted-foreground font-bold">
                  One chamber. Two degens. One SOL winner.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <span className="text-lg">⚡</span>
                  <span className="text-sm text-foreground font-bold">Instant matchmaking</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">🎯</span>
                  <span className="text-sm text-foreground font-bold">Best of 3 chambers</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">💰</span>
                  <span className="text-sm text-foreground font-bold">Direct SOL to wallet</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-8 p-4 rounded bg-background border border-border">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Min Stake
                  </p>
                  <p className="font-bold text-primary">0.5 SOL</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Max Stake
                  </p>
                  <p className="font-bold text-primary">100 SOL</p>
                </div>
              </div>

              {/* CTA */}
              <Link
                href="/play/1v1"
                className="w-full px-6 py-3 rounded bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg flex items-center justify-center gap-2 transition-all group-hover:gap-3 uppercase"
              >
                🔫 DRAW
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>

          {/* 2v2 Mode */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-accent/0 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-8 rounded-lg border-2 border-accent/50 bg-card hover:bg-muted transition-colors">
              <div className="mb-6">
                <div className="text-5xl mb-4">
                  🤠
                </div>
                <h2 className="text-4xl font-black text-foreground mb-2">POSSE</h2>
                <p className="text-muted-foreground font-bold">
                  Squad up with homies. Ride together, eat together.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <span className="text-lg">👥</span>
                  <span className="text-sm text-foreground font-bold">Find or create squad</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">🏆</span>
                  <span className="text-sm text-foreground font-bold">Team leaderboard battles</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">💎</span>
                  <span className="text-sm text-foreground font-bold">Shared treasury & rewards</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-8 p-4 rounded bg-background border border-border">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Min Stake
                  </p>
                  <p className="font-bold text-accent">1 SOL</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Max Stake
                  </p>
                  <p className="font-bold text-accent">200 SOL</p>
                </div>
              </div>

              {/* CTA */}
              <Link
                href="/play/2v2"
                className="w-full px-6 py-3 rounded bg-secondary hover:bg-secondary/90 text-secondary-foreground font-black text-lg flex items-center justify-center gap-2 transition-all group-hover:gap-3 uppercase"
              >
                🤠 RIDE
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>

        {/* Rules Section */}
        <div className="max-w-4xl mx-auto p-8 rounded-lg border border-border bg-card">
          <h3 className="text-2xl font-bold text-foreground mb-6">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-primary mb-3">1</div>
              <h4 className="font-semibold text-foreground mb-2">Place Your Bet</h4>
              <p className="text-sm text-muted-foreground">
                Choose your stake in SOL. The higher the risk, the greater the reward.
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-3">2</div>
              <h4 className="font-semibold text-foreground mb-2">Spin & Select</h4>
              <p className="text-sm text-muted-foreground">
                The revolver spins. You select a chamber. Only one is safe.
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-3">3</div>
              <h4 className="font-semibold text-foreground mb-2">Claim Your Prize</h4>
              <p className="text-sm text-muted-foreground">
                Win and the SOL transfers instantly to your wallet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
