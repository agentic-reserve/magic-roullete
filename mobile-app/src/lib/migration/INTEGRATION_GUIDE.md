# Migration System Integration Guide

This guide shows how to integrate the SPL to compressed token migration system into the Magic Roulette mobile app.

## Quick Start

### 1. Initialize Migration Phase

In your app initialization (e.g., `App.tsx`):

```typescript
import { FeatureFlagService, MigrationPhase } from './lib/migration';

// On app startup
useEffect(() => {
  const featureFlags = FeatureFlagService.getInstance();
  
  // Set the current migration phase
  // Phase 1: Beta testers only
  // Phase 2: All users with opt-out
  // Phase 3: Default compressed, auto-migration
  // Phase 4: Compressed only
  featureFlags.setPhase(MigrationPhase.PHASE_2_GRADUAL);
}, []);
```

### 2. Add Migration Prompt to Home Screen

In `HomeScreen.tsx`:

```typescript
import { useMigration } from '../hooks/useMigration';
import { MigrationPrompt } from '../components/MigrationPrompt';

export function HomeScreen() {
  const { publicKey } = useWallet();
  const userId = publicKey?.toString() || 'guest';
  
  const {
    showPrompt,
    setShowPrompt,
    migrate,
    dismissPrompt,
  } = useMigration(userId);

  const handleMigrate = async () => {
    try {
      // Get user's token accounts to migrate
      const mint = GAME_TOKEN_MINT;
      const amount = await getTokenBalance(publicKey, mint);
      
      if (amount > 0n) {
        await migrate(mint, amount);
        Alert.alert('Success', 'Migration completed successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Migration failed. Please try again.');
    }
  };

  return (
    <View>
      {/* Your existing home screen content */}
      
      <MigrationPrompt
        visible={showPrompt}
        userId={userId}
        onClose={() => setShowPrompt(false)}
        onMigrate={handleMigrate}
        onDismiss={dismissPrompt}
      />
    </View>
  );
}
```

### 3. Add Migration Dashboard to Settings

In `SettingsScreen.tsx`:

```typescript
import { MigrationDashboard } from '../components/MigrationDashboard';

export function SettingsScreen() {
  const { publicKey } = useWallet();
  const userId = publicKey?.toString() || 'guest';

  return (
    <ScrollView>
      {/* Your existing settings */}
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compressed Tokens</Text>
        <MigrationDashboard userId={userId} />
      </View>
    </ScrollView>
  );
}
```

### 4. Integrate with Game Creation Flow

In `CreateGameScreen.tsx`:

```typescript
import { useMigration } from '../hooks/useMigration';
import { useCompressedTokens } from '../hooks/useCompressedTokens';

export function CreateGameScreen() {
  const { publicKey } = useWallet();
  const userId = publicKey?.toString() || 'guest';
  const { isEligible, isAutoCompressionEnabled } = useMigration(userId);
  const { transferCompressed } = useCompressedTokens();

  const handleCreateGame = async (entryFee: number) => {
    try {
      // Use compressed tokens if eligible
      if (isEligible) {
        // Transfer entry fee using compressed tokens
        await transferCompressed(
          GAME_VAULT_ADDRESS,
          BigInt(entryFee * 1e9)
        );
      } else {
        // Fallback to SPL tokens
        await transferSPL(GAME_VAULT_ADDRESS, entryFee);
      }
      
      // Create game
      await createGame(entryFee, gameMode);
    } catch (error) {
      console.error('Game creation failed:', error);
    }
  };

  return (
    <View>
      {/* Show cost savings badge if using compressed tokens */}
      {isEligible && (
        <View style={styles.savingsBadge}>
          <Text>💰 Using Compressed Tokens - 399x Cost Savings!</Text>
        </View>
      )}
      
      {/* Your game creation form */}
    </View>
  );
}
```

### 5. Auto-Compression on Deposit (Phase 3+)

In your deposit/funding flow:

