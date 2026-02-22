# Magic Roulette - SOL Native Guide

## 🎯 Sistem SOL Native (Lebih Simple!)

Program ini sekarang mendukung **2 cara bermain**:

### 1️⃣ SOL Native (RECOMMENDED) ⭐
- **Stake langsung dengan SOL**
- Tidak perlu token khusus
- Lebih mudah untuk pemain
- Entry fee dalam SOL (0.1 SOL, 0.5 SOL, 1 SOL, dll)

### 2️⃣ Token-based (Advanced)
- Menggunakan SPL Token-2022
- Untuk platform yang ingin token sendiri
- Lebih kompleks setup

---

## 💰 Cara Kerja SOL Native

### Entry Fee dalam SOL
```
Minimum: 0.01 SOL (10,000,000 lamports)
Contoh:
- 0.1 SOL  = 100,000,000 lamports
- 0.5 SOL  = 500,000,000 lamports
- 1 SOL    = 1,000,000,000 lamports
- 5 SOL    = 5,000,000,000 lamports
```

### Distribusi Hadiah (Default)

**Contoh: Game 1v1 dengan Entry Fee 1 SOL**

```
Player 1 stake: 1 SOL
Player 2 stake: 1 SOL
─────────────────────────
Total Pot:      2 SOL

Distribusi:
├─ Platform Fee (5%):   0.1 SOL  → Platform Authority
├─ Treasury Fee (10%):  0.2 SOL  → Treasury
└─ Pemenang (85%):      1.7 SOL  → Winner

Hasil:
✅ Pemenang: +0.7 SOL profit (stake 1, dapat 1.7)
❌ Kalah:    -1 SOL loss (stake 1, dapat 0)
```

---

## 🎮 Instruksi SOL Native

### 1. Create Game (SOL)

```rust
pub fn create_game_sol(
    ctx: Context<CreateGameSol>,
    game_mode: GameMode,
    entry_fee: u64,        // dalam lamports
    vrf_seed: [u8; 32],
) -> Result<()>
```

**Accounts:**
- `game` - Game PDA (akan dibuat)
- `platform_config` - Platform config
- `creator` - Pembuat game (signer, bayar SOL)
- `game_vault` - PDA untuk hold SOL
- `system_program` - System program

**Contoh TypeScript:**
```typescript
const entryFee = new BN(0.1 * LAMPORTS_PER_SOL); // 0.1 SOL
const vrfSeed = Array(32).fill(1);

await program.methods
  .createGameSol(
    { oneVsOne: {} },
    entryFee,
    vrfSeed
  )
  .accounts({
    game: gamePda,
    platformConfig,
    creator: player1.publicKey,
    gameVault: gameVaultPda,
    systemProgram: SystemProgram.programId,
  })
  .signers([player1])
  .rpc();
```

---

### 2. Join Game (SOL)

```rust
pub fn join_game_sol(
    ctx: Context<JoinGameSol>
) -> Result<()>
```

**Accounts:**
- `game` - Game PDA
- `player` - Pemain yang join (signer, bayar SOL)
- `platform_config` - Platform config
- `game_vault` - PDA untuk hold SOL
- `system_program` - System program

**Contoh TypeScript:**
```typescript
await program.methods
  .joinGameSol()
  .accounts({
    game: gamePda,
    player: player2.publicKey,
    platformConfig,
    gameVault: gameVaultPda,
    systemProgram: SystemProgram.programId,
  })
  .signers([player2])
  .rpc();
```

---

### 3. Finalize Game (SOL)

```rust
pub fn finalize_game_sol(
    ctx: Context<FinalizeGameSol>
) -> Result<()>
```

**Accounts:**
- `game` - Game PDA
- `platform_config` - Platform config
- `payer` - Yang bayar tx fee (signer)
- `game_vault` - PDA yang hold SOL
- `platform_authority` - Wallet platform (terima fee)
- `treasury` - Wallet treasury (terima fee)
- `winner1` - Pemenang 1
- `winner2` - Pemenang 2 (untuk 2v2)
- `system_program` - System program

