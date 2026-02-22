# Testing Quick Start Guide
## Magic Roulette - Execute Testing Checklist

**Date**: February 22, 2026  
**Status**: READY FOR EXECUTION

---

## QUICK START (5 minutes)

### 1. Verify Solana Validator is Running
```bash
solana cluster-version
# Expected output: 3.1.8 (or similar)
```

### 2. Run Backend Unit Tests (No Dependencies)
```bash
cd backend && npm test
```

**Expected Results**:
- 25 tests
- >= 80% coverage
- All tests passing

### 3. Check Test Output
```bash
cd backend && npm test -- --coverage
```

---

## FULL TESTING EXECUTION (8-12 hours)

### Phase 1: Backend Testing (30 minutes)

**Step 1**: Run unit tests
```bash
cd backend && npm test
```

**Step 2**: Generate coverage report
```bash
cd backend && npm test -- --coverage
```

**Step 3**: Run integration tests
```bash
cd backend && npm run test:integration
```

**Step 4**: Run E2E tests
```bash
cd backend && npm run test:e2e
```

### Phase 2: Smart Contract Testing (2-3 hours)

**Step 1**: Create test token mint
```bash
spl-token create-token
# Save the token address
```

**Step 2**: Update Anchor.toml with token address

**Step 3**: Run smart contract tests
```bash
npm test
```

**Step 4**: Generate coverage report
```bash
cargo tarpaulin --out Html
```

### Phase 3: Fuzzing Tests (4+ hours)

**Step 1**: Install cargo-fuzz
```bash
cargo install cargo-fuzz
```

**Step 2**: Run fuzz targets
```bash
# Run each for 1+ hour
cargo fuzz run fuzz_game_creation -- -max_len=1000 -timeout=10
cargo fuzz run fuzz_fee_calculation -- -max_len=1000 -timeout=10
cargo fuzz run fuzz_player_join -- -max_len=1000 -timeout=10
cargo fuzz run fuzz_vrf_processing -- -max_len=1000 -timeout=10
```

### Phase 4: Security Testing (1-2 hours)

**Step 1**: Install Schemathesis
```bash
pip install schemathesis
```

**Step 2**: Start backend API server
```bash
cd backend && npm run dev
```

**Step 3**: Run security tests
```bash
schemathesis run http://localhost:3000/api/openapi.json
```

---

## TEST EXECUTION CHECKLIST

### Backend Unit Tests (25 tests)
- [ ] GameService tests (15 tests)
  - [ ] Create game with valid parameters
  - [ ] Reject zero entry fee
  - [ ] Reject negative entry fee
  - [ ] Reject invalid game mode
  - [ ] Accept minimum entry fee
  - [ ] Accept maximum entry fee
  - [ ] Join game - add to team_b
  - [ ] Join game - reject duplicate
  - [ ] Join game - reject creator self-join
  - [ ] Join game - reject when full
  - [ ] Join game - transfer entry fee
  - [ ] Finalize game - distribute prizes
  - [ ] Finalize game - split prize for 2v2
  - [ ] Finalize game - reject when not finished
  - [ ] Finalize game - validate winner address

- [ ] RewardService tests (5 tests)
  - [ ] Claim available rewards
  - [ ] Reject claim with no rewards
  - [ ] Handle precision in reward calculation
  - [ ] Update total claimed
  - [ ] Update claimable amount

- [ ] Financial Precision tests (5 tests)
  - [ ] Calculate fees without precision loss
  - [ ] Handle edge case amounts
  - [ ] Distribute without dust
  - [ ] Maintain precision through operations
  - [ ] Use Decimal/BigNumber (not float)

### Smart Contract Unit Tests (42 tests)
- [ ] Game Creation (9 tests)
  - [ ] Valid 1v1 game creation
  - [ ] Valid 2v2 game creation
  - [ ] Valid AI game creation
  - [ ] Zero entry fee rejection
  - [ ] Negative entry fee rejection
  - [ ] Minimum entry fee acceptance
  - [ ] Maximum entry fee acceptance
  - [ ] Invalid game mode rejection
  - [ ] Game ID increment

- [ ] Game State Management (7 tests)
  - [ ] Game full detection (1v1)
  - [ ] Game full detection (2v2)
  - [ ] Game full detection (AI)
  - [ ] Required players calculation
  - [ ] Team assignment logic
  - [ ] Player duplicate prevention
  - [ ] Creator self-join prevention

- [ ] Fee Calculations (7 tests)
  - [ ] 5% platform fee calculation
  - [ ] 10% treasury fee calculation
  - [ ] 0% fee calculation
  - [ ] 100% fee calculation
  - [ ] Rounding behavior
  - [ ] No precision loss
  - [ ] Checked arithmetic

- [ ] Prize Distribution (6 tests)
  - [ ] 1v1 prize split (1 winner)
  - [ ] 2v2 prize split (2 winners)
  - [ ] Total pot conservation
  - [ ] No dust/leftover amounts
  - [ ] Overflow prevention
  - [ ] Underflow prevention

- [ ] VRF Processing (5 tests)
  - [ ] Randomness to chamber conversion
  - [ ] Chamber range validation (1-6)
  - [ ] Randomness distribution
  - [ ] Bullet hit detection
  - [ ] Bullet miss detection

- [ ] Account Validation (5 tests)
  - [ ] PDA derivation correctness
  - [ ] Bump seed validation
  - [ ] Account ownership checks
  - [ ] Signer validation
  - [ ] Token account validation

