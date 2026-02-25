# Gasless Gameplay Quick Start Guide

## What is Gasless Gameplay?

Gasless gameplay allows players to take shots in Magic Roulette without:
- ❌ Paying gas fees
- ❌ Approving transactions
- ❌ Seeing wallet popups

Instead, shots execute instantly on Ephemeral Rollups with sub-10ms latency!

## How It Works

1. **Game Delegation**: Game is delegated to Ephemeral Rollup
2. **Session Pre-Authorization**: Wallet pre-authorizes game session (one-time)
3. **Zero-Gas Execution**: Shots execute on ER without gas or popups
4. **State Commitment**: Final state committed to base layer when game ends

## Quick Integration

### Step 1: Import Hooks

```typescript
import { useGaslessGame } from '../hooks/useGaslessGame';
import { useWallet } from '../contexts/WalletContext';
import { useProgram } from '../hooks/useProgram';
```

### Step 2: Initialize in Component

```typescript
const { provider } = useProgram();
const gaslessGame = useGaslessGame(provider);
const wallet = useWallet();

useEffect(() => {
  if (gameStarted && wallet.connected) {
    gaslessGame.initializeGaslessGame(gameId, 6);
  }
}, [gameStarted, wallet.connected]);
```

### Step 3: Execute Gasless Shots

```typescript
const handleShot = async () => {
  if (gaslessGame.isReady) {
    const result = await gaslessGame.executeShot(gameId);
    console.log(`Shot executed in ${result.latency}ms`);
  }
};
```

### Step 4: Finish Game

```typescript
useEffect(() => {
  if (gameFinished && gaslessGame.isReady) {
    gaslessGame.finishGame(gameId);
  }
}, [gameFinished]);
```

## API Reference

### `useGaslessGame(provider)`

Returns:
- `isReady: boolean` - Gasless mode is active
- `isLoading: boolean` - Operation in progress
- `error: string | null` - Error message if any
- `lastShotResult: GaslessShotResult | null` - Last shot result
- `averageLatency: number | null` - Average shot latency
- `initializeGaslessGame(gameId, maxShots)` - Initialize gasless mode
- `executeShot(gameId)` - Execute gasless shot
- `finishGame(gameId)` - Finish and commit game
- `checkReadiness(gameId)` - Check if ready
- `resetState()` - Reset state

### `useWallet()`

Gasless-related methods:
- `gameSession: GameSessionAuth | null` - Current game session
- `preAuthorizeGameSession(gameId, maxShots)` - Pre-authorize session
- `executeShotGasless(gameId)` - Validate and track shot
- `clearGameSession()` - Clear session

## Example: Complete Integration

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { useGaslessGame } from '../hooks/useGaslessGame';
import { useWallet } from '../contexts/WalletContext';
import { useProgram } from '../hooks/useProgram';

export function GameScreen({ gameId }) {
  const { provider } = useProgram();
  const gaslessGame = useGaslessGame(provider);
  const wallet = useWallet();
  const [gameFinished, setGameFinished] = useState(false);

  // Initialize gasless gameplay
  useEffect(() => {
    const init = async () => {
      if (wallet.connected && !gaslessGame.isReady) {
        try {
          await gaslessGame.initializeGaslessGame(gameId, 6);
          console.log('✅ Gasless mode activated!');
        } catch (error) {
          console.error('Failed to initialize gasless:', error);
        }
      }
    };
    init();
  }, [wallet.connected, gameId]);

  // Finish game when done
  useEffect(() => {
    if (gameFinished && gaslessGame.isReady) {
      gaslessGame.finishGame(gameId).then(() => {
        console.log('✅ Game committed to base layer');
      });
    }
  }, [gameFinished]);

  const handleShot = async () => {
    try {
      const result = await gaslessGame.executeShot(gameId);
      
      console.log(`Shot: Chamber ${result.chamber}`);
      console.log(`Result: ${result.isBullet ? 'Bullet!' : 'Safe'}`);
      console.log(`Latency: ${result.latency}ms`);
      
      if (result.gameOver) {
        setGameFinished(true);
      }
    } catch (error) {
      console.error('Shot failed:', error);
    }
  };

  return (
    <View>
      {/* Gasless Status */}
      {gaslessGame.isReady && (
        <View style={{ backgroundColor: '#14F195', padding: 10 }}>
          <Text>⚡ Gasless Mode Active</Text>
          {gaslessGame.averageLatency && (
            <Text>Avg: {gaslessGame.averageLatency.toFixed(1)}ms</Text>
          )}
        </View>
      )}

      {/* Initializing */}
      {gaslessGame.isLoading && (
        <Text>Initializing gasless gameplay...</Text>
      )}

      {/* Error */}
      {gaslessGame.error && (
        <Text style={{ color: 'red' }}>{gaslessGame.error}</Text>
      )}

      {/* Shoot Button */}
      <Button
        title="Take Shot (Zero Gas)"
        onPress={handleShot}
        disabled={!gaslessGame.isReady || gaslessGame.isLoading}
      />

      {/* Last Shot Result */}
      {gaslessGame.lastShotResult && (
        <View>
          <Text>Chamber: {gaslessGame.lastShotResult.chamber}</Text>
          <Text>
            Result: {gaslessGame.lastShotResult.isBullet ? '💥' : '✅'}
          </Text>
          <Text>Latency: {gaslessGame.lastShotResult.latency}ms</Text>
        </View>
      )}
    </View>
  );
}
```

## Performance Tracking

```typescript
import { useGaslessPerformance } from '../hooks/useGaslessGame';

const performance = useGaslessPerformance();

// Record shot
performance.recordShot(latency, success);

// Get metrics
console.log('Total Shots:', performance.metrics.totalShots);
console.log('Avg Latency:', performance.metrics.averageLatency);
console.log('Success Rate:', performance.metrics.successRate);

// Reset
performance.resetMetrics();
```

## Troubleshooting

### "Game not delegated to ER"
- Gasless initialization failed
- Check ER service is running
- Verify game status is "InProgress"

### "Session expired"
- Game session expired (30 min timeout)
- Call `initializeGaslessGame()` again

### "Max shots reached"
- Shot limit reached (default 6)
- Increase `maxShots` parameter

### High latency (>10ms)
- Check network connection
- Verify ER service health
- Review console logs for errors

## Best Practices

1. **Initialize Early**: Initialize gasless mode as soon as game starts
2. **Check Readiness**: Always check `isReady` before executing shots
3. **Handle Errors**: Provide fallback to regular gameplay
4. **Track Performance**: Monitor latency in development
5. **Clean Up**: Always call `finishGame()` when game ends

## Testing

```bash
# Start dev server with logging
npm run start:dev

# Look for these console messages:
# ✅ "Gasless gameplay initialized"
# ✅ "Gasless shot executed in Xms"
# ✅ "Game committed to base layer"
```

## Resources

- Full Documentation: `GASLESS_GAMEPLAY_IMPLEMENTATION.md`
- WalletContext: `src/contexts/WalletContext.tsx`
- Gasless Service: `src/services/gaslessGame.ts`
- React Hooks: `src/hooks/useGaslessGame.ts`
- Example Screen: `src/screens/GamePlayScreen.tsx`

## Support

For issues or questions:
1. Check console logs for error messages
2. Review `GASLESS_GAMEPLAY_IMPLEMENTATION.md`
3. Check ER service status
4. Verify wallet connection

---

**Remember**: Gasless gameplay provides zero-gas, popup-free gaming with sub-10ms latency! 🚀
