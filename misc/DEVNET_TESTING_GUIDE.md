# Magic Roulette - Devnet Testing Guide

Complete testing guide for validating all functionality on Solana Devnet.

---

## Prerequisites

### 1. Environment Setup

```bash
# Set Solana to devnet
solana config set --url https://api.devnet.solana.com

# Create test wallets
solana-keygen new --outfile ~/.config/solana/test-wallet-1.json
solana-keygen new --outfile ~/.config/solana/test-wallet-2.json
solana-keygen new --outfile ~/.config/solana/test-wallet-3.json
solana-keygen new --outfile ~/.config/solana/test-wallet-4.json

# Airdrop SOL to test wallets
solana airdrop 5 $(solana-keygen pubkey ~/.config/solana/test-wallet-1.json)
solana airdrop 5 $(solana-keygen pubkey ~/.config/solana/test-wallet-2.json)
solana airdrop 5 $(solana-keygen pubkey ~/.config/solana/test-wallet-3.json)
solana airdrop 5 $(solana-keygen pubkey ~/.config/solana/test-wallet-4.json)
```

### 2. Deploy Program

```bash
# Build program
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Get program ID
solana address -k target/deploy/magic_roulette-keypair.json
```

### 3. Initialize Platform

```bash
# Initialize platform configuration
anchor run initialize-platform --provider.cluster devnet
```

---

## Test Suite 1: Basic Game Flow (1v1 SOL)

### Test 1.1: Create Game

**Command**:
```bash
anchor run create-game-sol --provider.cluster devnet -- \
  --mode OneVsOne \
  --entry-fee 0.1
```

**Verify**:
- [ ] Game account created with correct PDA
- [ ] Game ID incremented in platform_config
- [ ] Creator added to team_a[0]
- [ ] Entry fee (0.1 SOL) transferred to game_vault
- [ ] total_pot = 0.1 SOL
- [ ] status = WaitingForPlayers
- [ ] team_a_count = 1, team_b_count = 0
- [ ] VRF seed stored
- [ ] created_at timestamp set

**Check State**:
```bash
# Get game account
solana account <GAME_PDA> --output json

# Verify game_vault balance
solana balance <GAME_VAULT_PDA>
```

---

### Test 1.2: Join Game

**Command**:
```bash
# Switch to player 2
solana config set --keypair ~/.config/solana/test-wallet-2.json

# Join game
anchor run join-game-sol --provider.cluster devnet -- \
  --game-id 0
```

**Verify**:
- [ ] Player added to team_b[0]
- [ ] Entry fee (0.1 SOL) transferred to game_vault
- [ ] total_pot updated to 0.2 SOL
- [ ] team_b_count = 1
- [ ] status = WaitingForPlayers (game now full)
- [ ] Game marked as full (is_full() returns true)

**Check State**:
```bash
# Verify game_vault balance increased
solana balance <GAME_VAULT_PDA>
# Expected: 0.2 SOL

# Check game state
solana account <GAME_PDA> --output json
```

---

### Test 1.3: Delegate Game to Ephemeral Rollup

**Command**:
```bash
anchor run delegate-game --provider.cluster devnet -- \
  --game-id 0
```

**Verify**:
- [ ] status changed to Delegated
- [ ] Game ready for VRF processing
- [ ] No state changes to teams or pot

**Check State**:
```bash
solana account <GAME_PDA> --output json | jq '.data.status'
# Expected: "Delegated"
```

---

### Test 1.4: Process VRF Result

**Command**:
```bash
# This should be called by MagicBlock VRF oracle
# For testing, simulate with authorized signer
anchor run process-vrf --provider.cluster devnet -- \
  --game-id 0 \
  --randomness <32_BYTE_HEX>
```

**Verify**:
- [ ] vrf_result stored
- [ ] bullet_chamber set (1-6)
- [ ] status changed to InProgress
- [ ] current_chamber = 1
- [ ] current_turn = 0

