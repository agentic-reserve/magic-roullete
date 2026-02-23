# Magic Roulette 🎰

Wild West themed roulette game built with React Native, Expo, and Solana blockchain integration.

## 🎨 Theme

Deep browns, dusty gold, burnt orange, and warm cream colors inspired by weathered saloons and wanted posters.

## 🚀 Quick Start

```bash
cd magic-roullete
npm install
npm run dev
```

Then:
- Press `w` for web
- Press `a` for Android (requires Android Studio)
- Press `i` for iOS (requires Xcode on macOS)

## 📱 Build Commands

```bash
# Build PWA
npm run build:pwa

# Build Android APK (requires Android SDK)
npm run android:apk

# Export web for deployment
npm run export:web
```

## 📖 Documentation

See [BUILD.md](./BUILD.md) for detailed build and deployment instructions.

## 🎮 Features

- Animated roulette wheel with Wild West theme
- Number betting (0-36)
- Red/Black/Green color coding
- Solana wallet integration ready
- PWA support for mobile web
- Native Android/iOS builds

## 🛠️ Tech Stack

- React Native + Expo
- TypeScript
- Solana Web3.js
- React Native Reanimated
- Expo Router

## 📦 Project Structure

```
magic-roullete/
├── app/              # Expo Router pages
│   ├── (tabs)/      # Tab navigation
│   │   ├── roulette.tsx  # Main game screen
│   │   ├── account/      # Wallet & account
│   │   └── settings/     # App settings
├── components/       # Reusable components
├── constants/        # Colors & config
├── hooks/           # Custom React hooks
├── utils/           # Helper functions
└── scripts/         # Build scripts
```

## 🎯 Next Steps

1. Connect to Solana program for on-chain betting
2. Implement real SOL transactions
3. Add game history and leaderboard
4. Deploy to production

## 📝 License

MIT
