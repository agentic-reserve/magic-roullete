# Magic Roulette - Build & Deploy Guide

Wild West themed roulette game built with React Native + Expo and Solana integration.

## 🎨 Theme Colors

- **Deep Browns**: `#1a0f05`, `#2a1810` - Weathered saloon backgrounds
- **Dusty Gold**: `#d4a574` - Primary actions, wanted poster aesthetic
- **Burnt Orange**: `#c85a17` - Secondary actions
- **Rust**: `#d9531e` - Accent colors, saloon lights
- **Warm Cream**: `#f5e6d3` - Text on parchment

## 🚀 Development

### Start Development Server
```bash
cd magic-roullete
npm run dev
```

### Run on Platforms
```bash
# Web
npm run web

# Android (requires Android Studio)
npm run android

# iOS (requires Xcode on macOS)
npm run ios
```

## 📱 Building for Production

### 1. Build Web (PWA)
```bash
npm run web
npx expo export --platform web
```

This creates a static build in `dist/` folder ready for PWA deployment.

### 2. Build Android APK (without EAS)

#### Option A: Using Expo Prebuild + Android Studio
```bash
# Generate native Android project
npm run android:build

# Open in Android Studio and build APK
# Or use Gradle directly:
cd android
./gradlew assembleRelease
```

APK will be in `android/app/build/outputs/apk/release/`

#### Option B: Using Bubblewrap CLI (PWA to APK)

First, build the web version:
```bash
npx expo export --platform web
```

Install Bubblewrap:
```bash
npm install -g @bubblewrap/cli
```

Initialize Bubblewrap project:
```bash
bubblewrap init --manifest https://your-domain.com/manifest.json
```

Build APK:
```bash
bubblewrap build
```

The APK will be in the project root.

### 3. PWA Deployment

Deploy the `dist/` folder to any static hosting:

**Vercel:**
```bash
npm install -g vercel
vercel --prod
```

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

**GitHub Pages:**
```bash
# Push dist folder to gh-pages branch
npm install -g gh-pages
gh-pages -d dist
```

## 🔧 Configuration

### Update App Identifiers

Edit `app.json`:
- `expo.android.package`: Your Android package name
- `expo.ios.bundleIdentifier`: Your iOS bundle ID
- `expo.scheme`: Your custom URL scheme

### PWA Manifest

The web build automatically generates a manifest. Customize in `app.json` under `expo.web`.

## 📦 Dependencies

Key packages:
- `expo` - React Native framework
- `@solana/web3.js` - Solana blockchain integration
- `react-native-reanimated` - Smooth animations
- `expo-router` - File-based routing

## 🎮 Features

- Wild West themed UI
- Animated roulette wheel
- Number betting (0-36)
- Red/Black/Green color coding
- Solana wallet integration ready
- Responsive design for mobile & web

## 🐛 Troubleshooting

### Android Build Issues
```bash
# Clean build
cd android
./gradlew clean
cd ..
npm run android:build
```

### Web Build Issues
```bash
# Clear cache
npx expo start -c
```

### Bubblewrap Issues
Make sure you have:
- Java JDK 11+
- Android SDK installed
- `ANDROID_HOME` environment variable set

## 📝 Next Steps

1. Integrate Solana program for on-chain betting
2. Add wallet connection UI
3. Implement real SOL transactions
4. Add game history and statistics
5. Deploy smart contract to devnet/mainnet
