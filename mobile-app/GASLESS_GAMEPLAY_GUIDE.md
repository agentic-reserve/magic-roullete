# Gasless Gameplay Implementation Guide

## Overview

This guide documents the implementation of gasless gameplay for Magic Roulette using Ephemeral Rollups. The feature enables zero-gas shot execution without wallet popups during gameplay, providing a seamless mobile gaming experience.

## Architecture

### Components

1. **WalletContext** (`src/contexts/WalletContext.tsx`)
   - Manages wallet connection and session authorization
   - Pre-authorizes game sessions for gasless gameplay
   - Tracks shots taken and session expiry

2. **Gasless Game Service** (`src/services/gaslessGame.ts`)
   - Handles game delegation to Ephemeral Rollups
   - Executes shots with zero gas fees
   - Commits game state back to base layer

3. **useGaslessGame Hook** (`src/hooks/useGaslessGame.ts`)
   - React hook integrating wallet and ER services
   - Manages gasless gameplay state
   - Provides performance metrics

4. **GaslessGameplay Component** (`src/components/game/GaslessGameplay.tsx`)
   - UI component demonstrating gasless gameplay
   - Displays performance metrics and session info

## How It Works

### 1. Session Pre-Authorization

When a player joins a game, the wallet pre-authorizes the game session:

```typescript
// Pre-authorize game session (one-time, no popups during gameplay)
await wallet.preAuthorizeGameSession(gameId, maxShots);
```

This creates a `GameSessionAuth` object:
```typescript
interface GameSessionAuth {
  gameId: number;
  authorizedAt: number;
  expiresAt: number;      // 30 minutes
  maxShots: number;        // Default: 6
  shotsTaken: number;
}
```

### 2. Game Delegation to Ephemeral Rollup

The game is delegated to an Ephemeral Rollup for sub-10ms execution:

```typescript
// Delegate game to ER (one-time setup)
await delegateGameToER(provider, gameId);
```

This:
- Transfers game account ownership to the Delegation Program
- Enables execution on ER with zero gas fees
- Maintains state consistency with base layer

### 3. Gasless Shot Execution

Shots execute instantly without transaction approval:

```typescript
// Execute shot (zero gas, no popup)
const result = await gaslessGame.executeShot(gameId);
```

Flow:
1. Verify game session is authorized
2. Check shots remaining in session
3. Execute shot on ER (zero gas)
4. Update session shot counter
5. Return result with latency metrics

### 4. Game Finalization

After the game ends, state is committed back to base layer:

```typescript
// Commit and undelegate game
await gaslessGame.finishGame(gameId);
```

This:
- Commits final game state from ER to base layer
- Undelegates game from ER
- Clears game session authorization

## Usage Example

### Basic Integration

```typescript
import { useGaslessGame } from '../hooks/useGaslessGame';
import { useWallet } from '../contexts/WalletContext';

function GameScreen({ gameId }) {
  const wallet = useWallet();
  const gaslessGame = useGaslessGame(provider);

  // Initialize gasless gameplay
  useEffect(() => {
    const init = async () => {
      await gaslessGame.initializeGaslessGame(gameId, 6);
    };
    init();
  }, [gameId]);

  // Execute shot
  const handleShot = async () => {
    const result = await gaslessGame.executeShot(gameId);
    
    if (result.gameOver) {
      await gaslessGame.finishGame(gameId);
    }
  };

  return (
    <View>
      <Button onPress={handleShot} disabled={!gaslessGame.isReady}>
        Take Shot (Zero Gas)
      </Button>
      
      {gaslessGame.lastShotResult && (
        <Text>Latency: {gaslessGame.lastShotResult.latency}ms</Text>
      )}
    </View>
  );
}
```

### With Performance Monitoring

```typescript
import { useGaslessPerformance } from '../hooks/useGaslessGame';

function GameWithMetrics({ gameId }) {
  const gaslessGame = useGaslessGame(provider);
  const performance = useGaslessPerformance();

  const handleShot = async () => {
    const result = await gaslessGame.executeShot(gameId);
    performance.recordShot(result.latency, result.success);
  };

  return (
    <View>
      <Text>Average Latency: {performance.metrics.averageLatency}ms</Text>
      <Text>Success Rate: {performance.metrics.successRate}%</Text>
      <Button onPress={handleShot}>Take Shot</Button>
    </View>
  );
}
```

## API Reference

### WalletContext Methods

#### `preAuthorizeGameSession(gameId: number, maxShots?: number): Promise<void>`
Pre-authorizes a game session for gasless gameplay.

**Parameters:**
- `gameId`: Game ID to authorize
- `maxShots`: Maximum shots allowed (default: 6)

**Throws:**
- Error if wallet not connected
- Error if session creation fails

#### `executeShotGasless(gameId: number): Promise<void>`
Verifies session authorization for a gasless shot.

**Parameters:**
- `gameId`: Game ID to execute shot for

**Throws:**
- Error if no active session
- Error if session expired
- Error if max shots reached

#### `clearGameSession(): Promise<void>`
Clears the current game session authorization.

### Gasless Game Service Functions

#### `executeShotOnER(provider: AnchorProvider, gameId: number): Promise<GaslessShotResult>`
Executes a shot on Ephemeral Rollup with zero gas.

**Returns:**
```typescript
interface GaslessShotResult {
  success: boolean;
  chamber: number;
  isBullet: boolean;
  gameOver: boolean;
  winner?: PublicKey;
  latency: number;
}
```

#### `delegateGameToER(provider: AnchorProvider, gameId: number): Promise<string>`
Delegates game to Ephemeral Rollup.

**Returns:** Transaction signature

#### `commitGameFromER(provider: AnchorProvider, gameId: number): Promise<string>`
Commits game state from ER to base layer.

**Returns:** Transaction signature

#### `isGameReadyForGasless(provider: AnchorProvider, gameId: number): Promise<boolean>`
Checks if game is delegated and ready for gasless gameplay.

**Returns:** True if ready

### useGaslessGame Hook

#### State
```typescript
interface GaslessGameState {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  lastShotResult: GaslessShotResult | null;
  averageLatency: number | null;
}
```

#### Methods
- `initializeGaslessGame(gameId, maxShots?)`: Initialize gasless gameplay
- `executeShot(gameId)`: Execute gasless shot
- `finishGame(gameId)`: Finish and commit game
- `checkReadiness(gameId)`: Check if ready
- `resetState()`: Reset hook state

## Performance Targets

- **Shot Execution Latency**: < 10ms (Ephemeral Rollup)
- **Session Authorization**: One-time (no popups during gameplay)
- **Gas Fees**: Zero (all shots on ER)
- **Transaction Approval**: None (pre-authorized session)

## Security Considerations

### Session Expiry
- Game sessions expire after 30 minutes
- Expired sessions require re-authorization
- Prevents unauthorized shot execution

### Shot Limits
- Maximum shots per session (default: 6)
- Prevents session abuse
- Tracks shots taken vs authorized

### State Verification
- Game must be delegated to ER
- Session must match game ID
- Wallet must be connected

## Error Handling

### Common Errors

1. **"No active game session"**
   - Cause: Session not pre-authorized
   - Solution: Call `preAuthorizeGameSession()` first

2. **"Game session expired"**
   - Cause: Session exceeded 30-minute limit
   - Solution: Re-authorize session

3. **"Maximum shots reached"**
   - Cause: Shot limit exceeded
   - Solution: Finish game or create new session

4. **"Game is not delegated to ER"**
   - Cause: Game not delegated
   - Solution: Call `delegateGameToER()` first

## Testing

### Unit Tests
Test wallet session management:
```typescript
describe('WalletContext Gasless Gameplay', () => {
  it('should pre-authorize game session', async () => {
    await wallet.preAuthorizeGameSession(1, 6);
    expect(wallet.gameSession).toBeDefined();
    expect(wallet.gameSession.gameId).toBe(1);
  });

  it('should track shots taken', async () => {
    await wallet.preAuthorizeGameSession(1, 6);
    await wallet.executeShotGasless(1);
    expect(wallet.gameSession.shotsTaken).toBe(1);
  });

  it('should expire after 30 minutes', async () => {
    await wallet.preAuthorizeGameSession(1, 6);
    // Fast-forward time
    jest.advanceTimersByTime(1800001);
    await expect(wallet.executeShotGasless(1)).rejects.toThrow('expired');
  });
});
```

### Integration Tests
Test end-to-end gasless gameplay:
```typescript
describe('Gasless Gameplay Integration', () => {
  it('should execute gasless shots without popups', async () => {
    // Initialize
    await gaslessGame.initializeGaslessGame(gameId, 6);
    
    // Execute shots
    for (let i = 0; i < 6; i++) {
      const result = await gaslessGame.executeShot(gameId);
      expect(result.success).toBe(true);
      expect(result.latency).toBeLessThan(10);
    }
    
    // Finish
    await gaslessGame.finishGame(gameId);
  });
});
```

## Troubleshooting

### High Latency
- Check ER connection health
- Verify network connectivity
- Use ER router for auto-region selection

### Session Issues
- Clear AsyncStorage if corrupted
- Verify wallet connection
- Check session expiry time

### Delegation Failures
- Ensure sufficient SOL for delegation
- Wait for delegation to propagate
- Check ER validator status

## Future Enhancements

1. **Multi-Game Sessions**: Support multiple concurrent game sessions
2. **Dynamic Shot Limits**: Adjust based on game mode
3. **Session Refresh**: Auto-refresh expiring sessions
4. **Batch Delegation**: Delegate multiple games at once
5. **ER Region Selection**: Auto-select best ER region by latency

## References

- [MagicBlock Ephemeral Rollups Documentation](https://docs.magicblock.gg)
- [Mobile Wallet Adapter Documentation](https://docs.solanamobile.com)
- [Task 7.5 Requirements](../.kiro/specs/q2-2026-roadmap/requirements.md)
