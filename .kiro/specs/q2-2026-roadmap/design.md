# Design Document: Magic Roulette Q2 2026 Development Phase

## Overview

This design document specifies the technical implementation for Magic Roulette's Q2 2026 development phase, building upon the completed Q1 2026 foundation to deliver a production-ready, mobile-optimized gaming platform for Solana Seeker devices and the Solana dApp Store.

### Q1 2026 Foundation (Completed)

The following components are already implemented and operational:

- **Smart Contracts**: Anchor 0.32.1 program with game logic, delegation patterns, fee distribution
- **Program ID**: `HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam` (devnet)
- **MagicBlock Ephemeral Rollups**: Sub-10ms gameplay execution with gasless transactions
- **VRF Integration**: Verifiable randomness for bullet chamber placement
- **Kamino Finance**: Leveraged betting with 110% collateralization
- **Squads Protocol**: 3-of-5 multisig for treasury management
- **Web App**: Next.js 16 with @solana/react-hooks
- **Backend API**: Express, PostgreSQL, Redis, WebSocket
- **Mobile App (Basic)**: React Native + Expo with basic structure

### Q2 2026 Objectives

This phase focuses on five critical areas:

1. **External Security Audit**: Third-party audit of all smart contracts, VRF, and DeFi integrations
2. **Light Protocol ZK Compression**: 1000x cost reduction for token accounts and storage
3. **Mobile App Completion**: Full-featured React Native app optimized for Seeker hardware
4. **Mobile Wallet Adapter Optimization**: Seamless one-tap connections with gasless gameplay
5. **Solana dApp Store Submission**: NFT-based app publishing and distribution

### Success Criteria

- External audit completed with zero critical vulnerabilities
- Light Protocol integrated with verified 1000x cost savings
- Mobile app achieving sub-100ms load time on Seeker
- Mobile Wallet Adapter providing one-tap connection without mid-game popups
- App successfully published to Solana dApp Store
- Beta testing completed with 100+ Seeker users
- All features maintaining sub-10ms gameplay latency

## Architecture

### System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                   Magic Roulette Q2 2026 Stack                   │
├─────────────────────────────────────────────────────────────────┤
│  Mobile App (React Native + Expo)                               │
│  ├─ Mobile Wallet Adapter (one-tap connection)                  │
│  ├─ Light Protocol SDK (compressed tokens)                      │
│  ├─ WebSocket (real-time updates)                               │
│  └─ Seeker Optimization (sub-100ms load)                        │
├─────────────────────────────────────────────────────────────────┤
│  Smart Contract Layer (Solana) - Q1 Complete                    │
│  ├─ Game Logic (Anchor 0.32.1)                                  │
│  ├─ Token Management (Token-2022)                               │
│  ├─ Fee Distribution (5% platform, 10% treasury, 85% winner)    │
│  └─ Delegation/Commit (MagicBlock ER)                           │
├─────────────────────────────────────────────────────────────────┤
│  Ephemeral Rollup Layer (MagicBlock) - Q1 Complete              │
│  ├─ Sub-10ms execution                                          │
│  ├─ Gasless transactions                                        │
│  └─ State commitment                                            │
├─────────────────────────────────────────────────────────────────┤
│  DeFi Integration Layer                                         │
│  ├─ Light Protocol (NEW: ZK Compression - 1000x savings)        │
│  ├─ Kamino Finance (Q1 Complete: leveraged betting)             │
│  ├─ Squads Protocol (Q1 Complete: multisig governance)          │
│  └─ VRF (Q1 Complete: verifiable randomness)                    │
├─────────────────────────────────────────────────────────────────┤
│  Distribution Layer (NEW)                                       │
│  ├─ Solana dApp Store (NFT-based publishing)                    │
│  ├─ Deep Linking (game invites, direct launch)                  │
│  └─ Update Mechanism (OTA updates)                              │
└─────────────────────────────────────────────────────────────────┘
```


### Technology Stack

**Mobile Frontend**:
- React Native 0.76.5
- Expo ~52.0.0
- TypeScript 5.3.3
- @solana-mobile/mobile-wallet-adapter-protocol 2.1.3
- @solana/web3.js 1.95.8

**Light Protocol Integration**:
- @lightprotocol/stateless.js (latest)
- @lightprotocol/compressed-token (latest)
- ZK Compression SDK

**Smart Contracts** (Q1 Complete):
- Anchor 0.32.1
- Rust 1.85.0
- Token-2022 (SPL Token Extensions)

**Backend** (Q1 Complete):
- Express.js
- PostgreSQL
- Redis
- WebSocket (Socket.io)

**Infrastructure**:
- Helius RPC (mainnet/devnet)
- MagicBlock Ephemeral Rollups
- Solana dApp Store (NFT publishing)

## Components and Interfaces

### 1. External Security Audit Component

#### 1.1 Audit Scope Definition

**Smart Contract Audit Areas**:
```typescript
interface AuditScope {
  programInstructions: {
    gameCreation: ['initialize_platform', 'create_game', 'create_game_with_loan'];
    gameExecution: ['join_game', 'delegate_game', 'take_shot', 'commit_game'];
    finalization: ['undelegate_game', 'finalize_game', 'distribute_winnings'];
    stats: ['update_player_stats', 'claim_treasury_rewards'];
  };
  
  vrfIntegration: {
    randomnessRequest: 'request_vrf_randomness';
    randomnessCallback: 'process_vrf_result';
    bulletChamberDetermination: 'calculate_bullet_chamber';
  };
  
  defiIntegrations: {
    kamino: ['create_loan', 'repay_loan', 'liquidate_collateral'];
    squads: ['multisig_proposal', 'multisig_execution'];
    lightProtocol: ['create_compressed_account', 'transfer_compressed'];
  };
  
  securityChecks: {
    accessControl: 'authority validation, PDA verification';
    arithmetic: 'overflow protection, checked math';
    reentrancy: 'state guards, CPI safety';
    randomness: 'VRF manipulation resistance';
  };
}
```

#### 1.2 Audit Process Flow

```
Phase 1: Preparation (Week 1)
├─ Compile audit documentation
├─ Prepare test environment
├─ Provide auditor access
└─ Schedule kickoff meeting

Phase 2: Initial Review (Weeks 2-3)
├─ Static code analysis
├─ Manual code review
├─ Architecture assessment
└─ Preliminary findings report

Phase 3: Deep Dive (Weeks 4-5)
├─ Exploit attempt testing
├─ Edge case validation
├─ Integration testing
└─ VRF manipulation testing

Phase 4: Remediation (Week 6)
├─ Fix critical issues
├─ Fix high-priority issues
├─ Re-test fixes
└─ Update documentation

Phase 5: Final Report (Week 7)
├─ Final audit report
├─ Severity classifications
├─ Remediation verification
└─ Public disclosure
```

#### 1.3 Vulnerability Classification

```typescript
enum VulnerabilitySeverity {
  CRITICAL = 'Critical',    // Fund theft, game manipulation, system compromise
  HIGH = 'High',            // Significant impact, requires immediate fix
  MEDIUM = 'Medium',        // Moderate impact, fix before mainnet
  LOW = 'Low',              // Minor issues, best practice improvements
  INFORMATIONAL = 'Info'    // Code quality, gas optimization
}

interface VulnerabilityReport {
  id: string;
  severity: VulnerabilitySeverity;
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  status: 'Open' | 'Fixed' | 'Acknowledged' | 'Mitigated';
  fixCommit?: string;
}
```


### 2. Light Protocol ZK Compression Integration

#### 2.1 Compressed Token Architecture

**Cost Comparison**:
```typescript
interface TokenAccountCosts {
  traditional: {
    tokenAccount: 2_039_280,      // ~2M lamports (~$0.20)
    mint: 1_461_600,              // ~1.5M lamports (~$0.15)
    transfer: 5_000,              // ~5K lamports (~$0.0005)
  };
  
  compressed: {
    tokenAccount: 5_000,          // ~5K lamports (~$0.0005)
    mint: 7_308,                  // ~7K lamports (~$0.0007)
    transfer: 5_000,              // ~5K lamports (~$0.0005)
  };
  
  savings: {
    perAccount: 400,              // 400x savings per account
    perMint: 200,                 // 200x savings per mint
    overall: 1000,                // 1000x average savings
  };
}
```

#### 2.2 Light Protocol SDK Integration

**Compressed Token Operations**:
```typescript
import { createRpc, Rpc } from '@lightprotocol/stateless.js';
import { 
  createMint, 
  mintTo, 
  transfer,
  compress,
  decompress 
} from '@lightprotocol/compressed-token';

class LightProtocolService {
  private rpc: Rpc;
  
  constructor(rpcEndpoint: string) {
    this.rpc = createRpc(rpcEndpoint, rpcEndpoint);
  }
  
  // Create compressed mint for game tokens
  async createCompressedMint(
    payer: Keypair,
    authority: PublicKey,
    decimals: number = 9
  ): Promise<PublicKey> {
    const { mint } = await createMint(
      this.rpc,
      payer,
      authority,
      decimals
    );
    return mint;
  }
  
