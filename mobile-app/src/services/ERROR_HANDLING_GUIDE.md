# Error Handling and Fallback Guide

## Overview

The Magic Roulette mobile app implements comprehensive error handling and automatic fallback for compressed token operations. This ensures the system remains operational even when Light Protocol's ZK Compression is unavailable.

## Architecture

### Three-Layer Service Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    TokenService                          │
│  (Unified interface with automatic fallback)            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────┐    ┌────────────────────────┐│
│  │ LightProtocolService │    │ SplTokenFallbackService││
│  │ (Compressed tokens)  │    │ (Traditional SPL)      ││
│  │ - Retry logic        │    │ - Reliable fallback    ││
│  │ - Error classification│   │ - Higher costs         ││
│  │ - Exponential backoff│    │ - Always available     ││
│  └──────────────────────┘    └────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

## Error Types

### CompressedTokenErrorType

All compressed token errors are classified into specific types:

```typescript
enum CompressedTokenErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',           // Network connectivity issues
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE', // Not enough tokens
  INVALID_ACCOUNT = 'INVALID_ACCOUNT',       // Account doesn't exist
  RPC_ERROR = 'RPC_ERROR',                   // RPC endpoint issues
  TIMEOUT = 'TIMEOUT',                       // Operation timed out
  UNKNOWN = 'UNKNOWN',                       // Unclassified error
}
```

### Error Classification Logic

Errors are automatically classified based on their message content:

- **INSUFFICIENT_BALANCE**: Contains "insufficient" or "balance"
- **INVALID_ACCOUNT**: Contains "invalid" or "not found"
- **TIMEOUT**: Contains "timeout" or "timed out"
- **NETWORK_ERROR**: Contains "network", "connection", or "fetch"
- **RPC_ERROR**: Contains "rpc" or has an error code
- **UNKNOWN**: All other errors

## Retry Logic

### Exponential Backoff

Operations that fail with retryable errors are automatically retried with exponential backoff:

```typescript
interface RetryConfig {
  maxRetries: 3,              // Maximum retry attempts
  initialDelayMs: 1000,       // Initial delay (1 second)
  maxDelayMs: 10000,          // Maximum delay (10 seconds)
  backoffMultiplier: 2,       // Delay doubles each retry
}
```

### Retryable Errors

Only the following error types trigger automatic retry:
- `NETWORK_ERROR`
- `RPC_ERROR`
- `TIMEOUT`

Non-retryable errors (like `INSUFFICIENT_BALANCE` or `INVALID_ACCOUNT`) fail immediately.

### Retry Example

```
Attempt 1: Fails with NETWORK_ERROR → Wait 1s
Attempt 2: Fails with NETWORK_ERROR → Wait 2s
Attempt 3: Fails with NETWORK_ERROR → Wait 4s
Attempt 4: Fails with NETWORK_ERROR → Throw error
```

## Automatic Fallback

### When Fallback Occurs

The system automatically falls back to SPL tokens when:

1. Compressed token operation fails with a retryable error
2. All retry attempts are exhausted
3. Fallback is enabled in configuration (`enableFallback: true`)

### Fallback Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. Try compressed token operation                       │
│    ↓                                                     │
│ 2. Operation fails with NETWORK_ERROR                   │
│    ↓                                                     │
│ 3. Retry with exponential backoff (3 attempts)          │
│    ↓                                                     │
│ 4. All retries exhausted                                │
│    ↓                                                     │
│ 5. Check if fallback enabled                            │
│    ↓                                                     │
│ 6. Execute SPL token operation                          │
│    ↓                                                     │
│ 7. Return result with fallbackUsed: true                │
└─────────────────────────────────────────────────────────┘
```

### Cost Implications

When fallback is used, costs increase significantly:

| Operation | Compressed Cost | SPL Cost | Difference |
|-----------|----------------|----------|------------|
| Create Account | ~5,000 lamports | ~2,039,280 lamports | 400x more |
| Mint Tokens | ~7,308 lamports | ~1,461,600 lamports | 200x more |
| Transfer | ~5,000 lamports | ~5,000 lamports | Same |

## Usage Examples

### Basic Usage with TokenService

```typescript
import { createTokenService } from './services/tokenService';

