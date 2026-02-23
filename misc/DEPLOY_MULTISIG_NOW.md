# 🚀 Deploy Magic Roulette Multisig - READY TO GO!

## ✅ Configuration Complete

**Website**: [magicroullete.com](https://magicroullete.com)  
**Member 1**: `5YJB8rve6RCkJJApFW6qaWR3cC7VXSeaGC92DGcatoKo`  
**Member 2**: `8qRCKcY9nDkLTYNAmS9SHfUahwao4e8bgGMhvJffZvv9`

---

## 🎯 Quick Deploy (3 Commands)

### Step 1: Install Dependencies
```bash
npm install @sqds/multisig
```

### Step 2: Create Deployment Script

Create file `scripts/deploy-multisig-ready.ts`:

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as multisig from "@sqds/multisig";
import * as fs from "fs";

async function deployMultisig() {
  // Connect to devnet (change to mainnet when ready)
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  
  // Load your wallet (make sure you have SOL for fees)
  const walletPath = process.env.WALLET_PATH || "./wallet.json";
  const wallet = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync(walletPath, "utf-8")))
  );
  
  console.log("🔐 Deploying Magic Roulette Multisig...\n");
  console.log("Website: magicroullete.com");
  console.log("Deployer:", wallet.publicKey.toString());
  console.log("Network: Devnet\n");
  
  // Generate create key
  const createKey = Keypair.generate();
  
  // Derive multisig PDA
  const [multisigPda] = multisig.getMultisigPda({
    createKey: createKey.publicKey,
  });
  
  // Define team members - BOTH CONFIGURED ✅
  const members = [
    { 
      key: new PublicKey("5YJB8rve6RCkJJApFW6qaWR3cC7VXSeaGC92DGcatoKo"), // Member 1
      permissions: multisig.types.Permissions.all() 
    },
    { 
      key: new PublicKey("8qRCKcY9nDkLTYNAmS9SHfUahwao4e8bgGMhvJffZvv9"), // Member 2
      permissions: multisig.types.Permissions.all() 
    },
  ];
  
  console.log("👥 Members:");
  console.log("   Member 1:", members[0].key.toString());
  console.log("   Member 2:", members[1].key.toString());
  console.log();
  
  // Create multisig - 2-of-2
  console.log("📝 Creating multisig...");
  const signature = await multisig.rpc.multisigCreateV2({
    connection,
    createKey,
    creator: wallet,
    multisigPda,
    configAuthority: null, // Immutable
    threshold: 2, // 2-of-2 (both must sign)
    members,
    timeLock: 3600, // 1 hour (change to 0 for no lock, 86400 for 24 hours)
    rentCollector: null,
  });
  
  console.log("✅ Multisig created!");
  console.log("   Transaction:", signature);
  console.log("   Multisig PDA:", multisigPda.toString());
  console.log();
  
  // Derive vault PDAs
  const [platformVault] = multisig.getVaultPda({
    multisigPda,
    index: 0,
  });
  
  const [treasuryVault] = multisig.getVaultPda({
    multisigPda,
    index: 1,
  });
  
  console.log("📦 Vaults:");
  console.log("   Platform Vault (Index 0):", platformVault.toString());
  console.log("   Treasury Vault (Index 1):", treasuryVault.toString());
  console.log();
  
  // Save addresses to file
  const addresses = {
    website: "magicroullete.com",
    network: "devnet",
    multisigPda: multisigPda.toString(),
    platformVault: platformVault.toString(),
    treasuryVault: treasuryVault.toString(),
    threshold: 2,
    totalMembers: 2,
    timeLock: 3600,
    members: members.map(m => m.key.toString()),
    createdAt: new Date().toISOString(),
    transaction: signature,
  };
  
  const outputFile = "./deployed-multisig-addresses.json";
  fs.writeFileSync(outputFile, JSON.stringify(addresses, null, 2));
  
  console.log("💾 Addresses saved to:", outputFile);
  console.log();
  console.log("=" .repeat(70));
  console.log("🎉 DEPLOYMENT SUCCESSFUL!");
  console.log("=" .repeat(70));
  console.log();
  console.log("Next steps:");
  console.log("1. Update examples/kamino-squads-example.ts with Multisig PDA");
  console.log("2. Initialize Magic Roulette platform with these addresses");
  console.log("3. Test on devnet before mainnet deployment");
  console.log();
  
  return addresses;
}

