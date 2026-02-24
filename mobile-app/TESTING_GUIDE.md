# Magic Roulette Mobile App - Testing Guide

## Quick Start Testing

### 1. Start Development Server

```bash
cd mobile-app
npm start
```

Ini akan membuka Expo Dev Tools di browser.

### 2. Test on Physical Device (Recommended)

**Android:**
1. Install Expo Go dari Play Store
2. Scan QR code dari Expo Dev Tools
3. Install Phantom/Solflare wallet di device

**iOS:**
1. Install Expo Go dari App Store
2. Scan QR code dari Expo Dev Tools
3. Install Phantom/Solflare wallet di device

### 3. Test on Emulator

**Android Emulator:**
```bash
npm run android
```

**iOS Simulator:**
```bash
npm run ios
```

## Testing Scenarios

### Scenario 1: Wallet Connection
1. Open app
2. Tap "Connect Wallet"
3. ✅ Should open mobile wallet
4. ✅ Approve connection
5. ✅ See wallet address displayed
6. ✅ Menu buttons appear

### Scenario 2: Create Game (1v1)
1. Connect wallet
2. Tap "Create Game"
3. Select "1v1" mode
4. Enter entry fee: 0.1 SOL
5. Tap "Create Game"
6. ✅ Approve transaction in wallet
7. ✅ See success message
8. ✅ Navigate to game lobby

### Scenario 3: Join Game
1. Connect wallet (different device/wallet)
2. Tap "Join Game"
3. ✅ See list of active games
4. Tap on a game
5. Tap "Join Game"
6. ✅ Approve transaction
7. ✅ Game status changes to "InProgress"

### Scenario 4: Play Game
1. Wait for your turn
2. ✅ See "TURN" indicator
3. ✅ See bullet chamber visualization
4. Tap "Take Shot"
5. ✅ Approve transaction
6. ✅ Chamber advances
7. ✅ Turn switches to opponent
8. Repeat until winner

### Scenario 5: Finalize Game
1. Game ends (someone hits bullet)
2. ✅ See "Finished" status
3. Tap "Claim Winnings"
4. ✅ Approve transaction
5. ✅ Funds distributed
6. ✅ Navigate to home

### Scenario 6: AI Practice Mode (TODO)
1. Connect wallet
2. Tap "Practice Mode"
3. Select difficulty
4. ✅ Play for FREE
5. ✅ No entry fee required

## Expected Behaviors

### Wallet Connection
- ✅ One-tap connection
- ✅ No popups during gameplay
- ✅ Persistent connection
- ✅ Disconnect option

### Game Creation
- ✅ Mode selection (1v1/2v2)
- ✅ Custom entry fee
- ✅ Fee breakdown display
- ✅ Transaction confirmation

### Game Lobby
- ✅ List active games
- ✅ Pull to refresh
- ✅ Auto-refresh every 3s
- ✅ Empty state message

### Gameplay
- ✅ Real-time updates
- ✅ Turn indicator
- ✅ Bullet chamber visual
- ✅ Player list
- ✅ Prize pool display

### Finalization
- ✅ Winner determination
- ✅ Prize distribution
- ✅ Fee deduction (5% + 10%)
- ✅ Transaction success

## Common Issues & Solutions

### Issue: Wallet won't connect
**Solution:**
- Ensure wallet app is installed
- Check network is Devnet
- Try force-closing wallet app
- Restart Expo app

### Issue: Transaction fails
**Solution:**
- Check wallet has sufficient SOL (>0.1 SOL)
- Verify game state is correct
- Check RPC endpoint is responsive
- Try again after 30 seconds

### Issue: Game not updating
**Solution:**
- Pull to refresh
- Check internet connection
- Verify RPC endpoint
- Restart app

### Issue: Can't join game
**Solution:**
- Ensure game is "WaitingForPlayers"
- Check you're not already in game
- Verify entry fee matches
- Check wallet balance

## Performance Testing

### Load Testing
- [ ] 10 concurrent games
- [ ] 50 concurrent games
- [ ] 100 concurrent games

### Network Testing
- [ ] Slow 3G connection
- [ ] WiFi connection
- [ ] 4G/5G connection
- [ ] Offline mode handling

### Device Testing
- [ ] Android 11+
- [ ] iOS 14+
- [ ] Various screen sizes
- [ ] Low-end devices

## Security Testing

### Wallet Security
- ✅ No private key exposure
- ✅ Transaction signing in wallet
- ✅ No unauthorized transactions
- ✅ Secure RPC connection

### Smart Contract Security
- ✅ PDA validation
- ✅ Signer checks
- ✅ Overflow protection
- ✅ Reentrancy guards

## Automated Testing (TODO)

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

### Integration Tests
```bash
npm run test:integration
```

## Test Checklist

Before submitting PR:
- [ ] All screens load correctly
- [ ] Wallet connection works
- [ ] Game creation works
- [ ] Game joining works
- [ ] Gameplay mechanics work
- [ ] Finalization works
- [ ] No console errors
- [ ] No memory leaks
- [ ] Smooth animations
- [ ] Responsive UI

## Reporting Issues

When reporting bugs, include:
1. Device model & OS version
2. Wallet app & version
3. Steps to reproduce
4. Expected vs actual behavior
5. Screenshots/video
6. Console logs

## Next Testing Phase

### Phase 2: Enhanced Testing
- [ ] Animation testing
- [ ] Sound effects testing
- [ ] Push notification testing
- [ ] Offline mode testing

### Phase 3: Production Testing
- [ ] Mainnet testing
- [ ] Load testing (1000+ users)
- [ ] Security audit
- [ ] Performance optimization

## Resources

- [Expo Testing](https://docs.expo.dev/develop/unit-testing/)
- [React Native Testing](https://reactnative.dev/docs/testing-overview)
- [Solana Mobile Testing](https://docs.solanamobile.com/getting-started/testing)