  // Mint compressed tokens to player (5,000 lamports)
  async mintCompressedTokens(
    payer: Keypair,
    mint: PublicKey,
    recipient: PublicKey,
    authority: Keypair,
    amount: bigint
  ): Promise<string> {
    const signature = await mintTo(
      this.rpc,
      payer,
      mint,
      recipient,
      authority,
      amount
    );
    return signature;
  }
  
  // Transfer compressed tokens (gasless on ER)
  async transferCompressed(
    payer: Keypair,
    mint: PublicKey,
    amount: bigint,
    sender: Keypair,
    recipient: PublicKey
  ): Promise<string> {
    const signature = await transfer(
      this.rpc,
      payer,
      mint,
      amount,
      sender,
      recipient
    );
    return signature;
  }
  
  // Compress existing SPL tokens
  async compressTokens(
    payer: Keypair,
    mint: PublicKey,
    amount: bigint,
    owner: Keypair
  ): Promise<string> {
    const signature = await compress(
      this.rpc,
      payer,
      mint,
      amount,
      owner,
      owner.publicKey
    );
    return signature;
  }
  
  // Decompress to SPL tokens
  async decompressTokens(
    payer: Keypair,
    mint: PublicKey,
    amount: bigint,
    owner: Keypair
  ): Promise<string> {
    const signature = await decompress(
      this.rpc,
      payer,
      mint,
      amount,
      owner,
      owner.publicKey
    );
    return signature;
  }
}
```

#### 2.3 Game Integration with Compressed Tokens

**Entry Fee Deposit Flow**:
```typescript
interface CompressedGameFlow {
  // Step 1: Player creates compressed token account (5,000 lamports)
  createAccount: async (player: PublicKey) => {
    const account = await lightProtocol.createCompressedAccount(player);
    return account; // Cost: ~5,000 lamports vs ~2M for SPL
  };
  
  // Step 2: Deposit entry fee as compressed tokens
  depositEntryFee: async (
    player: Keypair,
    gameId: bigint,
    entryFee: bigint
  ) => {
    const signature = await lightProtocol.transferCompressed(
      player,
      GAME_TOKEN_MINT,
      entryFee,
      player,
      getGameVaultPDA(gameId)
    );
    return signature;
  };
  
  // Step 3: Game executes on Ephemeral Rollup (gasless)
  executeGame: async (gameId: bigint) => {
    // Shots executed on ER with zero gas
    // State committed back to base layer
  };
  
  // Step 4: Distribute winnings as compressed tokens
  distributeWinnings: async (
    gameId: bigint,
    winners: PublicKey[],
    amounts: bigint[]
  ) => {
    for (let i = 0; i < winners.length; i++) {
      await lightProtocol.transferCompressed(
        GAME_AUTHORITY,
        GAME_TOKEN_MINT,
        amounts[i],
        GAME_AUTHORITY,
        winners[i]
      );
    }
  };
}
```

#### 2.4 Migration Strategy

**SPL to Compressed Token Migration**:
```typescript
interface MigrationStrategy {
  // Phase 1: Parallel Support (Weeks 1-2)
  phase1: {
    description: 'Support both SPL and compressed tokens';
    implementation: 'Feature flag for compressed token opt-in';
    rollout: 'Beta testers only';
  };
  
  // Phase 2: Gradual Migration (Weeks 3-4)
  phase2: {
    description: 'Encourage compressed token adoption';
    implementation: 'UI prompts for migration, cost savings display';
    rollout: 'All users with opt-out option';
  };
  
  // Phase 3: Full Migration (Weeks 5-6)
  phase3: {
    description: 'Default to compressed tokens';
    implementation: 'Automatic compression on deposit';
    rollout: 'All new users, existing users migrated';
  };
  
  // Phase 4: SPL Deprecation (Week 7+)
  phase4: {
    description: 'Compressed tokens only';
    implementation: 'Remove SPL token support';
    rollout: 'All users on compressed tokens';
  };
}
```


### 3. Mobile App Development Completion

#### 3.1 Mobile App Architecture

**Component Structure**:
```typescript
mobile-app/
├── src/
│   ├── components/
│   │   ├── wallet/
│   │   │   ├── WalletButton.tsx           // One-tap connection
│   │   │   ├── WalletStatus.tsx           // Connection indicator
│   │   │   └── TransactionToast.tsx       // TX feedback
│   │   ├── game/
│   │   │   ├── GameCard.tsx               // Lobby game card
│   │   │   ├── GameRoom.tsx               // Gameplay interface
│   │   │   ├── PlayerList.tsx             // Team display
│   │   │   ├── ChamberAnimation.tsx       // Shot animation
│   │   │   └── WinnerModal.tsx            // Result display
│   │   ├── ui/
│   │   │   ├── Button.tsx                 // Styled button
│   │   │   ├── Card.tsx                   // Container card
│   │   │   ├── LoadingSpinner.tsx         // Loading state
│   │   │   └── ErrorBoundary.tsx          // Error handling
│   │   └── seeker/
│   │       ├── SeekerBadge.tsx            // Device indicator
│   │       └── SeekerOptimization.tsx     // Performance hints
│   ├── screens/
│   │   ├── HomeScreen.tsx                 // Landing/lobby
│   │   ├── GameLobbyScreen.tsx            // Available games
│   │   ├── CreateGameScreen.tsx           // Game creation
│   │   ├── GamePlayScreen.tsx             // Active game
│   │   ├── DashboardScreen.tsx            // Player stats
│   │   └── SettingsScreen.tsx             // App settings
│   ├── contexts/
│   │   ├── WalletContext.tsx              // MWA provider
│   │   ├── GameContext.tsx                // Game state
│   │   └── SeekerContext.tsx              // Device detection
│   ├── hooks/
│   │   ├── useWallet.ts                   // Wallet operations
│   │   ├── useGame.ts                     // Game operations
│   │   ├── useWebSocket.ts                // Real-time updates
│   │   └── useSeeker.ts                   // Seeker detection
│   ├── services/
│   │   ├── LightProtocolService.ts        // Compressed tokens
│   │   ├── GameService.ts                 // Game API
│   │   ├── WebSocketService.ts            // Real-time
│   │   └── AnalyticsService.ts            // Tracking
│   └── lib/
│       ├── constants.ts                   // App constants
│       ├── utils.ts                       // Utilities
│       └── types.ts                       // TypeScript types
├── App.tsx                                // App entry
├── app.json                               // Expo config
└── package.json                           // Dependencies
```

#### 3.2 Key Screen Implementations

**Home Screen (Landing/Lobby)**:
```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useWallet } from '../hooks/useWallet';
import { useGame } from '../hooks/useGame';
import { WalletButton } from '../components/wallet/WalletButton';
import { GameCard } from '../components/game/GameCard';
import { SeekerBadge } from '../components/seeker/SeekerBadge';

export function HomeScreen({ navigation }) {
  const { connected, publicKey } = useWallet();
  const { availableGames, loading } = useGame();
  const [refreshing, setRefreshing] = useState(false);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAvailableGames();
    setRefreshing(false);
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Magic Roulette</Text>
        <SeekerBadge />
        <WalletButton />
      </View>
      
      {/* Game Lobby */}
      {connected ? (
        <FlatList
          data={availableGames}
          renderItem={({ item }) => (
            <GameCard
              game={item}
              onJoin={() => navigation.navigate('GamePlay', { gameId: item.id })}
            />
          )}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No games available</Text>
          }
        />
      ) : (
        <View style={styles.connectPrompt}>
          <Text style={styles.promptText}>Connect wallet to play</Text>
        </View>
      )}
      
      {/* Create Game Button */}
      {connected && (
        <Button
          title="Create Game"
          onPress={() => navigation.navigate('CreateGame')}
          style={styles.createButton}
        />
      )}
    </View>
  );
}
```

**Game Play Screen**:
```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGame } from '../hooks/useGame';
import { useWebSocket } from '../hooks/useWebSocket';
import { GameRoom } from '../components/game/GameRoom';
import { ChamberAnimation } from '../components/game/ChamberAnimation';
import { WinnerModal } from '../components/game/WinnerModal';

export function GamePlayScreen({ route, navigation }) {
  const { gameId } = route.params;
  const { game, takeShot, loading } = useGame(gameId);
  const { subscribe, unsubscribe } = useWebSocket();
  const [showWinner, setShowWinner] = useState(false);
  
  useEffect(() => {
    // Subscribe to game updates
    subscribe(`game:${gameId}`, (update) => {
      if (update.status === 'finished') {
        setShowWinner(true);
      }
    });
    
    return () => unsubscribe(`game:${gameId}`);
  }, [gameId]);
  
  const handleShot = async () => {
    try {
      await takeShot(gameId);
    } catch (error) {
      console.error('Shot failed:', error);
    }
  };
  
  return (
    <View style={styles.container}>
      <GameRoom
        game={game}
        onShoot={handleShot}
        loading={loading}
      />
      
      {game?.currentShot && (
        <ChamberAnimation
          chamber={game.currentShot.chamber}
          isBullet={game.currentShot.isBullet}
        />
      )}
      
      <WinnerModal
        visible={showWinner}
        winner={game?.winner}
        prize={game?.prize}
        onClose={() => navigation.navigate('Home')}
      />
    </View>
  );
}
```

#### 3.3 Performance Optimization for Seeker

**Load Time Optimization**:
```typescript
// Lazy loading for non-critical components
const DashboardScreen = React.lazy(() => import('./screens/DashboardScreen'));
const SettingsScreen = React.lazy(() => import('./screens/SettingsScreen'));

