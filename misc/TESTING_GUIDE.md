# Magic Roulette - Complete Testing Guide

## Prerequisites

Before running any tests, ensure you have:

1. ✅ Solana CLI installed (`solana --version`)
2. ✅ Anchor CLI installed (`anchor --version`)
3. ✅ Node.js installed (`node --version`)
4. ✅ Program built (`anchor build`)
5. ✅ Dependencies installed (`npm install`)

## Step-by-Step Testing Process

### Step 1: Start Local Validator

Open a **new terminal** and keep it running:

```bash
# Start validator with program loaded
solana-test-validator \
  --bpf-program HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam \
  target/deploy/magic_roulette.so \
  --reset
```

**Expected output:**
```
Ledger location: test-ledger
Log: test-ledger/validator.log
⠁ Initializing...
```

**Keep this terminal open!** The validator must stay running for all tests.

### Step 2: Verify Connection

In your main terminal:

```bash
node scripts/test-connection.js
```

**Expected output:**
```
🔍 Testing Magic Roulette Connection
====================================

✅ Connection successful
   Cluster: http://localhost:8899
   Version: 1.18.x

✅ Wallet loaded
   Address: BUBk7ywKijkH46o3f8PPG9q1oCqEo4TN5WrBLaEedTxq
   Balance: 500000000 SOL

✅ Program loaded
   Program ID: HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam
   IDL: magic_roulette.json

✅ Platform Config exists
   Address: D2foAR2UbNF3Mm85NGuKbAG1LtDehLxNpMWj89FMUdZR
   Status: Ready
```

If platform config doesn't exist, continue to Step 3. Otherwise, skip to Step 4.

### Step 3: Initialize Platform (If Needed)

Only run this if platform config doesn't exist:

```bash
node scripts/simple-init.js
```

**Expected output:**
```
🚀 Initialize Platform
=====================

Wallet: BUBk7ywKijkH46o3f8PPG9q1oCqEo4TN5WrBLaEedTxq

✅ Platform initialized!
   TX: [transaction_signature]
   Platform Config: D2foAR2UbNF3Mm85NGuKbAG1LtDehLxNpMWj89FMUdZR
   Platform Fee: 5%
   Treasury Fee: 10%
   Total Games: 0
   Status: Ready
```

### Step 4: Create Test Games

```bash
node scripts/simple-create-game.js
```

**Expected output:**
```
🎮 Create Test Game
===================

Wallet: BUBk7ywKijkH46o3f8PPG9q1oCqEo4TN5WrBLaEedTxq

📝 Creating 1v1 Game (SOL-based)...
Next Game ID: 0

✅ Game created!
   TX: [transaction_signature]
   Game PDA: [game_address]
   Game ID: 0
   Entry Fee: 0.1 SOL

📊 Game State:
   Creator: BUBk7ywKijkH46o3f8PPG9q1oCqEo4TN5WrBLaEedTxq
   Mode: 1v1
   Team A: 1
   Team B: 0
   Status: waitingForPlayers
   AI Game: false
   Practice: false

📝 Creating AI Practice Game...
Next AI Game ID: 1

✅ AI Game created!
   TX: [transaction_signature]
   Game PDA: [ai_game_address]

📊 AI Game State:
   Player: BUBk7ywKijkH46o3f8PPG9q1oCqEo4TN5WrBLaEedTxq
   AI Game: true
   Practice: true
   Entry Fee: 0 (free)

✅ Complete
```

### Step 5: Test Joining a Game

```bash
node scripts/test-join-game.js
```

**Expected output:**
```
🎮 Test Join Game
=================

Main Wallet: BUBk7ywKijkH46o3f8PPG9q1oCqEo4TN5WrBLaEedTxq

📝 Creating test player...
Test Player: [new_player_address]

💰 Airdropping SOL to test player...
   Balance: 5 SOL

📊 Platform Status:
   Total Games: 2

📝 Fetching game state...
   Game ID: 0
   Creator: BUBk7ywKijkH46o3f8PPG9q1oCqEo4TN5WrBLaEedTxq
   Entry Fee: 0.1 SOL
   Status: waitingForPlayers
   Team A Count: 1
   Team B Count: 0

📝 Joining game as test player...

✅ Joined game!
   TX: [transaction_signature]

📊 Updated Game State:
   Team A Count: 1
   Team B Count: 1
   Status: ready
   Total Pot: 0.2 SOL

👥 Players:
   Team A:
     [0] BUBk7ywKijkH46o3f8PPG9q1oCqEo4TN5WrBLaEedTxq
   Team B:
     [0] [test_player_address]

✅ Complete
```

## Testing Checklist

Use this checklist to track your testing progress:

### Platform Setup
- [ ] Validator started successfully
- [ ] Connection test passes
- [ ] Platform initialized
- [ ] Platform config verified (5% platform fee, 10% treasury fee)

### Game Creation
- [ ] 1v1 SOL game created successfully
- [ ] Game PDA derived correctly using `platform_config.total_games`
- [ ] Game state initialized properly (creator, mode, status)
- [ ] Entry fee set correctly (0.1 SOL)
- [ ] AI practice game created successfully
- [ ] AI game is free (0 entry fee)
- [ ] AI game has practice mode flag set

