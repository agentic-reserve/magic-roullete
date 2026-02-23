# Magic Roulette - Next Steps Guide

## Current Status

✅ **Completed:**
- Wallet integration (Mobile + Web/Desktop)
- Seeker detection system (Platform check + SGT verification)
- Platform initialization scripts
- Game creation scripts (needs testing)
- Complete documentation suite
- Code pushed to GitHub

⏳ **In Progress:**
- Testing game creation and full game flow

## Immediate Next Steps

### 1. Start Local Validator

The localnet validator needs to be running for testing. Open a new terminal and run:

```bash
# Start validator with program loaded
solana-test-validator \
  --bpf-program HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam \
  target/deploy/magic_roulette.so \
  --reset
```

**Important:** Keep this terminal open. The validator must stay running for all tests.

### 2. Verify Platform Initialization

Check if platform is already initialized:

```bash
node scripts/test-connection.js
```

Expected output should show:
- ✅ Connection successful
- ✅ Wallet loaded
- ✅ Program loaded
- ✅ Platform Config exists

If platform is NOT initialized, run:

```bash
node scripts/simple-init.js
```

### 3. Test Game Creation

Once validator is running and platform is initialized:

```bash
# Test 1v1 game creation
node scripts/simple-create-game.js
```

**Expected Results:**
- ✅ 1v1 game created with entry fee
- ✅ Game PDA derived correctly
- ✅ Game state shows: creator, mode, status
- ❌ AI game creation will fail (needs fixing)

### 4. Fix AI Game Creation

The AI game creation has an issue - it's using the wrong PDA derivation. The script currently uses:

```javascript
const aiGameId = new anchor.BN(Date.now() + 1000);  // ❌ Wrong!
```

But it should use `platform_config.total_games` like the 1v1 game does.

**Fix needed in `scripts/simple-create-game.js`:**

```javascript
// After 1v1 game creation, fetch updated config
const updatedConfig = await program.account.platformConfig.fetch(platformConfig);
const aiGameId = updatedConfig.totalGames;  // ✅ Correct!

const [aiGamePda] = PublicKey.findProgramAddressSync(
  [Buffer.from("game"), aiGameId.toArrayLike(Buffer, "le", 8)],
  programId
);

// Also need to add aiBot account
// Check the Rust instruction to see what aiBot should be
```

### 5. Test Game Joining

Create a script to test joining games:

```bash
# Create test script
node scripts/test-join-game.js
```

**What it should do:**
1. Create a new test player keypair
2. Airdrop SOL to test player
3. Fetch an existing game
4. Join the game with test player
5. Verify game state updated (team counts)

### 6. Test Complete Game Flow

Once creation and joining work, test the full flow:

1. **Create game** (Player 1)
2. **Join game** (Player 2)
3. **Delegate to ER** (if using MagicBlock)
4. **Process VRF** (get random bullet chamber)
5. **Take shots** (players alternate)
6. **Finalize game** (distribute prizes)

## Testing Checklist

### Platform Setup
- [ ] Validator running
- [ ] Platform initialized
- [ ] Platform config verified (fees, treasury)

### Game Creation
- [ ] 1v1 SOL game creation works
- [ ] AI practice game creation works
- [ ] Game PDA derivation correct
- [ ] Game state properly initialized

### Game Joining
- [ ] Player can join existing game
- [ ] Entry fee transferred correctly
- [ ] Team counts updated
- [ ] Game status changes to Ready

### Game Execution
- [ ] VRF randomness processed
- [ ] Players can take shots
- [ ] Bullet chamber logic works
- [ ] Game ends when player eliminated

### Prize Distribution
- [ ] Winner receives prize pool
- [ ] Platform fee deducted
- [ ] Treasury fee allocated
- [ ] Vault emptied correctly

### AI Games
- [ ] AI game creation (free)
- [ ] AI bot takes shots
- [ ] No prizes distributed
- [ ] Practice mode flag set

## Common Issues & Solutions

### Issue: "Connection refused" error
**Solution:** Start the local validator first (see Step 1)

### Issue: "Account does not exist" for platform config
**Solution:** Run `node scripts/simple-init.js` to initialize platform

### Issue: "PDA seed constraint" error
**Solution:** Make sure you're using `platform_config.total_games` for game ID, not a custom ID

### Issue: AI game creation fails
**Solution:** Check the Rust instruction for `create_ai_game` - it may need an `aiBot` account parameter

### Issue: Game joining fails
**Solution:** Verify:
- Game exists and is in WaitingForPlayers status
- Player has enough SOL for entry fee
- Player isn't already in the game

## File References

### Scripts
- `scripts/test-connection.js` - Verify setup
- `scripts/simple-init.js` - Initialize platform
- `scripts/simple-create-game.js` - Create games (needs AI fix)
- `scripts/init-platform-devnet.js` - Devnet initialization
- `scripts/create-test-game-devnet.js` - Devnet game creation

### Documentation
- `WALLET_INTEGRATION_COMPLETE.md` - Wallet setup guide
- `DEVNET_DEPLOYMENT_GUIDE.md` - Devnet deployment
- `ALTERNATIVE_TESTING_GUIDE.md` - Troubleshooting
- `misc/IMPLEMENTATION_STATUS.md` - Overall status

### Program Files
- `programs/magic-roulette/src/instructions/create_game_sol.rs` - 1v1 game creation
- `programs/magic-roulette/src/instructions/create_ai_game.rs` - AI game creation
- `programs/magic-roulette/src/instructions/join_game.rs` - Join game logic
- `programs/magic-roulette/src/state.rs` - State structures

## Network Configuration

### Current Setup (Localnet)
- RPC: `http://localhost:8899`
- Wallet: `BUBk7ywKijkH46o3f8PPG9q1oCqEo4TN5WrBLaEedTxq`
- Balance: 500M SOL
- Program ID: `HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam`

### Switching to Devnet
If you want to test on devnet instead:

```bash
# Switch to devnet
solana config set --url devnet

# Check balance
solana balance

# If low, use devnet-pow (if network is working)
devnet-pow mine --target-lamports 5000000000 -u

# Or use alternative methods in DEVNET_DEPLOYMENT_GUIDE.md
```

## What to Do Next

**Recommended order:**

1. ✅ Start validator (Step 1)
2. ✅ Verify platform (Step 2)
3. ✅ Test 1v1 game creation (Step 3)
4. 🔧 Fix AI game creation (Step 4)
5. 🔧 Create join game test (Step 5)
6. 🔧 Test full game flow (Step 6)

Once all tests pass on localnet, you can:
- Deploy to devnet
- Build the React Native frontend
- Integrate MagicBlock ER for real-time gameplay
- Add VRF for true randomness
- Deploy to mainnet

## Questions?

If you encounter issues:
1. Check the error logs carefully
2. Verify validator is running
3. Check platform config exists
4. Review the Rust instruction code
5. Look at `ALTERNATIVE_TESTING_GUIDE.md` for troubleshooting

---

**Last Updated:** Based on conversation summary
**Platform Status:** Initialized on localnet
**Next Priority:** Test game creation with running validator
