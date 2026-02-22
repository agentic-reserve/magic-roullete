# Production Testing Strategy - Financial Application
## Agentic Programming Era (Claude, Codex)

Comprehensive testing checklist untuk aplikasi finansial yang melibatkan smart contract dan Web2 backend.

---

## PART 1: SMART CONTRACT TESTING

### 1.1 Unit Tests (Minimal 80% Coverage)

**Target**: Setiap fungsi, edge case, dan error path

```bash
# Run unit tests dengan coverage report
cargo test --lib -- --nocapture
cargo tarpaulin --out Html --output-dir coverage/

# Target: >= 80% line coverage
# Verify: coverage/index.html shows >= 80%
```

**Checklist Unit Tests**:
- [ ] Setiap public function tested
- [ ] Setiap error condition tested
- [ ] Boundary values tested (0, u64::MAX, etc)
- [ ] State transitions tested
- [ ] Account validation tested
- [ ] Permission checks tested
- [ ] Arithmetic operations tested (overflow/underflow)
- [ ] Coverage report >= 80%

**Example Test Structure**:
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_game_valid() {
        // Arrange
        let mut game = Game::default();
        
        // Act
        let result = game.initialize(100, GameMode::OneVsOne);
        
        // Assert
        assert!(result.is_ok());
        assert_eq!(game.entry_fee, 100);
    }

    #[test]
    fn test_create_game_zero_fee() {
        let mut game = Game::default();
        let result = game.initialize(0, GameMode::OneVsOne);
        assert!(result.is_err());
    }

    #[test]
    fn test_create_game_max_fee() {
        let mut game = Game::default();
        let result = game.initialize(u64::MAX, GameMode::OneVsOne);
        // Verify behavior at boundary
    }
}
```

---

### 1.2 Fuzzing Tests (Minimal)

**Target**: Random input generation untuk menemukan edge cases

```bash
# Install cargo-fuzz
cargo install cargo-fuzz

# Create fuzz targets
cargo fuzz init

# Run fuzzing
cargo fuzz run fuzz_game_creation -- -max_len=1000 -timeout=10
```

**Fuzz Targets**:
- [ ] `fuzz_game_creation` - Random game parameters
- [ ] `fuzz_fee_calculation` - Random fee values
- [ ] `fuzz_player_join` - Random player sequences
- [ ] `fuzz_vrf_processing` - Random randomness values

**Example Fuzz Target**:
```rust
// fuzz/fuzz_targets/fuzz_game_creation.rs
#![no_main]
use libfuzzer_sys::fuzz_target;
use magic_roulette::*;

fuzz_target!(|data: &[u8]| {
    if data.len() < 16 { return; }
    
    let entry_fee = u64::from_le_bytes([
        data[0], data[1], data[2], data[3],
        data[4], data[5], data[6], data[7],
    ]);
    
    let mode_byte = data[8];
    let game_mode = match mode_byte % 3 {
        0 => GameMode::OneVsOne,
        1 => GameMode::TwoVsTwo,
        _ => GameMode::HumanVsAi,
    };
    
    // Should not panic
    let _ = Game::new(entry_fee, game_mode);
});
```

---

### 1.3 Logic Verification

**Target**: Memastikan business logic benar

**Checklist**:
- [ ] Game state transitions valid
- [ ] Winner determination correct
- [ ] Fee calculations accurate
- [ ] Pot distribution correct
- [ ] PDA derivation consistent
- [ ] Arithmetic never overflows
- [ ] All constraints enforced

**Logic Tests**:
```rust
#[test]
fn test_winner_determination_logic() {
    let mut game = Game::default();
    game.bullet_chamber = 3;
    game.current_chamber = 1;
    
    // Chamber 1: safe
    assert!(!game.is_bullet_hit());
    game.current_chamber = 2;
    
    // Chamber 2: safe
    assert!(!game.is_bullet_hit());
    game.current_chamber = 3;
    
    // Chamber 3: bullet!
    assert!(game.is_bullet_hit());
}

