# Solana Wallet Adapter Integration - Magic Roulette

## Overview

Magic Roulette uses the official [Solana Wallet Adapter](https://github.com/anza-xyz/wallet-adapter) for seamless wallet connections. This provides support for all major Solana wallets with a consistent UX.

## Supported Wallets

✅ **Phantom** - Most popular Solana wallet  
✅ **Solflare** - Feature-rich wallet  
✅ **Backpack** - xNFT-enabled wallet  
✅ **Trust Wallet** - Multi-chain wallet  
✅ **Ledger** - Hardware wallet support  
✅ **Trezor** - Hardware wallet support  

## Current Setup

### Dependencies

```json
{
  "@solana/wallet-adapter-base": "^0.9.23",
  "@solana/wallet-adapter-react": "^0.15.35",
  "@solana/wallet-adapter-react-ui": "^0.9.35",
  "@solana/wallet-adapter-wallets": "^0.19.32",
  "@solana/web3.js": "^1.95.8"
}
```

### File Structure

```
frontend/
├── components/
│   ├── wallet-provider.tsx    # Wallet context provider
│   └── wallet-button.tsx      # Connect wallet button
├── hooks/
│   └── use-helius.ts          # Helius integration for balance
└── app/
    ├── layout.tsx             # Root layout with providers
    └── globals.css            # Wallet adapter styles
```

## Implementation

### 1. Wallet Provider (`components/wallet-provider.tsx`)

```tsx
'use client';

import { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  BackpackWalletAdapter,
  TrustWalletAdapter,
} from '@solana/wallet-adapter-wallets';

require('@solana/wallet-adapter-react-ui/styles.css');

export function WalletContextProvider({ children }: { children: React.ReactNode }) {
  const endpoint = process.env.NEXT_PUBLIC_HELIUS_RPC_URL || 
                   'https://api.devnet.solana.com';

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BackpackWalletAdapter(),
      new TrustWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
```

### 2. Wallet Button (`components/wallet-button.tsx`)

```tsx
'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function WalletButton({ className = '' }: { className?: string }) {
  const { connected, publicKey } = useWallet();

  return (
    <WalletMultiButton className={`wallet-adapter-button-trigger ${className}`}>
      {connected && publicKey
        ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
        : 'Connect Wallet'}
    </WalletMultiButton>
  );
}
```

### 3. Root Layout (`app/layout.tsx`)

```tsx
import { WalletContextProvider } from '@/components/wallet-provider';
import { ThemeProvider } from '@/components/theme-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <WalletContextProvider>
            {children}
          </WalletContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 4. Using Wallet in Components

```tsx
'use client';

import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export function GameComponent() {
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const handlePlay = async () => {
    if (!publicKey) {
      alert('Please connect your wallet');
      return;
    }

    // Get balance
    const balance = await connection.getBalance(publicKey);
    console.log('Balance:', balance / LAMPORTS_PER_SOL, 'SOL');

    // Create and send transaction
    // ... your transaction logic
  };

  return (
    <button onClick={handlePlay} disabled={!publicKey}>
      {publicKey ? 'Play Game' : 'Connect Wallet First'}
    </button>
  );
}
```

## Helius Integration

### Balance Hook (`hooks/use-helius.ts`)

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export function useHeliusBalance(address: string | null) {
  const { connection } = useConnection();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) {
      setBalance(0);
      return;
    }

    const fetchBalance = async () => {
      setLoading(true);
      try {
        const publicKey = new PublicKey(address);
        const lamports = await connection.getBalance(publicKey);
        setBalance(lamports / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance(0);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();

    // Poll for balance updates every 10 seconds
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [address, connection]);

  return { balance, loading };
}
```

### Usage

```tsx
import { useWallet } from '@solana/wallet-adapter-react';
import { useHeliusBalance } from '@/hooks/use-helius';

export function BalanceDisplay() {
  const { publicKey } = useWallet();
  const { balance, loading } = useHeliusBalance(publicKey?.toBase58() || null);

  return (
    <div>
      {loading ? 'Loading...' : `${balance.toFixed(4)} SOL`}
    </div>
  );
}
```

## Styling

### Custom Styles (`app/globals.css`)

```css
/* Wallet Adapter Custom Styles */
.wallet-adapter-button-trigger {
  padding: 0.75rem 1.5rem;
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  font-weight: 900;
  text-transform: uppercase;
  border-radius: 0.5rem;
  transition: all 0.2s;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

.wallet-adapter-button-trigger:hover {
  background-color: hsl(var(--primary) / 0.9);
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
}

.wallet-adapter-modal-wrapper {
  background-color: hsl(var(--background) / 0.95);
  backdrop-filter: blur(8px);
}

.wallet-adapter-modal {
  background-color: hsl(var(--card));
  border: 2px solid hsl(var(--primary) / 0.3);
  border-radius: 0.5rem;
}
```

## Common Use Cases

### 1. Check if Wallet is Connected

```tsx
const { connected, publicKey } = useWallet();

if (!connected) {
  return <div>Please connect your wallet</div>;
}
```

### 2. Get Wallet Balance

```tsx
const { connection } = useConnection();
const { publicKey } = useWallet();

const balance = await connection.getBalance(publicKey);
console.log('Balance:', balance / LAMPORTS_PER_SOL, 'SOL');
```

### 3. Send Transaction

```tsx
const { publicKey, sendTransaction } = useWallet();
const { connection } = useConnection();

const transaction = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: publicKey,
    toPubkey: recipientPublicKey,
    lamports: LAMPORTS_PER_SOL * 0.01, // 0.01 SOL
  })
);

const signature = await sendTransaction(transaction, connection);
await connection.confirmTransaction(signature, 'confirmed');
```

### 4. Sign Message

```tsx
const { signMessage } = useWallet();

const message = new TextEncoder().encode('Hello from Magic Roulette!');
const signature = await signMessage(message);
```

### 5. Disconnect Wallet

```tsx
const { disconnect } = useWallet();

const handleDisconnect = () => {
  disconnect();
};
```

## Error Handling

### Connection Errors

```tsx
const { connection } = useConnection();

try {
  const balance = await connection.getBalance(publicKey);
} catch (error) {
  if (error.message.includes('429')) {
    console.error('Rate limit exceeded');
  } else if (error.message.includes('timeout')) {
    console.error('Connection timeout');
  } else {
    console.error('Unknown error:', error);
  }
}
```

### Transaction Errors

```tsx
try {
  const signature = await sendTransaction(transaction, connection);
  await connection.confirmTransaction(signature);
} catch (error) {
  if (error.message.includes('insufficient funds')) {
    alert('Insufficient SOL balance');
  } else if (error.message.includes('User rejected')) {
    alert('Transaction cancelled');
  } else {
    alert('Transaction failed: ' + error.message);
  }
}
```

## Testing

### Local Testing

```bash
# Start local validator
solana-test-validator

# Set CLI to localhost
solana config set --url localhost

# Airdrop SOL
solana airdrop 2

# Run frontend
pnpm dev
```

### Devnet Testing

```bash
# Set CLI to devnet
solana config set --url devnet

# Airdrop SOL
solana airdrop 2

# Update .env.local
NEXT_PUBLIC_HELIUS_RPC_URL=https://api.devnet.solana.com
```

## Troubleshooting

### Wallet Not Connecting

1. **Check if wallet extension is installed**
   ```tsx
   const { wallets } = useWallet();
   console.log('Available wallets:', wallets);
   ```

2. **Check network mismatch**
   - Ensure wallet is on same network (devnet/mainnet)
   - Check RPC endpoint in `.env.local`

3. **Clear browser cache**
   - Wallet adapter caches connection state
   - Clear localStorage: `localStorage.clear()`

### Balance Not Updating

1. **Check RPC endpoint**
   ```tsx
   const { connection } = useConnection();
   console.log('RPC endpoint:', connection.rpcEndpoint);
   ```

2. **Increase polling interval**
   ```tsx
   // Poll more frequently
   const interval = setInterval(fetchBalance, 5000); // 5 seconds
   ```

3. **Use Helius webhooks** (advanced)
   - Subscribe to address changes
   - Real-time balance updates

### Transaction Failing

1. **Check balance**
   ```tsx
   const balance = await connection.getBalance(publicKey);
   if (balance < transactionCost) {
     throw new Error('Insufficient balance');
   }
   ```

2. **Add priority fees**
   ```tsx
   transaction.add(
     ComputeBudgetProgram.setComputeUnitPrice({
       microLamports: 1000,
     })
   );
   ```

3. **Retry with exponential backoff**
   ```tsx
   async function sendWithRetry(tx, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await sendTransaction(tx, connection);
       } catch (error) {
         if (i === maxRetries - 1) throw error;
         await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
       }
     }
   }
   ```

## Security Best Practices

1. **Never expose private keys**
   - Use wallet adapter, never handle private keys directly
   - Let wallet handle signing

2. **Validate all inputs**
   ```tsx
   if (!PublicKey.isOnCurve(address)) {
     throw new Error('Invalid address');
   }
   ```

3. **Check transaction before signing**
   ```tsx
   // Show transaction details to user
   console.log('Transaction:', transaction);
   ```

4. **Use HTTPS in production**
   - Never use HTTP for wallet connections
   - Ensure RPC endpoint uses HTTPS

5. **Implement rate limiting**
   - Prevent spam transactions
   - Add cooldown periods

## Advanced Features

### Auto-Connect

```tsx
<WalletProvider wallets={wallets} autoConnect>
  {children}
</WalletProvider>
```

### Custom Wallet Button

```tsx
export function CustomWalletButton() {
  const { select, wallets, publicKey, disconnect } = useWallet();
  const [isOpen, setIsOpen] = useState(false);

  if (publicKey) {
    return (
      <button onClick={disconnect}>
        {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
      </button>
    );
  }

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Connect Wallet</button>
      {isOpen && (
        <div>
          {wallets.map((wallet) => (
            <button
              key={wallet.adapter.name}
              onClick={() => {
                select(wallet.adapter.name);
                setIsOpen(false);
              }}
            >
              {wallet.adapter.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Transaction Confirmation UI

```tsx
export function TransactionStatus({ signature }: { signature: string }) {
  const { connection } = useConnection();
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'failed'>('pending');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const result = await connection.confirmTransaction(signature);
        setStatus(result.value.err ? 'failed' : 'confirmed');
      } catch {
        setStatus('failed');
      }
    };
    checkStatus();
  }, [signature, connection]);

  return (
    <div>
      {status === 'pending' && '⏳ Confirming...'}
      {status === 'confirmed' && '✅ Confirmed!'}
      {status === 'failed' && '❌ Failed'}
    </div>
  );
}
```

## Resources

- **Official Docs**: https://github.com/anza-xyz/wallet-adapter
- **Solana Cookbook**: https://solanacookbook.com/
- **Helius Docs**: https://docs.helius.dev/
- **Web3.js Docs**: https://solana-labs.github.io/solana-web3.js/

## Support

For issues with wallet adapter:
- GitHub: https://github.com/anza-xyz/wallet-adapter/issues
- Discord: https://discord.gg/solana

For Magic Roulette specific issues:
- Check `frontend/README.md`
- Review error logs in browser console

---

**Status**: ✅ Fully Integrated  
**Last Updated**: February 22, 2025  
**Version**: Wallet Adapter v0.15.35
