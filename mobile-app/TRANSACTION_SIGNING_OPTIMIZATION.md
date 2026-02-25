# Transaction Signing Performance Optimization

## Overview

This document describes the transaction signing performance optimizations implemented for Magic Roulette mobile app, targeting sub-200ms signing time on Seeker hardware.

**Validates: Requirements 4.10**

## Implementation Summary

### 1. Transaction Signing Optimizer Service

**File**: `src/services/transactionSigningOptimizer.ts`

A comprehensive service that provides:

#### Transaction Size Optimization
- **Deduplicates instructions**: Removes duplicate transaction instructions
- **Deduplicates account keys**: Optimizes account key usage
- **Optimizes compute budget**: Removes redundant compute budget instructions
- **Versioned transactions**: Converts to versioned transactions when beneficial (>20 unique accounts)
- **Metrics tracking**: Reports original size, optimized size, savings percentage

#### Parallel Transaction Preparation
- **Shared blockhash fetching**: Fetches blockhash once for all transactions
- **Concurrent optimization**: Optimizes multiple transactions in parallel
- **Parallelization metrics**: Tracks time saved vs sequential preparation

#### Signing Performance Tracking
- **Duration measurement**: Tracks signing time for each transaction
- **Target compliance**: Monitors <200ms target compliance
- **Detailed metrics**: Collects transaction size, instruction count, signature count
- **Device-specific tracking**: Differentiates between Seeker and other devices

#### Seeker Hardware Optimizations
- **Compute budget optimization**: Adds optimal compute budget for Seeker
- **Hardware acceleration hints**: Prepares transactions for Seeker's crypto acceleration
- **Memory-efficient serialization**: Minimizes memory allocations

### 2. WalletContext Integration

**File**: `src/contexts/WalletContext.tsx`

Integrated the optimizer into the wallet context:

- **Automatic optimization**: All transactions are automatically optimized before signing
- **Performance tracking**: Every transaction signing is tracked
- **Parallel preparation**: Multiple transactions are prepared in parallel
- **Seeker detection**: Automatically detects Seeker devices and applies optimizations
- **Performance logging**: Logs optimization and performance metrics to console

### 3. Performance Monitoring Hook

**File**: `src/hooks/useTransactionSigningPerformance.ts`

Provides React hooks for accessing performance metrics:

- `useTransactionSigningPerformance()`: Get overall signing performance stats
- `useTransactionMetrics(transactionId)`: Get metrics for specific transaction

### 4. Performance Dashboard Component

**File**: `src/components/TransactionPerformanceDashboard.tsx`

Visual dashboard for monitoring transaction signing performance:

- **Total transactions**: Count of signed transactions
- **Average signing time**: Mean signing duration with target indicator
- **Target compliance**: Percentage of transactions meeting <200ms target
- **Device type**: Shows if running on Seeker or other device
- **Status banner**: Visual indicator of overall performance compliance

### 5. Unit Tests

**File**: `src/services/__tests__/transactionSigningOptimizer.test.ts`

Comprehensive test suite covering:

- Transaction size optimization
- Duplicate instruction removal
- Compute budget optimization
- Parallel transaction preparation
- Signing performance tracking
- Seeker-specific optimizations
- Metrics collection and export

## Performance Targets

### Primary Target
- **Signing time**: <200ms on Seeker hardware
- **Compliance rate**: >95% of transactions meet target

### Optimization Goals
- **Transaction size reduction**: 10-30% smaller transactions
- **Parallel preparation gain**: 20-50% faster for batched transactions
- **Instruction deduplication**: Remove 100% of duplicate instructions

## Usage Examples

### Basic Transaction Signing (Automatic)

```typescript
const { signAndSendTransaction } = useWallet();

// Transaction is automatically optimized and tracked
const signature = await signAndSendTransaction(transaction);
```

### Batch Transaction Signing

```typescript
const { signAllTransactions } = useWallet();

// Transactions are prepared in parallel and optimized
const signedTxs = await signAllTransactions([tx1, tx2, tx3]);
```

### Monitoring Performance