#[test]
fn test_fee_distribution_sums_to_pot() {
    let total_pot = 1_000_000_000u64;
    let platform_fee_bps = 500u16;
    let treasury_fee_bps = 1000u16;
    
    let platform_fee = calculate_fee(total_pot, platform_fee_bps);
    let treasury_fee = calculate_fee(total_pot, treasury_fee_bps);
    let winner_amount = total_pot - platform_fee - treasury_fee;
    
    assert_eq!(
        platform_fee + treasury_fee + winner_amount,
        total_pot
    );
}
```

---

### 1.4 Integration Tests (Full Flow)

**Target**: End-to-end game flow

```bash
# Run integration tests
cargo test --test '*' -- --nocapture
```

**Main Flow Tests**:
- [ ] Create game → Join → Delegate → VRF → Shots → Finalize
- [ ] 1v1 game complete flow
- [ ] 2v2 game complete flow
- [ ] AI game complete flow
- [ ] Kamino loan flow
- [ ] Error recovery flows

**Example Integration Test**:
```rust
#[tokio::test]
async fn test_complete_1v1_game_flow() {
    // Setup
    let mut program_context = setup_test_context().await;
    let player1 = Keypair::new();
    let player2 = Keypair::new();
    
    // 1. Create game
    let game_id = create_game(
        &mut program_context,
        &player1,
        GameMode::OneVsOne,
        100_000_000, // 0.1 SOL
    ).await.unwrap();
    
    // 2. Join game
    join_game(
        &mut program_context,
        &player2,
        game_id,
    ).await.unwrap();
    
    // 3. Delegate
    delegate_game(
        &mut program_context,
        game_id,
    ).await.unwrap();
    
    // 4. Process VRF
    let randomness = [42u8; 32];
    process_vrf(
        &mut program_context,
        game_id,
        randomness,
    ).await.unwrap();
    
    // 5. Take shots
    take_shot(&mut program_context, &player1, game_id)
        .await.unwrap();
    
    // 6. Finalize
    finalize_game(
        &mut program_context,
        game_id,
    ).await.unwrap();
    
    // Verify final state
    let game = get_game(&program_context, game_id).await;
    assert_eq!(game.status, GameStatus::Cancelled);
    assert!(game.winner_team.is_some());
}
```

---

### 1.5 Precision Testing

**Target**: Memastikan tidak ada rounding errors atau precision loss

**Checklist**:
- [ ] Decimal precision maintained (9 decimals untuk SOL)
- [ ] No rounding errors dalam fee calculation
- [ ] Checked arithmetic untuk semua operasi
- [ ] Total pot = sum of all distributions
- [ ] No dust/leftover amounts

**Precision Tests**:
```rust
#[test]
fn test_fee_calculation_precision() {
    // Test dengan berbagai nilai
    let test_cases = vec![
        (1_000_000_000u64, 500u16, 50_000_000u64),   // 5%
        (1_000_000_001u64, 500u16, 50_000_000u64),   // Rounding
        (999_999_999u64, 500u16, 49_999_999u64),     // Rounding
        (u64::MAX / 2, 500u16, (u64::MAX / 2) / 20), // Large value
    ];
    
    for (pot, fee_bps, expected) in test_cases {
        let fee = (pot as u128)
            .checked_mul(fee_bps as u128)
            .unwrap()
            .checked_div(10000)
            .unwrap() as u64;
        
        assert_eq!(fee, expected, "Fee mismatch for pot={}", pot);
    }
}

#[test]
fn test_no_dust_in_distribution() {
    let total_pot = 1_000_000_000u64;
    let platform_fee_bps = 500u16;
    let treasury_fee_bps = 1000u16;
    let winner_count = 2u64;
    
    let platform_fee = calculate_fee(total_pot, platform_fee_bps);
    let treasury_fee = calculate_fee(total_pot, treasury_fee_bps);
    let winner_amount = total_pot - platform_fee - treasury_fee;
    let per_winner = winner_amount / winner_count;
    let dust = winner_amount % winner_count;
    
    // Dust should be minimal (< 1 lamport)
    assert!(dust < winner_count);
}
```

---

## PART 2: WEB2 BACKEND TESTING

### 2.1 Unit Tests (Minimal 80% Coverage)

**Target**: Setiap endpoint, service, dan utility function

```bash
# Run unit tests dengan coverage
npm test -- --coverage --collectCoverageFrom="src/**/*.ts"

