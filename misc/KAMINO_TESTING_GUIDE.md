# Kamino Integration Testing Guide

Complete guide for testing the Kamino Finance integration with Magic Roulette.

---

## 📋 Prerequisites

### 1. Install Dependencies

```bash
# Install Kamino SDK (optional but recommended)
npm install @kamino-finance/klend-sdk

# Install testing dependencies
npm install --save-dev chai @types/chai
npm install --save-dev @solana/web3.js @coral-xyz/anchor
```

### 2. Get Kamino Devnet Addresses

You need to fetch real Kamino devnet market addresses. Here's how:

**Option A: Use Kamino SDK**
```typescript
import { KaminoMarket } from '@kamino-finance/klend-sdk';
import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection("https://api.devnet.solana.com");
const marketAddress = new PublicKey("DxXdAyU3kCjnyggvHmY5nAwg5cRbbmdyX3npfDMjjMek");

const market = await KaminoMarket.load(connection, marketAddress, 400);

// Get SOL reserve
const solReserve = market.getReserve("SOL");
console.log("SOL Reserve:", solReserve.address.toString());
console.log("Liquidity Supply:", solReserve.stats.liquiditySupply.toString());
console.log("Collateral Mint:", solReserve.stats.collateralMint.toString());
```

**Option B: Use Kamino CLI**
```bash
# Install Kamino CLI
npm install -g @kamino-finance/klend-cli

# Print all reserves
kamino-cli print-all-reserve-accounts --rpc https://api.devnet.solana.com
```

**Option C: Query On-Chain**
```bash
# Get market account
solana account DxXdAyU3kCjnyggvHmY5nAwg5cRbbmdyX3npfDMjjMek --url devnet
```

### 3. Update Helper File

Once you have the addresses, update `sdk/kamino-helpers.ts`:

```typescript
// Replace placeholders with real addresses
const solReserve = new PublicKey("YOUR_SOL_RESERVE_ADDRESS");
const reserveLiquiditySupply = new PublicKey("YOUR_LIQUIDITY_SUPPLY_ADDRESS");
const reserveCollateralMint = new PublicKey("YOUR_COLLATERAL_MINT_ADDRESS");
const reserveCollateralSupply = new PublicKey("YOUR_COLLATERAL_SUPPLY_ADDRESS");
```

---

## 🧪 Running Tests

### Unit Tests (No Kamino Required)

These tests don't require real Kamino integration:

```bash
# Test collateral calculations
npm test -- --grep "Collateral Calculations"

# Test account derivation
npm test -- --grep "Account Derivation"

# Test error handling
npm test -- --grep "Error Handling"
```

### Integration Tests (Requires Kamino Devnet)

These tests require real Kamino devnet market:

```bash
# Run all integration tests
npm test -- --grep "Integration"

# Run specific test
npm test -- --grep "creates game with Kamino loan"
```

**Note**: Integration tests are skipped by default. Remove `.skip` from test descriptions to enable them.

---

## 🔍 Verifying Instruction Discriminators

The CPI helper functions use hardcoded instruction discriminators. These need to match Kamino's actual instruction layout.

### Method 1: Check Kamino IDL

```bash
# Clone Kamino repo
git clone https://github.com/Kamino-Finance/klend.git
cd klend

# Find IDL
cat target/idl/kamino_lending.json | jq '.instructions[] | select(.name == "deposit_reserve_liquidity")'
```

### Method 2: Use Anchor CLI

```bash
# Fetch Kamino program IDL
anchor idl fetch KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD --provider.cluster devnet

# Check instruction discriminators
cat kamino_lending.json | jq '.instructions[] | {name: .name, discriminator: .discriminator}'
```

### Method 3: Test with Simulation

```typescript
import { Connection, PublicKey, Transaction } from '@solana/web3.js';

const connection = new Connection("https://api.devnet.solana.com");

// Build your CPI instruction
const ix = build_kamino_deposit_ix(...);

// Simulate transaction
const tx = new Transaction().add(ix);
const simulation = await connection.simulateTransaction(tx);

if (simulation.value.err) {
  console.error("Simulation failed:", simulation.value.err);
  console.log("Logs:", simulation.value.logs);
} else {
  console.log("✅ Instruction discriminator is correct!");
}
```

### Expected Discriminators

Based on Anchor's instruction discriminator calculation (first 8 bytes of SHA256 hash of "global:instruction_name"):

```rust
// These are the discriminators we're using
DepositReserveLiquidity: [0xef, 0x1d, 0x1a, 0x4e, 0x15, 0x4a, 0x9c, 0x7e]
BorrowObligationLiquidity: [0x0c, 0x7e, 0x9e, 0x3a, 0x17, 0x4d, 0x5e, 0x8f]
RepayObligationLiquidity: [0x84, 0x3e, 0x4c, 0x8b, 0x1f, 0x2d, 0x6a, 0x9f]
WithdrawObligationCollateral: [0x3a, 0x7f, 0x1d, 0x9e, 0x4b, 0x2c, 0x8f, 0x6d]
```

**⚠️ IMPORTANT**: If tests fail with "Invalid instruction data", the discriminators are likely incorrect. You'll need to:
1. Fetch Kamino's actual IDL
2. Extract correct discriminators
3. Update the helper functions in `create_game_with_loan.rs` and `finalize_game_with_loan.rs`

---

## 🚀 Manual Testing Flow

### Step 1: Initialize Platform

```bash
# Initialize platform config
anchor run initialize-platform
```

### Step 2: Create Game with Loan

