# Magic Roulette - Quick Reference Guide

Fast lookup for common tasks, commands, and configurations.

---

## Program IDs & Constants

### Core Program IDs

```rust
// Magic Roulette Program
Program ID: JE2fDdXcYEprUR2yPmWdLGDSJ7Y7HD8qsJ52eD6qUavq

// MagicBlock VRF (Randomness)
VRF Program: EPHvrfnQ5RPLRaakdqLZwxbDyLcrMnhL7QNTNwE5pto

// Kamino Lending
Kamino Program: KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD

// Ephemeral Rollups Delegation
Delegation Program: DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh

// Squads Multisig
Squads Program: SMPLecH534NA9YJEUfTnw5VgKKArwC1Xt3UANam5D7d
```

### Game Constants

```rust
// Entry Fees
MIN_ENTRY_FEE_SOL: 10_000_000 lamports (0.01 SOL)
MIN_ENTRY_FEE_TOKEN: 100_000_000 (0.1 tokens with 9 decimals)
MAX_ENTRY_FEE: 1_000_000_000_000 (1000 tokens)

// Game Expiry
GAME_EXPIRY_SECONDS: 86400 (24 hours)

// Collateral Requirements
MIN_COLLATERAL_RATIO: 110% (for Kamino loans)
```

### PDA Seeds

```rust
// Platform Config
seeds: [b"platform"]
bump: auto-derived

// Game Account
seeds: [b"game", game_id.to_le_bytes()]
bump: auto-derived

// Game Vault (SOL)
seeds: [b"game_vault", game_pubkey]
bump: auto-derived

// Player Stats
seeds: [b"player_stats", player_pubkey]
bump: auto-derived

// Treasury Rewards
seeds: [b"rewards", player_pubkey]
bump: auto-derived
```

---

## Common Commands

### Setup & Deployment

```bash
# Set to devnet
solana config set --url https://api.devnet.solana.com

# Build program
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Get program ID
solana address -k target/deploy/magic_roulette-keypair.json

# Initialize platform
anchor run initialize-platform --provider.cluster devnet
```

### Create Test Wallets

```bash
# Create 4 test wallets
for i in {1..4}; do
  solana-keygen new --outfile ~/.config/solana/test-wallet-$i.json
done

# Airdrop SOL
for i in {1..4}; do
  solana airdrop 5 $(solana-keygen pubkey ~/.config/solana/test-wallet-$i.json)
done

# Switch wallet
solana config set --keypair ~/.config/solana/test-wallet-1.json
```

### Game Operations

```bash
# Create 1v1 SOL game (0.1 SOL entry)
anchor run create-game-sol --provider.cluster devnet -- \
  --mode OneVsOne --entry-fee 0.1

# Create 2v2 SOL game (0.2 SOL entry)
anchor run create-game-sol --provider.cluster devnet -- \
  --mode TwoVsTwo --entry-fee 0.2

# Join game
anchor run join-game-sol --provider.cluster devnet -- \
  --game-id 0

# Delegate to Ephemeral Rollup
anchor run delegate-game --provider.cluster devnet -- \
  --game-id 0

# Process VRF randomness
anchor run process-vrf --provider.cluster devnet -- \
  --game-id 0 --randomness <32_BYTE_HEX>

# Take shot
anchor run take-shot --provider.cluster devnet -- \
  --game-id 0

# Finalize game
anchor run finalize-game-sol --provider.cluster devnet -- \
  --game-id 0
```

### Monitoring

```bash
# Stream program logs
solana logs JE2fDdXcYEprUR2yPmWdLGDSJ7Y7HD8qsJ52eD6qUavq

# Get account info
solana account <ACCOUNT_PUBKEY> --output json

# Check balance
solana balance <ACCOUNT_PUBKEY>

# Get transaction details
solana transaction-history <ACCOUNT_PUBKEY> --limit 10
```

---

## Account Structures

### Game Account