// Image optimization
import { Image } from 'expo-image';

<Image
  source={{ uri: imageUrl }}
  placeholder={blurhash}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"
/>

// Code splitting
const GamePlayScreen = React.lazy(() => 
  import(/* webpackChunkName: "gameplay" */ './screens/GamePlayScreen')
);

// Asset preloading
import { Asset } from 'expo-asset';

async function preloadAssets() {
  const images = [
    require('./assets/logo.png'),
    require('./assets/chamber.png'),
    require('./assets/bullet.png'),
  ];
  
  await Asset.loadAsync(images);
}
```

**Memory Management**:
```typescript
// Efficient list rendering
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={games}
  renderItem={renderGameCard}
  estimatedItemSize={120}
  removeClippedSubviews={true}
/>

// Memoization
const GameCard = React.memo(({ game, onJoin }) => {
  return (
    <Card>
      <Text>{game.entryFee} SOL</Text>
      <Button onPress={onJoin}>Join</Button>
    </Card>
  );
});

// Cleanup on unmount
useEffect(() => {
  const subscription = subscribeToGame(gameId);
  
  return () => {
    subscription.unsubscribe();
    clearCache();
  };
}, [gameId]);
```


### 4. Mobile Wallet Adapter Integration and Optimization

#### 4.1 Mobile Wallet Adapter Architecture

**Wallet Context Provider**:
```typescript
import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  transact,
  Web3MobileWallet 
} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';

interface WalletContextState {
  connected: boolean;
  connecting: boolean;
  publicKey: PublicKey | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signAndSendTransaction: (transaction: Transaction) => Promise<string>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
}

const WalletContext = createContext<WalletContextState | null>(null);

export function WalletProvider({ children, cluster = 'devnet' }) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  
  const connection = new Connection(
    cluster === 'mainnet-beta' 
      ? 'https://api.mainnet-beta.solana.com'
      : 'https://api.devnet.solana.com'
  );
  
  // One-tap wallet connection
  const connect = useCallback(async () => {
    setConnecting(true);
    
    try {
      await transact(async (wallet: Web3MobileWallet) => {
        // Request authorization (one-time)
        const authResult = await wallet.authorize({
          cluster,
          identity: {
            name: 'Magic Roulette',
            uri: 'https://magicroulette.com',
            icon: 'https://magicroulette.com/icon.png',
          },
        });
        
        setPublicKey(new PublicKey(authResult.accounts[0].address));
        setAuthToken(authResult.auth_token);
        setConnected(true);
      });
    } catch (error) {
      console.error('Connection failed:', error);
      throw error;
    } finally {
      setConnecting(false);
    }
  }, [cluster]);
  
  // Disconnect wallet
  const disconnect = useCallback(async () => {
    await transact(async (wallet: Web3MobileWallet) => {
      await wallet.deauthorize({ auth_token: authToken });
    });
    
    setConnected(false);
    setPublicKey(null);
    setAuthToken(null);
  }, [authToken]);
  
  // Sign and send transaction (no popup during gameplay)
  const signAndSendTransaction = useCallback(async (transaction: Transaction) => {
    if (!connected || !publicKey) {
      throw new Error('Wallet not connected');
    }
    
    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = publicKey;
    
    let signature: string;
    
    await transact(async (wallet: Web3MobileWallet) => {
      // Reauthorize with existing token (no popup)
      await wallet.reauthorize({
        auth_token: authToken,
        identity: {
          name: 'Magic Roulette',
          uri: 'https://magicroulette.com',
          icon: 'https://magicroulette.com/icon.png',
        },
      });
      
      // Sign and send (batched, no popup)
      const signedTransactions = await wallet.signAndSendTransactions({
        transactions: [transaction],
      });
      
      signature = signedTransactions[0];
    });
    
    return signature;
  }, [connected, publicKey, authToken, connection]);
  
  // Sign multiple transactions (batch)
  const signAllTransactions = useCallback(async (transactions: Transaction[]) => {
    if (!connected || !publicKey) {
      throw new Error('Wallet not connected');
    }
    
    const { blockhash } = await connection.getLatestBlockhash();
    
    transactions.forEach(tx => {
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;
    });
    
    let signedTxs: Transaction[];
    
    await transact(async (wallet: Web3MobileWallet) => {
      await wallet.reauthorize({
        auth_token: authToken,
        identity: {
          name: 'Magic Roulette',
          uri: 'https://magicroulette.com',
          icon: 'https://magicroulette.com/icon.png',
        },
      });
      
      signedTxs = await wallet.signTransactions({
        transactions,
      });
    });
    
    return signedTxs;
  }, [connected, publicKey, authToken, connection]);
  
  return (
    <WalletContext.Provider
      value={{
        connected,
        connecting,
        publicKey,
        connect,
        disconnect,
        signAndSendTransaction,
        signAllTransactions,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
}
```

#### 4.2 Gasless Gameplay Implementation

**Pre-Authorization for Game Transactions**:
```typescript
interface GameSessionAuth {
  // Pre-authorize game transactions during initial connection
  preAuthorizeGameSession: async (
    wallet: Web3MobileWallet,
    gameId: bigint,
    maxShots: number
  ) => {
    // Request authorization for multiple transactions
    const authResult = await wallet.authorize({
      cluster: 'devnet',
      identity: {
        name: 'Magic Roulette',
        uri: 'https://magicroulette.com',
        icon: 'https://magicroulette.com/icon.png',
      },
      // Pre-authorize game actions
      scope: [
        'sign_transactions',
        'sign_and_send_transactions',
      ],
    });
    
    // Store session token for gasless gameplay
    return {
      authToken: authResult.auth_token,
      publicKey: authResult.accounts[0].address,
      expiresAt: Date.now() + 3600000, // 1 hour
    };
  };
  
  // Execute shot without popup (uses Ephemeral Rollup)
  executeShotGasless: async (
    gameId: bigint,
    sessionAuth: SessionAuth
  ) => {
    // Shot executed on ER (zero gas)
    // No wallet popup required
    // State committed automatically
    
    const shotResult = await gameService.takeShot(gameId, {
      authToken: sessionAuth.authToken,
      publicKey: sessionAuth.publicKey,
    });
    
    return shotResult;
  };
}
```

#### 4.3 Transaction Batching

**Batch Entry Fee and Game Creation**:
```typescript
async function createGameWithBatchedTransactions(
  entryFee: number,
  gameMode: '1v1' | '2v2'
): Promise<string> {
  const { publicKey, signAllTransactions } = useWallet();
  
  // Transaction 1: Deposit entry fee (compressed tokens)
  const depositTx = await lightProtocol.createDepositTransaction(
    publicKey,
    entryFee
  );
  
  // Transaction 2: Create game
  const createGameTx = await gameService.createGameTransaction(
    publicKey,
    entryFee,
    gameMode
  );
  
  // Batch sign and send (single wallet popup)
  const signedTxs = await signAllTransactions([depositTx, createGameTx]);
  
  const signatures = await Promise.all(
    signedTxs.map(tx => connection.sendRawTransaction(tx.serialize()))
  );
  
  return signatures[1]; // Return game creation signature
}
```

#### 4.4 Wallet Compatibility

**Supported Wallets**:
```typescript
enum SupportedWallet {
  PHANTOM = 'Phantom Mobile',
  SOLFLARE = 'Solflare Mobile',
  BACKPACK = 'Backpack Mobile',
  SEED_VAULT = 'Seed Vault Wallet', // Seeker default
}

interface WalletCapabilities {
  [SupportedWallet.PHANTOM]: {
    mobileWalletAdapter: true,
    compressedTokens: true,
    batchTransactions: true,
    sessionAuth: true,
  };
  [SupportedWallet.SOLFLARE]: {
    mobileWalletAdapter: true,
    compressedTokens: true,
    batchTransactions: true,
    sessionAuth: true,
  };
  [SupportedWallet.BACKPACK]: {
    mobileWalletAdapter: true,
    compressedTokens: true,
    batchTransactions: true,
    sessionAuth: false, // Limited support
  };
  [SupportedWallet.SEED_VAULT]: {
    mobileWalletAdapter: true,
    compressedTokens: true,
    batchTransactions: true,
    sessionAuth: true,
  };
}
```


### 5. Solana dApp Store Submission

#### 5.1 NFT-Based App Publishing

**dApp Store Metadata Structure**:
```typescript
interface DAppStoreMetadata {
  // App Identity
  name: 'Magic Roulette';
  description: 'High-stakes Russian Roulette GameFi on Solana. Sub-10ms gameplay, provably fair VRF, 1000x cost savings via Light Protocol. Tokenless model - play with SOL/USDC.';
  category: 'Gaming';
  subcategory: 'GameFi';
  
  // NFT Publishing
  publisherNFT: {
    mint: PublicKey;              // Publisher NFT mint address
    collection: PublicKey;        // Solana dApp Store collection
    metadata: {
      name: 'Magic Roulette Publisher NFT';
      symbol: 'MRPUB';
      uri: 'https://magicroulette.com/metadata.json';
    };
  };
  
  // App Assets
  assets: {
    icon: {
      url: 'https://magicroulette.com/assets/icon-512.png';
      size: '512x512';
      format: 'PNG';
    };
    featureGraphic: {
      url: 'https://magicroulette.com/assets/feature-1024x500.png';
      size: '1024x500';
      format: 'PNG';
    };
    screenshots: [
      'https://magicroulette.com/assets/screenshot-1.png',
      'https://magicroulette.com/assets/screenshot-2.png',
      'https://magicroulette.com/assets/screenshot-3.png',
      'https://magicroulette.com/assets/screenshot-4.png',
      'https://magicroulette.com/assets/screenshot-5.png',
    ];
    video: {
      url: 'https://magicroulette.com/assets/demo.mp4';
      thumbnail: 'https://magicroulette.com/assets/video-thumb.png';
    };
  };
  
  // Technical Details
  technical: {
    packageName: 'com.magicroulette.mobile';
    version: '1.0.0';
    minSdkVersion: 24;
    targetSdkVersion: 34;
    permissions: [
      'INTERNET',
      'ACCESS_NETWORK_STATE',
      'CAMERA', // For QR code scanning
    ];
  };
  
  // Deep Linking
  deepLinks: {
    scheme: 'magicroulette://';
    paths: {
      game: 'magicroulette://game/{gameId}';
      invite: 'magicroulette://invite/{inviteCode}';
      lobby: 'magicroulette://lobby';
    };
  };
  
  // Update Mechanism
  updates: {
    type: 'OTA'; // Over-the-air updates
    channel: 'stable';
    autoUpdate: true;
  };
}
```

#### 5.2 App Store Listing Content

**Store Description**:
```markdown
# Magic Roulette - High-Stakes GameFi on Solana

Experience the fastest blockchain gaming on Solana Seeker. Magic Roulette combines classic Russian Roulette with cutting-edge Web3 technology for a provably fair, high-stakes gaming experience.

## 🚀 Key Features

- **Sub-10ms Gameplay**: Lightning-fast execution via MagicBlock Ephemeral Rollups
- **Provably Fair**: Verifiable randomness through VRF - impossible to manipulate
- **1000x Cost Savings**: Light Protocol ZK Compression reduces fees by 1000x
- **Seamless Mobile UX**: One-tap wallet connection, no popups during gameplay
- **Tokenless Model**: Play instantly with SOL/USDC - no platform token required
- **Multiple Game Modes**: 1v1, 2v2, and AI practice modes

## 🎮 How to Play

1. Connect your Solana wallet (one tap)
2. Choose a game mode and entry fee
3. Take turns shooting - survive to win
4. Winner takes 85% of the pot

## 💰 Fair & Transparent

- 5% platform fee
- 10% treasury rewards
- 85% to winners
- All transactions on-chain

## 🔒 Security

- External security audit completed
- Provably fair VRF randomness
- Decentralized governance via Squads Protocol
- Non-custodial - you control your funds

## 📱 Optimized for Seeker

- Native Seeker device support
- Sub-100ms load time
- Optimized for crypto-native hardware
- Exclusive Seeker features coming soon

## 🌐 Links

- Website: https://magicroulette.com
- Twitter: @mgcrouletteapp
- Discord: discord.gg/magicroulette
- Docs: docs.magicroulette.com

## ⚠️ Disclaimer

Magic Roulette is a gaming platform involving risk. Only wager what you can afford to lose. Availability may be restricted in certain jurisdictions.
```

**Keywords for Discovery**:
```typescript
const keywords = [
  'roulette',
  'russian roulette',
  'gaming',
  'gamefi',
  'solana',
  'seeker',
  'blockchain game',
  'crypto game',
  'web3 game',
  'high stakes',
  'provably fair',
  'vrf',
  'ephemeral rollups',
  'light protocol',
  'mobile gaming',
];
```

#### 5.3 Deep Linking Implementation

**Deep Link Handler**:
```typescript
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export function useDeepLinking() {
  const navigation = useNavigation();
  
  useEffect(() => {
    // Handle initial URL (app opened from link)
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink(url);
      }
    });
    
    // Handle URL while app is running
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });
    
    return () => subscription.remove();
  }, []);
  
  const handleDeepLink = (url: string) => {
    const route = parseDeepLink(url);
    
    switch (route.type) {
      case 'game':
        navigation.navigate('GamePlay', { gameId: route.params.gameId });
        break;
      
      case 'invite':
        navigation.navigate('GameLobby', { inviteCode: route.params.inviteCode });
        break;
      
      case 'lobby':
        navigation.navigate('GameLobby');
        break;
      
      default:
        navigation.navigate('Home');
    }
  };
  
  const parseDeepLink = (url: string): DeepLinkRoute => {
    // magicroulette://game/12345
    const match = url.match(/magicroulette:\/\/(\w+)\/?(.*)/);
    
    if (!match) {
      return { type: 'home', params: {} };
    }
    
    const [, type, params] = match;
    
    return {
      type,
      params: parseParams(params),
    };
  };
}
```

#### 5.4 Update Mechanism

**Over-the-Air (OTA) Updates**:
```typescript
import * as Updates from 'expo-updates';

