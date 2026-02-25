# Transaction Batching Guide

## Overview

Transaction batching is a key optimization technique that combines multiple related operations into a single transaction, minimizing wallet popup interruptions and improving user experience.

**Benefits:**
- ✅ Single wallet approval instead of multiple popups
- ✅ Faster execution (one transaction vs multiple)
- ✅ Lower total fees (one transaction fee)
- ✅ Better UX (less interruption during gameplay)

## Implementation Status

✅ **Task 7.7 Complete**: Transaction batching infrastructure implemented

### What's Implemented

1. **TransactionBatchingService** (`src/services/transactionBatching.ts`)
   - Core batching logic
   - Entry fee deposit + game creation batching
   - Winnings claim + withdrawal batching
   - Generic instruction batching
   - Transaction optimization utilities

2. **useTransactionBatching Hook** (`src/hooks/useTransactionBatching.ts`)
   - React hook for easy batching
   - `batchCreateGame()` - Batch deposit + creation
   - `batchClaimWinnings()` - Batch claim + withdrawal
   - `executeBatch()` - Generic batch execution

3. **Example Component** (`src/components/game/BatchedGameCreation.tsx`)
   - Demonstrates batching usage
   - Shows UX benefits
   - Comparison with non-batched approach

## Usage Examples

### 1. Batch Game Creation with Entry Fee Deposit

```typescript
import { useTransactionBatching } from '../hooks/useTransactionBatching';

function CreateGameScreen() {
  const { batchCreateGame, executing, error } = useTransactionBatching();

  const handleCreate = async () => {
    // Single wallet approval for both deposit and creation
    const signature = await batchCreateGame(
      'OneVsOne',  // Game mode
      0.1,         // Entry fee in SOL
      true         // Use compressed tokens
    );

    if (signature) {
      console.log('Game created:', signature);
      // Navigate to game lobby
    }
  };

  return (
    <Button onPress={handleCreate} disabled={executing}>
      {executing ? 'Creating...' : 'Create Game (1 Approval)'}
    </Button>
  );
}
```

**Without Batching:**
```
❌ User Action 1: Approve entry fee deposit
❌ User Action 2: Approve game creation
= 2 wallet popups, 2 transaction fees
```

**With Batching:**
```
✅ User Action: Approve deposit + creation
= 1 wallet popup, 1 transaction fee
```

### 2. Batch Winnings Claim with Withdrawal

```typescript
import { useTransactionBatching } from '../hooks/useTransactionBatching';

function WinningsScreen({ gameId }: { gameId: number }) {
  const { batchClaimWinnings, executing, error } = useTransactionBatching();

  const handleClaim = async () => {
    // Single wallet approval for both claim and withdrawal
    const signature = await batchClaimWinnings(
      gameId,      // Game ID
      1.5,         // Withdraw amount (optional)
      true         // Use compressed tokens
    );

    if (signature) {
      console.log('Winnings claimed:', signature);
      // Show success message
    }
  };

  return (
    <Button onPress={handleClaim} disabled={executing}>
      {executing ? 'Claiming...' : 'Claim Winnings (1 Approval)'}
    </Button>
  );
}
```

### 3. Advanced: Custom Batch Operations

```typescript
import { useTransactionBatching } from '../hooks/useTransactionBatching';
import { AnchorProvider } from '@coral-xyz/anchor';
import { connection } from '../services/solana';

function AdvancedBatchingExample() {
  const { batchingService, executeBatch } = useTransactionBatching();
  const { publicKey, signAllTransactions } = useWallet();

  const handleCustomBatch = async () => {
    // Create provider
    const provider = new AnchorProvider(
      connection,
      { publicKey, signAllTransactions, signTransaction: async (tx) => tx } as any,
      { commitment: 'confirmed' }
    );

    // Create custom instructions
    const instructions = [
      // Your custom instructions here
    ];

    // Batch instructions
    const batchedTx = await batchingService.batchInstructions(
      provider,
      instructions,
      'Custom batch operation'
    );

    // Execute batch
    const result = await executeBatch([batchedTx]);

    if (result?.success) {
      console.log('Batch executed:', result.signatures);
    }
  };

  return (
    <Button onPress={handleCustomBatch}>
      Execute Custom Batch
    </Button>
  );
}
```

