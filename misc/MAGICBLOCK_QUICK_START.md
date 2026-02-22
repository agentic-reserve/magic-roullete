# MagicBlock Integration - Quick Start

## ✅ What's Done

Your `magic-roulette` program now has:
- ✅ Ephemeral Rollup support (sub-10ms latency, gasless)
- ✅ VRF integration (verifiable randomness)
- ✅ New instructions: `delegate_game`, `request_vrf_randomness`, `commit_game`, `undelegate_game`
- ✅ Updated Game state with VRF fields
- ✅ Program compiled successfully

## 🚀 Next Steps

### 1. Install MagicBlock SDK

```bash
npm install @magicblock-labs/ephemeral-rollups-sdk
```

### 2. Update Your Client Code

```typescript
import { Connection } from "@solana/web3.js";
import { 
  DELEGATION_PROGRAM_ID,
  createDelegateInstruction,
  createUndelegateInstruction 
} from "@magicblock-labs/ephemeral-rollups-sdk";

// CRITICAL: Use separate connections
const baseConnection = new Connection("https://api.devnet.solana.com");
const erConnection = new Connection("https://devnet-router.magicblock.app");

// Create separate program instances
const baseProgram = new Program(IDL, PROGRAM_ID, baseProvider);
const erProgram = new Program(IDL, PROGRAM_ID, erProvider);
```

### 3. Game Flow with ER

```typescript
// 1. Create game (base layer)
await baseProgram.methods.createGame(gameMode, entryFee, vrfSeed)
  .accounts({ /* ... */ })
  .rpc();

// 2. Delegate to ER
const delegateIx = createDelegateInstruction(gamePda, wallet.publicKey);
await baseProvider.sendAndConfirm(new Transaction().add(delegateIx));

// 3. Request VRF (on ER - fast & gasless)
await erProgram.methods.requestVrfRandomness()
  .accounts({ payer: wallet.publicKey, game: gamePda })
  .rpc({ skipPreflight: true });

// 4. Wait for VRF callback
const game = await erProgram.account.game.fetch(gamePda);
console.log("Random result:", game.vrfResult);

// 5. Play game (on ER - fast & gasless)
await erProgram.methods.takeShot()
  .accounts({ /* ... */ })
  .rpc({ skipPreflight: true });

// 6. Undelegate when done
const undelegateIx = createUndelegateInstruction(gamePda, wallet.publicKey);
await erProvider.sendAndConfirm(new Transaction().add(undelegateIx));

// 7. Finalize on base layer
await baseProgram.methods.finalizeGame()
  .accounts({ /* ... */ })
  .rpc();
```

## 📋 New Instructions

| Instruction | Where | Purpose |
|------------|-------|---------|
| `delegate_game` | Base | Move game to ER |
| `request_vrf_randomness` | ER | Get random number |
| `request_vrf_randomness_callback` | ER | Receive result |
| `take_shot` | ER | Play (fast & free) |
| `commit_game` | ER | Save state to base |
| `undelegate_game` | ER | Return to base |
| `finalize_game` | Base | Distribute prizes |

## 🎯 Key Benefits

- **10-50ms latency** (vs 400ms on base Solana)
- **Zero gas fees** during gameplay
- **Verifiable randomness** via VRF
- **Same security** as base layer

## 🔧 Testing

```bash
# Build
anchor build

# Deploy
anchor deploy

# Test
anchor test
```

## 📚 Resources

- Full guide: `MAGICBLOCK_INTEGRATION_COMPLETE.md`
- [MagicBlock Docs](https://docs.magicblock.gg)
- [SDK Reference](https://github.com/magicblock-labs/ephemeral-rollups-sdk)

## ⚠️ Important Notes

1. **Always use separate connections** for base and ER
2. **Use `skipPreflight: true`** for all ER transactions
3. **Check delegation status** before sending to ER
4. **VRF callbacks** typically arrive in 2-5 seconds
5. **Undelegate before finalizing** on base layer

---

**Status**: Ready for integration! Start with step 1 above.