export function useAppUpdates() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [downloading, setDownloading] = useState(false);
  
  useEffect(() => {
    checkForUpdates();
  }, []);
  
  const checkForUpdates = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      
      if (update.isAvailable) {
        setUpdateAvailable(true);
      }
    } catch (error) {
      console.error('Update check failed:', error);
    }
  };
  
  const downloadAndInstallUpdate = async () => {
    try {
      setDownloading(true);
      
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    } catch (error) {
      console.error('Update failed:', error);
      setDownloading(false);
    }
  };
  
  return {
    updateAvailable,
    downloading,
    downloadAndInstallUpdate,
  };
}
```


### 6. Beta Testing and Seeker Optimization

#### 6.1 Beta Testing Infrastructure

**Beta Tester Recruitment**:
```typescript
interface BetaTesterProgram {
  // Recruitment Channels
  channels: {
    solanaMobile: 'Solana Mobile Discord community';
    twitter: 'Twitter/X campaign with #SolanaMobile #Seeker';
    reddit: 'r/solana, r/SolanaMobile';
    telegram: 'Solana Mobile Telegram groups';
  };
  
  // Eligibility Criteria
  eligibility: {
    seekerDevice: true;              // Must have Seeker device
    walletInstalled: true;           // Phantom/Solflare/Seed Vault
    testnetFunds: false;             // Provided by platform
    nda: false;                      // Public beta
  };
  
  // Incentives
  incentives: {
    earlyAccess: 'First access to mainnet launch';
    exclusiveNFT: 'Beta tester commemorative NFT';
    freeGames: '100 testnet SOL for gameplay';
    leaderboard: 'Beta leaderboard with prizes';
  };
  
  // Target Size
  target: {
    minimum: 100;
    optimal: 250;
    maximum: 500;
  };
}
```

**Testnet Environment Setup**:
```typescript
interface TestnetEnvironment {
  // Testnet Configuration
  network: 'devnet';
  rpcEndpoint: 'https://api.devnet.solana.com';
  programId: 'HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam';
  
  // Test Token Distribution
  testTokens: {
    sol: 100,                        // 100 testnet SOL per tester
    usdc: 1000,                      // 1000 testnet USDC per tester
    distribution: 'automatic',       // Auto-airdrop on signup
  };
  
  // Test Game Modes
  enabledModes: ['1v1', '2v2', 'ai'];
  
  // Feature Flags
  features: {
    lightProtocol: true,             // Test compressed tokens
    mobileWalletAdapter: true,       // Test MWA integration
    ephemeralRollups: true,          // Test ER performance
    deepLinking: true,               // Test dApp Store links
  };
}
```

#### 6.2 Performance Metrics Collection

**Metrics Tracking**:
```typescript
interface PerformanceMetrics {
  // Load Time Metrics
  loadTime: {
    appLaunch: number;               // Time to interactive (target: <100ms)
    walletConnection: number;        // Time to connect (target: <500ms)
    gameLoad: number;                // Time to load game (target: <200ms)
  };
  
  // Gameplay Metrics
  gameplay: {
    shotLatency: number;             // Shot execution time (target: <10ms)
    stateSync: number;               // ER commit time (target: <50ms)
    animationFPS: number;            // Animation smoothness (target: 60fps)
  };
  
  // Transaction Metrics
  transactions: {
    signTime: number;                // Wallet sign time (target: <200ms)
    confirmTime: number;             // TX confirmation (target: <400ms)
    successRate: number;             // TX success rate (target: >99%)
  };
  
  // Network Metrics
  network: {
    latency: number;                 // Network latency (target: <100ms)
    bandwidth: number;               // Data usage per game
    reconnectTime: number;           // WebSocket reconnect time
  };
  
  // Device Metrics
  device: {
    cpuUsage: number;                // CPU usage percentage
    memoryUsage: number;             // Memory usage (MB)
    batteryDrain: number;            // Battery drain per hour
    temperature: number;             // Device temperature
  };
}

