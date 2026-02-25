# Transaction Batching - Quick Start

## What is Transaction Batching?

Transaction batching combines multiple related operations into a single transaction, requiring only **one wallet approval** instead of multiple popups.

## Quick Example

### Before (Without Batching)
```typescript
// ❌ Two wallet popups
await depositEntryFee(0.1);  // Popup 1
await createGame('OneVsOne', 0.1);  // Popup 2
```

### After (With Batching)
```typescript
// ✅ One wallet popup
const { batchCreateGame } = useTransactionBatching();
await batchCreateGame('OneVsOne', 0.1);  // Single popup!
```

## Usage

### 1. Import the Hook

```typescript
import { useTransactionBatching } from '../hooks/useTransactionBatching';
```

### 2. Use in Your Component

```typescript
function CreateGameScreen() {
  const { batchCreateGame, executing, error } = useTransactionBatching();

  const handleCreate = async () => {
    const signature = await batchCreateGame(
      'OneVsOne',  // Game mode
      0.1,         // Entry fee
      true         // Use compressed tokens
    );

    if (signature) {
      console.log('Success!', signature);
    }
  };

  return (
    <Button onPress={handleCreate} disabled={executing}>
      {executing ? 'Creating...' : 'Create Game'}
    </Button>
  );
}
```

## Available Methods

### batchCreateGame()
Combines entry fee deposit + game creation
```typescript
const signature = await batchCreateGame(
  gameMode: 'OneVsOne' | 'TwoVsTwo',
  entryFeeSol: number,
  useCompressed?: boolean
);
```

### batchClaimWinnings()
Combines winnings claim + withdrawal
```typescript
const signature = await batchClaimWinnings(
  gameId: number,
  withdrawAmount?: number,
  useCompressed?: boolean
);
```

## Benefits

✅ **Better UX** - One popup instead of multiple  
✅ **Faster** - One transaction instead of multiple  
✅ **Cheaper** - One transaction fee instead of multiple  
✅ **Simpler** - Less code to write

## Example Component

See `src/components/game/BatchedGameCreation.tsx` for a complete example.

## Full Documentation

See [TRANSACTION_BATCHING_GUIDE.md](./TRANSACTION_BATCHING_GUIDE.md) for complete documentation.

## Task Status

✅ **Task 7.7 Complete** - Transaction batching implemented and ready to use!