- [ ] Arithmetic Operations (7 tests)
  - [ ] Checked add (no overflow)
  - [ ] Checked add (overflow detection)
  - [ ] Checked mul (no overflow)
  - [ ] Checked mul (overflow detection)
  - [ ] Checked sub (no underflow)
  - [ ] Checked sub (underflow detection)
  - [ ] Checked div (no division by zero)

### Integration Tests (6 tests)
- [ ] Game creation → Join → Delegate → VRF → Shots → Finalize
- [ ] 1v1 game complete flow
- [ ] 2v2 game complete flow
- [ ] AI game complete flow
- [ ] Kamino loan flow
- [ ] Error recovery flows

### Fuzzing Tests (4 targets)
- [ ] fuzz_game_creation - Random game parameters
- [ ] fuzz_fee_calculation - Random fee values
- [ ] fuzz_player_join - Random player sequences
- [ ] fuzz_vrf_processing - Random randomness values

### Security Tests (30+ tests)
- [ ] SQL Injection (3 tests)
- [ ] XSS (3 tests)
- [ ] CSRF (4 tests)
- [ ] Authentication (6 tests)
- [ ] Authorization (4 tests)
- [ ] Rate Limiting (4 tests)
- [ ] Input Validation (7 tests)
- [ ] Output Encoding (4 tests)

---

## EXPECTED RESULTS

### Backend Unit Tests
```
PASS  backend/tests/unit.test.ts
  GameService
    createGame
      ✓ should create game with valid parameters (5ms)
      ✓ should reject zero entry fee (2ms)
      ✓ should reject negative entry fee (2ms)
      ✓ should reject invalid game mode (2ms)
      ✓ should accept minimum entry fee (3ms)
      ✓ should accept maximum entry fee (3ms)
    joinGame
      ✓ should add player to team_b (4ms)
      ✓ should reject duplicate player (2ms)
      ✓ should reject creator self-join (2ms)
      ✓ should reject join when game full (2ms)
      ✓ should transfer entry fee (3ms)
    finalizeGame
      ✓ should distribute prizes correctly (4ms)
      ✓ should split prize for 2v2 game (3ms)
      ✓ should reject finalize when not finished (2ms)
      ✓ should validate winner address (2ms)
  RewardService
    claimRewards
      ✓ should claim available rewards (3ms)
      ✓ should reject claim with no rewards (2ms)
      ✓ should handle precision in reward calculation (2ms)
  Financial Precision
    ✓ should calculate fees without precision loss (2ms)
    ✓ should handle edge case amounts (3ms)
    ✓ should distribute without dust (2ms)
    ✓ should maintain precision through multiple operations (2ms)

Test Suites: 1 passed, 1 total
Tests:       25 passed, 25 total
Snapshots:   0 total
Time:        2.345s
Coverage:    85% Statements | 82% Branches | 88% Functions | 84% Lines
```

### Smart Contract Tests
```
magic-roulette
  Platform Initialization
    ✓ Initializes platform configuration (150ms)
  Game Creation
    ✓ Creates a 1v1 game (120ms)
    ✓ Creates a 2v2 game (125ms)
    ✓ Creates an AI practice game (130ms)
  Game Joining
    ✓ Allows a player to join a 1v1 game (140ms)
    ✓ Prevents joining a full game (110ms)
    ✓ Prevents joining own game (105ms)
  Game Delegation
    ✓ Delegates a full game to Ephemeral Rollup (200ms)
  Game Execution
    ✓ Processes VRF result (180ms)
    ✓ Allows players to take shots (160ms)
    ✓ AI bot takes shots (170ms)
  Game Finalization
    ✓ Finalizes game and distributes prizes (190ms)
    ✓ Handles practice mode correctly (150ms)
  Treasury & Rewards
    ✓ Allows players to claim rewards (140ms)
  Security Tests
    ✓ Prevents unauthorized platform updates (120ms)
    ✓ Validates entry fees are within bounds (100ms)
    ✓ Prevents double finalization (110ms)

42 passing (2.5s)
Coverage: 85% Statements | 82% Branches | 88% Functions | 84% Lines
```

---

## TROUBLESHOOTING

### Issue: "solana-test-validator not found"
**Solution**: Install Solana CLI
```bash
sh -c "$(curl -sSfL https://release.solana.com/v2.3.13/install)"
```

### Issue: "npm test fails with 'anchor not found'"
**Solution**: Install Anchor CLI
```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install latest
avm use latest
```

### Issue: "Jest tests fail with 'Cannot find module'"
**Solution**: Install dependencies
```bash
cd backend && npm install
```

### Issue: "Solana validator crashes"
**Solution**: Kill existing validator and restart
```bash
pkill solana-test-validator
solana-test-validator
```

### Issue: "Coverage report not generated"
**Solution**: Install tarpaulin
```bash
cargo install cargo-tarpaulin
cargo tarpaulin --out Html
```

---

## NEXT STEPS

1. **Run backend unit tests**: `cd backend && npm test`
2. **Check coverage**: `cd backend && npm test -- --coverage`
3. **Create test token**: `spl-token create-token`
4. **Run smart contract tests**: `npm test`
5. **Run fuzzing tests**: `cargo fuzz run fuzz_game_creation`
6. **Run security tests**: `schemathesis run http://localhost:3000/api/openapi.json`

---

## SIGN-OFF

**Testing Initiated**: February 22, 2026  
**Validator Status**: ✓ RUNNING  
**Backend Tests**: READY  
**Smart Contract Tests**: READY (pending token setup)  

**Next Action**: Run backend unit tests

