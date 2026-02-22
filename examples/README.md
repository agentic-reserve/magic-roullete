# Magic Roulette Examples

This directory contains example code demonstrating how to interact with the Magic Roulette program.

## Examples

### 1. MagicBlock Integration (`magicblock-integration.ts`)

Complete client implementation showing how to use MagicBlock Ephemeral Rollups for:
- Fast, gasless game execution
- Privacy-preserving gameplay with Intel TDX
- Sub-10ms latency
- Real-time game state subscriptions

**Features:**
- `MagicRouletteClient` class with full API
- Delegation to Ephemeral Rollup
- Game execution on ER
- State commit and finalization
- AI practice mode

**Usage:**
```typescript
import MagicRouletteClient from './examples/magicblock-integration';

const wallet = Keypair.generate();
const client = new MagicRouletteClient(wallet);

// Create game
const { gamePda } = await client.createGame(
  wallet,
  "oneVsOne",
  new BN(100_000_000),
  mintPublicKey
);

// Delegate to ER
await client.delegateGame(gamePda, wallet);

// Play on ER (fast!)
await client.takeShot(gamePda, wallet);

// Finalize
await client.finalizeGame(gamePda, wallet, mint, winner);
```

### 2. Simple Game Flow (`simple-game-flow.ts`)

End-to-end example without MagicBlock ER, running entirely on Solana base layer.
Perfect for testing core program logic.

**Steps:**
1. Create token mint
2. Initialize platform
3. Create 1v1 game
4. Player joins
5. Process VRF randomness
6. Play game (take shots)
7. Finalize and distribute prizes

**Run:**
```bash
# Start local validator
solana-test-validator

# In another terminal
ts-node examples/simple-game-flow.ts
```

## Key Concepts

### Delegation Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Create    │───▶│  Delegate   │───▶│   Execute   │───▶│  Finalize   │
│ (Base Layer)│    │   to ER     │    │    on ER    │    │ (Base Layer)│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Two Connection Pattern

Always maintain separate connections for base layer and ER:

```typescript
// Base layer (Solana)
const baseConnection = new Connection("https://api.devnet.solana.com");

// Ephemeral Rollup
const erConnection = new Connection("https://devnet.magicblock.app");
```

### Skip Preflight for ER

Always use `skipPreflight: true` for ER transactions:

```typescript
await erProgram.methods
  .takeShot()
  .accounts({ ... })
  .rpc({ skipPreflight: true });
```

## Testing Checklist

- [ ] Platform initialization
- [ ] Token mint creation
- [ ] Game creation (1v1, 2v2)
- [ ] Game joining
- [ ] Delegation to ER
- [ ] VRF randomness
- [ ] Taking shots
- [ ] Game completion
- [ ] Prize distribution
- [ ] AI practice mode
- [ ] Error handling

## Common Issues

### 1. Delegation Timeout
**Problem:** Game not delegating to ER
**Solution:** 
- Check ER endpoint is correct
- Verify account has enough SOL for rent
- Increase timeout in `waitForDelegation()`

### 2. Account Not Delegated
**Problem:** Trying to execute on ER before delegation completes
**Solution:**
- Always wait for `isDelegated()` to return true
- Use `waitForDelegation()` helper

### 3. Token Account Errors
**Problem:** Token account doesn't exist
**Solution:**
- Create associated token accounts before transactions
- Use `getAssociatedTokenAddress()` to derive correct address

### 4. VRF Authority
**Problem:** Invalid VRF authority error
**Solution:**
- Use proper VRF authority from MagicBlock
- For testing, any signer works (constraint not enforced yet)

## Next Steps

1. **Deploy to Devnet**
   ```bash
   anchor build
   anchor deploy --provider.cluster devnet
   ```

2. **Update Program ID**
   - Update `PROGRAM_ID` in examples
   - Update `declare_id!()` in `lib.rs`
   - Rebuild and redeploy

3. **Set Up MagicBlock**
   - Get devnet access
   - Configure ER endpoints
   - Test delegation flow

4. **Integrate VRF**
   - Set up MagicBlock VRF
   - Configure callback
   - Test randomness

5. **Build Frontend**
   - Use `MagicRouletteClient` class
   - Add wallet connection
   - Real-time updates via subscriptions

## Resources

- **MagicBlock Docs**: https://docs.magicblock.gg
- **Anchor Docs**: https://www.anchor-lang.com
- **Solana Cookbook**: https://solanacookbook.com
- **SPL Token**: https://spl.solana.com/token

## Support

For issues or questions:
1. Check `IMPLEMENTATION_STATUS.md` for known issues
2. Review MagicBlock documentation
3. Test with `simple-game-flow.ts` first
4. Use `magicblock-integration.ts` for ER features
