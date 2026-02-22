/**
 * Wallet Connect Button Component
 * 
 * Custom styled wallet button for Magic Roulette
 */

"use client";

import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut } from 'lucide-react';

interface WalletButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
}

export function WalletButton({ className = '', variant = 'default' }: WalletButtonProps) {
  const { connected, disconnect, publicKey } = useWallet();

  if (connected && publicKey) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/30">
          <Wallet className="w-4 h-4 text-primary" />
          <span className="text-sm font-mono text-foreground">
            {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={disconnect}
          className="gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Disconnect</span>
        </Button>
      </div>
    );
  }

  return (
    <WalletMultiButton className={`wallet-adapter-button-custom ${className}`} />
  );
}

// Custom styled wallet button (alternative)
export function CustomWalletButton({ className = '' }: WalletButtonProps) {
  const { connected, connect, disconnect, publicKey, wallet } = useWallet();

  const handleClick = () => {
    if (connected) {
      disconnect();
    } else {
      // This will open the wallet modal
      const button = document.querySelector('.wallet-adapter-button-trigger') as HTMLButtonElement;
      button?.click();
    }
  };

  return (
    <Button
      onClick={handleClick}
      className={`gun-metal-button ${className}`}
      size="lg"
    >
      {connected && publicKey ? (
        <>
          <Wallet className="w-5 h-5 mr-2" />
          {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
        </>
      ) : (
        <>
          <Wallet className="w-5 h-5 mr-2" />
          CONNECT WALLET
        </>
      )}
    </Button>
  );
}
