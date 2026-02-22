# Magic Roulette Architecture

## System Overview

Magic Roulette combines multiple cutting-edge Solana technologies to create a high-performance, cost-efficient, and provably fair Russian Roulette game.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Magic Roulette Stack                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  Token-2022     │  │  Light Protocol  │  │  MagicBlock ER   │  │
│  │  Platform Token │  │  ZK Compression  │  │  Intel TDX       │  │
│  │  + Extensions   │  │  1000x Savings   │  │  Sub-10ms        │  │
│  └─────────────────┘  └──────────────────┘  └──────────────────┘  │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Anchor Program (Rust)                           │   │
│  │  - Game State Management                                     │   │
│  │  - Fee Distribution (5% platform, 10% treasury, 85% winner) │   │
│  │  - Delegation/Commit Logic                                   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              TypeScript SDK                                  │   │
│  │  - @solana/kit (modern SDK)                                 │   │
│  │  - Light Protocol integration                               │   │
│  │  - ER connection management                                 │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### 1. Token-2022 (SPL Token Extensions)

**Purpose**: Platform token with advanced features

**Features Used**:
- Transfer hooks for custom logic
- Metadata extension for token info
- Permanent delegate for platform operations
- Interest-bearing tokens (future: staking rewards)

**Benefits**:
- Native Solana integration
- Composable with DeFi protocols
- Lower fees than custom token programs
- Future-proof with extension support

### 2. Light Protocol ZK Compression

**Purpose**: 1000x storage cost reduction

**Implementation**:
```typescript
// Create compressed mint
const { mint } = await createMint(rpc, payer, authority, 9);

// Mint compressed tokens (5,000 lamports vs 2M for SPL)
await mintTo(rpc, payer, mint, recipient, authority, amount);

// Transfer compressed tokens
await transfer(rpc, payer, mint, amount, sender, recipient);
```

**Cost Comparison**:
| Operation | SPL Token | Compressed Token | Savings |
|-----------|-----------|------------------|---------|
| Token Account | ~2,000,000 lamports | ~5,000 lamports | 400x |
| Mint | ~1,461,600 lamports | ~7,308 lamports | 200x |
| Transfer | ~5,000 lamports | ~5,000 lamports | 1x |

**Benefits**:
- Rent-free token accounts
- Massive cost savings for users
- Same security as L1
- Full composability

### 3. MagicBlock Ephemeral Rollups (ER)

**Purpose**: Sub-10ms gameplay with privacy

**Architecture**:
```
Base Layer (Solana)              Private ER (Intel TDX)
─────────────────────            ──────────────────────
│ Initialize Game    │           │ Execute Shots      │
│ Delegate to ER     │ ────────> │ Private State      │
│ VRF Request        │           │ Zero Gas           │
│ Commit Final State │ <──────── │ Reveal Winner      │
└────────────────────┘           └────────────────────┘
```

**Delegation Flow**:
1. Game created on base layer
2. Players join and pay entry fees
3. Game delegated to Private ER (Intel TDX)
4. Shots executed privately (no one sees order)
5. Winner revealed and state committed back
6. Funds distributed on base layer

**Benefits**:
- Sub-10ms transaction latency
- Gasless transactions for players
- Privacy via Intel TDX (TEE)
- Horizontal scaling

### 4. MagicBlock VRF

**Purpose**: Provably fair randomness

**Implementation**:
```rust
// Request randomness
pub fn create_game(ctx: Context<CreateGame>, vrf_seed: [u8; 32]) {
    game.vrf_seed = vrf_seed;
    // VRF callback will set bullet_chamber
}

// Process VRF result
pub fn process_vrf_result(ctx: Context<ProcessVrfResult>, randomness: [u8; 32]) {
    let random_u64 = u64::from_le_bytes(randomness[0..8]);
    game.bullet_chamber = ((random_u64 % 6) + 1) as u8;
}
```

**Benefits**:
- Verifiable randomness
- Cannot be manipulated
- On-chain verification
- Low latency

## Data Flow

### Game Creation Flow

```
1. Player 1 creates game
   ├─> Create game PDA
   ├─> Transfer entry fee (compressed tokens)
   └─> Set game mode (1v1 or 2v2)

2. Player 2 joins
   ├─> Transfer entry fee
   └─> Game marked as full

3. Delegate to ER
   ├─> Transfer ownership to delegation program
   ├─> Request VRF randomness
   └─> Game ready to start
```

### Gameplay Flow (in Private ER)

```
1. VRF sets bullet chamber (1-6)
   └─> Hidden in Intel TDX

2. Players take turns
   ├─> Player 1 shoots (chamber 1)
   ├─> Player 2 shoots (chamber 2)
   ├─> Player 1 shoots (chamber 3)
   └─> Continue until bullet fires

3. Bullet fires
   ├─> Losing player identified
   ├─> Winner team determined
   └─> Game status = Finished
```

### Finalization Flow

