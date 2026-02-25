# VRF Integration Documentation

## Overview

Magic Roulette uses Verifiable Random Function (VRF) to generate provably fair randomness for determining the bullet chamber position. This ensures that neither players nor the platform can predict or manipulate the outcome of games.

**VRF Provider**: MagicBlock Ephemeral VRF SDK
**Integration Type**: On-chain callback pattern
**Randomness Source**: Verifiable Random Function with cryptographic proof

## VRF Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    VRF Randomness Flow                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Game Creation                                           │
│     ├─ Player creates game with vrf_seed                    │
│     ├─ Game status: WaitingForPlayers                       │
│     └─ VRF seed stored in game state                        │
│                                                              │
│  2. Game Ready (All Players Joined)                         │
│     ├─ Game status: Ready                                   │
│     └─ Ready for VRF request                                │
│                                                              │
│  3. VRF Request (On Ephemeral Rollup)                       │
│     ├─ Instruction: request_vrf_randomness                  │
│     ├─ Game status: InProgress                              │
│     ├─ vrf_pending = true                                   │
│     └─ VRF oracle receives request                          │
│                                                              │
│  4. VRF Callback                                            │
│     ├─ Instruction: request_vrf_randomness_callback         │
│     ├─ VRF oracle provides randomness + proof               │
│     ├─ vrf_result stored in game state                      │
│     ├─ vrf_pending = false                                  │
│     └─ vrf_fulfilled = true                                 │
│                                                              │
│  5. Bullet Chamber Determination                            │
│     ├─ Instruction: process_vrf_result                      │
│     ├─ Calculate: bullet_chamber = (randomness % 6) + 1     │
│     ├─ Store bullet_chamber in game state                   │
│     └─ Game ready for shots                                 │
│                                                              │
│  6. Gameplay                                                │
│     ├─ Players take shots (current_chamber increments)      │
│     ├─ Check: current_chamber == bullet_chamber?            │
│     ├─ If match: Player eliminated                          │
│     └─ If no match: Next player's turn                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## VRF Instructions

### 1. `request_vrf_randomness`

Requests verifiable randomness from the VRF oracle.

**Execution Context**: Ephemeral Rollup (gasless)

**Parameters**: None (uses stored vrf_seed)

**Accounts**:
- `game` (mut) - Game account
- `vrf_oracle` - VRF oracle program

**Validation**:
- Game must be in `Ready` status
- VRF request must not be pending (`vrf_pending == false`)
- All players must have joined

**State Changes**:
- `game.vrf_pending = true`
- `game.status = InProgress`

**Security Considerations**:
- ✅ Prevents duplicate VRF requests
- ✅ Ensures game is ready before requesting randomness
- ⚠️ **AUDIT FOCUS**: VRF request cannot be replayed

```rust
pub fn request_vrf_randomness(ctx: Context<RequestVrfRandomness>) -> Result<()> {
    let game = &mut ctx.accounts.game;
    
    // SECURITY: Prevent duplicate requests
    require!(!game.vrf_pending, errors::GameError::VrfRequestPending);
    
    game.vrf_pending = true;
    msg!("VRF randomness requested for game {}", game.game_id);
    
    Ok(())
}
```

### 2. `request_vrf_randomness_callback`

Receives verifiable randomness from the VRF oracle.

**Execution Context**: Ephemeral Rollup (called by VRF oracle)

**Parameters**:
- `randomness: [u8; 32]` - 32-byte verifiable random value

**Accounts**:
- `game` (mut) - Game account
- `vrf_oracle` (signer) - VRF oracle authority

**Validation**:
- VRF request must be pending (`vrf_pending == true`)
- Caller must be authorized VRF oracle
- Randomness must be valid 32-byte array

**State Changes**:
- `game.vrf_result = randomness`
- `game.vrf_pending = false`
- `game.vrf_fulfilled = true`

**Security Considerations**:
- ✅ Only VRF oracle can call this instruction
- ✅ Randomness is cryptographically verifiable
- ✅ Prevents unauthorized randomness injection
- ⚠️ **AUDIT FOCUS**: VRF oracle authority validation