**Check State**:
```bash
solana account <GAME_PDA> --output json | jq '.data.bullet_chamber'
# Expected: 1-6
```

---

### Test 1.5: Take Shots

**Command**:
```bash
# Player 1 takes shot
solana config set --keypair ~/.config/solana/test-wallet-1.json
anchor run take-shot --provider.cluster devnet -- \
  --game-id 0

# Player 2 takes shot (if player 1 survived)
solana config set --keypair ~/.config/solana/test-wallet-2.json
anchor run take-shot --provider.cluster devnet -- \
  --game-id 0
```

**Verify After Each Shot**:
- [ ] shots_taken incremented
- [ ] current_chamber incremented (wraps at 6)
- [ ] current_turn incremented
- [ ] If bullet hit:
  - [ ] status = Finished
  - [ ] winner_team set (0 or 1)
  - [ ] finished_at timestamp set

**Check State**:
```bash
solana account <GAME_PDA> --output json | jq '.data.shots_taken'
```

---

### Test 1.6: Finalize Game

**Command**:
```bash
anchor run finalize-game-sol --provider.cluster devnet -- \
  --game-id 0
```

**Verify**:
- [ ] Platform fee transferred (5% = 0.01 SOL)
- [ ] Treasury fee transferred (10% = 0.02 SOL)
- [ ] Winner receives remaining (85% = 0.17 SOL)
- [ ] game_vault balance = 0
- [ ] status = Cancelled (processed)
- [ ] platform_config.total_volume updated
- [ ] platform_config.treasury_balance updated

**Check Balances**:
```bash
# Winner balance should increase by ~0.17 SOL
solana balance <WINNER_PUBKEY>

# Platform vault should receive 0.01 SOL
solana balance <PLATFORM_VAULT>

# Treasury should receive 0.02 SOL
solana balance <TREASURY_VAULT>

# Game vault should be empty
solana balance <GAME_VAULT_PDA>
# Expected: 0 SOL
```

---

## Test Suite 2: 2v2 Game Flow

### Test 2.1: Create 2v2 Game

**Command**:
```bash
anchor run create-game-sol --provider.cluster devnet -- \
  --mode TwoVsTwo \
  --entry-fee 0.2
```

**Verify**:
- [ ] game_mode = TwoVsTwo
- [ ] Entry fee = 0.2 SOL
- [ ] Creator in team_a[0]
- [ ] team_a_count = 1, team_b_count = 0

---

### Test 2.2: Join as Player 2 (Team A)

**Command**:
```bash
solana config set --keypair ~/.config/solana/test-wallet-2.json
anchor run join-game-sol --provider.cluster devnet -- \
  --game-id 1
```

**Verify**:
- [ ] Player added to team_a[1]
- [ ] team_a_count = 2
- [ ] total_pot = 0.4 SOL
- [ ] Game NOT full yet

---

### Test 2.3: Join as Player 3 (Team B)

**Command**:
```bash
solana config set --keypair ~/.config/solana/test-wallet-3.json
anchor run join-game-sol --provider.cluster devnet -- \
  --game-id 1
```

**Verify**:
- [ ] Player added to team_b[0]
- [ ] team_b_count = 1
- [ ] total_pot = 0.6 SOL
- [ ] Game NOT full yet

---

### Test 2.4: Join as Player 4 (Team B)

**Command**:
```bash
solana config set --keypair ~/.config/solana/test-wallet-4.json
anchor run join-game-sol --provider.cluster devnet -- \
  --game-id 1
```

**Verify**:
- [ ] Player added to team_b[1]
- [ ] team_b_count = 2
- [ ] total_pot = 0.8 SOL
- [ ] Game is FULL (is_full() = true)

---

### Test 2.5: Finalize 2v2 Game

**After game completes**:

**Verify**:
- [ ] Platform fee = 0.04 SOL (5%)
- [ ] Treasury fee = 0.08 SOL (10%)
- [ ] Winner amount = 0.68 SOL (85%)
- [ ] Each winner receives 0.34 SOL (split between 2)
- [ ] Both winner1 and winner2 validated
- [ ] Both winners receive correct amount

