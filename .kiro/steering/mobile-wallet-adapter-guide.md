---
title: Mobile Wallet Adapter Integration Guide
inclusion: manual
tags: [mobile-wallet-adapter, solana-mobile, seeker]
---

# Mobile Wallet Adapter Integration Guide

This steering file provides guidance for integrating and optimizing Mobile Wallet Adapter (MWA) for seamless mobile wallet connections on Solana Seeker devices.

## Overview

Mobile Wallet Adapter enables native mobile wallet integration on Solana Mobile devices, providing:
- **One-tap wallet connection** - Single user interaction for authorization
- **Persistent sessions** - No re-authentication during gameplay
- **Gasless gameplay** - Pre-authorized transactions eliminate popups
- **Transaction batching** - Multiple operations in single approval

## Key Concepts

### Mobile Wallet Adapter Protocol
- Native Android integration via intents
- Secure communication between app and wallet
- Session-based authorization with auth tokens
- Support for sign, signAndSend, and batch operations

### Supported Wallets
- Phantom Mobile
- Solflare Mobile
- Backpack Mobile
- Seed Vault Wallet (Seeker default)

## Integration Steps

### 1. Install Dependencies

```bash
npm install @solana-mobile/mobile-wallet-adapter-protocol @solana-mobile/mobile-wallet-adapter-protocol-web3js
```

### 2. Create Wallet Context Provider

```typescript
import { transact, Web3MobileWallet } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';

export function WalletProvider({ children, cluster = 'devnet' }) {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  
  const connect = useCallback(async () => {
    await transact(async (wallet: Web3MobileWallet) => {
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
  }, [cluster]);
  
  return (
    <WalletContext.Provider value={{ connected, publicKey, connect }}>
      {children}
    </WalletContext.Provider>
  );
}
```

### 3. Implement One-Tap Connection

```typescript
function WalletButton() {
  const { connect, connected, publicKey } = useWallet();
  
  return (
    <Button onPress={connect} disabled={connected}>
      {connected ? `${publicKey.toBase58().slice(0, 4)}...` : 'Connect Wallet'}
    </Button>
  );
}
```

### 4. Implement Persistent Session

```typescript
const signAndSendTransaction = useCallback(async (transaction: Transaction) => {
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
    
    // Sign and send (no popup)
    const [signature] = await wallet.signAndSendTransactions({
      transactions: [transaction],
    });
    
    return signature;
  });
}, [authToken]);
```

### 5. Implement Transaction Batching

```typescript
async function createGameWithBatchedTransactions(entryFee: number) {
  const depositTx = await createDepositTransaction(entryFee);
  const createGameTx = await createGameTransaction(entryFee);
  
  // Batch sign and send (single popup)
  const signedTxs = await signAllTransactions([depositTx, createGameTx]);
  
  return signedTxs;
}
```

## Gasless Gameplay Pattern

### Pre-Authorization for Game Sessions

```typescript
// During initial connection, pre-authorize game transactions
const preAuthorizeGameSession = async (gameId: bigint, maxShots: number) => {
  await transact(async (wallet: Web3MobileWallet) => {
    const authResult = await wallet.authorize({
      cluster: 'devnet',
      identity: {
        name: 'Magic Roulette',
        uri: 'https://magicroulette.com',
        icon: 'https://magicroulette.com/icon.png',
      },
      scope: ['sign_transactions', 'sign_and_send_transactions'],
    });
    
    // Store session token for gasless gameplay
    return {
      authToken: authResult.auth_token,
      expiresAt: Date.now() + 3600000, // 1 hour
    };
  });
};

// Execute shot without popup (uses Ephemeral Rollup)
const executeShotGasless = async (gameId: bigint) => {
  // Shot executed on ER (zero gas)
  // No wallet popup required
  // State committed automatically
  
  const shotResult = await gameService.takeShot(gameId, {
    authToken: sessionAuth.authToken,
  });
  
  return shotResult;
};
```

## Error Handling

### Common Errors

1. **User Rejected Authorization**
   ```typescript
   catch (error) {
     if (error.message.includes('User rejected')) {
       showToast('Wallet connection cancelled');
     }
   }
   ```

2. **No Wallet Installed**
   ```typescript
   catch (error) {
     if (error.message.includes('No wallet found')) {
       showToast('Please install a Solana wallet (Phantom, Solflare, or Backpack)');
     }
   }
   ```

3. **Session Expired**
   ```typescript
   catch (error) {
     if (error.message.includes('auth_token expired')) {
       // Reconnect wallet
       await connect();
     }
   }
   ```

### Error Handling Pattern

```typescript
async function handleWalletOperation<T>(
  operation: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error.message.includes('User rejected')) {
      throw new Error('Transaction cancelled by user');
    } else if (error.message.includes('No wallet found')) {
      throw new Error('No Solana wallet installed. Please install Phantom, Solflare, or Backpack.');
    } else if (error.message.includes('auth_token expired')) {
      // Attempt reconnection
      await connect();
      return await operation(); // Retry
    } else {
      console.error(errorMessage, error);
      throw new Error(`${errorMessage}: ${error.message}`);
    }
  }
}
```