class PerformanceTracker {
  private metrics: PerformanceMetrics[] = [];
  
  // Track app launch
  trackAppLaunch() {
    const startTime = performance.now();
    
    return () => {
      const loadTime = performance.now() - startTime;
      this.recordMetric('loadTime.appLaunch', loadTime);
    };
  }
  
  // Track shot execution
  async trackShot(shotFn: () => Promise<void>) {
    const startTime = performance.now();
    
    try {
      await shotFn();
      const latency = performance.now() - startTime;
      this.recordMetric('gameplay.shotLatency', latency);
    } catch (error) {
      this.recordError('shot_execution', error);
    }
  }
  
  // Track transaction
  async trackTransaction(txFn: () => Promise<string>) {
    const startTime = performance.now();
    
    try {
      const signature = await txFn();
      const signTime = performance.now() - startTime;
      this.recordMetric('transactions.signTime', signTime);
      return signature;
    } catch (error) {
      this.recordError('transaction', error);
      throw error;
    }
  }
  
  // Send metrics to backend
  async flushMetrics() {
    if (this.metrics.length === 0) return;
    
    await fetch('https://api.magicroulette.com/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metrics: this.metrics,
        deviceInfo: getDeviceInfo(),
        timestamp: Date.now(),
      }),
    });
    
    this.metrics = [];
  }
}
```

#### 6.3 Feedback Collection

**In-App Feedback Mechanism**:
```typescript
interface FeedbackSystem {
  // Feedback Types
  types: {
    bug: 'Bug report with screenshots and logs';
    feature: 'Feature request or suggestion';
    ux: 'User experience feedback';
    performance: 'Performance issue report';
  };
  
  // Feedback Form
  form: {
    type: FeedbackType;
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    screenshot?: string;             // Auto-captured
    logs?: string;                   // Auto-attached
    deviceInfo: DeviceInfo;          // Auto-collected
  };
  
  // Submission
  submit: async (feedback: FeedbackForm) => {
    await fetch('https://api.magicroulette.com/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedback),
    });
  };
}

// Feedback Button Component
function FeedbackButton() {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <>
      <TouchableOpacity
        style={styles.feedbackButton}
        onPress={() => setShowModal(true)}
      >
        <Text>📝 Feedback</Text>
      </TouchableOpacity>
      
      <FeedbackModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleFeedbackSubmit}
      />
    </>
  );
}
```

#### 6.4 Seeker-Specific Optimizations

**Seeker Hardware Optimization**:
```typescript
interface SeekerOptimizations {
  // Hardware Detection
  detectSeeker: () => {
    const userAgent = navigator.userAgent;
    const isSeeker = userAgent.includes('Seeker') || 
                     userAgent.includes('Saga'); // Saga is Seeker's predecessor
    
    return {
      isSeeker,
      model: isSeeker ? 'Seeker' : 'Unknown',
      optimizationsEnabled: isSeeker,
    };
  };
  
  // Performance Optimizations
  optimizations: {
    // Use native crypto APIs on Seeker
    cryptoAcceleration: true,
    
    // Optimize rendering for Seeker's display
    displayOptimization: {
      resolution: '1080x2400',
      refreshRate: 120,              // Seeker supports 120Hz
      colorDepth: 24,
    },
    
    // Battery optimization
    batteryOptimization: {
      reducedAnimations: false,      // Seeker can handle full animations
      backgroundSync: true,          // Efficient background updates
      wakelock: false,               // Don't prevent sleep
    },
    
    // Network optimization
    networkOptimization: {
      preferWiFi: true,              // Prefer WiFi over cellular
      compressionEnabled: true,      // Compress API responses
      caching: 'aggressive',         // Aggressive caching on Seeker
    },
  };
  
  // Seeker-Exclusive Features
  exclusiveFeatures: {
    seedVaultIntegration: true,      // Native Seed Vault wallet
    nfcSupport: false,               // Future: NFC for game invites
    hardwareWalletSupport: true,     // Seeker has secure element
  };
}
```


## Data Models

### 1. Audit Data Models

**Vulnerability Report**:
```typescript
interface VulnerabilityReport {
  id: string;                        // Unique vulnerability ID
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
  title: string;                     // Short description
  description: string;               // Detailed explanation
  impact: string;                    // Potential impact
  recommendation: string;            // Fix recommendation
  status: 'Open' | 'Fixed' | 'Acknowledged' | 'Mitigated';
  fixCommit?: string;                // Git commit hash of fix
  reTestResult?: 'Pass' | 'Fail';   // Re-test after fix
  discoveredAt: Date;
  fixedAt?: Date;
}

interface AuditReport {
  auditId: string;
  auditor: string;                   // Auditing firm name
  startDate: Date;
  endDate: Date;
  scope: string[];                   // Audited components
  vulnerabilities: VulnerabilityReport[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    informational: number;
  };
  conclusion: string;
  publicReportUrl: string;
}
```

### 2. Light Protocol Data Models

**Compressed Token Account**:
```typescript
interface CompressedTokenAccount {
  owner: PublicKey;                  // Account owner
  mint: PublicKey;                   // Token mint
  amount: bigint;                    // Token balance
  merkleTree: PublicKey;             // State tree address
  leafIndex: number;                 // Position in tree
  createdAt: Date;
  compressed: true;                  // Always true
  rentExempt: true;                  // Always rent-free
  cost: 5000;                        // ~5K lamports
}

interface CompressionMetrics {
  totalAccounts: number;             // Total compressed accounts
  totalSavings: bigint;              // Total lamports saved
  savingsMultiplier: number;         // Actual savings multiplier (target: 1000x)
  migrationProgress: {
    splAccounts: number;             // Remaining SPL accounts
    compressedAccounts: number;      // Migrated compressed accounts
    percentComplete: number;         // Migration percentage
  };
}
```

### 3. Mobile App Data Models

**Game State (Mobile)**:
```typescript
interface MobileGameState {
  gameId: bigint;
  status: 'waiting' | 'ready' | 'in_progress' | 'finished';
  mode: '1v1' | '2v2' | 'ai';
  entryFee: number;                  // SOL amount
  totalPot: number;                  // Total prize pool
  
  // Players
  players: {
    publicKey: PublicKey;
    team: 'A' | 'B';
    position: number;
    isCurrentTurn: boolean;
    shotsTaken: number;
    isAlive: boolean;
  }[];
  
  // Game Progress
  currentChamber: number;            // 1-6
  bulletChamber: number | null;      // Hidden until fired
  currentTurn: number;
  
  // Results
  winner?: {
    team: 'A' | 'B';
    players: PublicKey[];
    prize: number;
  };
  
  // Timestamps
  createdAt: Date;
  startedAt?: Date;
  finishedAt?: Date;
}
```

**Performance Metrics**:
```typescript
interface PerformanceSnapshot {
  sessionId: string;
  userId: PublicKey;
  deviceInfo: {
    model: string;
    isSeeker: boolean;
    osVersion: string;
    appVersion: string;
  };
  
  metrics: {
    loadTime: {
      appLaunch: number;             // ms
      walletConnection: number;      // ms
      gameLoad: number;              // ms
    };
    gameplay: {
      shotLatency: number;           // ms (target: <10ms)
      stateSync: number;             // ms
      animationFPS: number;          // fps (target: 60)
    };
    transactions: {
      signTime: number;              // ms (target: <200ms)
      confirmTime: number;           // ms
      successRate: number;           // percentage
    };
    network: {
      latency: number;               // ms
      bandwidth: number;             // bytes
      reconnectTime: number;         // ms
    };
  };
  
  timestamp: Date;
}
```

### 4. Beta Testing Data Models

**Beta Tester Profile**:
```typescript
interface BetaTester {
  id: string;
  publicKey: PublicKey;
  email?: string;
  discordHandle?: string;
  
  // Device Info
  device: {
    model: string;
    isSeeker: boolean;
    osVersion: string;
    walletInstalled: string[];       // ['Phantom', 'Solflare', etc.]
  };
  
  // Testing Activity
  activity: {
    gamesPlayed: number;
    feedbackSubmitted: number;
    bugsReported: number;
    lastActive: Date;
  };
  
  // Test Funds
  testFunds: {
    sol: number;                     // Testnet SOL balance
    usdc: number;                    // Testnet USDC balance
    distributed: Date;
  };
  
  // Rewards
  rewards: {
    betaNFT: boolean;
    leaderboardRank?: number;
    exclusiveAccess: boolean;
  };
  
  joinedAt: Date;
}

interface BugReport {
  id: string;
  reporterId: string;
  type: 'bug' | 'feature' | 'ux' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  screenshot?: string;
  logs?: string;
  deviceInfo: DeviceInfo;
  status: 'open' | 'in_progress' | 'resolved' | 'wont_fix';
  createdAt: Date;
  resolvedAt?: Date;
}
```

### 5. dApp Store Data Models

**App Listing**:
```typescript
interface DAppStoreListing {
  // App Identity
  appId: string;
  packageName: 'com.magicroulette.mobile';
  name: 'Magic Roulette';
  publisher: PublicKey;              // Publisher NFT holder
  
  // Metadata
  metadata: {
    description: string;
    category: 'Gaming';
    subcategory: 'GameFi';
    keywords: string[];
    version: string;
    releaseDate: Date;
    lastUpdated: Date;
  };
  