```rust
pub struct Game {
    pub game_id: u64,                    // Unique game ID
    pub creator: Pubkey,                 // Game creator
    pub game_mode: GameMode,             // OneVsOne, TwoVsTwo, HumanVsAi
    pub status: GameStatus,              // WaitingForPlayers, Delegated, InProgress, Finished, Cancelled
    pub entry_fee: u64,                  // Entry fee per player
    pub total_pot: u64,                  // Total pot (entry_fee * num_players)
    
    // AI Settings
    pub is_ai_game: bool,                // True for AI practice games
    pub ai_difficulty: Option<AiDifficulty>, // Easy, Medium, Hard
    pub ai_player: Option<Pubkey>,       // Bot wallet
    pub is_practice_mode: bool,          // True = no prizes
    
    // Kamino Loan
    pub has_loan: bool,                  // True if using Kamino loan
    pub loan_obligation: Option<Pubkey>, // Kamino obligation account
    pub collateral_amount: u64,          // Collateral deposited
    pub loan_amount: u64,                // Amount borrowed
    
    // Players
    pub team_a: [Pubkey; 2],             // Team A players
    pub team_b: [Pubkey; 2],             // Team B players
    pub team_a_count: u8,                // Number of players in team A
    pub team_b_count: u8,                // Number of players in team B
    
    // Game State
    pub bullet_chamber: u8,              // 1-6 (set by VRF)
    pub current_chamber: u8,             // Current position
    pub current_turn: u8,                // Which player's turn
    pub shots_taken: u8,                 // Total shots fired
    
    // VRF
    pub vrf_seed: [u8; 32],              // VRF seed
    pub vrf_result: Option<[u8; 32]>,    // VRF randomness result
    
    // Results
    pub winner_team: Option<u8>,         // 0 = team_a, 1 = team_b
    pub created_at: i64,                 // Creation timestamp
    pub finished_at: Option<i64>,        // Finish timestamp
    pub bump: u8,                        // PDA bump
}
```

### PlatformConfig Account

```rust
pub struct PlatformConfig {
    pub authority: Pubkey,               // Platform authority
    pub treasury: Pubkey,                // Treasury wallet
    pub platform_mint: Pubkey,           // Platform token mint
    pub platform_fee_bps: u16,           // Platform fee (basis points)
    pub treasury_fee_bps: u16,           // Treasury fee (basis points)
    pub total_games: u64,                // Total games created
    pub total_volume: u64,               // Total volume wagered
    pub treasury_balance: u64,           // Treasury balance
    pub paused: bool,                    // Emergency pause flag
    
    // Squads Multisig
    pub multisig_authority: Option<Pubkey>, // Squads multisig PDA
    pub platform_vault: Option<Pubkey>,     // Squads vault 0
    pub treasury_vault: Option<Pubkey>,     // Squads vault 1
    pub bump: u8,                        // PDA bump
}
```

---

## Error Codes

### Critical Errors

```rust
GameFull                          // Game is already full
GameNotReady                       // Game not ready to start
GameNotInProgress                  // Game not in progress
NotYourTurn                        // Not player's turn
InvalidGameMode                    // Invalid game mode
InsufficientEntryFee              // Entry fee too low
VrfNotReady                        // VRF result not ready
GameAlreadyFinished               // Game already finished
CannotJoinOwnGame                 // Creator can't join own game
InvalidFeeConfig                  // Invalid fee configuration
ArithmeticOverflow                // Arithmetic overflow
NoRewardsToClaim                  // No rewards to claim
InvalidVrfAuthority               // Invalid VRF authority
InvalidTokenProgram               // Invalid token program
InvalidVaultOwner                 // Invalid vault owner
Unauthorized                      // Unauthorized access
PlayerAlreadyInGame               // Player already in game
InvalidMint                       // Invalid mint
PlatformPaused                    // Platform is paused
CannotJoinAiGame                  // Can't join AI game
InvalidWinner                     // Invalid winner address
InvalidKaminoProgram              // Invalid Kamino program
```

### Kamino Errors

```rust
InsufficientCollateral            // Collateral < 110% of entry fee
LoanRepaymentFailed               // Loan repayment failed
InvalidKaminoMarket               // Invalid Kamino market
InvalidKaminoObligation           // Invalid Kamino obligation
CollateralWithdrawalFailed        // Collateral withdrawal failed
InsufficientWinningsForRepayment  // Winnings < loan repayment
```

### Squads Errors

```rust
MultisigUnauthorized              // Not multisig authority
InvalidMultisigTransaction        // Invalid multisig transaction
MultisigProposalNotApproved       // Proposal not approved
InsufficientTreasuryBalance       // Treasury balance too low
InsufficientVaultBalance          // Vault balance too low
```