## Architecture

### TransactionBatchingService

The core service provides:

1. **batchCreateGameWithDeposit()**
   - Combines entry fee deposit + game creation
   - Optimizes compute units
   - Estimates transaction cost
   - Returns batched transaction

2. **batchClaimAndWithdraw()**
   - Combines winnings claim + withdrawal
   - Supports compressed tokens
   - Handles finalization logic
   - Returns batched transaction

3. **batchInstructions()**
   - Generic batching utility
   - Accepts any transaction instructions
   - Adds compute budget optimization
   - Adds priority fees

4. **executeBatch()**
   - Executes batched transactions
   - Uses wallet's signAllTransactions
   - Sends and confirms transactions
   - Returns batch result

5. **optimizeTransaction()**
   - Removes duplicate instructions
   - Combines similar operations
   - Reduces transaction size

6. **canBatch()**
   - Validates batching safety
   - Checks instruction count limits
   - Detects conflicting writes

### Integration with Mobile Wallet Adapter

Transaction batching leverages the Mobile Wallet Adapter's `signAllTransactions` method:

```typescript
// WalletContext provides signAllTransactions
const { signAllTransactions } = useWallet();

// Batching service uses it to sign multiple transactions at once
const signedTxs = await signAllTransactions([tx1, tx2, tx3]);

// Result: Single wallet popup for all transactions
```

## Performance Optimization

### Compute Budget Optimization

Batched transactions automatically include compute budget instructions:

```typescript
// Automatically added to batched transactions
ComputeBudgetProgram.setComputeUnitLimit({
  units: 400_000, // Scaled based on instruction count
});

ComputeBudgetProgram.setComputeUnitPrice({
  microLamports: 1, // Minimal priority fee
});
```

### Transaction Size Limits

- Maximum 10 instructions per batch (safety limit)
- Compute units scaled with instruction count
- Automatic validation before batching

### Cost Estimation

```typescript
const batchedTx = await batchingService.batchCreateGameWithDeposit(...);

console.log('Estimated cost:', batchedTx.estimatedCost, 'lamports');
// Typical: 5,000 lamports (base fee) + priority fee
```

## Error Handling

### Batch Execution Errors

```typescript
const result = await executeBatch([batchedTx]);

if (!result.success) {
  console.error('Batch failed:', result.errors);
  // Handle errors:
  // - Transaction simulation failed
  // - Insufficient funds
  // - User rejected
  // - Network error
}
```

### Individual Transaction Errors

```typescript
const result = await executeBatch([tx1, tx2, tx3]);

// result.signatures contains successful transactions
// result.errors contains failed transaction details

if (result.signatures.length < 3) {
  console.log('Some transactions failed');
  console.log('Successful:', result.signatures);
  console.log('Errors:', result.errors);
}
```

## Testing

### Unit Tests

```typescript
// Test batching service
describe('TransactionBatchingService', () => {
  it('should batch create game with deposit', async () => {
    const batchedTx = await service.batchCreateGameWithDeposit(
      provider,
      'OneVsOne',
      0.1,
      true
    );

    expect(batchedTx.transaction).toBeDefined();
    expect(batchedTx.description).toContain('Create');
    expect(batchedTx.estimatedCost).toBeGreaterThan(0);
  });

  it('should batch claim and withdraw', async () => {
    const batchedTx = await service.batchClaimAndWithdraw(
      provider,
      gameId,
      1.5,
      true
    );

    expect(batchedTx.transaction).toBeDefined();
    expect(batchedTx.description).toContain('Claim');
  });
});
```

### Integration Tests

```typescript
// Test end-to-end batching
describe('Transaction Batching Integration', () => {
  it('should create game with single approval', async () => {
    const { batchCreateGame } = useTransactionBatching();

    const signature = await batchCreateGame('OneVsOne', 0.1, true);

    expect(signature).toBeDefined();
    // Verify game was created
    // Verify entry fee was deposited
  });
});
```

## Best Practices

### 1. Always Use Batching for Related Operations

❌ **Bad:**
```typescript
// Two separate transactions = two wallet popups
await depositEntryFee(0.1);
await createGame('OneVsOne', 0.1);
```

