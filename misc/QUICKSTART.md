# MagicBlock + VRF Quick Start

Get up and running in 5 minutes.

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Build Program

```bash
anchor build
```

## Step 3: Update Program IDs

```bash
# Get your program ID
anchor keys list

# You'll see:
# magicblock_vrf: <YOUR_PROGRAM_ID>
```

Update the program ID in these files:
1. `Anchor.toml` - Line 7: `magicblock_vrf = "YOUR_PROGRAM_ID"`
2. `programs/magicblock-vrf/src/lib.rs` - Line 6: `declare_id!("YOUR_PROGRAM_ID");`
3. `client/magicblock-client.ts` - Line 6: `PROGRAM_ID: new PublicKey("YOUR_PROGRAM_ID")`

```bash
# Rebuild after updating IDs
anchor build
```

## Step 4: Deploy

```bash
# Make sure you have SOL in your wallet
solana balance

# If not, airdrop (devnet only)
solana airdrop 2

# Deploy
anchor deploy
```

## Step 5: Test

```bash
# Run example
npm run example
```

## What You Get

- **Ephemeral Rollup Integration**: Sub-10ms latency, gasless transactions
- **VRF Support**: Verifiable on-chain randomness
- **Full Client**: TypeScript client with all operations
- **Real-time Updates**: WebSocket subscriptions

## Key Operations

### Initialize & Delegate
```typescript
const client = new MagicBlockVRFClient(wallet, IDL);
const { gamePda } = await client.initialize();
await client.delegate(gamePda);
```

### Roll Dice (1-6)
```typescript
const result = await client.rollDice(gamePda);
// Returns: 1, 2, 3, 4, 5, or 6
```

### Random in Range
```typescript
const random = await client.randomInRange(gamePda, 1, 100);
// Returns: 1-100
```

### Subscribe to Updates
```typescript
client.subscribeToGame(gamePda, (state) => {
  console.log("Roll:", state.lastRoll.toString());
});
```

## Architecture Flow

```
1. Initialize (Base Layer)
   ↓
2. Delegate to ER
   ↓
3. Execute on ER (fast, gasless)
   - Roll dice
   - Random in range
   ↓
4. VRF callback delivers randomness
   ↓
5. Undelegate when done
```

## Troubleshooting

### "Program not deployed"
```bash
anchor deploy
```

### "Insufficient funds"
```bash
solana airdrop 2
```

### "Account not found"
Make sure you've initialized before delegating:
```typescript
await client.initialize();
await client.delegate(gamePda);
```

### "VRF timeout"
VRF callbacks typically arrive in 2-5 seconds. If timeout:
- Check ER connection: `https://devnet-router.magicblock.app`
- Verify account is delegated: `await client.isDelegated(gamePda)`

## Next Steps

1. Customize game logic in `programs/magicblock-vrf/src/lib.rs`
2. Add more VRF patterns (weighted random, multiple values, etc.)
3. Build your UI with real-time subscriptions
4. Deploy to mainnet when ready

## Resources

- [MagicBlock Docs](https://docs.magicblock.gg)
- [VRF Examples](https://github.com/magicblock-labs/magicblock-engine-examples)
- [Discord Support](https://discord.gg/magicblock)