```
1. Commit state from ER to base layer
   └─> Final game state written to Solana

2. Calculate distributions
   ├─> Winner(s): 85% of pot
   ├─> Platform: 5% of pot
   └─> Treasury: 10% of pot

3. Transfer funds
   ├─> Winner(s) receive compressed tokens
   ├─> Platform vault updated
   └─> Treasury vault updated

4. Update stats
   ├─> Platform total volume
   ├─> Player win/loss records
   └─> Treasury balance
```

## Account Structure

### PlatformConfig
```rust
pub struct PlatformConfig {
    pub authority: Pubkey,        // Platform admin
    pub treasury: Pubkey,         // Treasury for rewards
    pub platform_fee_bps: u16,    // 500 = 5%
    pub treasury_fee_bps: u16,    // 1000 = 10%
    pub total_games: u64,         // Game counter
    pub total_volume: u64,        // Total wagered
    pub treasury_balance: u64,    // Available for rewards
    pub bump: u8,
}
```

### Game
```rust
pub struct Game {
    pub game_id: u64,
    pub creator: Pubkey,
    pub game_mode: GameMode,      // 1v1 or 2v2
    pub status: GameStatus,
    pub entry_fee: u64,
    pub total_pot: u64,
    
    // Teams
    pub team_a: [Pubkey; 2],
    pub team_b: [Pubkey; 2],
    pub team_a_count: u8,
    pub team_b_count: u8,
    
    // Game state (private in ER)
    pub bullet_chamber: u8,       // 1-6
    pub current_chamber: u8,
    pub current_turn: u8,
    pub shots_taken: u8,
    
    // VRF
    pub vrf_seed: [u8; 32],
    pub vrf_result: Option<[u8; 32]>,
    
    // Results
    pub winner_team: Option<u8>,
    pub created_at: i64,
    pub finished_at: Option<i64>,
    pub bump: u8,
}
```

### PlayerStats
```rust
pub struct PlayerStats {
    pub player: Pubkey,
    pub games_played: u64,
    pub games_won: u64,
    pub total_wagered: u64,
    pub total_winnings: u64,
    pub shots_survived: u64,
    pub bump: u8,
}
```

### TreasuryRewards
```rust
pub struct TreasuryRewards {
    pub player: Pubkey,
    pub claimable_amount: u64,
    pub total_claimed: u64,
    pub last_claim: i64,
    pub bump: u8,
}
```

## Security Considerations

### 1. Randomness
- VRF ensures unpredictable bullet placement
- Seed generated client-side, result verified on-chain
- Cannot be manipulated by players or platform

### 2. Privacy
- Intel TDX (TEE) hides shot order during gameplay
- Only final result revealed on base layer
- Prevents front-running and manipulation

### 3. Fund Security
- Game vault holds funds during gameplay
- PDA-controlled transfers (no admin keys)
- Automatic distribution on finalization
- No manual intervention required

### 4. Delegation Safety
- Ephemeral Rollups SDK handles delegation
- State committed back to base layer
- Cannot be censored or manipulated
- Full audit trail on Solana

### 5. Compressed Token Security
- Light Protocol uses ZK proofs
- Same security as L1 Solana
- Merkle tree state verification
- No trusted setup required

## Performance Metrics

### Expected Performance

| Metric | Value |
|--------|-------|
| Game Creation | ~400ms (base layer) |
| Join Game | ~400ms (base layer) |
| Delegation | ~400ms (base layer) |
| Shot Execution | ~10ms (ER) |
| Finalization | ~400ms (base layer) |
| Token Transfer Cost | ~5,000 lamports |
| Token Account Cost | ~5,000 lamports |

### Scalability

- **Concurrent Games**: Unlimited (horizontal scaling via ER)
- **Players per Game**: 2-4
- **Shots per Second**: ~100 per ER instance
- **Cost per Game**: ~0.00001 SOL (compressed tokens)

## Future Enhancements

### Phase 2: Advanced Features
- [ ] Spectator mode with live updates
- [ ] Tournament brackets (8-16 players)
- [ ] Custom game rules (chamber count, entry fees)
- [ ] NFT rewards for winners
- [ ] Leaderboards and achievements

### Phase 3: DeFi Integration
- [ ] Staking for treasury rewards
- [ ] Liquidity pools for platform token
- [ ] Yield farming with game fees
- [ ] Governance for platform parameters

### Phase 4: Cross-Chain
- [ ] Bridge to other chains via deBridge
- [ ] Multi-chain tournaments
- [ ] Cross-chain token support

## Monitoring and Analytics

### Key Metrics to Track
- Total games played
- Total volume wagered
- Average game duration
- Player retention rate
- Treasury growth rate
- Platform revenue
- ER performance (latency, uptime)
- Compressed token adoption

### Dashboards
- Real-time game stats
- Player leaderboards
- Treasury balance and distributions
- Platform fee collection
- ER delegation status