### Game Joining
- [ ] Test player created and funded
- [ ] Player can join existing game
- [ ] Entry fee transferred to game vault
- [ ] Team counts updated correctly
- [ ] Game status changes to "ready" when full
- [ ] Total pot calculated correctly (sum of entry fees)

### Game State Verification
- [ ] Game creator recorded correctly
- [ ] Game mode set properly (1v1, 2v2, or AI)
- [ ] Teams populated correctly
- [ ] Status transitions work (WaitingForPlayers → Ready)
- [ ] VRF seed stored
- [ ] Timestamps recorded

## Common Issues & Solutions

### Issue: "Connection refused" (ECONNREFUSED)
**Cause:** Local validator is not running

**Solution:**
```bash
# In a new terminal, start the validator
solana-test-validator \
  --bpf-program HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam \
  target/deploy/magic_roulette.so \
  --reset
```

### Issue: "Account does not exist" for platform config
**Cause:** Platform not initialized

**Solution:**
```bash
node scripts/simple-init.js
```

### Issue: "PDA seed constraint" error
**Cause:** Using wrong game ID for PDA derivation

**Solution:** Always use `platform_config.total_games` for the next game ID:
```javascript
const config = await program.account.platformConfig.fetch(platformConfig);
const gameId = config.totalGames;  // ✅ Correct!
```

### Issue: AI game creation fails with "missing account"
**Cause:** Missing `aiBot` account parameter

**Solution:** The script now includes an AI bot keypair:
```javascript
const aiBot = Keypair.generate();
// ... in accounts:
aiBot: aiBot.publicKey,
```

### Issue: "Game is not accepting players"
**Cause:** Game status is not "WaitingForPlayers"

**Solution:** Create a new game or check game status:
```bash
node scripts/simple-create-game.js
```

### Issue: "Insufficient funds" when joining
**Cause:** Test player doesn't have enough SOL

**Solution:** The script airdrops 5 SOL automatically. If it fails:
```bash
# Manually airdrop
solana airdrop 5 [test_player_address] --url localhost
```

## Next Steps After Basic Tests Pass

Once all basic tests pass, you can proceed to:

### 1. Test VRF Processing
Create a script to test VRF randomness:
- Process VRF result
- Verify bullet chamber is set
- Check VRF fulfilled flag

### 2. Test Game Execution
Create a script to test taking shots:
- Player takes shot
- Check if bullet chamber hit
- Verify turn rotation
- Test game completion

### 3. Test Prize Distribution
Create a script to test finalization:
- Finalize completed game
- Verify winner receives prize
- Check platform fee deduction
- Verify treasury fee allocation
- Confirm vault is emptied

### 4. Test AI Game Flow
Create a script to test AI gameplay:
- Create AI game
- Player takes shot
- AI bot takes shot
- Verify no prizes distributed
- Check practice mode flag

### 5. Deploy to Devnet
Once all tests pass on localnet:
```bash
# Switch to devnet
solana config set --url devnet

# Deploy program
anchor deploy --provider.cluster devnet

# Initialize platform on devnet
node scripts/init-platform-devnet.js

# Create test games on devnet
node scripts/create-test-game-devnet.js
```

## Advanced Testing

### Load Testing
Test with multiple concurrent games:
```bash
# Create 10 games simultaneously
for i in {1..10}; do
  node scripts/simple-create-game.js &
done
wait
```

### Stress Testing
Test with many players joining:
```bash
# Create 100 test players and join games
node scripts/stress-test.js
```

### Edge Cases
Test error conditions:
- Joining a full game
- Joining with insufficient funds
- Taking shot out of turn
- Finalizing unfinished game
- Double-joining same game

## Monitoring & Debugging

### View Validator Logs
```bash
# In validator terminal, logs are shown in real-time
# Or view log file:
tail -f test-ledger/validator.log
```

### View Program Logs
```bash
# Program logs are shown in transaction output
# Or use Solana Explorer (localnet):
solana confirm -v [transaction_signature] --url localhost
```

### Check Account Data
```bash
# View platform config
solana account [platform_config_address] --url localhost

# View game account
solana account [game_pda_address] --url localhost
```

### Debug with Anchor
```bash
# Run with verbose logging
RUST_LOG=debug anchor test
```

## Test Scripts Reference

| Script | Purpose | Prerequisites |
|--------|---------|---------------|
| `test-connection.js` | Verify setup | Validator running |
| `simple-init.js` | Initialize platform | Validator running |
| `simple-create-game.js` | Create test games | Platform initialized |
| `test-join-game.js` | Test joining games | Games created |
| `init-platform-devnet.js` | Initialize on devnet | Devnet SOL |
| `create-test-game-devnet.js` | Create games on devnet | Platform on devnet |

## Success Criteria

Your testing is complete when:

✅ All scripts run without errors
✅ Platform config exists and is correct
✅ Games can be created (1v1 and AI)
✅ Players can join games
✅ Game state updates correctly
✅ Entry fees are transferred
✅ Team counts are accurate
✅ Status transitions work

Once these pass, you're ready for advanced testing and devnet deployment!

---

**Last Updated:** Based on current implementation
**Network:** Localnet (http://localhost:8899)
**Program ID:** HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam
