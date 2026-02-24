# SPL to Compressed Token Migration System

This module implements a phase-based migration system for transitioning users from traditional SPL tokens to Light Protocol's compressed tokens, achieving 399x cost savings per account.

## Overview

The migration system consists of three main components:

1. **FeatureFlagService**: Manages feature flags and migration phases
2. **MigrationService**: Handles token compression, progress tracking, and analytics
3. **UI Components**: User-facing prompts and dashboards

## Migration Phases

### Phase 1: Parallel Support (Weeks 1-2)
- **Description**: Support both SPL and compressed tokens
- **Rollout**: Beta testers only
- **Features**: Opt-in compressed tokens
- **Opt-out**: Allowed

### Phase 2: Gradual Migration (Weeks 3-4)
- **Description**: Encourage compressed token adoption
- **Rollout**: All users
- **Features**: UI prompts, cost savings display
- **Opt-out**: Allowed

### Phase 3: Full Migration (Weeks 5-6)
- **Description**: Default to compressed tokens
- **Rollout**: All new users, existing users migrated
- **Features**: Automatic compression on deposit
- **Opt-out**: Not allowed

### Phase 4: SPL Deprecation (Week 7+)
- **Description**: Compressed tokens only
- **Rollout**: All users
- **Features**: SPL token support removed
- **Opt-out**: Not allowed

## Cost Savings

- **SPL Token Account**: ~2,000,000 lamports (~$0.20)
- **Compressed Account**: ~5,000 lamports (~$0.0005)
- **Savings per Account**: ~1,995,000 lamports (399x)
- **Overall Savings**: 1000x average across all operations

## Usage

### Initialize Services

```typescript
import { FeatureFlagService, MigrationService, MigrationPhase } from './lib/migration';
import { createLightProtocolService } from './services/lightProtocol';

// Initialize Light Protocol
const lightProtocol = createLightProtocolService(rpcEndpoint);

// Get service instances
const featureFlags = FeatureFlagService.getInstance();
const migrationService = MigrationService.getInstance(lightProtocol);

// Set migration phase
featureFlags.setPhase(MigrationPhase.PHASE_2_GRADUAL);
```

### Check Eligibility

```typescript
const userId = 'user123';
const isEligible = migrationService.isEligibleForMigration(userId);

if (isEligible) {
  console.log('User can migrate to compressed tokens');
}
```

### Migrate Tokens

```typescript
const signature = await migrationService.migrateToCompressed(
  userId,
  payerKeypair,
  mintPubkey,
  1000000000n, // 1 token with 9 decimals
  ownerKeypair
);

console.log('Migration successful:', signature);
```

### Track Progress

```typescript
const progress = migrationService.getMigrationProgress(userId);

console.log(`Migration ${progress.percentComplete}% complete`);
console.log(`Estimated savings: ${progress.estimatedCostSavings} lamports`);
```

### Get Analytics

```typescript
const analytics = migrationService.getMigrationAnalytics(userId);

console.log(`Migrated ${analytics.compressedAccountsCount} accounts`);
console.log(`Total savings: ${analytics.costSavings} lamports`);
```

### Enable Auto-Compression

```typescript
// Enable auto-compression for new deposits
featureFlags.enableAutoCompression(userId);

// Check if enabled
const isEnabled = migrationService.isAutoCompressionEnabled(userId);
```

### Opt Out/In

```typescript
// Opt out of migration (Phase 1-2 only)
featureFlags.optOut(userId);

// Opt back in
featureFlags.optIn(userId);
```

## React Hooks

### useMigration Hook

```typescript
import { useMigration } from './hooks/useMigration';

function MyComponent() {
  const {
    isEligible,
    progress,
    analytics,
    migrate,
    enableAutoCompression,
    getCostSavings,
  } = useMigration(userId);

  return (
    <View>
      <Text>Eligible: {isEligible ? 'Yes' : 'No'}</Text>
      <Text>Progress: {progress?.percentComplete}%</Text>
      <Text>Savings: {getCostSavings(1)}</Text>
      <Button onPress={() => migrate(mint, amount)}>
        Migrate Now
      </Button>
    </View>
  );
}
```