## Automatic Reconnection

### App Foreground/Background Handling

```typescript
import { AppState } from 'react-native';

useEffect(() => {
  const subscription = AppState.addEventListener('change', async (nextAppState) => {
    if (nextAppState === 'active' && connected && authToken) {
      // App returned to foreground, verify session
      try {
        await verifySession(authToken);
      } catch (error) {
        // Session expired, reconnect
        await connect();
      }
    }
  });
  
  return () => subscription.remove();
}, [connected, authToken]);
```

## Performance Optimization

### Transaction Signing Performance

```typescript
// Optimize transaction construction
const optimizeTransaction = (transaction: Transaction) => {
  // Use recent blockhash
  const { blockhash } = await connection.getLatestBlockhash('confirmed');
  transaction.recentBlockhash = blockhash;
  
  // Set fee payer
  transaction.feePayer = publicKey;
  
  // Minimize transaction size
  transaction.compileMessage();
  
  return transaction;
};

// Parallel transaction preparation
const prepareTransactions = async (operations: Operation[]) => {
  const transactions = await Promise.all(
    operations.map(op => createTransaction(op))
  );
  
  return transactions;
};
```

### Signing Time Target
- **Target**: <200ms on Seeker hardware
- **Optimization**: Minimize transaction size, use recent blockhash, parallel preparation

## Wallet Compatibility Testing

### Testing Checklist

**Phantom Mobile**:
- [ ] One-tap connection works
- [ ] Persistent session maintained
- [ ] Transaction batching works
- [ ] Gasless gameplay works
- [ ] Automatic reconnection works

**Solflare Mobile**:
- [ ] One-tap connection works
- [ ] Persistent session maintained
- [ ] Transaction batching works
- [ ] Gasless gameplay works
- [ ] Automatic reconnection works

**Backpack Mobile**:
- [ ] One-tap connection works
- [ ] Persistent session maintained (limited support)
- [ ] Transaction batching works
- [ ] Gasless gameplay works (limited support)
- [ ] Automatic reconnection works

**Seed Vault Wallet** (Seeker default):
- [ ] One-tap connection works
- [ ] Persistent session maintained
- [ ] Transaction batching works
- [ ] Gasless gameplay works
- [ ] Automatic reconnection works

## Testing Strategy

### Unit Tests
```typescript
describe('WalletProvider', () => {
  it('should connect wallet with one tap', async () => {
    const { result } = renderHook(() => useWallet());
    await act(async () => {
      await result.current.connect();
    });
    expect(result.current.connected).toBe(true);
  });
  
  it('should maintain persistent session', async () => {
    const { result } = renderHook(() => useWallet());
    await act(async () => {
      await result.current.connect();
    });
    const authToken = result.current.authToken;
    
    // Simulate app restart
    await act(async () => {
      await result.current.reauthorize(authToken);
    });
    
    expect(result.current.connected).toBe(true);
  });
});
```

### Integration Tests
- Test full game flow with wallet connection
- Test transaction batching for entry fee + game creation
- Test gasless gameplay on Ephemeral Rollup
- Test automatic reconnection on app foreground

## Best Practices

1. **Always use reauthorize for subsequent transactions** - Avoids wallet popups during gameplay
2. **Batch related transactions** - Minimize wallet popups by batching operations
3. **Implement automatic reconnection** - Handle app foreground/background transitions
4. **Provide clear error messages** - Help users troubleshoot wallet issues
5. **Test with all major wallets** - Ensure compatibility across Phantom, Solflare, Backpack, Seed Vault

## Common Pitfalls

❌ **Don't**: Call `authorize()` for every transaction
✅ **Do**: Use `reauthorize()` with stored auth token

❌ **Don't**: Ignore session expiration
✅ **Do**: Implement automatic reconnection on session expiry

❌ **Don't**: Show wallet popup during gameplay
✅ **Do**: Pre-authorize game session and use Ephemeral Rollup for gasless shots

❌ **Don't**: Assume all wallets have identical behavior
✅ **Do**: Test with all major wallets and handle wallet-specific quirks

## Resources

- [Mobile Wallet Adapter Documentation](https://docs.solanamobile.com/react-native/overview)
- [MWA Protocol Specification](https://solana-mobile.github.io/mobile-wallet-adapter/spec/spec.html)
- [Solana Mobile Stack](https://solanamobile.com/developers)
- [Example Implementation](https://github.com/solana-mobile/mobile-wallet-adapter/tree/main/examples)

## Seeker-Specific Optimizations

### Crypto Acceleration
```typescript
// Enable crypto acceleration on Seeker
if (isSeekerDevice()) {
  // Use hardware-accelerated crypto
  enableCryptoAcceleration();
}
```

### 120Hz Refresh Rate
```typescript
// Optimize for 120Hz display
if (isSeekerDevice()) {
  // Enable high refresh rate animations
  enableHighRefreshRate();
}
```

### Battery Optimization
```typescript
// Optimize battery usage on Seeker
if (isSeekerDevice()) {
  // Reduce background activity
  optimizeBatteryUsage();
}
```
