# Magic Roulette - Deployment Guide

Complete guide for deploying Magic Roulette to Solana devnet with MagicBlock integration.

## Prerequisites

### Required Tools
```bash
# Solana CLI
solana --version  # Should be 1.18.0 or higher

# Anchor
anchor --version  # Should be 0.32.1

# Node.js
node --version    # Should be 18.0.0 or higher

# Rust
rustc --version   # Should be 1.75.0 or higher
```

### Install Missing Tools

**Solana CLI:**
```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
```

**Anchor:**
```bash
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked
```

## Step 1: Build the Program

### 1.1 Clean Previous Builds
```bash
anchor clean
rm -rf target/
```

### 1.2 Build Program
```bash
anchor build
```

**Expected Output:**
```
Compiling magic-roulette v0.1.0
Finished release [optimized] target(s)
```

**Verify Build:**
```bash
ls -lh target/deploy/magic_roulette.so
ls -lh target/idl/magic_roulette.json
```

### 1.3 Get Program ID
```bash
solana address -k target/deploy/magic_roulette-keypair.json
```

**Update Program ID:**
1. Copy the program ID
2. Update `declare_id!()` in `programs/magic-roulette/src/lib.rs`
3. Update `PROGRAM_ID` in `examples/magicblock-integration.ts`
4. Update `PROGRAM_ID` in `examples/simple-game-flow.ts`
5. Rebuild: `anchor build`

## Step 2: Configure Solana CLI

### 2.1 Set Network to Devnet
```bash
solana config set --url devnet
```

### 2.2 Create/Load Wallet
```bash
# Create new wallet
solana-keygen new -o ~/.config/solana/devnet-wallet.json

# Or use existing wallet
solana config set --keypair ~/.config/solana/devnet-wallet.json
```

### 2.3 Get Devnet SOL
```bash
solana airdrop 2
solana balance
```

