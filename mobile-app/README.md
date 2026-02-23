# Magic Roulette - React Native Mobile App

Russian Roulette GameFi on Solana - Built for Solana Mobile Seeker

## 🚀 Features

- ✅ Mobile Wallet Adapter integration
- ✅ Seeker device detection
- ✅ 1v1, 2v2, and AI game modes
- ✅ SOL-based gameplay
- ✅ Real-time game state
- ✅ Seeker Genesis Token verification

## 📱 Prerequisites

- Node.js 18+
- React Native development environment
- Android Studio (for Android)
- Xcode (for iOS)
- Solana Mobile Wallet (Phantom, Solflare, or Seed Vault)

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Install iOS pods (macOS only)
cd ios && pod install && cd ..
```

## 🏃 Running the App

### Development Mode

```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Testing on Seeker

1. Enable Developer Mode on your Seeker device
2. Connect via USB
3. Run `npm run android`

## 📦 Project Structure

```
mobile-app/
├── src/
│   ├── components/
│   │   ├── SeekerBadge.tsx      # Seeker device indicator
│   │   └── WalletButton.tsx     # Wallet connect button
│   ├── lib/
│   │   ├── wallet/
│   │   │   └── MobileWalletProvider.tsx  # MWA context
│   │   ├── seeker/
│   │   │   └── SeekerDetection.ts        # Seeker detection
│   │   └── game/
│   │       └── MagicRouletteClient.ts    # Game client
│   └── screens/
│       └── HomeScreen.tsx       # Main lobby screen
├── App.tsx                      # App entry point
├── polyfill.js                  # Crypto polyfills
└── index.js                     # Entry with polyfills
```

## 🔐 Wallet Integration

### Mobile Wallet Adapter

The app uses Mobile Wallet Adapter (MWA) for wallet connections:

```typescript
import { useMobileWallet } from './src/lib/wallet/MobileWalletProvider';

function MyComponent() {
  const { connect, account, signAndSendTransaction } = useMobileWallet();
  
  // Connect wallet
  await connect();
  
  // Sign and send transaction
  const signature = await signAndSendTransaction(transaction);
}
```

### Supported Wallets

- Phantom Mobile
- Solflare Mobile
- Seed Vault Wallet (Seeker default)

## 📱 Seeker Detection

### Platform Check (Client-side)

```typescript
import { isSeekerDevice, getDeviceInfo } from './src/lib/seeker/SeekerDetection';

// Quick check
const isSeeker = isSeekerDevice();

// Detailed info
const deviceInfo = getDeviceInfo();
console.log(deviceInfo.model); // "Seeker"
```

### SGT Verification (Server-side)

For verified Seeker ownership, check for Seeker Genesis Token:

```typescript
import { verifySeekerUser } from './src/lib/seeker/SeekerDetection';

const result = await verifySeekerUser(walletAddress, connection);
console.log(result.verified); // true if Seeker with SGT
```

## 🎮 Game Integration

### Create a Game

```typescript
import { useMagicRouletteClient } from './src/lib/game/MagicRouletteClient';

const { client } = useMagicRouletteClient();

// Create 1v1 game
const { gameId, gamePda, transaction } = await client.createGame1v1(
  playerPublicKey,
  0.1 // 0.1 SOL entry fee
);

// Sign and send
const signature = await signAndSendTransaction(transaction);
```

### Create AI Practice Game

```typescript
// Free practice game
const { gameId, gamePda, transaction } = await client.createAIGame(
  playerPublicKey,
  'medium' // difficulty
);
```

## 🔧 Configuration

### RPC Endpoint

Update in `MobileWalletProvider.tsx`:

```typescript
<MobileWalletProvider cluster="devnet">
  {/* or "mainnet-beta" for production */}
</MobileWalletProvider>
```

### Program ID

Update in `MagicRouletteClient.ts`:

```typescript
const programId = 'HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam';
```

## 🧪 Testing

### Local Validator

```bash
# In project root
solana-test-validator

# Check program
solana program show HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam
```

### Test Players

Test players are created in `test-player1.json` and `test-player2.json`

## 📚 Documentation

- [Mobile Wallet Adapter Docs](https://docs.solanamobile.com/react-native/overview)
- [Seeker Detection Guide](https://docs.solanamobile.com/recipes/general/detecting-seeker-users)
- [Solana Mobile Stack](https://solanamobile.com/developers)

## 🐛 Troubleshooting

### Wallet Connection Issues

1. Ensure a compatible wallet is installed
2. Check that the app has proper permissions
3. Verify RPC endpoint is accessible

### Seeker Detection

- Platform check works on all devices
- SGT verification requires mainnet connection
- Use `__DEV__` flag for debug info

### Build Issues

```bash
# Clean build
cd android && ./gradlew clean && cd ..
npm start -- --reset-cache
```

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please read CONTRIBUTING.md first.

## 📧 Support

- Email: magicroulettesol@gmail.com
- Twitter: [@mgcrouletteapp](https://x.com/mgcrouletteapp)
- Discord: [Join our server](https://discord.gg/magicroulette)
