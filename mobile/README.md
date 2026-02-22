# Magic Roulette Mobile App (Flutter)

Cross-platform mobile app for Magic Roulette with Kamino Finance integration.

## Prerequisites

### Install Flutter

**Windows:**
```powershell
# Download Flutter SDK
# https://docs.flutter.dev/get-started/install/windows

# Add to PATH
$env:Path += ";C:\flutter\bin"

# Verify installation
flutter doctor
```

**macOS/Linux:**
```bash
# Download Flutter SDK
git clone https://github.com/flutter/flutter.git -b stable
export PATH="$PATH:`pwd`/flutter/bin"

# Verify installation
flutter doctor
```

### Install Dependencies

```bash
# Install Dart packages
flutter pub get

# For iOS (macOS only)
cd ios && pod install && cd ..
```

## Project Structure

```
mobile/
├── lib/
│   ├── main.dart                 # App entry point
│   ├── screens/
│   │   ├── home_screen.dart      # Home/lobby
│   │   ├── game_screen.dart      # Game play
│   │   ├── loan_selector_screen.dart  # Kamino loan selection
│   │   └── profile_screen.dart   # User profile
│   ├── widgets/
│   │   ├── wallet_connect_button.dart
│   │   ├── game_card.dart
│   │   ├── loan_option_card.dart
│   │   └── revolver_animation.dart
│   ├── services/
│   │   ├── solana_service.dart   # Solana RPC
│   │   ├── kamino_service.dart   # Kamino integration
│   │   ├── wallet_service.dart   # Wallet adapter
│   │   └── game_service.dart     # Game logic
│   ├── models/
│   │   ├── game.dart
│   │   ├── loan_option.dart
│   │   └── player.dart
│   └── utils/
│       ├── constants.dart
│       └── helpers.dart
├── android/                      # Android config
├── ios/                          # iOS config
├── pubspec.yaml                  # Dependencies
└── README.md
```

## Features

- ✅ Solana wallet connection (Mobile Wallet Adapter)
- ✅ Create games with direct payment or Kamino loan
- ✅ Real-time game updates
- ✅ Animated revolver cylinder
- ✅ Leaderboard and stats
- ✅ Push notifications
- ✅ Biometric authentication
- ✅ Dark mode support

## Dependencies

```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # Solana
  solana: ^0.30.0
  solana_mobile_client: ^1.0.0
  
  # State Management
  provider: ^6.1.1
  riverpod: ^2.4.9
  
  # UI
  flutter_svg: ^2.0.9
  lottie: ^3.0.0
  shimmer: ^3.0.0
  
  # Networking
  http: ^1.1.2
  web_socket_channel: ^2.4.0
  
  # Storage
  shared_preferences: ^2.2.2
  hive: ^2.2.3
  
  # Utils
  intl: ^0.19.0
  crypto: ^3.0.3
```

## Running the App

### Development

```bash
# Run on Android
flutter run -d android

# Run on iOS (macOS only)
flutter run -d ios

# Run on web
flutter run -d chrome
```

### Build Release

```bash
# Android APK
flutter build apk --release

# Android App Bundle (for Play Store)
flutter build appbundle --release

# iOS (macOS only)
flutter build ios --release
```

## Kamino Integration

The app integrates with Kamino Finance for lending/borrowing:

1. **Loan Selection**: Users choose entry fee and see collateral requirements
2. **Collateral Deposit**: 110% of entry fee deposited to Kamino
3. **Borrow**: Entry fee borrowed from Kamino
4. **Game Play**: Play with borrowed funds
5. **Auto-Repayment**: If winner, loan auto-repaid from winnings
6. **Collateral Return**: Collateral returned to winner

## Testing

```bash
# Run unit tests
flutter test

# Run integration tests
flutter test integration_test/

# Run with coverage
flutter test --coverage
```

## Publishing

### Android (Google Play)

1. Build app bundle: `flutter build appbundle --release`
2. Sign with keystore
3. Upload to Google Play Console

### iOS (App Store)

1. Build iOS app: `flutter build ios --release`
2. Archive in Xcode
3. Upload to App Store Connect

### Solana dApp Store

```bash
# Install dApp Store CLI
npm install -g @solana-mobile/dapp-store-cli

# Create app NFT
dapp-store create-app --name "Magic Roulette" --keypair ~/.config/solana/id.json

# Submit release
dapp-store create-release \
  --app-mint <APP_NFT_ADDRESS> \
  --apk-path ./build/app/outputs/flutter-apk/app-release.apk \
  --keypair ~/.config/solana/id.json
```

## Configuration

### Environment Variables

Create `.env` file:

```env
SOLANA_RPC_URL=https://api.devnet.solana.com
PROGRAM_ID=JE2fDdXcYEprUR2yPmWdLGDSJ7Y7HD8qsJ52eD6qUavq
KAMINO_MARKET=DxXdAyU3kCjnyggvHmY5nAwg5cRbbmdyX3npfDMjjMek
```

### Android Permissions

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
```

### iOS Permissions

Add to `ios/Runner/Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>Scan QR codes for wallet connection</string>
<key>NSFaceIDUsageDescription</key>
<string>Authenticate with Face ID</string>
```

## Troubleshooting

### Issue: Wallet Not Found

**Solution**: Install a compatible Solana wallet (Phantom, Solflare)

### Issue: Build Failed

**Solution**: Run `flutter clean && flutter pub get`

### Issue: iOS Build Error

**Solution**: Update CocoaPods: `pod repo update`

## Resources

- [Flutter Documentation](https://docs.flutter.dev/)
- [Solana Mobile Docs](https://docs.solanamobile.com/)
- [Kamino Finance Docs](https://kamino.com/build/)
- [Magic Roulette Program](../programs/magic-roulette/)

## License

MIT