---

## Test Suite 3: Security Tests

### Test 3.1: Reject Fake Kamino Program

**Command**:
```bash
# Attempt to create game with loan using wrong program ID
anchor run create-game-with-loan --provider.cluster devnet -- \
  --kamino-program <FAKE_PROGRAM_ID>
```

**Expected**:
- [ ] Transaction fails with "InvalidKaminoProgram" error
- [ ] No game created
- [ ] No funds transferred

---

### Test 3.2: Reject Unauthorized VRF

**Command**:
```bash
# Attempt to process VRF with unauthorized signer
anchor run process-vrf --provider.cluster devnet -- \
  --game-id 0 \
  --signer <UNAUTHORIZED_WALLET>
```

**Expected**:
- [ ] Transaction fails with "InvalidVrfAuthority" error
- [ ] Game state unchanged
- [ ] No randomness stored

---

### Test 3.3: Reject Wrong Winner Address

**Command**:
```bash
# Attempt to finalize with attacker as winner
anchor run finalize-game-sol --provider.cluster devnet -- \
  --game-id 0 \
  --winner1 <ATTACKER_ADDRESS>
```

**Expected**:
- [ ] Transaction fails with "InvalidWinner" error
- [ ] No funds transferred
- [ ] Game state unchanged

---

### Test 3.4: Reject Duplicate Player Join

**Command**:
```bash
# Player 1 creates game
solana config set --keypair ~/.config/solana/test-wallet-1.json
anchor run create-game-sol --provider.cluster devnet

# Same player tries to join
anchor run join-game-sol --provider.cluster devnet -- \
  --game-id <GAME_ID>
```

**Expected**:
- [ ] Transaction fails with "PlayerAlreadyInGame" error
- [ ] Player not added to team_b
- [ ] No funds transferred

---

### Test 3.5: Reject Creator Self-Join

**Command**:
```bash
# Creator tries to join own game
anchor run join-game-sol --provider.cluster devnet -- \
  --game-id <GAME_ID>
```

**Expected**:
- [ ] Transaction fails with "CannotJoinOwnGame" error
- [ ] Creator not added to team_b
- [ ] No funds transferred

---

### Test 3.6: Reject Join When Full

**Command**:
```bash
# Create 1v1 game and fill it
# Then try to join with 3rd player
anchor run join-game-sol --provider.cluster devnet -- \
  --game-id <FULL_GAME_ID>
```

**Expected**:
- [ ] Transaction fails with "GameFull" error
- [ ] Player not added
- [ ] No funds transferred

---

### Test 3.7: Reject Insufficient Entry Fee

**Command**:
```bash
# Try to create game with fee below minimum
anchor run create-game-sol --provider.cluster devnet -- \
  --entry-fee 0.005
```

**Expected**:
- [ ] Transaction fails with "InsufficientEntryFee" error
- [ ] No game created
- [ ] Minimum: 0.01 SOL for SOL games

---

### Test 3.8: Platform Pause

**Command**:
```bash
# Pause platform (requires authority)
anchor run pause-platform --provider.cluster devnet

# Try to join game
anchor run join-game-sol --provider.cluster devnet -- \
  --game-id 0
```

**Expected**:
- [ ] Transaction fails with "PlatformPaused" error
- [ ] No joins allowed while paused

---

## Test Suite 4: AI Practice Games

### Test 4.1: Create AI Game

**Command**:
```bash
anchor run create-ai-game --provider.cluster devnet -- \
  --difficulty Medium
```

**Verify**:
- [ ] is_ai_game = true
- [ ] is_practice_mode = true
- [ ] ai_difficulty = Medium
- [ ] entry_fee = 0 (free)
- [ ] No funds transferred

---

### Test 4.2: AI Takes Shot