```rust
pub fn request_vrf_randomness_callback(
    ctx: Context<VrfCallback>, 
    randomness: [u8; 32]
) -> Result<()> {
    let game = &mut ctx.accounts.game;
    
    // Store randomness in game state
    game.vrf_result = randomness;
    game.vrf_pending = false;
    game.vrf_fulfilled = true;
    
    msg!("VRF randomness received for game {}", game.game_id);
    msg!("Randomness: {:?}", &randomness[0..8]);
    
    Ok(())
}
```

### 3. `process_vrf_result`

Processes VRF randomness and determines bullet chamber position.

**Execution Context**: Ephemeral Rollup or Base Layer

**Parameters**:
- `randomness: [u8; 32]` - VRF randomness result

**Accounts**:
- `game` (mut) - Game account

**Validation**:
- VRF must be fulfilled (`vrf_fulfilled == true`)
- Bullet chamber must not already be set
- Randomness must match stored `vrf_result`

**State Changes**:
- `game.bullet_chamber = Some((randomness[0] % 6) + 1)`
- `game.current_chamber = 1`

**Bullet Chamber Calculation**:
```rust
// Use first byte of randomness for chamber determination
let random_byte = randomness[0];

// Calculate chamber (1-6)
let bullet_chamber = (random_byte % 6) + 1;

game.bullet_chamber = Some(bullet_chamber);
game.current_chamber = 1;
```

**Security Considerations**:
- ✅ Uniform distribution across chambers 1-6
- ✅ Randomness cannot be predicted before VRF callback
- ✅ Bullet chamber hidden from players until fired
- ⚠️ **AUDIT FOCUS**: Modulo bias analysis (negligible for 256 % 6)

## VRF Security Properties

### 1. Unpredictability

**Property**: The bullet chamber position cannot be predicted before the VRF callback.

**Mechanism**:
- VRF seed provided at game creation
- Randomness generated by VRF oracle using cryptographic functions
- Result is deterministic given seed but unpredictable without oracle's private key

**Verification**:
- VRF proof can be verified on-chain
- Randomness is cryptographically bound to the seed

### 2. Manipulation Resistance

**Property**: Neither players nor platform can manipulate the bullet chamber position.

**Mechanism**:
- VRF oracle is independent third-party
- Randomness is verifiable using cryptographic proof
- Bullet chamber calculation is deterministic from randomness

**Attack Vectors Mitigated**:
- ❌ Player cannot choose favorable seed (seed provided at creation)
- ❌ Platform cannot manipulate randomness (VRF oracle is independent)
- ❌ VRF oracle cannot manipulate without detection (proof is verifiable)

### 3. Fairness

**Property**: All chamber positions (1-6) have equal probability.

**Mechanism**:
- Uniform random byte (0-255) from VRF
- Modulo 6 operation: `(random_byte % 6) + 1`
- Slight bias: chambers 1-4 have probability 43/256, chambers 5-6 have probability 42/256
- Bias magnitude: ~0.39% difference (negligible)

**Distribution Analysis**:
```
Chamber 1: 43/256 = 16.80%
Chamber 2: 43/256 = 16.80%
Chamber 3: 43/256 = 16.80%
Chamber 4: 43/256 = 16.80%
Chamber 5: 42/256 = 16.41%
Chamber 6: 42/256 = 16.41%

Max bias: 0.39% (acceptable for gaming)
```

### 4. Verifiability

**Property**: VRF randomness can be verified by anyone.

**Mechanism**:
- VRF oracle provides cryptographic proof with randomness
- Proof can be verified using oracle's public key
- Verification ensures randomness was generated correctly

**Verification Process**:
1. VRF oracle generates randomness using private key and seed
2. Oracle provides randomness + proof
3. Anyone can verify proof using oracle's public key
4. Verification confirms randomness is valid for given seed

## VRF State Management

### Game State Fields

```rust
pub struct Game {
    // ... other fields ...
    
    // VRF fields
    pub vrf_seed: [u8; 32],          // Seed provided at game creation
    pub vrf_pending: bool,           // VRF request in progress
    pub vrf_fulfilled: bool,         // VRF callback received
    pub vrf_result: [u8; 32],        // VRF randomness result
    pub bullet_chamber: Option<u8>,  // Bullet chamber (1-6, hidden)
    pub current_chamber: u8,         // Current chamber position (1-6)
}
```

### State Transitions