```typescript
import { MigrationService } from '../lib/migration/MigrationService';
import { createLightProtocolService } from '../services/lightProtocol';

async function handleDeposit(amount: bigint) {
  const lightProtocol = createLightProtocolService(RPC_ENDPOINT);
  const migrationService = MigrationService.getInstance(lightProtocol);
  
  // Check if auto-compression is enabled
  if (migrationService.isAutoCompressionEnabled(userId)) {
    try {
      // Automatically compress tokens on deposit
      const signature = await migrationService.autoCompressOnDeposit(
        userId,
        payerKeypair,
        GAME_TOKEN_MINT,
        amount,
        ownerKeypair
      );
      
      console.log('Auto-compressed on deposit:', signature);
    } catch (error) {
      console.error('Auto-compression failed, using SPL:', error);
      // Fallback to SPL tokens
      await depositSPL(amount);
    }
  } else {
    // Use SPL tokens
    await depositSPL(amount);
  }
}
```

## Advanced Integration

### Beta Tester Identification

Mark beta testers to enable Phase 1 features:

```typescript
import { FeatureFlagService } from './lib/migration';

async function identifyBetaTester(userId: string) {
  const featureFlags = FeatureFlagService.getInstance();
  
  // Check if user is in beta tester list
  const isBetaTester = await checkBetaTesterStatus(userId);
  
  if (isBetaTester) {
    featureFlags.markAsBetaTester(userId);
    console.log('User marked as beta tester');
  }
}
```

### Migration Analytics Tracking

Send analytics to your backend:

```typescript
import { MigrationService } from './lib/migration/MigrationService';

async function syncMigrationAnalytics() {
  const migrationService = MigrationService.getInstance(lightProtocol);
  
  // Export all analytics
  const analytics = migrationService.exportAnalytics();
  
  // Send to backend
  await fetch('https://api.magicroulette.com/analytics/migration', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      analytics,
      timestamp: Date.now(),
    }),
  });
}

// Sync analytics periodically
useEffect(() => {
  const interval = setInterval(syncMigrationAnalytics, 60000); // Every minute
  return () => clearInterval(interval);
}, []);
```

### Custom Migration Prompt Trigger

Show migration prompt at strategic moments:

```typescript
import { useMigration } from '../hooks/useMigration';

export function GameLobbyScreen() {
  const { publicKey } = useWallet();
  const userId = publicKey?.toString() || 'guest';
  const { shouldShowPrompt, setShowPrompt } = useMigration(userId);

  // Show prompt after user views 3 games
  const [gamesViewed, setGamesViewed] = useState(0);
  
  useEffect(() => {
    if (gamesViewed >= 3 && shouldShowPrompt) {
      setShowPrompt(true);
    }
  }, [gamesViewed, shouldShowPrompt]);

  return (
    <View>
      {/* Game lobby content */}
    </View>
  );
}
```

### Cost Savings Display

Show real-time cost savings in UI:

```typescript
import { useMigration } from '../hooks/useMigration';

export function WalletBalanceCard() {
  const { publicKey } = useWallet();
  const userId = publicKey?.toString() || 'guest';
  const { getCostSavings, analytics } = useMigration(userId);

  return (
    <View style={styles.card}>
      <Text style={styles.balance}>{balance} SOL</Text>
      
      {analytics && analytics.costSavings > 0 && (
        <View style={styles.savingsBadge}>
          <Text style={styles.savingsText}>
            💰 Saved {(analytics.costSavings / 1e9).toFixed(4)} SOL
          </Text>
          <Text style={styles.savingsSubtext}>
            {getCostSavings(analytics.compressedAccountsCount)}
          </Text>
        </View>
      )}
    </View>
  );
}
```

### Opt-Out Flow

Allow users to opt out in Phase 1-2:

```typescript
import { useMigration } from '../hooks/useMigration';

export function MigrationSettingsCard() {
  const { publicKey } = useWallet();
  const userId = publicKey?.toString() || 'guest';
  const { isEligible, optOut, optIn } = useMigration(userId);
  const [hasOptedOut, setHasOptedOut] = useState(false);

  const handleOptOut = () => {
    Alert.alert(
      'Opt Out of Migration',
      'Are you sure? You will continue using SPL tokens with higher costs.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Opt Out',
          style: 'destructive',
          onPress: () => {
            optOut();
            setHasOptedOut(true);
          },
        },
      ]
    );
  };

  const handleOptIn = () => {
    optIn();
    setHasOptedOut(false);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Compressed Tokens</Text>
      <Text style={styles.description}>
        {isEligible
          ? 'You are using compressed tokens with 399x cost savings'
          : 'You are using traditional SPL tokens'}
      </Text>
      
      {hasOptedOut ? (
        <Button title="Opt Back In" onPress={handleOptIn} />
      ) : (
        <Button title="Opt Out" onPress={handleOptOut} />
      )}
    </View>
  );
}
```

