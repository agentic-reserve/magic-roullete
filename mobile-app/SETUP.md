# Magic Roulette Mobile App Setup

## Prerequisites

- Node.js 18+ installed
- Expo CLI installed: `npm install -g expo-cli`
- Android Studio (for Android) or Xcode (for iOS)
- Solana Mobile Wallet (Phantom, Solflare, etc.) installed on device

## Installation

1. Install dependencies:
```bash
cd mobile-app
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on device:
- Android: `npm run android`
- iOS: `npm run ios`
- Web: `npm run web`

## Project Structure

```
mobile-app/
├── src/
│   ├── contexts/
│   │   └── WalletContext.tsx       # Mobile Wallet Adapter integration
│   ├── services/
│   │   ├── solana.ts               # Solana connection & PDAs
│   │   └── game.ts                 # Game logic & smart contract calls
│   ├── hooks/
│   │   ├── useProgram.ts           # Anchor program hook
│   │   └── useGame.ts              # Game state management
│   ├── components/
│   │   ├── WalletButton.tsx        # Connect wallet button
│   │   └── GameCard.tsx            # Game list card
│   └── screens/
│       ├── HomeScreen.tsx          # Landing page
│       ├── GameLobbyScreen.tsx     # Active games list
│       ├── CreateGameScreen.tsx    # Create new game
│       └── GamePlayScreen.tsx      # Game interface
├── App.tsx                         # Main app with navigation
└── package.json
```

## Features Implemented

### ✅ Mobile Wallet Adapter Integration
- One-tap wallet connection
- Seamless transaction signing
- No popups during gameplay

### ✅ Smart Contract Integration
- Create games (1v1 or 2v2)
- Join existing games
- Take shots in-game
- Finalize and claim winnings
- AI practice mode (FREE)

### ✅ UI Screens
- Home screen with wallet connection
- Game lobby with active games
- Create game with mode selection
- Game play with real-time updates

### ✅ Game Logic
- Real-time game state updates
- Turn-based gameplay
- Bullet chamber visualization
- Winner determination

## Testing Flow

1. **Connect Wallet**
   - Open app
   - Tap "Connect Wallet"
   - Approve in mobile wallet

2. **Create Game**
   - Tap "Create Game"
   - Select mode (1v1 or 2v2)
   - Set entry fee
   - Confirm transaction

3. **Join Game**
   - Tap "Join Game"
   - Select game from lobby
   - Tap "Join Game"
   - Confirm transaction

4. **Play Game**
   - Wait for your turn
   - Tap "Take Shot"
   - Watch bullet chamber
   - Winner claims prize

## Smart Contract Details

- **Program ID**: `HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam`
- **Network**: Devnet
- **RPC**: `https://brooks-dn4q23-fast-devnet.helius-rpc.com`

## Next Steps

### Phase 1: Core Features (Current)
- ✅ Wallet integration
- ✅ Game creation
- ✅ Game joining
- ✅ Gameplay mechanics

### Phase 2: Enhanced UX
- [ ] Animations (bullet chamber spin)
- [ ] Sound effects
- [ ] Push notifications
- [ ] Game history

### Phase 3: Advanced Features
- [ ] AI practice mode UI
- [ ] Leaderboards
- [ ] Player profiles
- [ ] Tournament system

### Phase 4: Production
- [ ] Mainnet deployment
- [ ] Solana dApp Store submission
- [ ] Performance optimization
- [ ] Security audit

## Troubleshooting

### Wallet Connection Issues
- Ensure mobile wallet is installed
- Check network is set to Devnet
- Try disconnecting and reconnecting

### Transaction Failures
- Check wallet has sufficient SOL
- Verify game state is correct
- Check RPC endpoint is responsive

### Build Errors
- Clear cache: `expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version: `node -v` (should be 18+)

## Resources

- [Solana Mobile Docs](https://docs.solanamobile.com/)
- [Mobile Wallet Adapter](https://github.com/solana-mobile/mobile-wallet-adapter)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)

## Support

For issues or questions:
- Email: magicroulettesol@gmail.com
- Twitter: @mgcrouletteapp
- GitHub: github.com/magicroulette-game
