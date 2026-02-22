'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Github, Twitter, MessageCircle } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Play Now', href: '/play' },
      { label: 'Leaderboard', href: '/leaderboard' },
      { label: 'Rewards', href: '/rewards' },
      { label: 'How It Works', href: '/how-it-works' },
    ],
    resources: [
      { label: 'Documentation', href: '/docs' },
      { label: 'Whitepaper', href: '/whitepaper' },
      { label: 'Smart Contract', href: '/contract' },
      { label: 'Audit Report', href: '/audit' },
    ],
    community: [
      { label: 'Discord', href: 'https://discord.gg/magic-roulette', external: true },
      { label: 'Twitter', href: 'https://twitter.com/magic_roulette', external: true },
      { label: 'GitHub', href: 'https://github.com/magic-roulette', external: true },
      { label: 'Blog', href: '/blog' },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com/magic_roulette', label: 'Twitter' },
    { icon: MessageCircle, href: 'https://discord.gg/magic-roulette', label: 'Discord' },
    { icon: Github, href: 'https://github.com/magic-roulette', label: 'GitHub' },
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 group mb-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                className="text-3xl"
              >
                💀
              </motion.div>
              <div className="flex flex-col">
                <span className="font-black text-lg text-primary group-hover:text-accent transition-colors leading-none">
                  MAGIC ROULETTE
                </span>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                  Degen Edition
                </span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              The most degenerate, thrilling, and profitable roulette experience on Solana. 
              Play with real SOL, win instantly.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg bg-muted hover:bg-primary/20 hover:text-primary transition-colors"
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-black text-sm uppercase tracking-wider text-foreground mb-4">
                {category}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                      >
                        {link.label}
                        <span className="text-xs">↗</span>
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Magic Roulette. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/responsible-gaming" className="hover:text-primary transition-colors">
              Responsible Gaming
            </Link>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground text-center">
            ⚠️ <span className="font-bold">Disclaimer:</span> Magic Roulette is a high-risk game. 
            Only play with funds you can afford to lose. Gambling can be addictive. 
            Play responsibly. Must be 18+ to play.
          </p>
        </div>
      </div>
    </footer>
  );
}
