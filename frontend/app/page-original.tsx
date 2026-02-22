'use client';

import Link from 'next/link';
import { RevolverCylinder } from '@/components/revolver-cylinder';
import { WalletButton } from '@/components/wallet-button';
import { useWallet } from '@solana/wallet-adapter-react';
import { useHeliusBalance } from '@/hooks/use-helius';
import { useState } from 'react';

export default function Home() {
  const [selectedChamber, setSelectedChamber] = useState(0);
  const { publicKey, connected } = useWallet();
  const { balance } = useHeliusBalance(publicKey?.toBase58() || null);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-40 border-b border-border">
        <div 
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage: 'url(/hero-saloon.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 z-1 bg-gradient-to-r from-background via-background/80 to-transparent" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-10">
              <div className="space-y-6">
                <p className="text-primary font-black text-sm uppercase tracking-widest animate-pulse">
                  ☠️ DEGEN ALERT • PURE ADRENALINE
                </p>
                <h1 className="text-7xl sm:text-8xl font-black text-foreground leading-none">
                  <span className="text-primary">SPIN</span><br/>
                  <span className="text-accent">WIN</span>
                </h1>
                <p className="text-lg text-foreground font-bold pt-4 max-w-lg">
                  Solana's most degenerate roulette on chain.
                </p>
              </div>

              {/* Game Modes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8">
                <Link
                  href="/play/1v1"
                  className="group p-6 rounded-lg border-2 border-primary/40 hover:border-primary bg-card hover:bg-primary/5 transition-all active:scale-95"
                >
                  <div className="text-3xl mb-3">🔫</div>
                  <h3 className="font-black text-lg text-foreground mb-2">GUNSLINGER</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    1v1 Wild West Duel
                  </p>
                  <span className="inline-block text-primary font-bold group-hover:translate-x-2 transition-transform">
                    DRAW →
                  </span>
                </Link>

                <Link
                  href="/play/2v2"
                  className="group p-6 rounded-lg border-2 border-secondary/40 hover:border-secondary bg-card hover:bg-secondary/5 transition-all active:scale-95"
                >
                  <div className="text-3xl mb-3">🤠</div>
                  <h3 className="font-black text-lg text-foreground mb-2">POSSE</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    2v2 Squad Showdown
                  </p>
                  <span className="inline-block text-secondary font-bold group-hover:translate-x-2 transition-transform">
                    RIDE →
                  </span>
                </Link>
              </div>

              {/* CTA Button */}
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <WalletButton className="w-full sm:w-auto" />
                {connected && (
                  <div className="px-4 py-2 rounded-lg bg-accent/10 border border-accent/30">
                    <p className="text-xs text-muted-foreground">Balance</p>
                    <p className="text-lg font-black text-accent">{balance.toFixed(4)} SOL</p>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border">
                <div>
                  <p className="text-3xl font-black text-primary">💰</p>
                  <p className="text-lg font-black text-foreground">$12.3M</p>
                  <p className="text-xs text-muted-foreground font-bold">TOTAL WAGERED</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-secondary">👥</p>
                  <p className="text-lg font-black text-foreground">47.2K</p>
                  <p className="text-xs text-muted-foreground font-bold">DEGEN ARMY</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-accent">📈</p>
                  <p className="text-lg font-black text-foreground">1.8k SOL</p>
                  <p className="text-xs text-muted-foreground font-bold">AVG PAYOUT</p>
                </div>
              </div>
            </div>

            {/* Right - Revolver Animation */}
            <div className="hidden lg:flex items-center justify-center">
              <RevolverCylinder
                selectedChamber={selectedChamber}
                onSpinComplete={() => {
                  setSelectedChamber((prev) => (prev + 1) % 6);
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl font-black text-foreground mb-4 text-center">
            WHY YOU NEED THIS
          </h2>
          <p className="text-center text-muted-foreground font-bold mb-12 text-lg">
            The most degenerate, thrilling, and profitable roulette experience on Solana
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: '💸 REAL MONEY',
                description: 'Win actual SOL instantly. No fake tokens, no BS—direct to your wallet.',
                icon: '💰',
              },
              {
                title: '🚀 LIGHTNING FAST',
                description: 'Solana speed. Transactions confirm in milliseconds. Settle and play again.',
                icon: '⚡',
              },
              {
                title: '📊 PROVABLY FAIR',
                description: 'On-chain verification. No house tricks. Math cannot lie.',
                icon: '🔐',
              },
              {
                title: '🎯 INSTANT PAYOUTS',
                description: 'No waiting. No middlemen. Your W is your W immediately.',
                icon: '✨',
              },
              {
                title: '👑 FLEX GLOBAL',
                description: 'Climb the leaderboard. Earn badges. Become a legend.',
                icon: '🏆',
              },
              {
                title: '💎 DEGEN REWARDS',
                description: 'Weekly prize pools. Seasons. Exclusive NFT badges. Keep leveling up.',
                icon: '🎁',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-lg border-2 border-primary/20 hover:border-primary bg-card hover:bg-primary/5 transition-all group cursor-pointer"
              >
                <p className="text-5xl mb-4">{feature.icon}</p>
                <h3 className="font-black text-lg text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Winners Section */}
      <section className="py-20 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl font-black text-foreground mb-4 text-center">
            TODAY'S W's
          </h2>
          <p className="text-center text-muted-foreground font-bold mb-12">
            These degenerates got lucky. You could be next.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { rank: '👑', player: '7QmK...xFj2', winnings: '234.5 SOL', profit: '+$42,340' },
              { rank: '🔥', player: 'SolWarrior', winnings: '168.2 SOL', profit: '+$31,250' },
              { rank: '💎', player: 'OreSupplyGang', winnings: '145.8 SOL', profit: '+$27,890' },
              { rank: '🚀', player: 'BullMarketBob', winnings: '127.3 SOL', profit: '+$23,450' },
            ].map((winner, i) => (
              <div
                key={i}
                className="p-6 rounded-lg bg-background border-2 border-primary/30 hover:border-primary transition-all group hover:scale-105"
              >
                <p className="text-4xl mb-3">{winner.rank}</p>
                <h3 className="font-black text-lg text-foreground mb-2 truncate">
                  {winner.player}
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">Won: <span className="text-primary font-black">{winner.winnings}</span></p>
                  <p className="text-accent font-black">{winner.profit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 bg-background relative overflow-hidden">
        <div 
          className="absolute inset-0 z-0 opacity-15"
          style={{
            backgroundImage: 'url(/hero-outlaw.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 z-1 bg-gradient-to-t from-background via-background/60 to-background/30" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-6xl font-black text-foreground mb-4">
            FORTUNE WAITS NO ONE
          </h2>
          <p className="text-lg text-foreground font-bold mb-8 max-w-2xl mx-auto">
            47,000+ degens spinning daily on Solana. Will you join the legend?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="gun-metal-button text-lg font-black uppercase px-8 py-4">
              ⚡ SPIN NOW
            </button>
            <Link
              href="/how-it-works"
              className="px-8 py-4 rounded border-2 border-primary text-primary hover:bg-primary/20 transition-colors font-black uppercase"
            >
              📖 LEARN THE GAME
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
