# Magic Roulette Game Mechanics

## Overview

Magic Roulette is a Russian Roulette-style game where players compete in 1v1 or 2v2 battles. The winner takes 85% of the pot, with 5% going to platform operations and 10% to a treasury fund for community rewards.

## Game Modes

### 1v1 Mode
- 2 players compete
- Players alternate taking shots
- First player to hit the bullet loses
- Winner takes 85% of total pot (2x entry fee)

### 2v2 Mode
- 4 players compete in teams
- Teams alternate taking shots
- Team members take turns within their team
- First player to hit the bullet causes their team to lose
- Winning team splits 85% of pot (4x entry fee)

## Game Flow

### Phase 1: Lobby (Base Layer)

```
1. Create Game
   ├─> Player 1 creates game with entry fee
   ├─> Selects game mode (1v1 or 2v2)
   ├─> Pays entry fee in compressed tokens
   └─> Game enters "Waiting for Players" state

2. Join Game
   ├─> Other players join with matching entry fee
   ├─> For 1v1: 1 additional player needed
   ├─> For 2v2: 3 additional players needed
   └─> Game enters "Ready" state when full
```

### Phase 2: Delegation (Base Layer → ER)

```
3. Delegate to Private ER
   ├─> Game state transferred to Ephemeral Rollup
   ├─> Ownership given to delegation program
   ├─> VRF randomness requested
   └─> Game enters "Delegated" state

4. VRF Processing
   ├─> Random number generated (provably fair)
   ├─> Bullet chamber determined (1-6)
   ├─> Chamber position hidden in Intel TDX
   └─> Game enters "In Progress" state
```

### Phase 3: Gameplay (Private ER)

```
5. Take Turns
   ├─> Players take turns shooting
   ├─> Each shot advances chamber position
   ├─> Shot order hidden in TEE (privacy)
   └─> Continue until bullet fires

6. Bullet Fires
   ├─> Losing player identified
   ├─> Winner team determined
   ├─> Game enters "Finished" state
   └─> Final state prepared for commit
```

### Phase 4: Finalization (ER → Base Layer)

```
7. Commit State
   ├─> Final game state written to Solana
   ├─> Winner revealed publicly
   └─> Funds ready for distribution

8. Distribute Winnings
   ├─> Winner(s): 85% of pot
   ├─> Platform: 5% of pot
   ├─> Treasury: 10% of pot
   └─> Stats updated
```

## Turn Order

### 1v1 Example
```
Entry Fee: 100 tokens each
Total Pot: 200 tokens

Turn Order:
1. Player A shoots (chamber 1) → Click
2. Player B shoots (chamber 2) → Click
3. Player A shoots (chamber 3) → Click
4. Player B shoots (chamber 4) → BANG!

Result:
- Player B loses (hit bullet)
- Player A wins 170 tokens (85%)
- Platform gets 10 tokens (5%)
- Treasury gets 20 tokens (10%)
```

### 2v2 Example
```
Entry Fee: 100 tokens each
Total Pot: 400 tokens

Teams:
- Team A: Player 1, Player 2
- Team B: Player 3, Player 4

Turn Order:
1. Player 1 (Team A) shoots → Click
2. Player 3 (Team B) shoots → Click
3. Player 2 (Team A) shoots → Click
4. Player 4 (Team B) shoots → Click
5. Player 1 (Team A) shoots → BANG!

Result:
- Player 1 loses (hit bullet)
- Team A loses
- Team B wins 340 tokens (85% split: 170 each)
- Platform gets 20 tokens (5%)
- Treasury gets 40 tokens (10%)
```

## Fee Distribution

### Standard Distribution (15% total fees)

```
Total Pot: 100%
├─> Winner(s): 85%
├─> Platform Operations: 5%
└─> Treasury Rewards: 10%
```

### Example Calculations

#### 1v1 Game (200 tokens)
```
Total Pot: 200 tokens
├─> Winner: 170 tokens (85%)
├─> Platform: 10 tokens (5%)
└─> Treasury: 20 tokens (10%)
```

#### 2v2 Game (400 tokens)
```
Total Pot: 400 tokens
├─> Team Winners: 340 tokens (85%)
│   ├─> Player 1: 170 tokens
│   └─> Player 2: 170 tokens
├─> Platform: 20 tokens (5%)
└─> Treasury: 40 tokens (10%)
```

## Treasury Reward System

Inspired by ore.supply's mining rewards model.

### How It Works

1. **Accumulation**
   - 10% of every game pot goes to treasury
   - Treasury balance grows with platform activity
   - No manual deposits required

2. **Distribution**
   - Rewards distributed based on activity
   - Active players earn more rewards
   - Weighted by games played and volume

3. **Claiming**
   - Players can claim rewards anytime
   - No lockup period
   - Instant transfer to wallet

### Reward Calculation (Example)

```typescript
// Simplified reward formula
playerReward = (playerGames / totalGames) * treasuryBalance * rewardRate

// Example:
// - Player played 100 games
// - Total platform games: 10,000
// - Treasury balance: 50,000 tokens
// - Reward rate: 1% per epoch

playerReward = (100 / 10000) * 50000 * 0.01
             = 0.01 * 50000 * 0.01
             = 5 tokens
```

### Reward Tiers (Future)