## UI Components

### MigrationPrompt

Modal prompt encouraging users to migrate with cost savings display:

```typescript
import { MigrationPrompt } from './components/MigrationPrompt';

<MigrationPrompt
  visible={showPrompt}
  userId={userId}
  onClose={() => setShowPrompt(false)}
  onMigrate={handleMigrate}
  onDismiss={handleDismiss}
/>
```

### MigrationDashboard

Dashboard displaying migration progress and analytics:

```typescript
import { MigrationDashboard } from './components/MigrationDashboard';

<MigrationDashboard userId={userId} />
```

## Analytics

The migration system tracks comprehensive analytics:

- **User-level**: Progress, status, cost savings
- **Platform-level**: Total migrations, success rate, aggregate savings

### Export Analytics

```typescript
const allAnalytics = migrationService.exportAnalytics();

// Send to analytics service
await fetch('/api/analytics', {
  method: 'POST',
  body: JSON.stringify(allAnalytics),
});
```

### Aggregated Statistics

```typescript
const stats = migrationService.getAggregatedStats();

console.log(`Total users: ${stats.totalUsers}`);
console.log(`Completed: ${stats.completedMigrations}`);
console.log(`Migration rate: ${stats.migrationRate}%`);
console.log(`Total savings: ${stats.totalCostSavings} lamports`);
```

## Feature Flags

### Available Flags

- `COMPRESSED_TOKENS`: Enable compressed token support
- `AUTO_COMPRESSION`: Enable automatic compression on deposit
- `MIGRATION_PROMPTS`: Show migration prompts to users

### Check Feature Status

```typescript
import { FeatureFlag } from './lib/migration';

const isEnabled = featureFlags.isFeatureEnabled(
  FeatureFlag.COMPRESSED_TOKENS,
  userId
);
```

## Error Handling

The migration system includes comprehensive error handling:

```typescript
try {
  await migrationService.migrateToCompressed(/* ... */);
} catch (error) {
  // Error is logged and tracked in analytics
  console.error('Migration failed:', error.message);
  
  // Check analytics for error details
  const analytics = migrationService.getMigrationAnalytics(userId);
  console.log('Error:', analytics.errorMessage);
}
```

## Testing

### Reset Migration (for testing)

```typescript
migrationService.resetMigration(userId);
```

### Mark as Beta Tester

```typescript
featureFlags.markAsBetaTester(userId);
```

## Integration with Game Flow

### On Deposit (Phase 3+)

```typescript
// Automatically compress tokens on deposit
if (migrationService.isAutoCompressionEnabled(userId)) {
  const signature = await migrationService.autoCompressOnDeposit(
    userId,
    payerKeypair,
    mintPubkey,
    depositAmount,
    ownerKeypair
  );
}
```

### On Game Creation

```typescript
// Use compressed tokens for entry fees
const entryFee = 1000000000n; // 1 SOL

if (featureFlags.isFeatureEnabled(FeatureFlag.COMPRESSED_TOKENS, userId)) {
  // Use compressed token transfer
  await lightProtocol.transferCompressed(/* ... */);
} else {
  // Fallback to SPL tokens
  await splTokenTransfer(/* ... */);
}
```

## Monitoring

The migration system provides real-time monitoring:

- Migration progress per user
- Success/failure rates
- Cost savings metrics
- Phase rollout status

## Security Considerations

- All migrations are user-initiated (except Phase 3+ auto-compression)
- Opt-out available in Phase 1-2
- Balance verification before and after migration
- Comprehensive error logging without sensitive data
- Rollback mechanism for critical issues

## Performance

- Migration operations complete in <1 second
- Progress tracking with minimal overhead
- Efficient analytics aggregation
- Lazy loading of migration prompts

## Future Enhancements

- Batch migration for multiple accounts
- Scheduled migrations during off-peak hours
- Migration incentives (rewards for early adopters)
- Advanced analytics dashboard
- A/B testing for migration prompts