---

## Game Modes

### OneVsOne

```
Team A: 1 player
Team B: 1 player
Total: 2 players
Entry Fee: Per player
Prize: Winner takes all (minus fees)
```

### TwoVsTwo

```
Team A: 2 players
Team B: 2 players
Total: 4 players
Entry Fee: Per player
Prize: Split between 2 winners
```

### HumanVsAi

```
Team A: 1 human player
Team B: 1 AI bot
Total: 1 player (human)
Entry Fee: 0 (practice mode)
Prize: None (practice)
Difficulty: Easy, Medium, Hard
```

---

## Game Status Flow

```
WaitingForPlayers
    ↓
Delegated (optional - for Ephemeral Rollup)
    ↓
InProgress (after VRF randomness)
    ↓
Finished (when bullet hit)
    ↓
Cancelled (after finalization)
```

---

## Fee Calculation

### Example: 1v1 Game with 0.1 SOL Entry

```
Total Pot: 0.2 SOL (2 players × 0.1 SOL)

Platform Fee (5%): 0.01 SOL
Treasury Fee (10%): 0.02 SOL
Winner Prize (85%): 0.17 SOL

Total: 0.2 SOL ✓
```

### Example: 2v2 Game with 0.2 SOL Entry

```
Total Pot: 0.8 SOL (4 players × 0.2 SOL)

Platform Fee (5%): 0.04 SOL
Treasury Fee (10%): 0.08 SOL
Winner Pool (85%): 0.68 SOL
Per Winner (÷2): 0.34 SOL each

Total: 0.8 SOL ✓
```

---

## Kamino Loan Flow

### Borrow Process

```
1. Deposit Collateral (110% of entry fee)
   ↓
2. Borrow SOL from Kamino
   ↓
3. SOL transferred to game_vault
   ↓
4. Play game
```

### Repayment Process (Winner is Borrower)

```
1. Game finishes, winner is borrower
   ↓
2. Calculate loan repayment (principal + interest)
   ↓
3. Repay loan from winnings
   ↓
4. Withdraw collateral
   ↓
5. Distribute remaining winnings
```

### Liquidation Process (Borrower Loses)

```
1. Game finishes, borrower loses
   ↓
2. Collateral liquidated by Kamino
   ↓
3. Winner receives full prize
   ↓
4. Borrower loses collateral
```

---

## VRF Integration

### Request Randomness

```rust
// Called by game program
create_request_randomness_ix(
    caller_seed: [u8; 32],
    callback: consume_randomness
)
```

### Receive Randomness

```rust
// Called by VRF oracle
pub fn process_vrf_result(
    randomness: [u8; 32]
) -> Result<()> {
    // Convert to chamber (1-6)
    let chamber = (randomness[0] % 6) + 1;
    // ...
}
```

### Helper Functions

```rust
random_u32(randomness: [u8; 32]) -> u32
random_u8_with_range(randomness: [u8; 32], max: u8) -> u8
random_bool(randomness: [u8; 32]) -> bool
```

---

## Ephemeral Rollup Integration

### Delegation Flow

```
1. Create game on base layer
   ↓
2. Delegate account to ER
   ↓
3. Execute on ER (fast, gasless)
   ↓
4. Commit state to base layer
   ↓
5. Undelegate and finalize
```

### RPC Endpoints

```
Solana Devnet: https://api.devnet.solana.com
ER Router: https://devnet-router.magicblock.app
ER Direct: https://devnet.magicblock.app
```

### Validator Identities

```
Asia: MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57
EU: MEUGGrYPxKk17hCr7wpT6s8dtNokZj5U2L57vjYMS8e
US: MUS3hc9TCw4cGC12vHNoYcCGzJG1txjgQLZWVoeNHNd
TEE: FnE6VJT5QNZdedZPnCoLsARgBwoE6DeJNjBs2H1gySXA
```

---

## Security Checklist

### Before Deployment

- [ ] VRF program ID verified
- [ ] Kamino program ID verified
- [ ] All constraints in place
- [ ] Winner validation enabled
- [ ] Vault balance checks enabled
- [ ] Race condition prevention active
- [ ] Arithmetic overflow protection enabled
- [ ] Account ownership validated
- [ ] Signer checks in place
- [ ] PDA derivation correct

### Critical Validations