```typescript
import { TransactionPerformanceDashboard } from '../components/TransactionPerformanceDashboard';

function SettingsScreen() {
  return (
    <View>
      <TransactionPerformanceDashboard />
    </View>
  );
}
```

### Manual Optimization

```typescript
import { createTransactionSigningOptimizer } from '../services/transactionSigningOptimizer';

const optimizer = createTransactionSigningOptimizer(connection, isSeeker);

// Optimize transaction size
const result = await optimizer.optimizeTransactionSize(transaction);
console.log(`Saved ${result.savingsPercent}% (${result.savingsBytes} bytes)`);

// Prepare multiple transactions in parallel
const prepared = await optimizer.prepareTransactionsParallel(
  [tx1, tx2, tx3],
  feePayer
);
console.log(`Parallelization saved ${prepared.parallelizationGain}ms`);

// Track signing performance
const { signedTransaction, metrics } = await optimizer.trackSigningPerformance(
  'tx-id',
  transaction,
  async () => await wallet.signTransaction(transaction)
);
console.log(`Signing took ${metrics.duration}ms (target: <200ms)`);
```

## Metrics Export

The optimizer can export metrics for analytics:

```typescript
const optimizer = createTransactionSigningOptimizer(connection, isSeeker);

// ... perform transactions ...

// Export metrics as JSON
const metricsJson = optimizer.exportMetrics();

// Send to analytics service
await fetch('/api/analytics/transaction-performance', {
  method: 'POST',
  body: metricsJson,
});
```

## Performance Monitoring

### Console Logging

The WalletContext automatically logs performance metrics:

```
Transaction optimization: {
  originalSize: 350,
  optimizedSize: 280,
  savings: "20.0%",
  optimizations: ["deduplicate_instructions", "optimize_compute_budget"]
}

Transaction signing performance: {
  transactionId: "tx_1234567890_abc123",
  duration: "145.23ms",
  meetsTarget: true,
  transactionSize: "280 bytes",
  deviceType: "seeker"
}
```

### Metrics API

```typescript
// Get all metrics
const allMetrics = optimizer.getMetrics();

// Get specific transaction metrics
const txMetrics = optimizer.getMetrics('tx-id');

// Get average signing time
const avgTime = optimizer.getAverageSigningTime();

// Get target compliance rate
const complianceRate = optimizer.getTargetComplianceRate();
```

## Seeker-Specific Optimizations

When running on Seeker devices:

1. **Compute budget optimization**: Adds conservative compute unit limits (200,000 units)
2. **Hardware acceleration**: Prepares transactions for Seeker's crypto acceleration
3. **Memory efficiency**: Minimizes memory allocations for better performance
4. **Performance tracking**: Separately tracks Seeker vs other device performance

## Future Enhancements

Potential improvements for future iterations:

1. **Address Lookup Tables (ALTs)**: Implement ALT support for transactions with many accounts
2. **Transaction compression**: Explore additional compression techniques
3. **Adaptive optimization**: Adjust optimization strategies based on historical performance
4. **Predictive optimization**: Pre-optimize transactions before user action
5. **Network-aware optimization**: Adjust strategies based on network conditions

## Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run optimizer tests only
npm test transactionSigningOptimizer.test.ts

# Run with coverage
npm test -- --coverage
```

## Troubleshooting

### Signing time exceeds 200ms

Check console logs for:
- Transaction size (should be <500 bytes)
- Instruction count (should be <10)
- Network latency (should be <100ms)
- Device type (Seeker should be faster)

### Optimization not applied

Verify:
- WalletContext is properly initialized
- Seeker detection is working (`isSeekerDevice()`)
- Connection is established
- Transactions are legacy format (versioned transactions have limited optimization)

### Metrics not collected

Ensure:
- Transactions are going through WalletContext
- `trackSigningPerformance` is being called
- Metrics are not cleared prematurely

## References

- **Requirements**: Section 4.10 - Transaction signing performance
- **Design**: Mobile Wallet Adapter Integration and Optimization
- **Target**: <200ms signing time on Seeker hardware
