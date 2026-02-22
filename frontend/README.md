# Magic Roulette Frontend

Next.js frontend for Magic Roulette with Solana wallet integration and Helius RPC.

## Features

- ✅ Solana Wallet Adapter (Phantom, Solflare, Backpack, Trust)
- ✅ Helius RPC Integration (ultra-fast, reliable)
- ✅ Real-time balance updates via WebSocket
- ✅ Kamino Finance loan integration
- ✅ Real-time game state subscriptions
- ✅ Priority fee estimation
- ✅ Enhanced transaction parsing
- ✅ Responsive UI with Tailwind CSS
- ✅ Dark mode support

## Setup

### 1. Install Dependencies

```bash
cd frontend
pnpm install
```

### 2. Configure Environment

Create `.env.local`:

```bash
# Helius API Key (get from https://dashboard.helius.dev)
NEXT_PUBLIC_HELIUS_API_KEY=your_helius_api_key_here

# Solana Network
NEXT_PUBLIC_SOLANA_NETWORK=devnet

# Program IDs
NEXT_PUBLIC_PROGRAM_ID=JE2fDdXcYEprUR2yPmWdLGDSJ7Y7HD8qsJ52eD6qUavq
NEXT_PUBLIC_KAMINO_PROGRAM_ID=KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD
NEXT_PUBLIC_KAMINO_MARKET_DEVNET=DxXdAyU3kCjnyggvHmY5nAwg5cRbbmdyX3npfDMjjMek
```

### 3. Get Helius API Key

1. Visit [dashboard.helius.dev](https://dashboard.helius.dev)
2. Create account or sign in
3. Generate API key
4. Copy to `.env.local`

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
frontend/
├── app/                      # Next.js app directory
│   ├── layout.tsx           # Root layout with wallet provider
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── wallet-provider.tsx  # Wallet context provider
│   ├── wallet-button.tsx    # Wallet connect button
│   ├── kamino-loan-selector.tsx  # Loan selection UI
│   └── ui/                  # shadcn/ui components
├── lib/                     # Utility libraries
│   ├── helius-config.ts     # Helius RPC configuration
│   └── kamino-integration.ts # Kamino helpers
├── hooks/                   # Custom React hooks
│   ├── use-helius.ts        # Helius SDK hooks
│   └── use-game-subscription.ts # Real-time game updates
└── public/                  # Static assets
```

## Key Components

### Wallet Integration

```typescript
import { WalletButton } from '@/components/wallet-button';
import { useWallet } from '@solana/wallet-adapter-react';

function MyComponent() {
  const { publicKey, connected } = useWallet();
  
  return (
    <div>
      <WalletButton />
      {connected && <p>Connected: {publicKey?.toBase58()}</p>}
    </div>
  );
}
```

### Helius Hooks

```typescript
import { useHeliusBalance, useHeliusTransactions } from '@/hooks/use-helius';

function BalanceDisplay() {
  const { publicKey } = useWallet();
  const { balance, loading } = useHeliusBalance(publicKey?.toBase58() || null);
  
  return <div>{balance.toFixed(4)} SOL</div>;
}
```

### Real-time Game Updates

```typescript
import { useGameSubscription } from '@/hooks/use-game-subscription';

function GameDisplay({ gamePda }: { gamePda: string }) {
  const { gameState, loading } = useGameSubscription(gamePda);
  
  return (
    <div>
      <p>Status: {gameState?.status}</p>
      <p>Players: {gameState?.players.length}</p>
    </div>
  );
}
```

## Helius Features

### RPC Endpoints

- **Mainnet**: `https://mainnet.helius-rpc.com/?api-key=YOUR_KEY`
- **Devnet**: `https://devnet.helius-rpc.com/?api-key=YOUR_KEY`

### WebSocket Endpoints

- **Standard**: `wss://mainnet.helius-rpc.com/?api-key=YOUR_KEY`
- **Atlas (1.5-2x faster)**: `wss://atlas-mainnet.helius-rpc.com/?api-key=YOUR_KEY`

### Available APIs

- ✅ RPC Methods (standard + enhanced)
- ✅ DAS API (NFTs, tokens, compressed assets)
- ✅ Enhanced Transactions (parsed, human-readable)
- ✅ Priority Fee API (real-time estimates)
- ✅ WebSocket Subscriptions (account, program, logs)
- ✅ ZK Compression API (Light Protocol)

## Development

### Run Tests

```bash
pnpm test
```

### Build for Production

```bash
pnpm build
```

### Lint

```bash
pnpm lint
```

## Deployment

### Vercel (Recommended)

```bash
vercel
```

### Environment Variables

Set in Vercel dashboard:
- `NEXT_PUBLIC_HELIUS_API_KEY`
- `NEXT_PUBLIC_SOLANA_NETWORK`
- `NEXT_PUBLIC_PROGRAM_ID`

## Troubleshooting

### Wallet Not Connecting

1. Check browser extension installed
2. Refresh page
3. Try different wallet

### RPC Errors

1. Verify Helius API key in `.env.local`
2. Check network (devnet vs mainnet)
3. Check rate limits in Helius dashboard

### WebSocket Issues

1. Ensure API key is valid
2. Check browser console for errors
3. Try Atlas WebSocket endpoint

## Resources

- [Helius Documentation](https://www.helius.dev/docs)
- [Solana Wallet Adapter](https://github.com/anza-xyz/wallet-adapter)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## License

MIT
