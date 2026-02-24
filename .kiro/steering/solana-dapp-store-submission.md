---
title: Solana dApp Store Submission Guide
inclusion: manual
tags: [dapp-store, solana-mobile, seeker, publishing]
---

# Solana dApp Store Submission Guide

This steering file provides a comprehensive guide for submitting Magic Roulette to the Solana dApp Store for Seeker device distribution.

## Overview

The Solana dApp Store is a decentralized app marketplace for Solana Mobile devices (Seeker). Apps are published via NFT-based metadata, enabling censorship-resistant distribution.

## Prerequisites

- [ ] Completed mobile app (React Native + Expo)
- [ ] Mobile Wallet Adapter integration
- [ ] App tested on Seeker device
- [ ] Beta testing completed
- [ ] All assets prepared (icon, screenshots, video)

## Submission Process

### Phase 1: Asset Preparation

#### 1.1 App Icon
- **Size**: 512x512 pixels
- **Format**: PNG with transparency
- **Requirements**: 
  - Clear, recognizable at small sizes
  - No text (app name shown separately)
  - Consistent with brand identity

#### 1.2 Feature Graphic
- **Size**: 1024x500 pixels
- **Format**: PNG or JPEG
- **Requirements**:
  - Showcases key features
  - High-quality visuals
  - No excessive text

#### 1.3 Screenshots
- **Count**: Minimum 5, maximum 8
- **Size**: 1080x2400 pixels (Seeker screen ratio)
- **Requirements**:
  - Show key features (lobby, gameplay, dashboard)
  - Real gameplay, not mockups
  - High-quality, clear UI

**Screenshot Checklist**:
- [ ] Home screen with wallet connection
- [ ] Game lobby with available games
- [ ] Game creation flow
- [ ] Active gameplay with shot animation
- [ ] Winner reveal modal
- [ ] Player dashboard with stats
- [ ] Settings screen

#### 1.4 Demo Video
- **Length**: 30-60 seconds
- **Format**: MP4, H.264 codec
- **Resolution**: 1080x2400 (portrait)
- **Requirements**:
  - Shows complete game flow
  - Highlights key features
  - Professional quality

**Video Script**:
```
0:00-0:05 - App launch and wallet connection (one-tap)
0:05-0:10 - Browse game lobby
0:10-0:15 - Create new game
0:15-0:25 - Gameplay with shot animation
0:25-0:30 - Winner reveal and prize distribution
```

### Phase 2: App Metadata

#### 2.1 App Store Description

```markdown
# Magic Roulette - High-Stakes GameFi on Solana

Experience the fastest on-chain gaming on Solana Seeker. Magic Roulette brings Russian Roulette to blockchain with sub-10ms gameplay, provably fair randomness, and 1000x cost savings.

## Key Features
✨ Sub-10ms Gameplay - Powered by MagicBlock Ephemeral Rollups
🎲 Provably Fair - Verifiable Random Functions (VRF)
💰 1000x Cost Savings - Light Protocol ZK Compression
📱 Seamless Mobile UX - One-tap wallet connection, no popups
🎮 Multiple Game Modes - 1v1, 2v2, AI practice
🔒 Tokenless Model - Play with SOL/USDC, no platform token

## How It Works
1. Connect wallet with one tap
2. Create or join a game
3. Take turns shooting
4. Winner takes 85% of pot

## Technology
- MagicBlock Ephemeral Rollups for instant gameplay
- Light Protocol for 1000x storage cost reduction
- Mobile Wallet Adapter for seamless UX
- VRF for provably fair randomness

## Safety
- External security audit completed
- Open-source smart contracts
- Transparent on-chain gameplay
- Community-driven governance

Play now on Solana Seeker!
```

#### 2.2 App Metadata JSON

```json
{
  "name": "Magic Roulette",
  "description": "High-stakes Russian Roulette GameFi on Solana. Sub-10ms gameplay, provably fair VRF, 1000x cost savings via Light Protocol.",
  "category": "Gaming",
  "subcategory": "GameFi",
  "tags": ["gaming", "gamefi", "roulette", "solana", "seeker"],
  "website": "https://magicroulette.com",
  "twitter": "https://x.com/mgcrouletteapp",
  "discord": "https://discord.gg/magicroulette",
  "github": "https://github.com/magicroulette-game/magic-roullete",
  "email": "magicroulettesol@gmail.com",
  "version": "1.0.0",
  "minSdkVersion": 29,
  "targetSdkVersion": 34,
  "permissions": [
    "INTERNET",
    "ACCESS_NETWORK_STATE"
  ],
  "deepLinks": [
    "magicroulette://",
    "https://magicroulette.com/play"
  ]
}
```

### Phase 3: NFT-Based Publishing

#### 3.1 Publisher NFT Creation

