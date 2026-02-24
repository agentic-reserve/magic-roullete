# MagicBlock Quick Reference

Quick reference untuk MagicBlock Ephemeral Rollups integration.

## 🔑 Key Constants

```typescript
// Program IDs
DELEGATION_PROGRAM_ID = 'DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh'
PERMISSION_PROGRAM_ID = 'ACLseoPoyC3cBqoUtkbjZ4aDrkurZW86v19pXz2XQnp1'

// RPC Endpoints (Devnet)
BASE_RPC = 'https://api.devnet.solana.com'
ER_RPC_ROUTER = 'https://devnet-router.magicblock.app'
ER_RPC_ASIA = 'https://devnet-as.magicblock.app'
ER_RPC_EU = 'https://devnet-eu.magicblock.app'
ER_RPC_US = 'https://devnet-us.magicblock.app'
ER_RPC_TEE = 'https://tee.magicblock.app'

// ER Validators (Devnet)
ASIA = 'MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57'
EU = 'MEUGGrYPxKk17hCr7wpT6s8dtNokZj5U2L57vjYMS8e'
US = 'MUS3hc9TCw4cGC12vHNoYcCGzJG1txjgQLZWVoeNHNd'
TEE = 'FnE6VJT5QNZdedZPnCoLsARgBwoE6DeJNjBs2H1gySXA'
```

## 📦 Dependencies

```toml
# Cargo.toml
[dependencies]
ephemeral-rollups-sdk = { version = "0.6.5", features = ["anchor", "disable-realloc"] }
ephemeral-vrf-sdk = { version = "0.2", features = ["anchor"] }
```

```json
// package.json
{
  "dependencies": {
    "@magicblock-labs/ephemeral-rollups-sdk": "latest"
  }
}
```

## 🦀 Rust Macros

```rust
// Enable ER support
#[ephemeral]
#[program]
pub mod my_program { }

// Mark account for delegation
#[account(mut, del)]
pub game: Account<'info, Game>,

// Auto-inject delegation accounts
#[delegate]
pub fn delegate_game(ctx: Context<DelegateGame>) -> Result<()> { }

// Auto-inject commit accounts
#[commit]
pub fn commit_game(ctx: Context<CommitGame>) -> Result<()> { }

// Commit + undelegate
#[commit]
pub fn undelegate_game(ctx: Context<UndelegateGame>) -> Result<()> { }
```

## 💻 TypeScript Functions

```typescript
// Check delegation
const delegated = await isDelegated(gamePDA);

// Get appropriate connection
const connection = await getConnectionForAccount(gamePDA);

// Delegate game
const tx = await program.methods
  .delegateGame()
  .accounts({ game, payer, delegationProgram })
  .rpc();

// Execute on ER (use ER connection)
const erProvider = new AnchorProvider(
  erConnection,
  wallet,
  { commitment: 'confirmed', skipPreflight: true }
);

// Commit state
const tx = await program.methods
  .commitGame()
  .accounts({ game, payer })
  .rpc();

// Undelegate
const tx = await program.methods
  .undelegateGame()
  .accounts({ game, payer, delegationProgram })
  .rpc();
```

## 🎮 Game Flow

```
1. CREATE GAME (Base Layer)
   ↓
2. DELEGATE (Base Layer → ER)
   ↓
3. JOIN GAME (ER - Gasless)
   ↓
4. TAKE SHOTS (ER - Sub-10ms)
   ↓
5. COMMIT STATE (ER → Base Layer)
   ↓
6. UNDELEGATE (ER → Base Layer)
   ↓
7. FINALIZE (Base Layer)
```

## ⚡ Performance Targets

| Operation | Target | Layer |
|-----------|--------|-------|
| Delegate | ~400ms | Base |
| Join Game | ~10ms | ER |
| Take Shot | ~10ms | ER |
| Commit | ~400ms | Base |
| Undelegate | ~400ms | Base |

## 🔧 Common Commands

```bash
# Build program
anchor build

# Deploy program
anchor deploy --provider.cluster devnet

# Upgrade program
anchor upgrade target/deploy/magic_roulette.so \
  --program-id HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam \
  --provider.cluster devnet

# Update IDL
anchor idl upgrade HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam \
  --filepath target/idl/magic_roulette.json \
  --provider.cluster devnet

# Start dev server
cd mobile-app && npm run web
```

## 🐛 Quick Fixes

```typescript
// Wait for delegation
await new Promise(resolve => setTimeout(resolve, 2000));

// Check delegation status
const delegated = await isDelegated(gamePDA);
if (!delegated) {
  throw new Error('Game not delegated yet');
}

// Use skipPreflight for ER
const erProvider = new AnchorProvider(
  erConnection,
  wallet,
  { commitment: 'confirmed', skipPreflight: true }
);

// Fallback to base layer
try {
  await takeShotER(provider, gameId);
} catch (error) {
  await takeShot(provider, gameId);
}
```

## 📊 Monitoring

```typescript
// Measure ER latency
const start = Date.now();
await erConnection.getLatestBlockhash();
const latency = Date.now() - start;
console.log(`ER latency: ${latency}ms`);

// Monitor delegation status
const interval = setInterval(async () => {
  const delegated = await isDelegated(gamePDA);
  console.log('Delegated:', delegated);
}, 3000);
```

## 🎯 Best Practices

1. **Separate Connections**: Always use separate connections for base layer and ER
2. **Skip Preflight**: Use `skipPreflight: true` for all ER transactions
3. **Check Delegation**: Verify delegation status before sending to ER
4. **Wait for Propagation**: Wait 2-3 seconds after delegation
5. **Error Handling**: Implement fallback to base layer
6. **Performance Monitoring**: Track latency and costs

## 📚 Documentation

- **Main Guide**: `MAGICBLOCK_INTEGRATION_GUIDE.md`
- **Step-by-Step**: `MAGICBLOCK_IMPLEMENTATION_STEPS.md`
- **This File**: `MAGICBLOCK_QUICK_REFERENCE.md`

## 🔗 Links

- Docs: https://docs.magicblock.gg
- SDK: https://github.com/magicblock-labs/ephemeral-rollups-sdk
- Examples: https://github.com/magicblock-labs/magicblock-engine-examples
- Discord: https://discord.gg/magicblock