const tokenService = createTokenService({
  rpcEndpoint: 'https://api.devnet.solana.com',
  enableFallback: true,      // Enable automatic fallback
  preferCompressed: true,    // Try compressed first
});

// Transfer with automatic fallback
try {
  const result = await tokenService.transfer(
    payer,
    mint,
    amount,
    sender,
    recipient
  );
  
  if (result.fallbackUsed) {
    console.warn('Used SPL fallback:', result.errorMessage);
    // Notify user about higher costs
  }
  
  console.log('Transfer successful:', result.signature);
} catch (error) {
  console.error('Both compressed and SPL transfers failed:', error);
  // Handle complete failure
}
```

### Using the Hook

```typescript
import { useCompressedTokens } from './hooks/useCompressedTokens';

function MyComponent() {
  const {
    transferTokens,
    fallbackUsed,
    error,
    loading,
  } = useCompressedTokens();
  
  const handleTransfer = async () => {
    try {
      const result = await transferTokens(recipientPubkey, amount);
      
      if (result.fallbackUsed) {
        // Show warning to user
        alert('Compressed tokens unavailable. Using traditional tokens (higher cost).');
      }
    } catch (err) {
      console.error('Transfer failed:', err);
    }
  };
  
  return (
    <div>
      {fallbackUsed && (
        <Warning>Using SPL fallback due to compressed token issues</Warning>
      )}
      <button onClick={handleTransfer} disabled={loading}>
        Transfer Tokens
      </button>
    </div>
  );
}
```

### Direct Service Usage

```typescript
import { LightProtocolService, CompressedTokenError } from './services/lightProtocol';

const lightProtocol = new LightProtocolService(rpcEndpoint);

try {
  const signature = await lightProtocol.transferCompressed(
    payer,
    mint,
    amount,
    sender,
    recipient
  );
  console.log('Transfer successful:', signature);
} catch (error) {
  if (error instanceof CompressedTokenError) {
    console.error(`Transfer failed (${error.type}):`, error.message);
    
    // Handle specific error types
    switch (error.type) {
      case 'INSUFFICIENT_BALANCE':
        alert('Insufficient balance for transfer');
        break;
      case 'NETWORK_ERROR':
        alert('Network error. Please check your connection.');
        break;
      case 'TIMEOUT':
        alert('Operation timed out. Please try again.');
        break;
      default:
        alert('Transfer failed. Please try again.');
    }
  }
}
```

## Configuration

### TokenService Configuration

```typescript
interface TokenServiceConfig {
  rpcEndpoint: string;           // Solana RPC endpoint
  compressionEndpoint?: string;  // Optional Light Protocol endpoint
  enableFallback: boolean;       // Enable SPL fallback
  preferCompressed: boolean;     // Try compressed first
}
```

### Retry Configuration

```typescript
const lightProtocol = new LightProtocolService(
  rpcEndpoint,
  compressionEndpoint,
  {
    maxRetries: 5,              // Increase retry attempts
    initialDelayMs: 500,        // Faster initial retry
    maxDelayMs: 15000,          // Longer max delay
    backoffMultiplier: 2.5,     // More aggressive backoff
  }
);
```

## Error Messages

### User-Friendly Error Messages

The system provides clear, actionable error messages:

```typescript
// Insufficient balance
"Transfer failed (INSUFFICIENT_BALANCE): Insufficient funds for transfer"

// Network error
"Transfer failed (NETWORK_ERROR): Network request failed after 4 attempts"

// Invalid account
"Transfer failed (INVALID_ACCOUNT): Token account not found"

