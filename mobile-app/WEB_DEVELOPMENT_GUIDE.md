# Magic Roulette - Web/Desktop Development Guide

## Overview

Untuk development di laptop, kita menggunakan **Solana Wallet Adapter** (web/desktop) sebagai pengganti Mobile Wallet Adapter. Ini memungkinkan testing dengan browser extension wallets seperti Phantom dan Solflare.

## Setup

### 1. Install Dependencies

```bash
cd mobile-app
npm install
```

Dependencies yang ditambahkan:
- `@solana/wallet-adapter-base`
- `@solana/wallet-adapter-react`
- `@solana/wallet-adapter-react-ui`
- `@solana/wallet-adapter-wallets`
- `react-native-web`

### 2. Install Browser Wallet

Install salah satu wallet extension:
- [Phantom](https://phantom.app/) - Recommended
- [Solflare](https://solflare.com/)
- [Backpack](https://backpack.app/)

### 3. Configure Wallet to Devnet

1. Open wallet extension
2. Go to Settings
3. Change network to **Devnet**
4. Get test SOL from [Solana Faucet](https://faucet.solana.com/)

## Running the App

### Web Mode (Recommended for Development)

```bash
npm run web
```

This will:
- Start Expo web server
- Open browser at `http://localhost:19006`
- Use web wallet adapter
- Connect to Phantom/Solflare extension

### Mobile Mode (For Testing)

```bash
npm start
```

Then:
- Press `w` for web
- Press `a` for Android emulator
- Press `i` for iOS simulator

## Architecture Differences

### Mobile Wallet Adapter (Production)
```
Mobile App → Mobile Wallet Adapter → Mobile Wallet App
```

### Web Wallet Adapter (Development)
```
Web App → Wallet Adapter → Browser Extension Wallet
```

## File Structure

### Web-Specific Files

```
mobile-app/
├── src/
│   ├── contexts/
│   │   ├── WalletContext.tsx          # Mobile (production)
│   │   └── WalletContextWeb.tsx       # Web (development) ✅
│   ├── components/
│   │   ├── WalletButton.tsx           # Mobile
│   │   └── WalletButtonWeb.tsx        # Web ✅
│   ├── hooks/
│   │   ├── useProgram.ts              # Mobile
│   │   ├── useProgramWeb.ts           # Web ✅
│   │   ├── useGame.ts                 # Mobile
│   │   └── useGameWeb.ts              # Web ✅
│   └── screens/
│       ├── HomeScreen.tsx             # Mobile
│       ├── HomeScreenWeb.tsx          # Web ✅
│       └── ... (other screens)
├── App.tsx                            # Mobile entry
└── AppWeb.tsx                         # Web entry ✅
```

## Key Differences

### 1. Wallet Context

**Mobile (WalletContext.tsx):**
```typescript
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol';
// Uses Mobile Wallet Adapter protocol
```

**Web (WalletContextWeb.tsx):**
```typescript
import { WalletProvider } from '@solana/wallet-adapter-react';
// Uses standard wallet adapter
```

### 2. Wallet Button

**Mobile:**
- Custom button with transact() calls
- Opens mobile wallet app

**Web:**
- Uses `WalletMultiButton` component
- Opens wallet selection modal
- Connects to browser extension

### 3. Transaction Signing

**Mobile:**
```typescript
await transact(async (wallet) => {
  await wallet.signAndSendTransactions({ transactions });
});
```

**Web:**
```typescript
const { signTransaction, sendTransaction } = useWallet();
await sendTransaction(transaction, connection);
```

## Development Workflow

### Step 1: Start Development Server

```bash
npm run web
```

### Step 2: Connect Wallet

1. Click "Select Wallet" button
2. Choose Phantom or Solflare
3. Approve connection
4. Wallet address displayed

### Step 3: Test Features

**Create Game:**
1. Click "Create Game"
2. Select mode (1v1 or 2v2)
3. Set entry fee
4. Approve transaction in wallet extension
5. Game created on-chain

**Join Game:**
1. Click "Join Game"
2. See list of active games
3. Click on a game
4. Approve transaction
5. Game starts

**Play Game:**
1. Wait for your turn
2. Click "Take Shot"
3. Approve transaction
4. Watch game progress

**Finalize:**
1. Game ends
2. Click "Claim Winnings"
3. Approve transaction
4. Funds distributed

## Testing Scenarios

### Scenario 1: Single Player Testing

Use multiple browser profiles:

1. **Profile 1 (Chrome):**
   - Install Phantom
   - Create game

2. **Profile 2 (Chrome Incognito):**
   - Install Phantom
   - Join game

3. **Play:**
   - Switch between profiles
   - Take turns

### Scenario 2: Multi-Device Testing

1. **Laptop:** Create game
2. **Phone:** Join game (using mobile app)
3. **Play:** Cross-platform gameplay

### Scenario 3: Network Testing

Test different scenarios:
- Slow connection
- Transaction failures
- Wallet rejections
- RPC errors

## Common Issues & Solutions

### Issue: Wallet won't connect

**Solution:**
```bash
# Clear browser cache
# Disable other wallet extensions
# Refresh page
# Try different wallet
```

### Issue: Transaction fails

**Solution:**
```bash
# Check wallet has SOL (>0.1 SOL)
# Verify network is Devnet
# Check RPC endpoint is responsive
# Try again after 30 seconds
```

### Issue: "Module not found" errors

**Solution:**
```bash
# Clear cache
npm start -- --reset-cache

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Issue: Wallet adapter CSS not loading

**Solution:**
Add to your entry file:
```typescript
require('@solana/wallet-adapter-react-ui/styles.css');
```

## Browser Compatibility

### Supported Browsers

✅ Chrome/Chromium (Recommended)
✅ Firefox
✅ Brave
✅ Edge
⚠️ Safari (Limited support)

### Required Extensions

- Phantom Wallet
- Solflare Wallet
- Or any Solana-compatible wallet

## Environment Variables

Create `.env` file:

```env
# RPC Endpoint
REACT_APP_RPC_ENDPOINT=https://brooks-dn4q23-fast-devnet.helius-rpc.com

# Program ID
REACT_APP_PROGRAM_ID=HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam

# Network
REACT_APP_NETWORK=devnet
```

## Debugging

### Enable Console Logs

```typescript
// In WalletContextWeb.tsx
console.log('Wallet connected:', publicKey?.toBase58());
console.log('Transaction signature:', signature);
```

### Use React DevTools

```bash
# Install React DevTools extension
# Inspect component state
# Monitor wallet connection
```

### Check Network Tab

```bash
# Open browser DevTools
# Go to Network tab
# Filter by "RPC"
# Monitor Solana transactions
```

## Performance Optimization

### 1. Lazy Load Wallet Adapters

```typescript
const wallets = useMemo(
  () => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ],
  []
);
```

### 2. Memoize Expensive Computations

```typescript
const provider = useMemo(() => {
  // Create provider
}, [connection, wallet]);
```

### 3. Debounce State Updates

```typescript
const debouncedRefresh = useMemo(
  () => debounce(refreshGame, 1000),
  [refreshGame]
);
```

## Migration to Mobile

When ready for mobile deployment:

1. **Switch imports:**
   ```typescript
   // From:
   import { WalletContextProvider } from './src/contexts/WalletContextWeb';
   
   // To:
   import { WalletProvider } from './src/contexts/WalletContext';
   ```

2. **Update entry point:**
   ```typescript
   // Use App.tsx instead of AppWeb.tsx
   ```

3. **Test on device:**
   ```bash
   npm run android
   # or
   npm run ios
   ```

## Resources

### Documentation
- [Solana Wallet Adapter](https://github.com/anza-xyz/wallet-adapter)
- [Phantom Docs](https://docs.phantom.app/)
- [Solflare Docs](https://docs.solflare.com/)
- [Expo Web](https://docs.expo.dev/workflow/web/)

### Tools
- [Solana Explorer](https://explorer.solana.com/?cluster=devnet)
- [Solana Faucet](https://faucet.solana.com/)
- [Helius Dashboard](https://dashboard.helius.dev/)

### Community
- [Solana Discord](https://discord.gg/solana)
- [Solana Stack Exchange](https://solana.stackexchange.com/)

## Next Steps

1. ✅ Setup web wallet adapter
2. ✅ Test basic functionality
3. [ ] Add error handling
4. [ ] Implement loading states
5. [ ] Add animations
6. [ ] Optimize performance
7. [ ] Migrate to mobile

## Support

For issues or questions:
- Email: magicroulettesol@gmail.com
- Twitter: @mgcrouletteapp
- GitHub: github.com/magicroulette-game

---

**Status**: ✅ Web Development Ready
**Last Updated**: February 24, 2026
**Mode**: Development (Devnet)
