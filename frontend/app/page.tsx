/**
 * Enhanced Homepage with React Bits Components
 * 
 * This is an enhanced version of the homepage with:
 * - Particle background
 * - Floating cards with 3D tilt
 * - Magnetic buttons
 * - Animated text reveals
 * - Glitch effects
 * 
 * To use: Rename this file to page.tsx (backup the original first)
 */

'use client';

import Link from 'next/link';
import { RevolverCylinder } from '@/components/revolver-cylinder';
import { WalletButton } from '@/components/wallet-button';
import { useWallet } from '@solana/wallet-adapter-react';
import { useHeliusBalance } from '@/hooks/use-helius';
import { useState } from 'react';

// React Bits Components
import { ParticleBackground } from '@/components/react-bits/particle-background';
import { FloatingCard } from '@/components/react-bits/floating-card';
import { MagneticButton } from '@/components/react-bits/magnetic-button';
import { AnimatedText, SplitTextAnimation, GlitchText } from '@/components/react-bits/animated-text';

export default function Home() {
  const [selectedChamber, setSelectedChamber] = useState(0);
  const { publicKey, connected } = useWallet();
  const { balance } = useHeliusBalance(publicKey?.toBase58() || null);

  return (
    <main className="min-h-screen relative">
      {/* Particle Background */}
      <ParticleBackground
        particleCount={80}
        particleColor="rgba(239, 68, 68, 0.3)"
        particleSize={3}
        speed={0.3}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 lg:py-40 border-b border-border">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8 lg:space-y-10">
              <div className="space-y-4 sm:space-y-6">
                <AnimatedText
                  text="☠️ DEGEN ALERT • PURE ADRENALINE"
                  className="text-primary font-black text-xs sm:text-sm uppercase tracking-widest"
                  type="fade"
                  delay={100}
                />
                
                <div className="space-y-2">
                  <SplitTextAnimation
                    text="SPIN"
                    className="text-5xl sm:text-7xl lg:text-8xl font-black text-primary leading-none"
                    type="char"
                    stagger={0.1}
                    delay={300}
                  />
                  <GlitchText
                    text="WIN"
                    className="text-5xl sm:text-7xl lg:text-8xl font-black text-accent leading-none"
                  />
                </div>

                <AnimatedText
                  text="Solana's most degenerate roulette on chain."
                  className="text-base sm:text-lg text-foreground font-bold pt-4 max-w-lg"
                  type="slide"
                  delay={600}
                />
              </div>

              {/* Game Modes with Floating Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4 sm:pt-8">
                <FloatingCard intensity={8}>
                  <Link
                    href="/play/1v1"
                    className="group p-4 sm:p-6 rounded-lg border-2 border-primary/40 hover:border-primary bg-card hover:bg-primary/5 transition-all active:scale-95 block"
                  >
                    <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 animate-float">🔫</div>
                    <h3 className="font-black text-base sm:text-lg text-foreground mb-1 sm:mb-2">GUNSLINGER</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                      1v1 Wild West Duel
                    </p>
                    <span className="inline-block text-sm sm:text-base text-primary font-bold group-hover:translate-x-2 transition-transform">
                      DRAW →
                    </span>
                  </Link>
                </FloatingCard>

                <FloatingCard intensity={8}>
                  <Link
                    href="/play/2v2"
                    className="group p-4 sm:p-6 rounded-lg border-2 border-secondary/40 hover:border-secondary bg-card hover:bg-secondary/5 transition-all active:scale-95 block"
                  >
                    <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 animate-float" style={{ animationDelay: '0.5s' }}>🤠</div>
                    <h3 className="font-black text-base sm:text-lg text-foreground mb-1 sm:mb-2">POSSE</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                      2v2 Squad Showdown
                    </p>
                    <span className="inline-block text-sm sm:text-base text-secondary font-bold group-hover:translate-x-2 transition-transform">
                      RIDE →
                    </span>
                  </Link>
                </FloatingCard>
              </div>

              {/* CTA Button with Magnetic Effect */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-start">
                <MagneticButton strength={0.4}>
                  <WalletButton className="w-full sm:w-auto" />
                </MagneticButton>
                
                {connected && (
                  <AnimatedText
                    text=""
                    className="px-4 py-2 rounded-lg bg-accent/10 border border-accent/30 w-full sm:w-auto"
                    type="scale"
                    delay={800}
                  >
                    <div className="text-center sm:text-left">
                      <p className="text-xs text-muted-foreground">Balance</p>
                      <p className="text-base sm:text-lg font-black text-accent">{balance.toFixed(4)} SOL</p>
                    </div>
                  </AnimatedText>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-6 sm:pt-8 border-t border-border">
                {[
                  { icon: '💰', value: '$12.3M', label: 'TOTAL WAGERED', delay: 900 },
                  { icon: '👥', value: '47.2K', label: 'DEGEN ARMY', delay: 1000 },
                  { icon: '📈', value: '1.8k SOL', label: 'AVG PAYOUT', delay: 1100 },
                ].map((stat, i) => (
                  <AnimatedText
                    key={i}
                    text=""
                    type="scale"
                    delay={stat.delay}
                  >
                    <div className="text-center sm:text-left">
                      <p className="text-2xl sm:text-3xl font-black text-primary">{stat.icon}</p>
                      <p className="text-sm sm:text-lg font-black text-foreground">{stat.value}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground font-bold">{stat.label}</p>
                    </div>
                  </AnimatedText>
                ))}
              </div>
            </div>

            {/* Right - Revolver Animation */}
            <div className="hidden lg:flex items-center justify-center">
              <AnimatedText text="" type="scale" delay={400}>
                <RevolverCylinder
                  selectedChamber={selectedChamber}
                  onSpinComplete={() => {
                    setSelectedChamber((prev) => (prev + 1) % 6);
                  }}
                />
              </AnimatedText>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedText
            text="WHY YOU NEED THIS"
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mb-3 sm:mb-4 text-center"
            type="slide"
          />
          <AnimatedText
            text="The most degenerate, thrilling, and profitable roulette experience on Solana"
            className="text-center text-muted-foreground font-bold mb-8 sm:mb-12 text-sm sm:text-base lg:text-lg px-4"
            type="fade"
            delay={200}
          />

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
              <FloatingCard key={i} intensity={12}>
                <AnimatedText
                  text=""
                  type="scale"
                  delay={300 + i * 100}
                >
                  <div className="p-6 rounded-lg border-2 border-primary/20 hover:border-primary bg-card hover:bg-primary/5 transition-all group cursor-pointer h-full">
                    <p className="text-5xl mb-4 animate-bounce-in" style={{ animationDelay: `${i * 0.1}s` }}>
                      {feature.icon}
                    </p>
                    <h3 className="font-black text-lg text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </AnimatedText>
              </FloatingCard>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Winners Section */}
      <section className="py-20 bg-card border-y border-border relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <GlitchText
            text="TODAY'S W's"
            className="text-5xl font-black text-foreground mb-4 text-center block"
          />
          <AnimatedText
            text="These degenerates got lucky. You could be next."
            className="text-center text-muted-foreground font-bold mb-12"
            type="fade"
            delay={200}
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { rank: '👑', player: '7QmK...xFj2', winnings: '234.5 SOL', profit: '+$42,340' },
              { rank: '🔥', player: 'SolWarrior', winnings: '168.2 SOL', profit: '+$31,250' },
              { rank: '💎', player: 'OreSupplyGang', winnings: '145.8 SOL', profit: '+$27,890' },
              { rank: '🚀', player: 'BullMarketBob', winnings: '127.3 SOL', profit: '+$23,450' },
            ].map((winner, i) => (
              <FloatingCard key={i} intensity={10}>
                <AnimatedText
                  text=""
                  type="scale"
                  delay={400 + i * 100}
                >
                  <div className="p-6 rounded-lg bg-background border-2 border-primary/30 hover:border-primary transition-all group hover:scale-105">
                    <p className="text-4xl mb-3 animate-pulse-glow">{winner.rank}</p>
                    <h3 className="font-black text-lg text-foreground mb-2 truncate">
                      {winner.player}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-muted-foreground">
                        Won: <span className="text-primary font-black">{winner.winnings}</span>
                      </p>
                      <p className="text-accent font-black">{winner.profit}</p>
                    </div>
                  </div>
                </AnimatedText>
              </FloatingCard>
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
          <GlitchText
            text="FORTUNE WAITS NO ONE"
            className="text-6xl font-black text-foreground mb-4 block"
          />
          <AnimatedText
            text="47,000+ degens spinning daily on Solana. Will you join the legend?"
            className="text-lg text-foreground font-bold mb-8 max-w-2xl mx-auto"
            type="fade"
            delay={200}
          />
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <MagneticButton strength={0.5}>
              <button className="gun-metal-button text-lg font-black uppercase px-8 py-4 animate-pulse-glow">
                ⚡ SPIN NOW
              </button>
            </MagneticButton>
            <MagneticButton strength={0.3}>
              <Link
                href="/how-it-works"
                className="px-8 py-4 rounded border-2 border-primary text-primary hover:bg-primary/20 transition-colors font-black uppercase inline-block"
              >
                📖 LEARN THE GAME
              </Link>
            </MagneticButton>
          </div>
        </div>
      </section>
    </main>
  );
}
