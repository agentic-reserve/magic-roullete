# Magic Roulette - Complete Deployment Guide

## Overview

This guide covers deploying:
1. Solana Program (on-chain)
2. Web Frontend (Next.js)
3. Mobile App (Flutter - Android/iOS)

---

## 1. Solana Program Deployment

### Prerequisites
- Solana CLI installed
- Anchor CLI installed
- Wallet with SOL (devnet or mainnet)

### Deploy to Devnet

```bash
# Build program
anchor build

# Deploy
anchor deploy --provider.cluster devnet

# Verify deployment
solana program show <PROGRAM_ID> --url devnet
```

### Deploy to Mainnet

```bash
# Build for mainnet
anchor build

# Deploy (requires SOL for deployment)
anchor deploy --provider.cluster mainnet-beta

# Verify
solana program show <PROGRAM_ID> --url mainnet-beta
```

**Program ID**: `JE2fDdXcYEprUR2yPmWdLGDSJ7Y7HD8qsJ52eD6qUavq`

---

## 2. Web Frontend Deployment

### Build Frontend

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Test locally
npm run start
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Deploy to Netlify

```bash
# Build
npm run build

# Deploy via Netlify CLI
netlify deploy --prod --dir=.next
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_PROGRAM_ID=JE2fDdXcYEprUR2yPmWdLGDSJ7Y7HD8qsJ52eD6qUavq
NEXT_PUBLIC_KAMINO_MARKET=7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF
```

---

## 3. Mobile App Deployment

### Android APK Build

```bash
cd mobile

# Build APK
flutter build apk --release

# Output: build/app/outputs/flutter-apk/app-release.apk
```

### iOS Build (macOS only)

```bash
# Build iOS
flutter build ios --release

# Archive in Xcode
open ios/Runner.xcworkspace
```

### Publish to Solana dApp Store

```bash
# Install CLI
npm install -g @solana-mobile/dapp-store-cli

# Create app NFT
dapp-store create-app \
  --name "Magic Roulette" \
  --keypair ~/.config/solana/id.json

# Submit release
dapp-store create-release \
  --app-mint <APP_NFT_ADDRESS> \
  --apk-path ./build/app/outputs/flutter-apk/app-release.apk \
  --keypair ~/.config/solana/id.json
```

---

## Testing Checklist

- [ ] Program deployed successfully
- [ ] IDL uploaded
- [ ] Frontend connects to program
- [ ] Wallet connection works
- [ ] Kamino integration tested
- [ ] Mobile app builds
- [ ] All transactions work end-to-end

---

## Resources

- [Anchor Docs](https://www.anchor-lang.com/)
- [Vercel Deployment](https://vercel.com/docs)
- [Flutter Deployment](https://docs.flutter.dev/deployment)
- [Solana dApp Store](https://publish.solanamobile.com/)