```typescript
import { Metaplex } from '@metaplex-foundation/js';
import { Connection, Keypair } from '@solana/web3.js';

async function createPublisherNFT() {
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  const wallet = Keypair.fromSecretKey(/* publisher wallet */);
  
  const metaplex = Metaplex.make(connection).use(keypairIdentity(wallet));
  
  // Create publisher NFT
  const { nft } = await metaplex.nfts().create({
    name: 'Magic Roulette Publisher NFT',
    symbol: 'MRPUB',
    uri: 'https://magicroulette.com/publisher-metadata.json',
    sellerFeeBasisPoints: 0,
    collection: SOLANA_DAPP_STORE_COLLECTION, // Official dApp Store collection
  });
  
  return nft;
}
```

#### 3.2 Publisher Metadata JSON

```json
{
  "name": "Magic Roulette Publisher NFT",
  "symbol": "MRPUB",
  "description": "Publisher NFT for Magic Roulette on Solana dApp Store",
  "image": "https://magicroulette.com/publisher-nft.png",
  "attributes": [
    {
      "trait_type": "Publisher",
      "value": "Magic Roulette Team"
    },
    {
      "trait_type": "Category",
      "value": "Gaming"
    },
    {
      "trait_type": "Verified",
      "value": "true"
    }
  ],
  "properties": {
    "files": [
      {
        "uri": "https://magicroulette.com/publisher-nft.png",
        "type": "image/png"
      }
    ],
    "category": "image"
  }
}
```

### Phase 4: Deep Linking

#### 4.1 Configure Deep Link Scheme

**app.json (Expo)**:
```json
{
  "expo": {
    "scheme": "magicroulette",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "magicroulette.com",
              "pathPrefix": "/play"
            },
            {
              "scheme": "magicroulette"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

#### 4.2 Implement Deep Link Handler

```typescript
import { Linking } from 'react-native';
import { useEffect } from 'react';

export function useDeepLinking() {
  useEffect(() => {
    // Handle initial URL (app opened via deep link)
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink(url);
      }
    });
    
    // Handle URL changes (app already open)
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });
    
    return () => subscription.remove();
  }, []);
  
  const handleDeepLink = (url: string) => {
    // magicroulette://game/123 - Open specific game
    // magicroulette://create?mode=1v1 - Create game with mode
    // magicroulette://lobby - Open game lobby
    
    const route = url.replace(/.*?:\/\//g, '');
    const [path, query] = route.split('?');
    
    if (path.startsWith('game/')) {
      const gameId = path.split('/')[1];
      navigation.navigate('GamePlay', { gameId });
    } else if (path === 'create') {
      const params = new URLSearchParams(query);
      const mode = params.get('mode');
      navigation.navigate('CreateGame', { mode });
    } else if (path === 'lobby') {
      navigation.navigate('GameLobby');
    }
  };
}
```

### Phase 5: App Update Mechanism

#### 5.1 Configure Expo Updates

**app.json**:
```json
{
  "expo": {
    "updates": {
      "enabled": true,
      "checkAutomatically": "ON_LOAD",
      "fallbackToCacheTimeout": 0
    },
    "runtimeVersion": {
      "policy": "sdkVersion"
    }
  }
}
```

#### 5.2 Implement Update Check

```typescript
import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';

export function useAppUpdates() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  
  useEffect(() => {
    checkForUpdates();
  }, []);
  
  const checkForUpdates = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      
      if (update.isAvailable) {
        setUpdateAvailable(true);
        
        // Download update
        await Updates.fetchUpdateAsync();
        
        // Prompt user to restart
        Alert.alert(
          'Update Available',
          'A new version is available. Restart to update?',
          [
            { text: 'Later', style: 'cancel' },
            { text: 'Restart', onPress: () => Updates.reloadAsync() }
          ]
        );
      }
    } catch (error) {
      console.error('Update check failed:', error);
    }
  };
  
  return { updateAvailable, checkForUpdates };
}
```

### Phase 6: Submission

#### 6.1 Submit to dApp Store

1. **Create Publisher Account**
   - Connect wallet to dApp Store
   - Mint publisher NFT
   - Verify identity

2. **Upload App Assets**
   - Upload icon (512x512)
   - Upload feature graphic (1024x500)
   - Upload screenshots (5-8)
   - Upload demo video (30-60s)

3. **Fill Submission Form**
   - App name: Magic Roulette
   - Description: [See 2.1]
   - Category: Gaming > GameFi
   - Tags: gaming, gamefi, roulette, solana, seeker
   - Website: https://magicroulette.com
   - Contact: magicroulettesol@gmail.com

4. **Submit for Review**
   - Review submission checklist
   - Submit app for review
   - Monitor review status

#### 6.2 Review Process

**Timeline**: 3-7 days

**Review Criteria**:
- [ ] App functions as described
- [ ] No crashes or critical bugs
- [ ] Mobile Wallet Adapter works correctly
- [ ] Deep linking works correctly
- [ ] Assets meet quality standards
- [ ] Description is accurate
- [ ] No prohibited content

**Common Rejection Reasons**:
- App crashes on launch
- Wallet connection fails
- Misleading description
- Low-quality assets
- Missing required permissions

### Phase 7: Post-Submission

#### 7.1 Monitor Review Status

```typescript
// Check review status via dApp Store API
async function checkReviewStatus(submissionId: string) {
  const response = await fetch(
    `https://api.dappstore.solana.com/v1/submissions/${submissionId}`
  );
  
  const { status, feedback } = await response.json();
  
  return { status, feedback };
}
```

#### 7.2 Respond to Feedback

If rejected:
1. Read rejection feedback carefully
2. Address all issues mentioned
3. Re-test thoroughly
4. Resubmit with changes documented

#### 7.3 Launch Announcement

Once approved:
- [ ] Announce on Twitter/X
- [ ] Announce in Discord
- [ ] Post on r/solana and r/SolanaMobile
- [ ] Update website with dApp Store link
- [ ] Send email to beta testers

**Launch Tweet Template**:
```
🎉 Magic Roulette is LIVE on Solana dApp Store!