# Target: >= 80% coverage
```

**Checklist**:
- [ ] Setiap endpoint tested
- [ ] Setiap service method tested
- [ ] Error handling tested
- [ ] Input validation tested
- [ ] Database operations tested
- [ ] External API calls mocked
- [ ] Coverage >= 80%

**Example Unit Test**:
```typescript
describe('GameService', () => {
  let gameService: GameService;
  let mockDb: jest.Mocked<Database>;

  beforeEach(() => {
    mockDb = createMockDatabase();
    gameService = new GameService(mockDb);
  });

  describe('createGame', () => {
    it('should create game with valid parameters', async () => {
      const result = await gameService.createGame({
        creator: 'player1',
        mode: 'OneVsOne',
        entryFee: 100_000_000,
      });

      expect(result.gameId).toBeDefined();
      expect(result.status).toBe('WaitingForPlayers');
      expect(mockDb.games.create).toHaveBeenCalled();
    });

    it('should reject zero entry fee', async () => {
      await expect(
        gameService.createGame({
          creator: 'player1',
          mode: 'OneVsOne',
          entryFee: 0,
        })
      ).rejects.toThrow('InsufficientEntryFee');
    });

    it('should reject invalid game mode', async () => {
      await expect(
        gameService.createGame({
          creator: 'player1',
          mode: 'InvalidMode' as any,
          entryFee: 100_000_000,
        })
      ).rejects.toThrow('InvalidGameMode');
    });
  });
});
```

---

### 2.2 Integration Tests (Full Flow)

**Target**: End-to-end API flows

```bash
# Run integration tests
npm run test:integration

# Use test database
TEST_DB_URL=postgresql://test:test@localhost/magic_roulette_test npm run test:integration
```

**Main Flow Tests**:
- [ ] Create game → Join → Delegate → Finalize
- [ ] User registration → Login → Create game
- [ ] Payment processing flow
- [ ] Reward claiming flow
- [ ] Error recovery flows

**Example Integration Test**:
```typescript
describe('Game Flow Integration', () => {
  let app: INestApplication;
  let gameService: GameService;
  let playerService: PlayerService;
  let db: Database;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [GameModule, PlayerModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    
    gameService = moduleFixture.get<GameService>(GameService);
    playerService = moduleFixture.get<PlayerService>(PlayerService);
    db = moduleFixture.get<Database>(Database);
  });

  it('should complete full 1v1 game flow', async () => {
    // 1. Create players
    const player1 = await playerService.createPlayer({
      username: 'player1',
      wallet: 'wallet1',
    });
    const player2 = await playerService.createPlayer({
      username: 'player2',
      wallet: 'wallet2',
    });

    // 2. Create game
    const game = await gameService.createGame({
      creator: player1.id,
      mode: 'OneVsOne',
      entryFee: 100_000_000,
    });

    // 3. Join game
    await gameService.joinGame(game.id, player2.id);

    // 4. Verify game is full
    const fullGame = await gameService.getGame(game.id);
    expect(fullGame.isFull).toBe(true);

    // 5. Delegate
    await gameService.delegateGame(game.id);

    // 6. Process VRF
    await gameService.processVrf(game.id, Buffer.from([42, 42, 42, 42]));

    // 7. Take shots
    await gameService.takeShot(game.id, player1.id);

    // 8. Finalize
    const result = await gameService.finalizeGame(game.id);
    expect(result.status).toBe('Cancelled');
    expect(result.winner).toBeDefined();
  });
});
```

---

### 2.3 E2E Tests (Main Flow)

**Target**: HTTP API end-to-end testing

```bash
# Run E2E tests
npm run test:e2e