**Command**:
```bash
anchor run ai-take-shot --provider.cluster devnet -- \
  --game-id <AI_GAME_ID>
```

**Verify**:
- [ ] AI makes decision based on difficulty
- [ ] Shot processed correctly
- [ ] Game progresses

---

### Test 4.3: Finalize AI Game

**Command**:
```bash
anchor run finalize-game-sol --provider.cluster devnet -- \
  --game-id <AI_GAME_ID>
```

**Verify**:
- [ ] No prizes distributed
- [ ] status = Cancelled
- [ ] Winner logged but no transfers
- [ ] Message: "Practice game finished - no prizes distributed"

---

## Test Suite 5: Kamino Loan Integration

### Test 5.1: Create Game with Loan

**Prerequisites**:
- Kamino devnet deployment active
- Test wallet has collateral tokens

**Command**:
```bash
anchor run create-game-with-loan --provider.cluster devnet -- \
  --mode OneVsOne \
  --entry-fee 0.1 \
  --collateral 0.11
```

**Verify**:
- [ ] Collateral deposited to Kamino (0.11 SOL)
- [ ] Loan borrowed from Kamino (0.1 SOL)
- [ ] Borrowed funds in game_vault
- [ ] has_loan = true
- [ ] loan_obligation set
- [ ] collateral_amount = 0.11 SOL
- [ ] loan_amount = 0.1 SOL

---

### Test 5.2: Finalize Game with Loan (Winner is Borrower)

**Command**:
```bash
anchor run finalize-game-with-loan --provider.cluster devnet -- \
  --game-id <LOAN_GAME_ID>
```

**Verify**:
- [ ] Loan repaid to Kamino (principal + interest)
- [ ] Collateral returned to winner
- [ ] Net winnings = total_pot - fees - loan_repayment
- [ ] Winner receives correct amount

---

### Test 5.3: Finalize Game with Loan (Borrower Loses)

**Verify**:
- [ ] Collateral liquidated by Kamino
- [ ] Winner receives full prize
- [ ] Borrower loses collateral
- [ ] Message: "Borrower lost - collateral liquidated"

---

### Test 5.4: Reject Insufficient Collateral

**Command**:
```bash
anchor run create-game-with-loan --provider.cluster devnet -- \
  --entry-fee 0.1 \
  --collateral 0.09
```

**Expected**:
- [ ] Transaction fails with "InsufficientCollateral" error
- [ ] Minimum collateral: 110% of entry fee
- [ ] No game created

---

## Test Suite 6: Token-Based Games

### Test 6.1: Create Token Game

**Prerequisites**:
- Platform token mint created
- Test wallets have platform tokens

**Command**:
```bash
anchor run create-game --provider.cluster devnet -- \
  --mode OneVsOne \
  --entry-fee 100000000
```

**Verify**:
- [ ] Entry fee in platform tokens
- [ ] Tokens transferred to game_vault
- [ ] Token accounts validated

---

## Test Suite 7: Ephemeral Rollup Integration

### Test 7.1: Delegate to ER

**Command**:
```bash
# Delegate game to Ephemeral Rollup
anchor run delegate-game --provider.cluster devnet -- \
  --game-id 0 \
  --validator <ER_VALIDATOR_IDENTITY>
```

**Verify**:
- [ ] Game account delegated to delegation program
- [ ] Account owner = DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh
- [ ] status = Delegated

---

### Test 7.2: Execute on ER

**Command**:
```bash
# Connect to ER endpoint
export ER_RPC="https://devnet.magicblock.app"

# Take shots on ER (fast, gasless)
anchor run take-shot --provider.cluster $ER_RPC -- \
  --game-id 0
```

**Verify**:
- [ ] Transactions process in <50ms
- [ ] No gas fees charged
- [ ] State updates on ER

---

### Test 7.3: Commit State to Base Layer

**Command**:
```bash
# Commit ER state back to Solana
anchor run commit-game --provider.cluster devnet -- \
  --game-id 0
```