Experience the fastest on-chain gaming on Solana Seeker:
✨ Sub-10ms gameplay
🎲 Provably fair VRF
💰 1000x cost savings
📱 Seamless mobile UX

Download now: [dApp Store link]

#Solana #SolanaMobile #Seeker #GameFi
```

## Testing Checklist

### Pre-Submission Testing

- [ ] **Functionality**
  - [ ] App launches without crashes
  - [ ] Wallet connection works (Phantom, Solflare, Backpack, Seed Vault)
  - [ ] Game creation works
  - [ ] Game joining works
  - [ ] Gameplay works (shots, animations, winner reveal)
  - [ ] Prize distribution works

- [ ] **Performance**
  - [ ] Load time <100ms on Seeker
  - [ ] Shot execution <10ms
  - [ ] No lag or stuttering
  - [ ] Smooth animations (60fps)

- [ ] **Deep Linking**
  - [ ] magicroulette:// scheme works
  - [ ] https://magicroulette.com/play works
  - [ ] Game invite links work
  - [ ] Navigation to correct screens

- [ ] **Updates**
  - [ ] Update check works on launch
  - [ ] Update download works
  - [ ] Update installation works
  - [ ] App restarts correctly

- [ ] **Assets**
  - [ ] Icon displays correctly
  - [ ] Screenshots are high-quality
  - [ ] Video plays correctly
  - [ ] Description is accurate

## Discoverability Optimization

### Keywords
- Primary: roulette, gaming, gamefi
- Secondary: solana, seeker, blockchain, crypto
- Long-tail: russian roulette, on-chain gaming, provably fair

### Search Optimization
- Use keywords in app name
- Use keywords in description
- Use relevant tags
- Encourage user reviews

### Social Proof
- Share user testimonials
- Highlight beta tester feedback
- Show gameplay videos
- Display download count

## Maintenance

### Regular Updates
- [ ] Fix bugs reported by users
- [ ] Add new features based on feedback
- [ ] Optimize performance
- [ ] Update dependencies

### Monitoring
- [ ] Track downloads and DAU
- [ ] Monitor crash rate
- [ ] Track user reviews
- [ ] Monitor dApp Store ranking

### Community Engagement
- [ ] Respond to user reviews
- [ ] Address bug reports
- [ ] Implement feature requests
- [ ] Share updates on social media

## Resources

- [Solana dApp Store Documentation](https://docs.solanamobile.com/dapp-publishing/intro)
- [NFT Publishing Guide](https://docs.solanamobile.com/dapp-publishing/publishing)
- [Deep Linking Guide](https://docs.expo.dev/guides/linking/)
- [Expo Updates Documentation](https://docs.expo.dev/versions/latest/sdk/updates/)

## Common Issues

### Issue 1: App Not Appearing in Search
**Solution**: 
- Verify app is approved
- Check keywords and tags
- Wait 24-48 hours for indexing

### Issue 2: Deep Links Not Working
**Solution**:
- Verify intent filters in app.json
- Test with `adb shell am start -a android.intent.action.VIEW -d "magicroulette://"`
- Check domain verification

### Issue 3: Updates Not Downloading
**Solution**:
- Verify Expo Updates configuration
- Check runtime version compatibility
- Test update mechanism in development

### Issue 4: Low Download Count
**Solution**:
- Improve app store listing (better screenshots, video)
- Increase marketing efforts
- Encourage user reviews
- Optimize keywords