**Contoh TypeScript:**
```typescript
await program.methods
  .finalizeGameSol()
  .accounts({
    game: gamePda,
    platformConfig,
    payer: authority.publicKey,
    gameVault: gameVaultPda,
    platformAuthority: authorityWallet,
    treasury: treasuryWallet,
    winner1: winner1Pubkey,
    winner2: winner2Pubkey,
    systemProgram: SystemProgram.programId,
  })
  .signers([authority])
  .rpc();
```

---

## 📊 Perbandingan: SOL vs Token

| Aspek | SOL Native ⭐ | Token-based |
|-------|--------------|-------------|
| **Setup** | Sangat mudah | Kompleks |
| **User Experience** | Excellent | Perlu beli token dulu |
| **Entry Fee** | Langsung SOL | Perlu token |
| **Token Accounts** | Tidak perlu | Perlu create |
| **Mint Token** | Tidak perlu | Perlu create |
| **Gas Cost** | Lebih murah | Lebih mahal |
| **Onboarding** | Instant | Butuh waktu |
| **Liquidity** | SOL (liquid) | Token (illiquid) |

---

## 💡 Contoh Lengkap: Game 1v1 dengan SOL

### Setup
```typescript
import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Program, BN } from "@coral-xyz/anchor";

const connection = new Connection("https://api.devnet.solana.com");
const player1 = Keypair.generate();
const player2 = Keypair.generate();

// Airdrop SOL untuk testing
await connection.requestAirdrop(player1.publicKey, 5 * LAMPORTS_PER_SOL);
await connection.requestAirdrop(player2.publicKey, 5 * LAMPORTS_PER_SOL);
```

### 1. Create Game
```typescript
const entryFee = new BN(0.5 * LAMPORTS_PER_SOL); // 0.5 SOL

const [gamePda] = PublicKey.findProgramAddressSync(
  [Buffer.from("game"), new BN(0).toArrayLike(Buffer, "le", 8)],
  programId
);

const [gameVaultPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("game_vault"), gamePda.toBuffer()],
  programId
);

await program.methods
  .createGameSol(
    { oneVsOne: {} },
    entryFee,
    Array(32).fill(1)
  )
  .accounts({
    game: gamePda,
    platformConfig,
    creator: player1.publicKey,
    gameVault: gameVaultPda,
    systemProgram: SystemProgram.programId,
  })
  .signers([player1])
  .rpc();

console.log("✅ Game created!");
console.log("   Entry fee: 0.5 SOL");
console.log("   Player 1 balance:", await connection.getBalance(player1.publicKey) / LAMPORTS_PER_SOL, "SOL");
```

### 2. Join Game
```typescript
await program.methods
  .joinGameSol()
  .accounts({
    game: gamePda,
    player: player2.publicKey,
    platformConfig,
    gameVault: gameVaultPda,
    systemProgram: SystemProgram.programId,
  })
  .signers([player2])
  .rpc();

console.log("✅ Player 2 joined!");
console.log("   Player 2 balance:", await connection.getBalance(player2.publicKey) / LAMPORTS_PER_SOL, "SOL");
console.log("   Game vault balance:", await connection.getBalance(gameVaultPda) / LAMPORTS_PER_SOL, "SOL");
```

### 3. Play Game
```typescript
// Process VRF
await program.methods
  .processVrfResult(randomness)
  .accounts({
    game: gamePda,
    vrfAuthority: vrfAuth.publicKey,
  })
  .signers([vrfAuth])
  .rpc();

// Take shots
await program.methods
  .takeShot()
  .accounts({
    game: gamePda,
    player: player1.publicKey,
  })
  .signers([player1])
  .rpc();

// ... continue until game finishes
```

