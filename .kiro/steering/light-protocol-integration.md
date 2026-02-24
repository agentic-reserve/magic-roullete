---
title: Light Protocol ZK Compression Integration Guide
inclusion: manual
tags: [light-protocol, zk-compression, cost-optimization]
---

# Light Protocol ZK Compression Integration Guide

This steering file provides guidance for integrating Light Protocol ZK Compression to achieve 1000x cost savings for Magic Roulette.

## Overview

Light Protocol enables ZK Compression on Solana, reducing storage costs from ~2M lamports (SPL Token) to ~5K lamports (compressed tokens) - a 400x savings per account. Combined with other optimizations, this achieves 1000x overall cost reduction.

## Key Concepts

### Compressed Token Accounts
- **Traditional SPL Token Account**: ~2,039,280 lamports (~$0.20)
- **Compressed Token Account**: ~5,000 lamports (~$0.0005)
- **Savings**: 400x per account

### Zero-Knowledge Proofs
- State stored off-chain in Merkle trees
- On-chain state roots verified via ZK proofs
- Same security guarantees as L1 Solana
- Rent-free storage

## Integration Steps

### 1. Install Dependencies

```bash
npm install @lightprotocol/stateless.js @lightprotocol/compressed-token
```

### 2. Initialize Light Protocol RPC

```typescript
import { createRpc } from '@lightprotocol/stateless.js';

const rpc = createRpc(
  'https://devnet.helius-rpc.com/?api-key=YOUR_KEY',
  'https://devnet.helius-rpc.com/?api-key=YOUR_KEY'
);
```

### 3. Create Compressed Mint

```typescript
import { createMint } from '@lightprotocol/compressed-token';

const { mint } = await createMint(
  rpc,
  payer,
  mintAuthority.publicKey,
  9  // decimals
);
```

### 4. Mint Compressed Tokens

```typescript
import { mintTo } from '@lightprotocol/compressed-token';

await mintTo(
  rpc,
  payer,
  mint,
  recipientPublicKey,
  mintAuthority,
  entryFeeAmount
);
```

### 5. Transfer Compressed Tokens

```typescript
import { transfer } from '@lightprotocol/compressed-token';

await transfer(
  rpc,
  payer,
  mint,
  amount,
  sender,
  recipientPublicKey
);
```

### 6. Compress/Decompress SPL Tokens

```typescript
import { compress, decompress } from '@lightprotocol/compressed-token';

// Compress existing SPL tokens
await compress(
  rpc,
  payer,
  mint,
  amount,
  owner,
  owner.publicKey
);

// Decompress to SPL tokens
await decompress(
  rpc,
  payer,
  mint,
  amount,
  owner,
  owner.publicKey
);
```

## Game Integration Pattern

### Entry Fee Deposit Flow

```typescript
// 1. Player creates compressed token account (5,000 lamports)
const account = await lightProtocol.createCompressedAccount(playerPublicKey);

// 2. Deposit entry fee as compressed tokens
const signature = await lightProtocol.transferCompressed(
  player,
  GAME_TOKEN_MINT,
  entryFee,
  player,
  gameVaultPDA
);

// 3. Game executes on Ephemeral Rollup (gasless)
// Shots executed with zero gas fees

// 4. Distribute winnings as compressed tokens
await lightProtocol.transferCompressed(
  GAME_AUTHORITY,
  GAME_TOKEN_MINT,
  winnings,
  GAME_AUTHORITY,
  winnerPublicKey
);
```

## Migration Strategy

### Phase 1: Parallel Support (Weeks 1-2)
- Support both SPL and compressed tokens
- Feature flag for compressed token opt-in
- Beta testers only

### Phase 2: Gradual Migration (Weeks 3-4)
- Encourage compressed token adoption
- UI prompts for migration with cost savings display
- All users with opt-out option

### Phase 3: Full Migration (Weeks 5-6)
- Default to compressed tokens
- Automatic compression on deposit
- All new users, existing users migrated