| Tier | Games Played | Bonus Multiplier |
|------|--------------|------------------|
| Bronze | 1-50 | 1.0x |
| Silver | 51-200 | 1.2x |
| Gold | 201-500 | 1.5x |
| Platinum | 501-1000 | 2.0x |
| Diamond | 1000+ | 3.0x |

## Randomness & Fairness

### VRF Implementation

```rust
// Bullet chamber determined by VRF
pub fn process_vrf_result(randomness: [u8; 32]) {
    let random_u64 = u64::from_le_bytes(randomness[0..8]);
    game.bullet_chamber = ((random_u64 % 6) + 1) as u8;
}
```

### Fairness Guarantees

1. **Unpredictable**: VRF result cannot be predicted
2. **Verifiable**: Anyone can verify randomness on-chain
3. **Tamper-proof**: Cannot be manipulated by players or platform
4. **Transparent**: VRF seed and result stored on-chain

### Privacy via Intel TDX

- Bullet chamber hidden during gameplay
- Shot order not visible to other players
- Only final result revealed
- Prevents strategic manipulation

## Player Stats & Achievements

### Tracked Stats

```rust
pub struct PlayerStats {
    pub games_played: u64,      // Total games
    pub games_won: u64,         // Wins
    pub total_wagered: u64,     // Total bet
    pub total_winnings: u64,    // Total won
    pub shots_survived: u64,    // Shots without hitting bullet
}
```

### Calculated Metrics

- **Win Rate**: `games_won / games_played * 100`
- **ROI**: `(total_winnings - total_wagered) / total_wagered * 100`
- **Survival Rate**: `shots_survived / games_played`
- **Average Bet**: `total_wagered / games_played`

### Achievements (Future)

| Achievement | Requirement | Reward |
|-------------|-------------|--------|
| First Blood | Win first game | 10 tokens |
| Lucky Streak | Win 5 in a row | 50 tokens |
| High Roller | Bet 1000+ tokens | 100 tokens |
| Survivor | Survive 100 shots | 200 tokens |
| Champion | Win 100 games | 500 tokens |

## Game Rules

### Basic Rules

1. **Entry Fee**: Must match game creator's entry fee
2. **Turn Order**: Alternates between teams/players
3. **Chamber**: 6 chambers, 1 bullet
4. **Winning**: Survive all shots or opponent hits bullet
5. **Timeout**: 30 seconds per turn (future)

### Edge Cases

#### All Players Survive
- Extremely rare (1/6^n probability)
- Game continues until bullet fires
- No draws possible

#### Player Disconnects
- Turn auto-skipped after timeout
- Game continues with remaining players
- Disconnected player forfeits

#### ER Downtime
- Game state preserved on base layer
- Can resume when ER back online
- Funds always safe in vault

## Strategy & Psychology

### Optimal Strategy

Russian Roulette is a game of pure chance, but players can:
- Choose entry fees based on risk tolerance
- Select game modes (1v1 vs 2v2)
- Time entry to avoid specific opponents
- Build reputation for psychological advantage

### Psychological Factors

- **Pressure**: Later turns have higher tension
- **Team Dynamics**: 2v2 adds social pressure
- **Spectators**: Public games increase stakes
- **Reputation**: Win streaks attract attention

## Anti-Cheat Measures

### Technical Safeguards

1. **VRF Randomness**: Cannot predict bullet position
2. **Intel TDX**: Cannot see shot order
3. **On-Chain Verification**: All actions recorded
4. **Deterministic Logic**: No room for manipulation

### Monitoring

- Unusual win rates flagged
- Suspicious patterns detected
- Manual review for edge cases
- Community reporting system

## Future Game Modes

### Planned Variants

1. **Speed Roulette**
   - 10 second turns
   - Higher stakes
   - Bonus multipliers

2. **Team Tournament**
   - 8-16 teams
   - Bracket elimination
   - Grand prize pool

3. **Custom Rules**
   - Variable chamber count (4-10)
   - Multiple bullets
   - Special power-ups

4. **Spectator Betting**
   - Watch live games
   - Bet on outcomes
   - Share in winnings

## Economic Model

### Platform Sustainability

```
Monthly Volume: 1,000,000 tokens
├─> Winners: 850,000 tokens (85%)
├─> Platform: 50,000 tokens (5%)
│   ├─> Operations: 30,000 tokens
│   ├─> Development: 15,000 tokens
│   └─> Marketing: 5,000 tokens
└─> Treasury: 100,000 tokens (10%)
    ├─> Player Rewards: 80,000 tokens
    ├─> Liquidity: 15,000 tokens
    └─> Reserve: 5,000 tokens
```

### Growth Projections

| Month | Games | Volume | Platform Fee | Treasury |
|-------|-------|--------|--------------|----------|
| 1 | 1,000 | 100K | 5K | 10K |
| 3 | 5,000 | 500K | 25K | 50K |
| 6 | 20,000 | 2M | 100K | 200K |
| 12 | 100,000 | 10M | 500K | 1M |

## Responsible Gaming

### Player Protection

- Betting limits (configurable)
- Self-exclusion options
- Loss limits per day/week
- Reality checks (time played)
- Educational resources

### Age Verification

- KYC for high-stakes games
- Jurisdiction restrictions
- Compliance with local laws
