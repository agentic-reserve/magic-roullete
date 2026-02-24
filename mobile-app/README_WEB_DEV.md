# Magic Roulette - Quick Start (Web Development)

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Install Browser Wallet
- [Phantom](https://phantom.app/) (Recommended)
- [Solflare](https://solflare.com/)

### 3. Configure Wallet
1. Open wallet extension
2. Switch to **Devnet**
3. Get test SOL: https://faucet.solana.com/

### 4. Start Development Server
```bash
npm run web
```

Or use the script:
```bash
# Windows
start-web-dev.bat

# Linux/Mac
./start-web-dev.sh
```

### 5. Open Browser
Navigate to: http://localhost:19006

## 🎮 Testing Flow

1. **Connect Wallet**
   - Click "Select Wallet"
   - Choose Phantom/Solflare
   - Approve connection

2. **Create Game**
   - Click "Create Game"
   - Select mode (1v1/2v2)
   - Set entry fee (e.g., 0.1 SOL)
   - Approve transaction

3. **Join Game** (Use different browser profile)
   - Click "Join Game"
   - Select game from list
   - Approve transaction

4. **Play Game**
   - Wait for your turn
   - Click "Take Shot"
   - Approve transaction

5. **Claim Winnings**
   - Click "Claim Winnings"
   - Approve transaction

## 📁 Key Files

### Web Development Files
- `src/contexts/WalletContextWeb.tsx` - Web wallet adapter
- `src/components/WalletButtonWeb.tsx` - Wallet button
- `src/hooks/useProgramWeb.ts` - Program hook
- `src/hooks/useGameWeb.ts` - Game hook
- `src/screens/HomeScreenWeb.tsx` - Home screen
- `AppWeb.tsx` - Web entry point

### Shared Files
- `src/services/solana.ts` - Solana connection
- `src/services/game.ts` - Game logic

## 🔧 Common Commands

```bash
# Start web dev server
npm run web

# Start mobile dev server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Clear cache
npm start -- --reset-cache
```

## 🐛 Troubleshooting

### Wallet won't connect
- Clear browser cache
- Disable other wallet extensions
- Refresh page

### Transaction fails
- Check wallet has SOL (>0.1)
- Verify network is Devnet
- Wait 30 seconds and retry

### Module not found
```bash
rm -rf node_modules
npm install
```

## 📚 Documentation

- [Full Setup Guide](./SETUP.md)
- [Web Development Guide](./WEB_DEVELOPMENT_GUIDE.md)
- [Testing Guide](./TESTING_GUIDE.md)
- [Implementation Docs](../MOBILE_APP_IMPLEMENTATION.md)

## 🔗 Resources

- [Solana Explorer (Devnet)](https://explorer.solana.com/?cluster=devnet)
- [Solana Faucet](https://faucet.solana.com/)
- [Phantom Docs](https://docs.phantom.app/)
- [Wallet Adapter Docs](https://github.com/anza-xyz/wallet-adapter)

## 💡 Tips

1. **Use Chrome** for best compatibility
2. **Install React DevTools** for debugging
3. **Use multiple browser profiles** for testing multiplayer
4. **Check console logs** for errors
5. **Monitor Network tab** for RPC calls

## 🎯 Next Steps

- [ ] Test all game flows
- [ ] Add error handling
- [ ] Implement loading states
- [ ] Add animations
- [ ] Optimize performance
- [ ] Deploy to production

## 📞 Support

- Email: magicroulettesol@gmail.com
- Twitter: @mgcrouletteapp
- GitHub: github.com/magicroulette-game

---

**Happy Coding! 🚀**