### Phase 4: SPL Deprecation (Week 7+)
- Compressed tokens only
- Remove SPL token support

## Error Handling

### Common Errors

1. **Compressed RPC Not Available**
   - Fallback to SPL tokens
   - Display error message to user
   - Retry with exponential backoff

2. **Insufficient Lamports for Compression**
   - Require minimum balance (10,000 lamports)
   - Display clear error message
   - Suggest airdrop or deposit

3. **Merkle Tree Full**
   - Rotate to new Merkle tree
   - Automatic tree management
   - No user intervention required

### Error Handling Pattern

```typescript
try {
  await lightProtocol.transferCompressed(/* ... */);
} catch (error) {
  if (error.message.includes('RPC unavailable')) {
    // Fallback to SPL tokens
    await splToken.transfer(/* ... */);
  } else if (error.message.includes('insufficient lamports')) {
    throw new Error('Minimum 10,000 lamports required for compressed tokens');
  } else {
    // Log error and retry
    console.error('Compressed token operation failed:', error);
    await retryWithBackoff(() => lightProtocol.transferCompressed(/* ... */));
  }
}
```

## Testing Strategy

### Unit Tests
- Test compressed token account creation
- Test compressed token transfers
- Test compress/decompress operations
- Test error handling and fallbacks

### Property-Based Tests
- **Property 1**: Compressed token account cost < 10,000 lamports
- **Property 2**: Compressed token transfers preserve balances
- **Property 3**: Compress/decompress round-trip preserves amount
- **Property 4**: Error handling falls back to SPL tokens

### Integration Tests
- Test full game flow with compressed tokens
- Test migration from SPL to compressed
- Test wallet compatibility (Phantom, Solflare, Backpack)

## Performance Considerations

### Optimization Tips
1. **Batch Operations**: Batch multiple compressed token operations into single transaction
2. **Merkle Tree Management**: Use dedicated Merkle trees for high-volume operations
3. **RPC Caching**: Cache compressed account state to reduce RPC calls
4. **Parallel Processing**: Process multiple compressed token operations in parallel

### Monitoring
- Track compressed token adoption rate
- Monitor compressed token operation success rate
- Track cost savings vs SPL tokens
- Alert on compressed RPC failures

## Wallet Compatibility

### Supported Wallets
- ✅ Phantom Mobile (full support)
- ✅ Solflare Mobile (full support)
- ✅ Backpack Mobile (full support)
- ✅ Seed Vault Wallet (Seeker default, full support)

### Testing Checklist
- [ ] Test compressed token creation in each wallet
- [ ] Test compressed token transfers in each wallet
- [ ] Test compress/decompress in each wallet
- [ ] Test error handling in each wallet

## Resources

- [Light Protocol Documentation](https://docs.lightprotocol.com/)
- [Compressed Token SDK](https://github.com/Lightprotocol/light-protocol/tree/main/sdk/compressed-token)
- [ZK Compression Whitepaper](https://docs.lightprotocol.com/whitepaper)
- [Example Implementation](https://github.com/Lightprotocol/example-token-escrow)

## Best Practices

1. **Always provide fallback to SPL tokens** - Don't break user experience if compressed tokens fail
2. **Display cost savings to users** - Show how much they save with compressed tokens
3. **Implement gradual migration** - Don't force users to switch immediately
4. **Monitor adoption metrics** - Track compressed token usage and optimize accordingly
5. **Test thoroughly** - Compressed tokens are new, test extensively before mainnet

## Common Pitfalls

❌ **Don't**: Force users to use compressed tokens without fallback
✅ **Do**: Provide seamless fallback to SPL tokens on failure

❌ **Don't**: Assume all wallets support compressed tokens
✅ **Do**: Test with all major wallets and handle incompatibilities

❌ **Don't**: Ignore error handling for compressed token operations
✅ **Do**: Implement robust error handling with clear user messages

❌ **Don't**: Deploy to mainnet without thorough testing
✅ **Do**: Test extensively on devnet with beta testers first