# With coverage
npm run test:e2e -- --coverage
```

**E2E Test Scenarios**:
- [ ] POST /games - Create game
- [ ] POST /games/:id/join - Join game
- [ ] POST /games/:id/delegate - Delegate game
- [ ] POST /games/:id/vrf - Process VRF
- [ ] POST /games/:id/shot - Take shot
- [ ] POST /games/:id/finalize - Finalize game
- [ ] GET /games/:id - Get game state
- [ ] GET /players/:id/rewards - Get rewards
- [ ] POST /rewards/claim - Claim rewards

**Example E2E Test**:
```typescript
describe('Game API E2E', () => {
  let app: INestApplication;
  let request: supertest.SuperTest<supertest.Test>;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    request = supertest(app.getHttpServer());
  });

  it('POST /games should create game', async () => {
    const response = await request
      .post('/games')
      .send({
        creator: 'player1',
        mode: 'OneVsOne',
        entryFee: 100_000_000,
      })
      .expect(201);

    expect(response.body).toHaveProperty('gameId');
    expect(response.body.status).toBe('WaitingForPlayers');
  });

  it('POST /games/:id/join should add player', async () => {
    const game = await createTestGame();

    const response = await request
      .post(`/games/${game.id}/join`)
      .send({ player: 'player2' })
      .expect(200);

    expect(response.body.teamBCount).toBe(1);
  });

  it('GET /games/:id should return game state', async () => {
    const game = await createTestGame();

    const response = await request
      .get(`/games/${game.id}`)
      .expect(200);

    expect(response.body.id).toBe(game.id);
    expect(response.body.status).toBe('WaitingForPlayers');
  });
});
```

---

### 2.4 Precision Testing

**Target**: Decimal precision dalam financial calculations

**Checklist**:
- [ ] Gunakan Decimal/BigNumber untuk semua calculations
- [ ] No floating point arithmetic
- [ ] Rounding rules consistent
- [ ] Total = sum of parts
- [ ] No dust/leftover amounts

**Precision Tests**:
```typescript
describe('Financial Precision', () => {
  it('should calculate fees without precision loss', () => {
    const totalPot = new Decimal('1000000000'); // 1 SOL
    const platformFeeBps = 500; // 5%
    
    const platformFee = totalPot
      .times(platformFeeBps)
      .dividedBy(10000);
    
    expect(platformFee.toString()).toBe('50000000');
  });

  it('should distribute without dust', () => {
    const totalPot = new Decimal('1000000000');
    const platformFeeBps = 500;
    const treasuryFeeBps = 1000;
    const winnerCount = 2;
    
    const platformFee = totalPot.times(platformFeeBps).dividedBy(10000);
    const treasuryFee = totalPot.times(treasuryFeeBps).dividedBy(10000);
    const winnerAmount = totalPot.minus(platformFee).minus(treasuryFee);
    const perWinner = winnerAmount.dividedBy(winnerCount).integerValue(Decimal.ROUND_DOWN);
    const dust = winnerAmount.minus(perWinner.times(winnerCount));
    
    expect(dust.lessThan(1)).toBe(true);
  });

  it('should handle edge case amounts', () => {
    const testCases = [
      '1',
      '999999999',
      '1000000000',
      '999999999999999999',
    ];
    
    for (const amount of testCases) {
      const pot = new Decimal(amount);
      const fee = pot.times(500).dividedBy(10000);
      
      expect(fee.isFinite()).toBe(true);
      expect(fee.isNaN()).toBe(false);
    }
  });
});
```

---

### 2.5 Security Testing (Schemathesis)

**Target**: API security vulnerabilities

```bash
# Install Schemathesis
pip install schemathesis

# Generate OpenAPI spec
npm run generate:openapi

# Run security tests
schemathesis run http://localhost:3000/api/openapi.json \
  --base-url=http://localhost:3000 \
  --hypothesis-max-examples=1000 \
  --checks all
```

**Security Test Scenarios**:
- [ ] SQL Injection attempts
- [ ] XSS payloads
- [ ] CSRF attacks
- [ ] Authentication bypass
- [ ] Authorization bypass
- [ ] Rate limiting
- [ ] Input validation
- [ ] Output encoding

**Example Schemathesis Test**:
```yaml
# schemathesis-config.yaml
base_url: http://localhost:3000
hypothesis:
  max_examples: 1000
  deadline: 5000

