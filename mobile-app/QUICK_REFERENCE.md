# Magic Roulette - Quick Reference Card

## 🚀 Start Development

```bash
cd mobile-app
npm run web
```

Open: http://localhost:19006

## 🔧 Prerequisites

1. Install Phantom: https://phantom.app/
2. Switch to Devnet
3. Get test SOL: https://faucet.solana.com/

## 🎮 Test Flow

1. Connect Wallet → 2. Create Game → 3. Join Game → 4. Play → 5. Claim

## 📁 Key Files

| File | Purpose |
|------|---------|
| `WalletContextWeb.tsx` | Web wallet provider |
| `useProgramWeb.ts` | Program hook |
| `useGameWeb.ts` | Game hook |
| `HomeScreenWeb.tsx` | Home screen |

## 🐛 Quick Fixes

**Wallet won't connect:**
```bash
# Clear cache, refresh page
```

**Transaction fails:**
```bash
# Check SOL balance > 0.1
# Verify Devnet network
```

**Module not found:**
```bash
rm -rf node_modules && npm install
```

## 📊 Smart Contract

- **Program ID**: `HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam`
- **Network**: Devnet
- **RPC**: `https://brooks-dn4q23-fast-devnet.helius-rpc.com`

## 🔗 Quick Links

- [Solana Explorer](https://explorer.solana.com/?cluster=devnet)
- [Solana Faucet](https://faucet.solana.com/)
- [Full Guide](./WEB_DEVELOPMENT_GUIDE.md)

## 💡 Commands

```bash
npm run web          # Start web dev
npm start            # Start mobile dev
npm run android      # Run Android
npm run ios          # Run iOS
```

## 📞 Support

- Email: magicroulettesol@gmail.com
- Twitter: @mgcrouletteapp