**Note:** If airdrop fails, use [Solana Faucet](https://faucet.solana.com/)

## Step 3: Deploy to Devnet

### 3.1 Deploy Program
```bash
anchor deploy --provider.cluster devnet
```

**Expected Output:**
```
Deploying cluster: devnet
Program Id: JE2fDdXcYEprUR2yPmWdLGDSJ7Y7HD8qsJ52eD6qUavq

Deploy success
```

### 3.2 Verify Deployment
```bash
solana program show <PROGRAM_ID>
```

Should show:
- Program ID
- Owner: BPFLoaderUpgradeab1e11111111111111111111111
- ProgramData Address
- Authority
- Last Deployed Slot
- Data Length

## Step 4: Create Platform Token

### 4.1 Create Token Mint (Token-2022)
```bash
spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
```

**Save the mint address!**

### 4.2 Create Token Accounts
```bash
# Platform authority account
spl-token create-account <MINT_ADDRESS> --owner <AUTHORITY_PUBKEY>

# Treasury account
spl-token create-account <MINT_ADDRESS> --owner <TREASURY_PUBKEY>
```

### 4.3 Mint Initial Supply (Optional)
```bash
spl-token mint <MINT_ADDRESS> 1000000 --owner <MINT_AUTHORITY>
```

## Step 5: Initialize Platform

### 5.1 Update Deployment Script

Edit `scripts/deploy.ts`:
```typescript
const CONFIG = {
  PROGRAM_ID: new PublicKey("YOUR_PROGRAM_ID"),
  PLATFORM_MINT: new PublicKey("YOUR_MINT_ADDRESS"),
  AUTHORITY: Keypair.fromSecretKey(/* your authority keypair */),
  TREASURY: new PublicKey("YOUR_TREASURY_PUBKEY"),
  PLATFORM_FEE_BPS: 500,  // 5%
  TREASURY_FEE_BPS: 1000, // 10%
};
```

### 5.2 Run Deployment Script
```bash
ts-node scripts/deploy.ts
```

**Expected Output:**
```
🎮 Magic Roulette Deployment Script
=====================================
Program ID: JE2fDdXcYEprUR2yPmWdLGDSJ7Y7HD8qsJ52eD6qUavq
Network: https://api.devnet.solana.com
Deployer: <YOUR_PUBKEY>

✅ Program deployed
Platform Config PDA: <PDA_ADDRESS>
✅ Platform initialized
   Authority: <AUTHORITY_PUBKEY>
   Treasury: <TREASURY_PUBKEY>
   Platform Fee: 5 %
   Treasury Fee: 10 %
   Total Games: 0

🎉 Deployment complete!
```

## Step 6: MagicBlock Integration

### 6.1 Request Devnet Access

1. Visit [MagicBlock Discord](https://discord.gg/magicblock)
2. Request devnet access in #devnet-access channel
3. Get your ER endpoint

### 6.2 Configure ER Endpoints

Update your client code:
```typescript
const CONFIG = {
  SOLANA_RPC: "https://api.devnet.solana.com",
  ER_RPC: "https://devnet.magicblock.app", // Or your assigned endpoint
};
```

### 6.3 Test Delegation

```bash
ts-node examples/magicblock-integration.ts
```

## Step 7: VRF Setup (Optional)

### 7.1 Configure VRF

MagicBlock VRF provides verifiable randomness for the bullet chamber.

```typescript
import { createRequestRandomnessInstruction } from "@magicblock-labs/ephemeral-vrf-sdk";

// Request randomness
const vrfIx = createRequestRandomnessInstruction({
  payer: payer.publicKey,
  program: programId,
  callback: "process_vrf_result",
  accounts: [gamePda],
  queue: DEFAULT_EPHEMERAL_QUEUE,
});
```

### 7.2 Update VRF Authority

Once you have the VRF program ID, update the constraint in `process_vrf_result.rs`:
```rust
#[account(
    constraint = vrf_authority.key() == VRF_PROGRAM_ID @ GameError::InvalidVrfAuthority
)]
pub vrf_authority: Signer<'info>,
```

## Step 8: Testing

### 8.1 Run Local Tests
```bash
# Start local validator
solana-test-validator

# In another terminal
anchor test --skip-local-validator
```

### 8.2 Run Devnet Tests
```bash
# Update Anchor.toml cluster to devnet
anchor test --provider.cluster devnet
```

### 8.3 Manual Testing
```bash
# Simple flow (no ER)
ts-node examples/simple-game-flow.ts

# With MagicBlock ER
ts-node examples/magicblock-integration.ts
```

## Step 9: Monitoring & Verification

### 9.1 Check Program Logs
```bash
solana logs <PROGRAM_ID>
```

### 9.2 View Transactions
- **Solana Explorer**: https://explorer.solana.com/?cluster=devnet
- **SolanaFM**: https://solana.fm/?cluster=devnet

### 9.3 Query Platform State
```bash
# Using Anchor CLI
anchor account PlatformConfig <PLATFORM_CONFIG_PDA> --provider.cluster devnet

# Or use TypeScript
ts-node -e "
import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import IDL from './target/idl/magic_roulette.json';

const connection = new Connection('https://api.devnet.solana.com');
const program = new Program(IDL, new PublicKey('YOUR_PROGRAM_ID'), {} as any);

const [platformConfig] = PublicKey.findProgramAddressSync(
  [Buffer.from('platform')],
  program.programId
);

program.account.platformConfig.fetch(platformConfig).then(console.log);
"
```

## Troubleshooting

### Build Errors

**Error: `cargo build-sbf` not found**
```bash
# Install Solana platform tools
solana-install init
```

**Error: Anchor version mismatch**
```bash
anchor --version
# Should be 0.32.1
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --tag v0.32.1 --locked
```

### Deployment Errors

**Error: Insufficient funds**
```bash
solana airdrop 2
# Or use faucet: https://faucet.solana.com/
```

**Error: Program already deployed**
```bash
# Upgrade existing program
anchor upgrade target/deploy/magic_roulette.so --program-id <PROGRAM_ID> --provider.cluster devnet
```

**Error: Account already exists**
```bash
# Platform already initialized - skip initialization step
```

### Runtime Errors

**Error: Account not found**
- Verify PDAs are derived correctly
- Check program ID matches deployed program

**Error: Invalid token account**
- Ensure using TOKEN_2022_PROGRAM_ID
- Verify token accounts exist and have correct owner

**Error: Delegation timeout**
- Check ER endpoint is accessible
- Verify account has enough SOL for rent
- Increase timeout in client code

## Production Checklist

Before mainnet deployment:

- [ ] Security audit completed
- [ ] All tests passing
- [ ] Error handling comprehensive
- [ ] Fee configuration reviewed
- [ ] VRF integration tested
- [ ] MagicBlock ER tested extensively
- [ ] Frontend integration complete
- [ ] Monitoring and alerts set up
- [ ] Documentation complete
- [ ] Emergency procedures defined

## Mainnet Deployment

### Differences from Devnet

1. **Network Configuration**
   ```bash
   solana config set --url mainnet-beta
   ```

2. **Real SOL Required**
   - Program deployment: ~5-10 SOL
   - Account rent: ~0.01 SOL per account
   - Transaction fees: ~0.000005 SOL per tx

3. **MagicBlock Mainnet**
   - Use mainnet ER endpoint
   - Production VRF configuration
   - Higher stakes, more testing required

4. **Token Mint**
   - Use real token or create production mint
   - Consider token economics carefully
   - Set up proper treasury management

## Support & Resources

- **Documentation**: See `IMPLEMENTATION_STATUS.md`
- **Examples**: See `examples/README.md`
- **MagicBlock**: https://docs.magicblock.gg
- **Solana**: https://docs.solana.com
- **Anchor**: https://www.anchor-lang.com

## Next Steps

1. ✅ Deploy to devnet
2. ✅ Initialize platform
3. ✅ Create test games
4. ⏳ Integrate MagicBlock ER
5. ⏳ Set up VRF
6. ⏳ Build frontend
7. ⏳ Security audit
8. ⏳ Mainnet deployment