deployMultisig()
  .then((addresses) => {
    console.log("✅ All done! Check deployed-multisig-addresses.json for details.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });
```

### Step 3: Run Deployment

```bash
# Make sure you have a wallet with SOL
# For devnet, get free SOL:
solana airdrop 2 --url devnet

# Run deployment
ts-node scripts/deploy-multisig-ready.ts

# Or with custom wallet path:
WALLET_PATH=./my-wallet.json ts-node scripts/deploy-multisig-ready.ts
```

---

## 📋 Expected Output

```
🔐 Deploying Magic Roulette Multisig...

Website: magicroullete.com
Deployer: [your wallet]
Network: Devnet

👥 Members:
   Member 1: 5YJB8rve6RCkJJApFW6qaWR3cC7VXSeaGC92DGcatoKo
   Member 2: 8qRCKcY9nDkLTYNAmS9SHfUahwao4e8bgGMhvJffZvv9

📝 Creating multisig...
✅ Multisig created!
   Transaction: [signature]
   Multisig PDA: [address]

📦 Vaults:
   Platform Vault (Index 0): [address]
   Treasury Vault (Index 1): [address]

💾 Addresses saved to: deployed-multisig-addresses.json

======================================================================
🎉 DEPLOYMENT SUCCESSFUL!
======================================================================

Next steps:
1. Update examples/kamino-squads-example.ts with Multisig PDA
2. Initialize Magic Roulette platform with these addresses
3. Test on devnet before mainnet deployment
```

---

## 🔐 After Deployment

### Update Your Code

1. **Update `examples/kamino-squads-example.ts`**:
   ```typescript
   const SQUADS_MULTISIG = new PublicKey("YOUR_ACTUAL_MULTISIG_PDA");
   ```

2. **Initialize Platform**:
   ```bash
   anchor run initialize-platform-multisig
   ```

### Test the Multisig

```typescript
// Test creating a proposal
import * as multisig from "@sqds/multisig";

const multisigPda = new PublicKey("YOUR_MULTISIG_PDA");

// Get transaction index
const multisigAccount = await multisig.accounts.Multisig.fromAccountAddress(
  connection,
  multisigPda
);
const transactionIndex = BigInt(Number(multisigAccount.transactionIndex) + 1);

// Create test proposal
const [transactionPda] = multisig.getTransactionPda({
  multisigPda,
  index: transactionIndex,
});

// ... create, approve, execute
```

---

## 🌐 Deployment Checklist

- [x] Member 1 address configured
- [x] Member 2 address configured
- [x] Deployment script ready
- [ ] Wallet has SOL for fees
- [ ] Run deployment on devnet
- [ ] Save multisig PDA and vault addresses
- [ ] Update code with actual addresses
- [ ] Initialize Magic Roulette platform
- [ ] Test proposal creation/approval
- [ ] Test fee distribution
- [ ] Deploy to mainnet

---

## 📞 Support

- **Full Documentation**: `MULTISIG_ADDRESSES.md`
- **Status Guide**: `MULTISIG_STATUS.md`
- **Quick Setup**: `QUICK_MULTISIG_SETUP.md`
- **Website**: https://magicroullete.com
- **Documentation**: https://docs.magicroulette.com
- **Email**: magicroulettesol@gmail.com
- **Twitter**: https://x.com/mgcrouletteapp
- **GitHub**: https://github.com/magicroulette-game/magic-roullete

---

## ⚠️ Important Notes

1. **Test on devnet first** before mainnet
2. **Backup both private keys** securely
3. **Cannot change members** after deployment (immutable)
4. **Both members needed** to access funds
5. **Send funds to vaults**, not multisig PDA

---

**Ready to deploy? Run the commands above! 🚀**