  // Assets
  assets: {
    icon: string;                    // 512x512 PNG URL
    featureGraphic: string;          // 1024x500 PNG URL
    screenshots: string[];           // 5+ screenshots
    video?: string;                  // Demo video URL
  };
  
  // Technical
  technical: {
    minSdkVersion: number;
    targetSdkVersion: number;
    permissions: string[];
    deepLinkScheme: string;
    updateChannel: 'stable' | 'beta';
  };
  
  // Stats
  stats: {
    downloads: number;
    activeUsers: number;
    rating: number;                  // 0-5
    reviews: number;
  };
  
  // Publishing NFT
  publisherNFT: {
    mint: PublicKey;
    collection: PublicKey;
    verified: boolean;
  };
}

interface AppUpdate {
  appId: string;
  version: string;
  releaseNotes: string;
  downloadUrl: string;
  fileSize: number;                  // bytes
  checksum: string;                  // SHA-256
  mandatory: boolean;
  releasedAt: Date;
}
```

### 6. Monitoring Data Models

**System Health**:
```typescript
interface SystemHealth {
  timestamp: Date;
  
  // Service Status
  services: {
    mobileApp: 'operational' | 'degraded' | 'down';
    backend: 'operational' | 'degraded' | 'down';
    smartContract: 'operational' | 'degraded' | 'down';
    ephemeralRollup: 'operational' | 'degraded' | 'down';
    lightProtocol: 'operational' | 'degraded' | 'down';
  };
  
  // Performance
  performance: {
    avgLoadTime: number;             // ms
    avgShotLatency: number;          // ms
    avgTransactionTime: number;      // ms
    uptime: number;                  // percentage
  };
  
  // Usage
  usage: {
    activeUsers: number;
    activeGames: number;
    transactionsPerSecond: number;
    bandwidthUsage: number;          // MB/s
  };
  
  // Errors
  errors: {
    rate: number;                    // errors per minute
    critical: number;
    high: number;
    medium: number;
  };
}
```


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

The following properties validate the Q2 2026 development phase requirements. These properties focus on new functionality (Light Protocol, Mobile Wallet Adapter, mobile app, dApp Store) while ensuring backward compatibility with Q1 2026 features.

### Light Protocol ZK Compression Properties

**Property 1: Compressed token account cost savings**
*For any* player creating a compressed token account, the account creation cost should be approximately 5,000 lamports (within 10% tolerance), representing a 400x savings compared to SPL token accounts (~2,000,000 lamports).
**Validates: Requirements 2.2, 2.6**

**Property 2: Compressed token transfer functionality**
*For any* valid compressed token transfer with sufficient balance, the transfer should succeed and the recipient's balance should increase by the transfer amount while the sender's balance decreases by the same amount.
**Validates: Requirements 2.3**

**Property 3: Winnings distributed as compressed tokens**
*For any* game that finishes with a winner, the winnings distribution should use compressed tokens and the winner's compressed token balance should increase by 85% of the total pot.
**Validates: Requirements 2.4**

**Property 4: Compress and decompress round-trip**
*For any* SPL token amount, compressing the tokens then immediately decompressing should result in the same SPL token balance (within rounding tolerance of 1 lamport).
**Validates: Requirements 2.5**

**Property 5: Compressed token error handling**
*For any* compressed token operation that fails (insufficient balance, invalid account, network error), the system should provide a clear error message indicating the failure reason and automatically fallback to SPL token operations if configured.
**Validates: Requirements 2.8**

### Mobile App Properties

**Property 6: Game lobby displays required information**
*For any* game displayed in the lobby interface, the rendered output should contain the entry fee amount, game mode (1v1/2v2/AI), and current player count.
**Validates: Requirements 3.2**

**Property 7: Game creation accepts valid inputs**
*For any* valid game creation request with entry fee between 0.01 and 100 SOL and game mode of 1v1 or 2v2, the system should successfully create a game and return a valid game ID.
**Validates: Requirements 3.3**

**Property 8: Player dashboard displays statistics**
*For any* player dashboard render, the output should contain game history, win/loss statistics, total wagered amount, and lifetime earnings.
**Validates: Requirements 3.5**

**Property 9: Mobile app load time on Seeker**
*For any* app launch on a Seeker device with normal network conditions, the time to interactive should be less than 100ms.
**Validates: Requirements 3.6, 6.5**

**Property 10: Shot execution latency maintained**
*For any* shot execution on Ephemeral Rollups, the latency from user action to state update should be less than 10ms (Q1 performance maintained).
**Validates: Requirements 3.7, 6.5, 7.1**

**Property 11: Offline UI graceful degradation**
*For any* network disconnection event, the mobile app UI should remain responsive and display cached data with a clear offline indicator, without crashing or freezing.
**Validates: Requirements 3.9**

### Mobile Wallet Adapter Properties

**Property 12: Persistent wallet session**
*For any* connected wallet session during gameplay, the system should not require re-authentication or additional wallet prompts until the session is explicitly ended or expires.
**Validates: Requirements 4.3**

**Property 13: Gasless shot execution**
*For any* shot taken during gameplay on Ephemeral Rollups, the shot should execute without requiring transaction approval popups or gas fees from the player.
**Validates: Requirements 4.4, 4.6**

**Property 14: Transaction batching minimizes popups**
*For any* sequence of related operations (deposit entry fee + create game, or claim winnings + withdraw), the system should batch them into a single transaction requiring only one wallet approval.
**Validates: Requirements 4.5**

**Property 15: Wallet connection error messages**
*For any* wallet connection failure (wallet not installed, user rejection, network error), the system should display a clear error message with specific troubleshooting steps.
**Validates: Requirements 4.8**

**Property 16: Automatic wallet reconnection**
*For any* app transition from background to foreground state with a previously connected wallet, the system should automatically reconnect without requiring user interaction.
**Validates: Requirements 4.9**

**Property 17: Transaction signing performance**
*For any* transaction signing operation on Seeker hardware, the signing time should be less than 200ms from user approval to signature completion.
**Validates: Requirements 4.10**

### dApp Store Properties

**Property 18: Deep linking navigation**
*For any* valid deep link URL (game invite, specific game mode, lobby), the app should navigate to the correct screen with the appropriate parameters loaded.
**Validates: Requirements 5.7**

### Beta Testing Properties

**Property 19: Test fund distribution**
*For any* beta tester account created, the system should automatically distribute 100 testnet SOL and 1000 testnet USDC within 5 minutes of account creation.
**Validates: Requirements 6.2**

**Property 20: Performance metrics collection**
*For any* game played during beta testing, the system should collect and store performance metrics including load time, shot latency, and transaction success rate.
**Validates: Requirements 6.3**

### Performance and Reliability Properties

**Property 21: High latency warning**
*For any* game creation attempt when network latency exceeds 100ms, the system should display a latency warning to the player before allowing game creation.
**Validates: Requirements 7.3**

**Property 22: RPC endpoint failover**
*For any* primary RPC endpoint failure (timeout, error response, unavailable), the system should automatically failover to a backup RPC endpoint within 1 second.
**Validates: Requirements 7.4**

**Property 23: VRF circuit breaker**
*For any* game creation attempt when the VRF service is unavailable or unresponsive, the system should prevent game creation and display an error message indicating VRF unavailability.
**Validates: Requirements 7.6**

**Property 24: Error logging without sensitive data**
*For any* system error that occurs, the error log should contain detailed debugging information (error type, stack trace, context) but should not contain sensitive data (private keys, auth tokens, personal information).
**Validates: Requirements 7.7**

**Property 25: Rate limiting enforcement**
*For any* user making more than 10 game creation requests within 60 seconds, the system should reject subsequent requests with a rate limit error until the time window resets.
**Validates: Requirements 7.8**

### Monitoring Properties

**Property 26: Metrics collection for analytics**
*For any* user action (game creation, shot taken, transaction signed), the system should record the corresponding metric with timestamp, user ID, and action details.
**Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5**

### Backward Compatibility Properties

**Property 27: Q1 smart contract compatibility**
*For any* existing game account or player stats account from Q1 2026, the Q2 2026 system should be able to read and update the account without data loss or corruption.
**Validates: Requirements 10.1**

**Property 28: Web app data migration**
*For any* player upgrading from web app to mobile app, the migration process should preserve all game history, statistics, and account balances with zero data loss.
**Validates: Requirements 10.2**

**Property 29: Optional compressed token migration**
*For any* player with existing SPL token balances, the system should allow continued use of SPL tokens without forcing migration to compressed tokens.
**Validates: Requirements 10.3**

**Property 30: Integration preservation during upgrades**
*For any* existing Kamino loan or Squads multisig configuration, the Q2 2026 upgrade should preserve the configuration and allow continued operation without re-initialization.
**Validates: Requirements 10.4**

**Property 31: In-progress games unaffected by upgrades**
*For any* game in progress during a system upgrade, the game should be able to complete normally without interruption, state loss, or requiring restart.
**Validates: Requirements 10.5**

**Property 32: Balance preservation during migration**
*For any* account migrating from SPL to compressed tokens, the token balance before migration should equal the token balance after migration (within rounding tolerance of 1 lamport).
**Validates: Requirements 10.8**


## Error Handling

### 1. Light Protocol Error Handling

**Compressed Token Errors**:
```typescript
enum CompressedTokenError {
  ACCOUNT_CREATION_FAILED = 'Failed to create compressed token account',
  INSUFFICIENT_BALANCE = 'Insufficient compressed token balance',
  TRANSFER_FAILED = 'Compressed token transfer failed',
  COMPRESSION_FAILED = 'Failed to compress SPL tokens',
  DECOMPRESSION_FAILED = 'Failed to decompress to SPL tokens',
  MERKLE_TREE_FULL = 'State merkle tree is full',
  INVALID_PROOF = 'Invalid ZK compression proof',
}