```rust
// Kamino program validation
constraint = kamino_program.key() == KAMINO_PROGRAM_ID

// VRF authority validation
constraint = vrf_authority.key() == crate::ID

// Winner validation
require!(ctx.accounts.winner1.key() == expected_winner1)

// Vault balance validation
require!(vault_balance >= total_pot)

// Race condition prevention
require!(!game.is_full())
```

---

## Testing Commands

### Unit Tests

```bash
# Run all tests
cargo test

# Run specific test
cargo test test_name

# Run with output
cargo test -- --nocapture
```

### Integration Tests

```bash
# Run devnet tests
anchor test --provider.cluster devnet

# Run with logs
ANCHOR_LOG=true anchor test --provider.cluster devnet
```

### Security Tests

```bash
# Run security test suite
cargo test security_tests

# Test specific vulnerability
cargo test test_rejects_fake_kamino_program
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "Account not found" | Verify PDA derivation, ensure program deployed |
| "Insufficient funds" | Airdrop more SOL to test wallet |
| "InvalidVrfAuthority" | Check VRF program ID is correct |
| "GameFull" | Game already has max players, create new game |
| "Transaction simulation failed" | Check program logs for detailed error |
| "InvalidWinner" | Winner address doesn't match game participants |
| "InsufficientCollateral" | Collateral must be ≥110% of entry fee |

### Debug Commands

```bash
# Stream logs
solana logs JE2fDdXcYEprUR2yPmWdLGDSJ7Y7HD8qsJ52eD6qUavq

# Get account data
solana account <PDA> --output json | jq

# Check transaction
solana confirm <TX_SIGNATURE> -v

# Get program accounts
solana program show JE2fDdXcYEprUR2yPmWdLGDSJ7Y7HD8qsJ52eD6qUavq
```

---

## Performance Metrics

### Latencies

| Operation | Base Layer | Ephemeral Rollup |
|-----------|-----------|------------------|
| Create Game | ~400ms | N/A |
| Join Game | ~400ms | N/A |
| Take Shot | ~400ms | ~10-50ms |
| Finalize | ~400ms | N/A |

### Gas Costs

| Operation | Cost |
|-----------|------|
| Create Game | ~0.001 SOL |
| Join Game | ~0.001 SOL |
| Take Shot (Base) | ~0.0005 SOL |
| Take Shot (ER) | FREE |
| Finalize | ~0.002 SOL |

---

## Useful Links

### Documentation
- [MagicBlock Docs](https://docs.magicblock.gg)
- [Kamino Docs](https://docs.kamino.finance)
- [Squads Docs](https://docs.squads.so)
- [Solana Docs](https://docs.solana.com)

### GitHub Repositories
- [MagicBlock Labs](https://github.com/magicblock-labs)
- [Kamino Finance](https://github.com/Kamino-Finance)
- [Squads Protocol](https://github.com/squads-dapp)

### Tools
- [Solana CLI](https://docs.solana.com/cli)
- [Anchor Framework](https://www.anchor-lang.com)
- [Solana Explorer](https://explorer.solana.com)

---

## Quick Deployment Checklist

```bash
# 1. Build
anchor build

# 2. Deploy
anchor deploy --provider.cluster devnet

# 3. Initialize
anchor run initialize-platform --provider.cluster devnet

# 4. Create test game
anchor run create-game-sol --provider.cluster devnet -- \
  --mode OneVsOne --entry-fee 0.1

# 5. Verify
solana account <GAME_PDA> --output json

# 6. Monitor
solana logs JE2fDdXcYEprUR2yPmWdLGDSJ7Y7HD8qsJ52eD6qUavq
```

---

## Support & Resources

### Getting Help

1. Check [DEVNET_TESTING_GUIDE.md](./DEVNET_TESTING_GUIDE.md) for detailed testing
2. Review [SECURITY_FIXES.md](./SECURITY_FIXES.md) for security details
3. Check program logs: `solana logs <PROGRAM_ID>`
4. Verify account state: `solana account <ACCOUNT_PDA>`

### Reporting Issues

Include:
- Transaction signature
- Program logs
- Account state (JSON)
- Expected vs actual behavior
- Steps to reproduce

---

**Last Updated**: February 22, 2026
**Program Version**: 0.1.0
**Status**: ✅ Production Ready (After Mainnet Audit)