✅ **Good:**
```typescript
// Single batched transaction = one wallet popup
await batchCreateGame('OneVsOne', 0.1);
```

### 2. Provide Clear Transaction Descriptions

```typescript
const batchedTx = await batchingService.batchInstructions(
  provider,
  instructions,
  'Deposit 0.1 SOL and create 1v1 game' // Clear description
);
```

### 3. Handle Errors Gracefully

```typescript
const signature = await batchCreateGame('OneVsOne', 0.1);

if (!signature) {
  // Show user-friendly error message
  Alert.alert(
    'Transaction Failed',
    'Failed to create game. Please try again.',
    [{ text: 'OK' }]
  );
}
```

### 4. Show Loading States

```typescript
const { batchCreateGame, executing } = useTransactionBatching();

return (
  <Button disabled={executing}>
    {executing ? 'Creating...' : 'Create Game'}
  </Button>
);
```

### 5. Estimate Costs Before Execution

```typescript
const batchedTx = await batchingService.batchCreateGameWithDeposit(...);

console.log(`This will cost approximately ${batchedTx.estimatedCost} lamports`);

// Show cost to user before execution
Alert.alert(
  'Confirm Transaction',
  `Estimated cost: ${batchedTx.estimatedCost / 1e9} SOL`,
  [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Confirm', onPress: () => executeBatch([batchedTx]) }
  ]
);
```

## Future Enhancements

### Compressed Token Integration

Once Light Protocol integration is complete, batching will support:

```typescript
// Batch compressed token operations
await batchCreateGame(
  'OneVsOne',
  0.1,
  true // Use compressed tokens (1000x cost savings)
);

// Batch compressed token claim + withdrawal
await batchClaimWinnings(
  gameId,
  1.5,
  true // Use compressed tokens
);
```

### Automatic Batching Detection

Future enhancement: Automatically detect related operations and suggest batching:

```typescript
// System detects: deposit + create happening in sequence
// Automatically suggests: "Batch these operations?"
```

### Transaction Simulation

Preview transaction results before execution:

```typescript
const simulation = await batchingService.simulateBatch([batchedTx]);

console.log('Simulation result:', simulation);
// Show user what will happen before they approve
```

## Troubleshooting

### Issue: "Too many instructions to batch safely"

**Solution:** Split into multiple batches or reduce instruction count.

```typescript
// Check if transactions can be batched
if (!batchingService.canBatch([tx1, tx2, tx3])) {
  // Split into smaller batches
  await executeBatch([tx1, tx2]);
  await executeBatch([tx3]);
}
```

### Issue: "Transaction simulation failed"

**Solution:** Check account balances and instruction validity.

```typescript
// Verify sufficient balance before batching
const balance = await connection.getBalance(publicKey);
if (balance < estimatedCost) {
  throw new Error('Insufficient balance');
}
```

### Issue: "User rejected transaction"

**Solution:** Provide clear transaction description and cost estimate.

```typescript
// Show clear description in wallet popup
const batchedTx = await batchingService.batchInstructions(
  provider,
  instructions,
  'Deposit 0.1 SOL and create game' // User sees this in wallet
);
```

## Related Documentation

- [Mobile Wallet Adapter Integration](./TASK_7.1_IMPLEMENTATION_SUMMARY.md)
- [Gasless Gameplay Guide](./GASLESS_GAMEPLAY_GUIDE.md)
- [Compressed Tokens Integration](./COMPRESSED_TOKENS_INTEGRATION.md)

## Support

For questions or issues with transaction batching:
1. Check this guide first
2. Review example component: `src/components/game/BatchedGameCreation.tsx`
3. Check service implementation: `src/services/transactionBatching.ts`
4. Open an issue on GitHub

## Summary

Transaction batching is a critical optimization for mobile gaming UX. By combining related operations into single transactions, we minimize wallet popup interruptions and provide a seamless gameplay experience.

**Key Takeaways:**
- ✅ Always batch related operations
- ✅ Use `useTransactionBatching` hook for easy integration
- ✅ Provide clear transaction descriptions
- ✅ Handle errors gracefully
- ✅ Show loading states during execution

**Implementation Status:** ✅ Complete (Task 7.7)