```typescript
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { getKaminoAccountsForGame, solToLamports } from './sdk/kamino-helpers';

const connection = new Connection("https://api.devnet.solana.com");
const wallet = Keypair.fromSecretKey(/* your secret key */);
const provider = new AnchorProvider(connection, wallet, {});
const program = // Load your program

// Parameters
const entryFee = solToLamports(0.01); // 0.01 SOL
const collateral = solToLamports(0.011); // 0.011 SOL (110%)
const vrfSeed = Array.from(crypto.getRandomValues(new Uint8Array(32)));

// Get accounts
const [platformConfig] = PublicKey.findProgramAddressSync(
  [Buffer.from("platform")],
  program.programId
);

const [gamePda] = PublicKey.findProgramAddressSync(
  [Buffer.from("game"), new BN(0).toArrayLike(Buffer, "le", 8)],
  program.programId
);

const accounts = await getKaminoAccountsForGame(
  connection,
  wallet.publicKey,
  gamePda,
  platformConfig,
  true // devnet
);

// Create game
const tx = await program.methods
  .createGameWithLoan(
    { oneVsOne: {} },
    entryFee,
    collateral,
    vrfSeed
  )
  .accounts(accounts)
  .rpc();

console.log("Game created:", tx);
```

### Step 3: Play Game

```bash
# Join game
anchor run join-game

# Take shots
anchor run take-shot
```

### Step 4: Finalize Game with Loan

```typescript
// After game is finished
const tx = await program.methods
  .finalizeGameWithLoan()
  .accounts({
    game: gamePda,
    platformConfig,
    gameVault,
    // Kamino accounts
    lendingMarket,
    lendingMarketAuthority,
    reserve,
    reserveLiquiditySupply,
    reserveCollateralMint,
    obligation,
    obligationCollateral,
    playerCollateralAccount,
    kaminoProgram: KAMINO_PROGRAM_ID,
    // Winner accounts
    winner1,
    winner2,
    platformVault,
    treasuryVault,
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
  })
  .rpc();

console.log("Game finalized:", tx);
```

---

## 🐛 Troubleshooting

### Error: "Invalid instruction data"

**Cause**: Instruction discriminators don't match Kamino's actual layout.

**Solution**:
1. Fetch Kamino IDL: `anchor idl fetch KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD`
2. Extract correct discriminators
3. Update helper functions

### Error: "Account not found"

**Cause**: Kamino account addresses are incorrect or placeholder values.

**Solution**:
1. Use Kamino SDK to fetch real addresses
2. Update `sdk/kamino-helpers.ts` with actual addresses
3. Ensure you're using devnet addresses for devnet testing

### Error: "Insufficient collateral"

**Cause**: Collateral is less than 110% of entry fee.

**Solution**:
```typescript
const entryFee = solToLamports(0.01);
const collateral = calculateRequiredCollateral(entryFee); // Automatically 110%
```

### Error: "Cross-program invocation with unauthorized signer"

**Cause**: PDA seeds or signer setup is incorrect.

**Solution**:
1. Verify game vault PDA derivation
2. Ensure correct bump seeds are used
3. Check that player is signing the transaction

### Error: "Obligation not found"

**Cause**: User doesn't have an obligation account yet.

**Solution**:
1. Create obligation account first (Kamino SDK handles this)
2. Or use `VanillaObligation` to auto-create

---

## 📊 Monitoring & Debugging

### View Transaction Logs

```bash
# Get transaction details
solana confirm -v <TRANSACTION_SIGNATURE> --url devnet

# View program logs
solana logs --url devnet | grep "magic_roulette"
```

### Check Account State

```bash
# Check game account
anchor account game <GAME_PDA> --provider.cluster devnet

# Check obligation account
solana account <OBLIGATION_ADDRESS> --url devnet
```

### Monitor Kamino Market

```typescript
import { KaminoMarket } from '@kamino-finance/klend-sdk';

const market = await KaminoMarket.load(connection, marketAddress, 400);

// Check SOL reserve stats
const solReserve = market.getReserve("SOL");
console.log("Available Liquidity:", solReserve.stats.availableLiquidity.toString());
console.log("Utilization Rate:", solReserve.stats.utilizationRate);
console.log("Borrow APY:", solReserve.stats.borrowApy);
```

---

## ✅ Test Checklist

Before deploying to mainnet, ensure all tests pass:

- [ ] Collateral calculations are correct (110%)
- [ ] Account derivation works
- [ ] Error handling works (insufficient collateral, low entry fee)
- [ ] Game creation with loan succeeds
- [ ] Kamino CPI calls execute successfully
- [ ] Loan repayment works when winner borrowed
- [ ] Collateral is returned to winner
- [ ] Liquidation works when borrower loses
- [ ] Platform fees are distributed correctly
- [ ] Treasury fees are distributed correctly
- [ ] No stack overflow errors
- [ ] No ambiguous glob re-exports
- [ ] Instruction discriminators are correct

---

## 🎯 Next Steps

1. **Get Real Kamino Addresses**: Use Kamino SDK or CLI to fetch devnet addresses
2. **Update Helper File**: Replace placeholder addresses in `sdk/kamino-helpers.ts`
3. **Verify Discriminators**: Test CPI calls with simulation
4. **Run Integration Tests**: Enable and run full integration tests
5. **Manual Testing**: Create and finalize games manually
6. **Security Audit**: Have code reviewed before mainnet
7. **Mainnet Deployment**: Deploy to mainnet with real Kamino markets

---

## 📚 Resources

- [Kamino Developer Docs](https://kamino.com/build/borrow)
- [Kamino SDK GitHub](https://github.com/Kamino-Finance/klend-sdk)
- [Kamino Program GitHub](https://github.com/Kamino-Finance/klend)
- [Anchor Documentation](https://www.anchor-lang.com/)
- [Solana Cookbook](https://solanacookbook.com/)

---

**Status**: Ready for testing with real Kamino devnet addresses
**Last Updated**: February 21, 2025