class CompressedTokenErrorHandler {
  async handleError(error: CompressedTokenError, context: any): Promise<void> {
    switch (error) {
      case CompressedTokenError.ACCOUNT_CREATION_FAILED:
        // Fallback to SPL token account
        await this.createSPLAccount(context.owner);
        break;
      
      case CompressedTokenError.TRANSFER_FAILED:
        // Retry with SPL tokens
        await this.transferSPL(context.from, context.to, context.amount);
        break;
      
      case CompressedTokenError.MERKLE_TREE_FULL:
        // Use alternative merkle tree
        await this.switchMerkleTree(context.mint);
        break;
      
      default:
        // Log error and notify user
        logger.error('Compressed token error', { error, context });
        throw new UserFacingError('Compressed token operation failed. Please try again.');
    }
  }
}
```

### 2. Mobile Wallet Adapter Error Handling

**Wallet Connection Errors**:
```typescript
enum WalletError {
  NOT_INSTALLED = 'Wallet app not installed',
  USER_REJECTED = 'User rejected connection',
  TIMEOUT = 'Connection timeout',
  NETWORK_ERROR = 'Network error during connection',
  INVALID_CLUSTER = 'Invalid cluster configuration',
  SESSION_EXPIRED = 'Wallet session expired',
  SIGNING_FAILED = 'Transaction signing failed',
}

class WalletErrorHandler {
  getErrorMessage(error: WalletError): string {
    const messages = {
      [WalletError.NOT_INSTALLED]: 
        'No Solana wallet found. Please install Phantom, Solflare, or Seed Vault.',
      [WalletError.USER_REJECTED]: 
        'Connection rejected. Please approve the connection to play.',
      [WalletError.TIMEOUT]: 
        'Connection timed out. Please check your network and try again.',
      [WalletError.NETWORK_ERROR]: 
        'Network error. Please check your connection and try again.',
      [WalletError.INVALID_CLUSTER]: 
        'Invalid network configuration. Please contact support.',
      [WalletError.SESSION_EXPIRED]: 
        'Session expired. Please reconnect your wallet.',
      [WalletError.SIGNING_FAILED]: 
        'Transaction signing failed. Please try again.',
    };
    
    return messages[error] || 'An unexpected error occurred. Please try again.';
  }
  
  getTroubleshootingSteps(error: WalletError): string[] {
    const steps = {
      [WalletError.NOT_INSTALLED]: [
        '1. Install a Solana wallet from the app store',
        '2. Create or import a wallet',
        '3. Return to Magic Roulette and connect',
      ],
      [WalletError.USER_REJECTED]: [
        '1. Tap "Connect Wallet" again',
        '2. Approve the connection in your wallet app',
      ],
      [WalletError.TIMEOUT]: [
        '1. Check your internet connection',
        '2. Ensure your wallet app is up to date',
        '3. Try connecting again',
      ],
      [WalletError.SESSION_EXPIRED]: [
        '1. Tap "Connect Wallet" to reconnect',
        '2. Approve the connection in your wallet app',
      ],
    };
    
    return steps[error] || ['Please try again or contact support.'];
  }
}
```

### 3. Mobile App Error Handling

**Network Errors**:
```typescript
class NetworkErrorHandler {
  async handleNetworkError(error: Error, operation: string): Promise<void> {
    // Check if offline
    if (!navigator.onLine) {
      this.showOfflineMessage();
      return;
    }
    
    // Retry with exponential backoff
    const maxRetries = 3;
    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.retryOperation(operation);
        return;
      } catch (retryError) {
        if (i === maxRetries - 1) {
          throw retryError;
        }
        await this.delay(Math.pow(2, i) * 1000);
      }
    }
  }
  
  showOfflineMessage(): void {
    Toast.show({
      type: 'error',
      text1: 'No Internet Connection',
      text2: 'Please check your connection and try again.',
      position: 'bottom',
    });
  }
}
```

**Game State Errors**:
```typescript
enum GameStateError {
  GAME_NOT_FOUND = 'Game not found',
  GAME_FULL = 'Game is full',
  INSUFFICIENT_FUNDS = 'Insufficient funds for entry fee',
  NOT_YOUR_TURN = 'Not your turn',
  GAME_ALREADY_FINISHED = 'Game already finished',
  INVALID_GAME_STATE = 'Invalid game state',
}

class GameStateErrorHandler {
  handleError(error: GameStateError): void {
    const userMessages = {
      [GameStateError.GAME_NOT_FOUND]: 
        'This game no longer exists. Please join another game.',
      [GameStateError.GAME_FULL]: 
        'This game is full. Please join another game.',
      [GameStateError.INSUFFICIENT_FUNDS]: 
        'Insufficient funds. Please add SOL to your wallet.',
      [GameStateError.NOT_YOUR_TURN]: 
        'Please wait for your turn.',
      [GameStateError.GAME_ALREADY_FINISHED]: 
        'This game has already finished.',
      [GameStateError.INVALID_GAME_STATE]: 
        'Game state error. Please refresh and try again.',
    };
    
    Alert.alert('Error', userMessages[error]);
  }
}
```

### 4. Performance Error Handling

**Timeout Handling**:
```typescript
class TimeoutHandler {
  async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    operation: string
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${operation} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });
    
    try {
      return await Promise.race([promise, timeoutPromise]);
    } catch (error) {
      logger.error('Operation timeout', { operation, timeoutMs, error });
      throw new UserFacingError(
        `${operation} is taking longer than expected. Please try again.`
      );
    }
  }
}

// Usage
const gameState = await timeoutHandler.withTimeout(
  fetchGameState(gameId),
  5000,
  'Fetching game state'
);
```

### 5. Circuit Breaker Pattern

**VRF Circuit Breaker**:
```typescript
class VRFCircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  private readonly FAILURE_THRESHOLD = 5;
  private readonly TIMEOUT_MS = 60000; // 1 minute
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.TIMEOUT_MS) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('VRF service is currently unavailable. Please try again later.');
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }
  
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.FAILURE_THRESHOLD) {
      this.state = 'OPEN';
      logger.error('VRF circuit breaker opened', {
        failureCount: this.failureCount,
      });
    }
  }
}
```

### 6. Error Logging

**Structured Error Logging**:
```typescript
interface ErrorLog {
  timestamp: Date;
  level: 'error' | 'warning' | 'info';
  message: string;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  context: {
    userId?: string;
    gameId?: string;
    operation: string;
    deviceInfo: DeviceInfo;
  };
  // Sensitive data explicitly excluded
  sanitized: true;
}

class ErrorLogger {
  log(error: Error, context: any): void {
    const errorLog: ErrorLog = {
      timestamp: new Date(),
      level: 'error',
      message: error.message,
      error: {
        name: error.name,
        message: error.message,
        stack: this.sanitizeStackTrace(error.stack),
      },
      context: {
        userId: this.hashUserId(context.userId),
        gameId: context.gameId,
        operation: context.operation,
        deviceInfo: this.getDeviceInfo(),
      },
      sanitized: true,
    };
    
    // Remove any potential sensitive data
    this.sanitizeLog(errorLog);
    
    // Send to logging service
    this.sendToLoggingService(errorLog);
  }
  
  private sanitizeStackTrace(stack?: string): string | undefined {
    if (!stack) return undefined;
    
    // Remove file paths that might contain sensitive info
    return stack.replace(/\/Users\/[^\/]+/g, '/Users/***');
  }
  
  private sanitizeLog(log: ErrorLog): void {
    // Remove any keys that might contain sensitive data
    const sensitiveKeys = ['privateKey', 'authToken', 'password', 'secret'];
    
    const sanitize = (obj: any) => {
      for (const key in obj) {
        if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
          obj[key] = '***REDACTED***';
        } else if (typeof obj[key] === 'object') {
          sanitize(obj[key]);
        }
      }
    };
    