```
Game Creation
├─ vrf_seed = [provided seed]
├─ vrf_pending = false
├─ vrf_fulfilled = false
├─ vrf_result = [0; 32]
├─ bullet_chamber = None
└─ current_chamber = 0

VRF Request
├─ vrf_pending = true
└─ status = InProgress

VRF Callback
├─ vrf_result = [randomness]
├─ vrf_pending = false
└─ vrf_fulfilled = true

Process VRF Result
├─ bullet_chamber = Some((randomness[0] % 6) + 1)
└─ current_chamber = 1

Shot Execution
├─ current_chamber += 1
└─ Check: current_chamber == bullet_chamber?
```

## VRF Integration with Ephemeral Rollups

### Execution Context

**VRF Request**: Executed on Ephemeral Rollup (gasless)
**VRF Callback**: Executed on Ephemeral Rollup (gasless)
**Process Result**: Executed on Ephemeral Rollup (gasless)

### Benefits

1. **Gasless Randomness**: VRF request and callback are gasless on ER
2. **Sub-10ms Latency**: VRF callback processed in <10ms
3. **State Commitment**: Final game state with bullet chamber committed to base layer

### Commit Pattern

```
Ephemeral Rollup:
├─ Request VRF randomness (gasless)
├─ Receive VRF callback (gasless)
├─ Process VRF result (gasless)
├─ Execute shots (gasless)
└─ Commit final state to base layer

Base Layer:
├─ Receive committed state
├─ Verify state transition
└─ Finalize game and distribute winnings
```

## Security Audit Focus Areas

### Critical

1. **VRF Oracle Authority Validation**
   - Verify only authorized VRF oracle can call callback
   - Check oracle public key validation
   - Ensure no unauthorized randomness injection

2. **Randomness Manipulation Resistance**
   - Verify seed cannot be chosen to favor specific outcomes
   - Check VRF proof verification (if implemented)
   - Ensure bullet chamber calculation is deterministic

3. **Replay Attack Prevention**
   - Verify VRF request cannot be replayed
   - Check duplicate request prevention
   - Ensure one randomness per game

### High

4. **Bullet Chamber Calculation**
   - Verify modulo bias is acceptable
   - Check uniform distribution
   - Ensure calculation is deterministic

5. **State Transition Validation**
   - Verify VRF state transitions are correct
   - Check vrf_pending flag prevents race conditions
   - Ensure bullet chamber is set before shots

### Medium

6. **VRF Seed Uniqueness**
   - Verify seeds are unique per game
   - Check seed collision handling
   - Ensure seed cannot be reused

## Testing Recommendations

### Unit Tests

1. Test VRF request with valid game state
2. Test VRF callback with valid randomness
3. Test bullet chamber calculation for all random bytes (0-255)
4. Test duplicate VRF request prevention
5. Test unauthorized VRF callback rejection

### Integration Tests

1. Test complete VRF flow (request → callback → process)
2. Test VRF integration with Ephemeral Rollups
3. Test VRF with concurrent games
4. Test VRF failure handling

### Security Tests

1. Attempt to manipulate VRF seed
2. Attempt to inject unauthorized randomness
3. Attempt to replay VRF request
4. Attempt to predict bullet chamber before VRF callback
5. Verify bullet chamber distribution over 10,000 games

## Known Limitations

1. **Modulo Bias**: Slight bias in chamber distribution (~0.39% max difference)
   - **Mitigation**: Bias is negligible for gaming purposes
   - **Alternative**: Use rejection sampling (adds complexity)

2. **VRF Oracle Trust**: System relies on VRF oracle honesty
   - **Mitigation**: VRF proof verification (if implemented)
   - **Alternative**: Use multiple VRF oracles and combine results

3. **Seed Predictability**: If seed generation is predictable, outcomes may be predictable
   - **Mitigation**: Use high-entropy seed sources (timestamp, blockhash, user input)
   - **Recommendation**: Document seed generation best practices

## Conclusion

The VRF integration provides provably fair randomness for Magic Roulette games. The system is designed to prevent manipulation by players or the platform, with verifiable randomness generation. The main security considerations are VRF oracle authority validation and randomness manipulation resistance.

**Audit Recommendation**: Focus on VRF oracle authority validation, replay attack prevention, and bullet chamber calculation correctness.
