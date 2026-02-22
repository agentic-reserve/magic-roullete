'use client';

import Link from 'next/link';

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-4">
            How to Play Magic Roulette
          </h1>
          <p className="text-xl text-muted-foreground">
            Master the art of calculated risk on the Solana blockchain.
          </p>
        </div>

        {/* Game Rules */}
        <section className="mb-16 space-y-8">
          <h2 className="text-3xl font-bold text-foreground">Game Rules</h2>

          <div className="space-y-6">
            {[
              {
                title: 'The Revolver',
                description:
                  'A 6-chamber revolver is loaded with exactly one bullet. The chambers are spun randomly. Players must select which chamber is safe.',
                icon: '🔫',
              },
              {
                title: 'Chamber Selection',
                description:
                  'Each player takes turns selecting a chamber number (1-6). If you select the safe chamber, you win. If you select the loaded chamber, you lose.',
                icon: '🎯',
              },
              {
                title: 'Betting',
                description:
                  'All bets are placed upfront in SOL. The loser\'s stake is transferred directly to the winner\'s wallet via Solana blockchain.',
                icon: '💰',
              },
              {
                title: 'Best of 3',
                description:
                  'In 1v1 duels, you play the best of 3 rounds. In 2v2 matches, teams alternate player selections across 3 rounds.',
                icon: '⚡',
              },
            ].map((rule, i) => (
              <div key={i} className="p-6 rounded-lg border border-border bg-card flex gap-6">
                <div className="text-4xl flex-shrink-0">{rule.icon}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-foreground mb-2">{rule.title}</h3>
                  <p className="text-muted-foreground">{rule.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Step-by-Step Guide */}
        <section className="mb-16 space-y-8">
          <h2 className="text-3xl font-bold text-foreground">Step-by-Step Guide</h2>

          <div className="space-y-6">
            {[
              {
                step: 1,
                title: 'Connect Your Wallet',
                description:
                  'Click "Connect Wallet" and approve the connection request in your Solana wallet (Phantom, Magic Eden, Backpack, etc.).',
              },
              {
                step: 2,
                title: 'Choose Game Mode',
                description:
                  'Select between 1v1 Duel for direct competition or 2v2 Team for squad-based gameplay.',
              },
              {
                step: 3,
                title: 'Set Your Stake',
                description:
                  'Choose how much SOL you want to bet (0.5-100 SOL for 1v1, 1-200 SOL for 2v2).',
              },
              {
                step: 4,
                title: 'Find an Opponent',
                description:
                  'Our matchmaking system finds you an opponent of similar skill level in under 30 seconds.',
              },
              {
                step: 5,
                title: 'Spin the Revolver',
                description:
                  'Click to spin the revolver. The random spin determines which chamber contains the bullet.',
              },
              {
                step: 6,
                title: 'Select Your Chamber',
                description:
                  'Click on a chamber (1-6). You\'ll be prompted to confirm before your decision is locked in.',
              },
              {
                step: 7,
                title: 'View Results',
                description:
                  'Instantly see if you survived. Wins are credited to your wallet immediately via Solana.',
              },
              {
                step: 8,
                title: 'Climb the Leaderboard',
                description:
                  'Earn badges, unlock rewards, and establish yourself as a legendary player.',
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-6">
                <div className="w-12 h-12 rounded-full bg-primary flex-shrink-0 flex items-center justify-center font-bold text-primary-foreground text-lg">
                  {item.step}
                </div>
                <div className="flex-1 p-6 rounded-lg border border-border bg-card">
                  <h3 className="font-bold text-lg text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Strategy Guide */}
        <section className="mb-16 space-y-8">
          <h2 className="text-3xl font-bold text-foreground">Strategy & Tips</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: 'Bankroll Management',
                tips: [
                  'Never bet more than 5% of your total bankroll per match',
                  'Start with smaller stakes to understand the game',
                  'Track your win rate and adjust stakes accordingly',
                ],
              },
              {
                title: 'Chamber Selection',
                tips: [
                  'Mix up your selection patterns to avoid predictability',
                  'Psychological patterns exist - vary your choices',
                  'First rounds are statistically more important',
                ],
              },
              {
                title: 'Team Play (2v2)',
                tips: [
                  'Communicate strategy with your teammate',
                  'Alternate high-risk and conservative players',
                  'Build streak momentum for bonus multipliers',
                ],
              },
              {
                title: 'Long-Term Success',
                tips: [
                  'Play when mentally focused, not emotionally',
                  'Review your match history to identify patterns',
                  'Participate in tournaments for higher rewards',
                ],
              },
            ].map((section, i) => (
              <div key={i} className="p-6 rounded-lg border border-border bg-card">
                <h3 className="font-bold text-lg text-foreground mb-4">{section.title}</h3>
                <ul className="space-y-3">
                  {section.tips.map((tip, j) => (
                    <li key={j} className="flex gap-3">
                      <span className="text-primary flex-shrink-0">✓</span>
                      <span className="text-muted-foreground">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Responsible Gaming */}
        <section className="mb-16 space-y-8">
          <h2 className="text-3xl font-bold text-foreground">Responsible Gaming</h2>

          <div className="p-8 rounded-lg border-2 border-accent/30 bg-card space-y-4">
            <p className="text-foreground">
              Magic Roulette is a game of chance combined with strategic decision-making. Please gamble responsibly:
            </p>

            <ul className="space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <span className="text-accent flex-shrink-0">•</span>
                <span>Only bet money you can afford to lose</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent flex-shrink-0">•</span>
                <span>Set daily/weekly loss limits and stick to them</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent flex-shrink-0">•</span>
                <span>Never chase losses with larger bets</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent flex-shrink-0">•</span>
                <span>Take regular breaks from playing</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent flex-shrink-0">•</span>
                <span>If you feel addicted, reach out for help</span>
              </li>
            </ul>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3">
                For more information on responsible gambling:
              </p>
              <a
                href="#"
                className="text-primary hover:underline font-semibold"
              >
                National Council on Problem Gambling
              </a>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16 space-y-8">
          <h2 className="text-3xl font-bold text-foreground">Frequently Asked Questions</h2>

          <div className="space-y-4">
            {[
              {
                q: 'Is Magic Roulette fair and provably random?',
                a: 'Yes. All game outcomes are verified on the Solana blockchain using Switchboard oracle for true randomness. You can verify any match result on-chain.',
              },
              {
                q: 'What are the minimum and maximum stakes?',
                a: '1v1 duels: 0.5 - 100 SOL. 2v2 team matches: 1 - 200 SOL per team. You can adjust stakes based on your bankroll.',
              },
              {
                q: 'How long does a match take?',
                a: 'Average match duration is 3-5 minutes for 1v1 and 4-7 minutes for 2v2. You have 60 seconds per turn to make your selection.',
              },
              {
                q: 'What happens if I disconnect during a match?',
                a: 'You have 5 minutes to reconnect. If you don\'t, you forfeit the match and lose your stake. Your opponent receives the winnings.',
              },
              {
                q: 'Can I withdraw my earnings anytime?',
                a: 'Yes. Winnings are transferred to your wallet immediately after each match. You can withdraw at any time to your exchange or another wallet.',
              },
              {
                q: 'Is there a house edge or fee?',
                a: 'Magic Roulette takes a 2% platform fee on all matches. This goes toward server costs, security, and community rewards. No hidden fees.',
              },
            ].map((item, i) => (
              <details key={i} className="group p-6 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors cursor-pointer">
                <summary className="font-semibold text-foreground flex justify-between items-center">
                  {item.q}
                  <span className="group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-muted-foreground mt-4">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center p-8 rounded-lg border-2 border-primary/30 bg-card">
          <h2 className="text-2xl font-bold text-foreground mb-4">Ready to Test Your Nerve?</h2>
          <p className="text-muted-foreground mb-6">
            Join the saloon and start playing Magic Roulette today.
          </p>
          <Link
            href="/play"
            className="inline-block px-8 py-3 rounded bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
          >
            Start Playing Now
          </Link>
        </div>
      </div>
    </main>
  );
}