## Testing

### Test Migration Flow

```typescript
import { MigrationService } from './lib/migration/MigrationService';
import { FeatureFlagService, MigrationPhase } from './lib/migration';

// Test Phase 1 (Beta testers only)
const featureFlags = FeatureFlagService.getInstance();
featureFlags.setPhase(MigrationPhase.PHASE_1_PARALLEL);
featureFlags.markAsBetaTester(testUserId);

// Test migration
const migrationService = MigrationService.getInstance(lightProtocol);
const signature = await migrationService.migrateToCompressed(
  testUserId,
  testPayer,
  testMint,
  1000000000n,
  testOwner
);

// Verify progress
const progress = migrationService.getMigrationProgress(testUserId);
expect(progress.percentComplete).toBe(100);

// Verify analytics
const analytics = migrationService.getMigrationAnalytics(testUserId);
expect(analytics.status).toBe(MigrationStatus.COMPLETED);
expect(analytics.costSavings).toBeGreaterThan(0);
```

### Reset for Testing

```typescript
// Reset migration state for testing
migrationService.resetMigration(testUserId);
```

## Monitoring

### Track Migration Metrics

```typescript
import { MigrationService } from './lib/migration/MigrationService';

function MigrationMetricsDisplay() {
  const migrationService = MigrationService.getInstance(lightProtocol);
  const stats = migrationService.getAggregatedStats();

  return (
    <View>
      <Text>Total Users: {stats.totalUsers}</Text>
      <Text>Completed: {stats.completedMigrations}</Text>
      <Text>In Progress: {stats.inProgressMigrations}</Text>
      <Text>Failed: {stats.failedMigrations}</Text>
      <Text>Migration Rate: {stats.migrationRate.toFixed(1)}%</Text>
      <Text>Total Savings: {(stats.totalCostSavings / 1e9).toFixed(4)} SOL</Text>
    </View>
  );
}
```

## Troubleshooting

### Migration Fails

If migration fails, check:

1. User has sufficient balance
2. Wallet is connected
3. RPC endpoint is responsive
4. User is eligible for current phase

```typescript
try {
  await migrate(mint, amount);
} catch (error) {
  if (error.message.includes('not eligible')) {
    Alert.alert('Not Eligible', 'You are not eligible for migration in the current phase');
  } else if (error.message.includes('insufficient balance')) {
    Alert.alert('Insufficient Balance', 'You need more tokens to migrate');
  } else {
    Alert.alert('Migration Failed', error.message);
  }
}
```

### Prompt Not Showing

If migration prompt doesn't show:

1. Check if user is eligible
2. Verify current phase allows prompts
3. Check if user has dismissed prompts

```typescript
const { shouldShowPrompt, isEligible } = useMigration(userId);

console.log('Should show prompt:', shouldShowPrompt);
console.log('Is eligible:', isEligible);
console.log('Current phase:', featureFlags.getPhase());
```

## Best Practices

1. **Always check eligibility** before attempting migration
2. **Show cost savings** prominently to encourage adoption
3. **Handle errors gracefully** with fallback to SPL tokens
4. **Track analytics** for monitoring and optimization
5. **Test thoroughly** in each migration phase
6. **Provide clear feedback** during migration process
7. **Allow opt-out** in early phases (1-2)
8. **Monitor performance** and adjust rollout as needed

## Phase Transition Checklist

When transitioning between phases:

- [ ] Update phase in FeatureFlagService
- [ ] Test migration flow with new phase settings
- [ ] Update UI prompts and messaging
- [ ] Monitor analytics for issues
- [ ] Communicate changes to users
- [ ] Prepare rollback plan if needed
- [ ] Update documentation

## Support

For issues or questions:
- Check the [README.md](./README.md) for detailed API documentation
- Review error logs in MigrationAnalytics
- Contact the development team