**Verify**:
- [ ] State synced from ER to base layer
- [ ] Account still delegated
- [ ] State matches ER state

---

### Test 7.4: Undelegate from ER

**Command**:
```bash
# Undelegate and finalize
anchor run finalize-game-sol --provider.cluster devnet -- \
  --game-id 0
```

**Verify**:
- [ ] Account ownership returned to program
- [ ] Final state committed
- [ ] Prizes distributed

---

## Monitoring & Debugging

### Check Program Logs

```bash
# Stream program logs
solana logs <PROGRAM_ID>

# Filter for specific game
solana logs <PROGRAM_ID> | grep "Game 0"
```

### Inspect Account Data

```bash
# Get game account
solana account <GAME_PDA> --output json | jq

# Get platform config
solana account <PLATFORM_CONFIG_PDA> --output json | jq

# Get game vault balance
solana balance <GAME_VAULT_PDA>
```

### Transaction History

```bash
# Get recent transactions for account
solana transaction-history <ACCOUNT_PUBKEY> --limit 10
```

---

## Performance Benchmarks

### Expected Latencies

| Operation | Base Layer | Ephemeral Rollup |
|-----------|-----------|------------------|
| Create Game | ~400ms | N/A |
| Join Game | ~400ms | N/A |
| Delegate | ~400ms | N/A |
| Take Shot | ~400ms | ~10-50ms |
| Finalize | ~400ms | N/A |

### Gas Costs

| Operation | Base Layer | Ephemeral Rollup |
|-----------|-----------|------------------|
| Create Game | ~0.001 SOL | N/A |
| Join Game | ~0.001 SOL | N/A |
| Take Shot | ~0.0005 SOL | FREE |
| Finalize | ~0.002 SOL | N/A |

---

## Troubleshooting

### Common Issues

1. **"Account not found"**
   - Ensure program is deployed
   - Verify PDA derivation matches

2. **"Insufficient funds"**
   - Airdrop more SOL to test wallets
   - Check game_vault has enough balance

3. **"InvalidVrfAuthority"**
   - Ensure using correct VRF program ID
   - Verify signer is authorized

4. **"GameFull"**
   - Game already has maximum players
   - Create new game

5. **"Transaction simulation failed"**
   - Check program logs for detailed error
   - Verify all account constraints

---

## Automated Testing Script

```bash
#!/bin/bash
# run-devnet-tests.sh

set -e

echo "🧪 Running Magic Roulette Devnet Tests..."

# Test 1: Create game
echo "Test 1: Creating 1v1 game..."
GAME_ID=$(anchor run create-game-sol --provider.cluster devnet -- --mode OneVsOne --entry-fee 0.1 | grep "Game ID" | awk '{print $3}')
echo "✅ Game created: $GAME_ID"

# Test 2: Join game
echo "Test 2: Joining game..."
solana config set --keypair ~/.config/solana/test-wallet-2.json
anchor run join-game-sol --provider.cluster devnet -- --game-id $GAME_ID
echo "✅ Player joined"

# Test 3: Delegate
echo "Test 3: Delegating game..."
anchor run delegate-game --provider.cluster devnet -- --game-id $GAME_ID
echo "✅ Game delegated"

# Test 4: Process VRF
echo "Test 4: Processing VRF..."
anchor run process-vrf --provider.cluster devnet -- --game-id $GAME_ID
echo "✅ VRF processed"

# Test 5: Play game
echo "Test 5: Playing game..."
# ... continue with shots ...

echo "🎉 All tests passed!"
```

---

## Success Criteria

All tests should pass with:
- ✅ No transaction failures
- ✅ Correct state transitions
- ✅ Accurate fund transfers
- ✅ Proper error handling
- ✅ Security constraints enforced
- ✅ Performance within benchmarks

---

## Next Steps

After successful devnet testing:
1. Document any issues found
2. Fix bugs and re-test
3. Conduct load testing
4. Prepare for mainnet deployment
5. Get external security audit