    sanitize(log);
  }
}
```


## Testing Strategy

### Dual Testing Approach

The Q2 2026 testing strategy employs both unit testing and property-based testing to ensure comprehensive coverage:

- **Unit Tests**: Verify specific examples, edge cases, error conditions, and integration points
- **Property Tests**: Verify universal properties across all inputs through randomization
- Both approaches are complementary and necessary for production readiness

### Unit Testing Strategy

**Focus Areas**:
- Specific examples demonstrating correct behavior
- Edge cases (empty inputs, boundary values, maximum limits)
- Error conditions (network failures, invalid inputs, timeout scenarios)
- Integration points between components (Light Protocol SDK, Mobile Wallet Adapter, backend API)

**Unit Test Balance**:
- Avoid writing too many unit tests for scenarios covered by property tests
- Focus unit tests on concrete examples that illustrate requirements
- Use unit tests for integration testing with external services
- Property tests handle comprehensive input coverage through randomization

**Example Unit Tests**:
```typescript
describe('Light Protocol Integration', () => {
  it('should create compressed token account with ~5K lamports cost', async () => {
    const cost = await lightProtocol.getAccountCreationCost();
    expect(cost).toBeGreaterThan(4500);
    expect(cost).toBeLessThan(5500);
  });
  
  it('should fallback to SPL when compressed token creation fails', async () => {
    // Mock compressed token failure
    jest.spyOn(lightProtocol, 'createCompressedAccount').mockRejectedValue(
      new Error('Merkle tree full')
    );
    
    const account = await gameService.createPlayerAccount(player);
    expect(account.type).toBe('SPL');
  });
  
  it('should handle empty game lobby gracefully', async () => {
    const games = await gameService.getAvailableGames();
    expect(games).toEqual([]);
    // UI should display "No games available" message
  });
});

describe('Mobile Wallet Adapter', () => {
  it('should connect wallet with one tap', async () => {
    const { connect } = useWallet();
    await connect();
    expect(mockWallet.authorize).toHaveBeenCalledTimes(1);
  });
  
  it('should display error message when wallet not installed', async () => {
    jest.spyOn(transact, 'transact').mockRejectedValue(
      new Error('Wallet not found')
    );
    
    await expect(connect()).rejects.toThrow();
    expect(mockToast.show).toHaveBeenCalledWith(
      expect.objectContaining({
        text1: expect.stringContaining('wallet'),
      })
    );
  });
});
```

### Property-Based Testing Strategy

**Property Test Configuration**:
- Minimum 100 iterations per property test (due to randomization)
- Each property test references its design document property
- Tag format: `Feature: q2-2026-roadmap, Property {number}: {property_text}`

**Property Test Library**:
- **TypeScript/JavaScript**: fast-check
- **Rust (smart contracts)**: proptest or quickcheck

**Example Property Tests**:
```typescript
import fc from 'fast-check';

describe('Property Tests: Light Protocol', () => {
  // Feature: q2-2026-roadmap, Property 1: Compressed token account cost savings
  it('should create compressed accounts with ~5K lamports cost for any player', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          publicKey: fc.string().map(s => new PublicKey(s)),
        }),
        async ({ publicKey }) => {
          const cost = await lightProtocol.createCompressedAccount(publicKey);
          expect(cost).toBeGreaterThan(4500);
          expect(cost).toBeLessThan(5500);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // Feature: q2-2026-roadmap, Property 4: Compress and decompress round-trip
  it('should preserve balance through compress/decompress for any amount', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          amount: fc.bigInt({ min: 1n, max: 1000000000n }),
          owner: fc.string().map(s => new PublicKey(s)),
        }),
        async ({ amount, owner }) => {
          const initialBalance = await getBalance(owner);
          
          // Compress
          await lightProtocol.compressTokens(owner, amount);
          
          // Decompress
          await lightProtocol.decompressTokens(owner, amount);
          
          const finalBalance = await getBalance(owner);
          
          // Allow 1 lamport rounding tolerance
          expect(Math.abs(Number(finalBalance - initialBalance))).toBeLessThanOrEqual(1);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property Tests: Mobile Wallet Adapter', () => {
  // Feature: q2-2026-roadmap, Property 13: Gasless shot execution
  it('should execute shots without gas fees for any game', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          gameId: fc.bigInt({ min: 1n, max: 1000000n }),
          player: fc.string().map(s => new PublicKey(s)),
        }),
        async ({ gameId, player }) => {
          const initialBalance = await connection.getBalance(player);
          
          await gameService.takeShot(gameId, player);
          
          const finalBalance = await connection.getBalance(player);
          
          // Balance should not decrease (gasless)
          expect(finalBalance).toBeGreaterThanOrEqual(initialBalance);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // Feature: q2-2026-roadmap, Property 14: Transaction batching minimizes popups
  it('should batch related operations into single transaction for any game creation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          entryFee: fc.float({ min: 0.01, max: 100 }),
          gameMode: fc.constantFrom('1v1', '2v2'),
        }),
        async ({ entryFee, gameMode }) => {
          const walletApprovals = [];
          
          jest.spyOn(mockWallet, 'signAndSendTransactions').mockImplementation((txs) => {
            walletApprovals.push(txs.length);
            return Promise.resolve(txs.map(() => 'signature'));
          });
          
          await gameService.createGameWithDeposit(entryFee, gameMode);
          
          // Should batch deposit + create into single approval
          expect(walletApprovals.length).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property Tests: Performance', () => {
  // Feature: q2-2026-roadmap, Property 9: Mobile app load time on Seeker
  it('should load in <100ms for any app launch on Seeker', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          networkLatency: fc.integer({ min: 10, max: 50 }), // Normal conditions
        }),
        async ({ networkLatency }) => {
          // Simulate network latency
          jest.spyOn(global, 'fetch').mockImplementation(
            () => new Promise(resolve => setTimeout(resolve, networkLatency))
          );
          
          const startTime = performance.now();
          await renderApp();
          const loadTime = performance.now() - startTime;
          
          expect(loadTime).toBeLessThan(100);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // Feature: q2-2026-roadmap, Property 10: Shot execution latency maintained
  it('should execute shots in <10ms for any game on ER', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          gameId: fc.bigInt({ min: 1n, max: 1000000n }),
          chamber: fc.integer({ min: 1, max: 6 }),
        }),
        async ({ gameId, chamber }) => {
          const startTime = performance.now();
          await ephemeralRollup.executeShot(gameId, chamber);
          const latency = performance.now() - startTime;
          
          expect(latency).toBeLessThan(10);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property Tests: Backward Compatibility', () => {
  // Feature: q2-2026-roadmap, Property 32: Balance preservation during migration
  it('should preserve balance through SPL to compressed migration for any amount', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          amount: fc.bigInt({ min: 1n, max: 1000000000n }),
          owner: fc.string().map(s => new PublicKey(s)),
        }),
        async ({ amount, owner }) => {
          // Setup SPL account with balance
          await setupSPLAccount(owner, amount);
          const balanceBefore = await getSPLBalance(owner);
          
          // Migrate to compressed
          await migrationService.migrateToCompressed(owner);
          
          const balanceAfter = await getCompressedBalance(owner);
          
          // Allow 1 lamport rounding tolerance
          expect(Math.abs(Number(balanceAfter - balanceBefore))).toBeLessThanOrEqual(1);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

**External Service Integration**:
```typescript
describe('Integration Tests', () => {
  it('should integrate with Light Protocol RPC', async () => {
    const rpc = createRpc(LIGHT_PROTOCOL_RPC);
    const health = await rpc.getHealth();
    expect(health).toBe('ok');
  });
  
  it('should integrate with MagicBlock Ephemeral Rollups', async () => {
    const game = await createGame();
    const delegated = await ephemeralRollup.delegateGame(game.id);
    expect(delegated).toBe(true);
  });
  
  it('should integrate with Mobile Wallet Adapter on Seeker', async () => {
    // Requires physical Seeker device or emulator
    const connected = await mobileWallet.connect();
    expect(connected).toBe(true);
  });
});
```

### Performance Testing

**Load Testing**:
```typescript
describe('Load Tests', () => {
  it('should handle 50 concurrent games', async () => {
    const games = await Promise.all(
      Array.from({ length: 50 }, () => createGame())
    );
    
    expect(games.every(g => g.status === 'ready')).toBe(true);
  });
  
  it('should maintain <10ms latency under load', async () => {
    const latencies = await Promise.all(
      Array.from({ length: 100 }, async () => {
        const start = performance.now();
        await executeShot();
        return performance.now() - start;
      })
    );
    
    const avgLatency = latencies.reduce((a, b) => a + b) / latencies.length;
    expect(avgLatency).toBeLessThan(10);
  });
});
```

### Beta Testing Validation

**Beta Test Metrics**:
```typescript
describe('Beta Testing Validation', () => {
  it('should collect performance metrics from beta testers', async () => {
    const metrics = await betaTestingService.getMetrics();
    
    expect(metrics.avgLoadTime).toBeLessThan(100);
    expect(metrics.avgShotLatency).toBeLessThan(10);
    expect(metrics.transactionSuccessRate).toBeGreaterThan(0.99);
  });
  
  it('should gather feedback from 100+ beta testers', async () => {
    const testers = await betaTestingService.getTesters();
    expect(testers.length).toBeGreaterThanOrEqual(100);
  });
});
```

### Test Coverage Goals

**Coverage Targets**:
- Unit test coverage: 80%+ for new Q2 2026 code
- Property test coverage: 100% of correctness properties
- Integration test coverage: All external service integrations
- Performance test coverage: All performance requirements
- Beta test coverage: 100+ Seeker users

**Continuous Integration**:
- Run unit tests on every commit
- Run property tests on every pull request
- Run integration tests nightly
- Run performance tests weekly
- Collect beta test metrics daily