// Timeout
"Transfer failed (TIMEOUT): Operation timed out after 30 seconds"
```

### Fallback Notifications

When fallback is used, the system provides context:

```typescript
{
  signature: "5x7...",
  usedCompressed: false,
  fallbackUsed: true,
  errorMessage: "Compressed token transfer failed (NETWORK_ERROR): Connection timeout"
}
```

## Best Practices

### 1. Always Enable Fallback in Production

```typescript
const tokenService = createTokenService({
  rpcEndpoint: process.env.RPC_ENDPOINT,
  enableFallback: true,  // ✅ Always enable in production
  preferCompressed: true,
});
```

### 2. Monitor Fallback Usage

```typescript
if (result.fallbackUsed) {
  // Log to analytics
  analytics.track('spl_fallback_used', {
    operation: 'transfer',
    error: result.errorMessage,
  });
  
  // Alert operations team
  if (fallbackRate > 0.1) {  // More than 10% fallback
    alertOps('High SPL fallback rate detected');
  }
}
```

### 3. Inform Users About Cost Differences

```typescript
if (result.fallbackUsed) {
  showNotification({
    type: 'warning',
    message: 'Using traditional tokens due to network issues. Transaction costs may be higher.',
  });
}
```

### 4. Handle Complete Failures Gracefully

```typescript
try {
  const result = await tokenService.transfer(...);
} catch (error) {
  // Both compressed and SPL failed
  showError({
    title: 'Transfer Failed',
    message: 'Unable to complete transfer. Please try again later.',
    action: 'Retry',
    onAction: () => retryTransfer(),
  });
}
```

### 5. Test Fallback Scenarios

```typescript
// Disable compressed tokens to test fallback
const tokenService = createTokenService({
  rpcEndpoint: 'https://api.devnet.solana.com',
  enableFallback: true,
  preferCompressed: false,  // Force SPL usage for testing
});
```

## Monitoring and Debugging

### Log Levels

The system logs at different levels:

```typescript
// Info: Normal operation
console.log('Transferred compressed tokens:', signature);

// Warning: Fallback used
console.warn('Compressed token transfer failed (NETWORK_ERROR), falling back to SPL');

// Error: Complete failure
console.error('Both compressed and SPL transfers failed:', error);
```

### Metrics to Track

1. **Fallback Rate**: Percentage of operations using SPL fallback
2. **Error Distribution**: Count of each error type
3. **Retry Success Rate**: Percentage of operations succeeding after retry
4. **Cost Impact**: Additional costs from fallback usage

### Debug Mode

Enable verbose logging for debugging:

```typescript
// Set environment variable
process.env.DEBUG_TOKEN_SERVICE = 'true';

// Or add custom logging
const tokenService = createTokenService({
  rpcEndpoint: 'https://api.devnet.solana.com',
  enableFallback: true,
  preferCompressed: true,
});

// Wrap operations with logging
const originalTransfer = tokenService.transfer.bind(tokenService);
tokenService.transfer = async (...args) => {
  console.log('Transfer starting:', args);
  const result = await originalTransfer(...args);
  console.log('Transfer result:', result);
  return result;
};
```

## Troubleshooting

### High Fallback Rate

**Symptom**: More than 10% of operations using SPL fallback

**Possible Causes**:
- Light Protocol RPC endpoint issues
- Network connectivity problems
- Rate limiting on compression endpoint

**Solutions**:
1. Check Light Protocol service status
2. Verify RPC endpoint configuration
3. Increase retry attempts
4. Use backup compression endpoint

### Frequent Timeouts

**Symptom**: Many operations failing with TIMEOUT error

**Possible Causes**:
- Slow RPC endpoint
- Network latency
- Insufficient timeout duration

**Solutions**:
1. Switch to faster RPC endpoint (e.g., Helius, Quicknode)
2. Increase timeout duration
3. Implement request caching

### Insufficient Balance Errors

**Symptom**: Operations failing with INSUFFICIENT_BALANCE

**Possible Causes**:
- User actually has insufficient balance
- Balance not synced
- Wrong token account

**Solutions**:
1. Refresh balance before operations
2. Verify correct token account
3. Show clear balance to user

## Related Documentation

- [Light Protocol Integration Guide](./README_LIGHT_PROTOCOL.md)
- [Token Service API Reference](./tokenService.ts)
- [Migration Guide](../lib/migration/README.md)