### 4. Finalize & Distribute
```typescript
const game = await program.account.game.fetch(gamePda);
const winnerTeam = game.winnerTeam;
const winner = winnerTeam === 0 ? player1.publicKey : player2.publicKey;

await program.methods
  .finalizeGameSol()
  .accounts({
    game: gamePda,
    platformConfig,
    payer: authority.publicKey,
    gameVault: gameVaultPda,
    platformAuthority: authorityWallet,
    treasury: treasuryWallet,
    winner1: winner,
    winner2: winner, // Same for 1v1
    systemProgram: SystemProgram.programId,
  })
  .signers([authority])
  .rpc();

console.log("✅ Game finalized!");
console.log("   Winner balance:", await connection.getBalance(winner) / LAMPORTS_PER_SOL, "SOL");
```

---

## 🎯 Entry Fee Recommendations

### Casual Players
```
0.01 SOL - 0.1 SOL
- Low risk
- Good for beginners
- Fast games
```

### Regular Players
```
0.5 SOL - 1 SOL
- Medium risk
- Decent rewards
- Competitive
```

### High Rollers
```
5 SOL - 10 SOL
- High risk
- Big rewards
- Serious players only
```

---

## 🔒 Security Features

### 1. Minimum Entry Fee
```rust
require!(entry_fee >= 10_000_000, GameError::InsufficientEntryFee);
// Minimum 0.01 SOL
```

### 2. PDA Vault
```rust
seeds = [b"game_vault", game.key().as_ref()]
// SOL aman di PDA, tidak bisa dicuri
```

### 3. Validation
- ✅ Game status check
- ✅ Player authorization
- ✅ Cannot join own game
- ✅ Cannot join AI game
- ✅ Arithmetic overflow protection

---

## 📈 Profit Calculator

### Formula
```
Entry Fee: X SOL
Total Pot: X * jumlah_pemain
Platform Fee: Total Pot * 5%
Treasury Fee: Total Pot * 10%
Winner Amount: Total Pot - Platform Fee - Treasury Fee

Profit (jika menang): Winner Amount - Entry Fee
Loss (jika kalah): -Entry Fee
```

### Contoh Perhitungan

**1v1 dengan 1 SOL:**
```
Entry Fee:      1 SOL
Total Pot:      2 SOL
Platform Fee:   0.1 SOL (5%)
Treasury Fee:   0.2 SOL (10%)
Winner Gets:    1.7 SOL

Profit: 1.7 - 1 = +0.7 SOL (70% ROI)
Loss: -1 SOL (100% loss)
```

**2v2 dengan 0.5 SOL:**
```
Entry Fee:      0.5 SOL per player
Total Pot:      2 SOL (4 players)
Platform Fee:   0.1 SOL (5%)
Treasury Fee:   0.2 SOL (10%)
Winner Amount:  1.7 SOL
Per Winner:     0.85 SOL (split 2 ways)

Profit: 0.85 - 0.5 = +0.35 SOL (70% ROI)
Loss: -0.5 SOL (100% loss)
```

---

## ⚠️ Important Notes

1. **Minimum Entry Fee**: 0.01 SOL (10,000,000 lamports)
2. **Gas Fees**: ~0.000005 SOL per transaction
3. **Rent**: Game account ~0.002 SOL (refundable)
4. **Total Cost**: Entry Fee + Gas + Rent
5. **Winner Gets**: 85% of total pot (after fees)

---

## 🚀 Deployment

### Build
```bash
anchor build
```

### Deploy
```bash
anchor deploy --provider.cluster devnet
```

### Test
```bash
anchor test
```

---

## 📞 Support

Untuk pertanyaan:
- Lihat `SCHEMA_DATABASE.md` untuk struktur data
- Lihat `PENJELASAN_HADIAH.md` untuk distribusi hadiah
- Lihat `DEPLOYMENT_GUIDE.md` untuk deployment

---

**Status**: ✅ SOL Native sudah siap digunakan!
**Recommended**: Gunakan SOL Native untuk user experience terbaik