checks:
  - all

hooks:
  - name: before_call
    handler: hooks.add_auth_header

security:
  - name: sql_injection
    payloads:
      - "' OR '1'='1"
      - "'; DROP TABLE games; --"
      - "1' UNION SELECT * FROM players --"
  
  - name: xss
    payloads:
      - "<script>alert('xss')</script>"
      - "javascript:alert('xss')"
      - "<img src=x onerror=alert('xss')>"
  
  - name: authentication
    tests:
      - missing_auth_header
      - invalid_token
      - expired_token
      - wrong_user_id
```

---

## PART 3: DEPLOYMENT CHECKLIST

### Pre-Production Verification

```bash
# 1. Run all tests
npm test -- --coverage
cargo test --lib
cargo test --test '*'

# 2. Check coverage
# Smart Contract: >= 80%
# Backend: >= 80%

# 3. Run security tests
schemathesis run http://localhost:3000/api/openapi.json

# 4. Run fuzzing (minimal 1 hour)
cargo fuzz run fuzz_game_creation -- -max_len=1000 -timeout=10

# 5. Performance testing
npm run test:performance

# 6. Load testing
npm run test:load

# 7. Security audit
npm audit
cargo audit

# 8. Code review
# - Smart contract: 2 reviewers
# - Backend: 2 reviewers
```

### Production Deployment

```bash
# 1. Deploy smart contract
anchor deploy --provider.cluster mainnet-beta

# 2. Deploy backend
docker build -t magic-roulette:latest .
docker push registry.example.com/magic-roulette:latest
kubectl apply -f k8s/production.yaml

# 3. Verify deployment
curl https://api.magic-roulette.com/health
solana account <PROGRAM_ID>

# 4. Monitor
# - Error rates
# - Transaction success rates
# - Fund transfers accuracy
# - User complaints
```

---

## PART 4: MONITORING & ALERTING

### Critical Metrics

```yaml
# Prometheus metrics
- name: game_creation_errors
  threshold: > 1% error rate
  alert: "High game creation error rate"

- name: fund_transfer_failures
  threshold: > 0.1% failure rate
  alert: "Fund transfer failures detected"

- name: vrf_processing_delay
  threshold: > 30 seconds
  alert: "VRF processing delayed"

- name: precision_errors
  threshold: > 0
  alert: "Precision error detected in calculations"

- name: unauthorized_access_attempts
  threshold: > 10 per minute
  alert: "Potential security attack"
```

### Logging

```typescript
// Log all financial transactions
logger.info('Fund transfer', {
  gameId: game.id,
  from: sender,
  to: recipient,
  amount: amount.toString(),
  timestamp: new Date().toISOString(),
  txHash: txHash,
});

// Log all errors
logger.error('Transaction failed', {
  gameId: game.id,
  error: error.message,
  stack: error.stack,
  timestamp: new Date().toISOString(),
});
```

---

## SUMMARY CHECKLIST

### Smart Contract
- [ ] Unit tests: >= 80% coverage
- [ ] Fuzzing tests: minimal (1+ targets)
- [ ] Logic verification: all critical paths
- [ ] Integration tests: full flow
- [ ] Precision tests: no rounding errors
- [ ] Security audit: external review
- [ ] Code review: 2+ reviewers

### Web2 Backend
- [ ] Unit tests: >= 80% coverage
- [ ] Integration tests: full flow
- [ ] E2E tests: main endpoints
- [ ] Precision tests: Decimal arithmetic
- [ ] Security tests: Schemathesis
- [ ] Performance tests: load testing
- [ ] Code review: 2+ reviewers

### Deployment
- [ ] All tests passing
- [ ] Coverage >= 80%
- [ ] Security audit passed
- [ ] Performance acceptable
- [ ] Monitoring configured
- [ ] Alerting configured
- [ ] Rollback plan ready
