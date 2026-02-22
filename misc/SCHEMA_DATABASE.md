# Magic Roulette - Schema Database

Dokumentasi lengkap struktur data (schema) untuk program Magic Roulette.

---

## 📊 Overview

Program ini memiliki **4 Account Types** utama:
1. **PlatformConfig** - Konfigurasi platform
2. **Game** - Data game individual
3. **PlayerStats** - Statistik pemain (belum diimplementasi)
4. **TreasuryRewards** - Hadiah treasury untuk pemain

---

## 1️⃣ PlatformConfig

Menyimpan konfigurasi global platform.

### Schema

| Field | Type | Size | Deskripsi |
|-------|------|------|-----------|
| `authority` | Pubkey | 32 bytes | Admin/owner platform |
| `treasury` | Pubkey | 32 bytes | Wallet treasury |
| `platform_mint` | Pubkey | 32 bytes | Token mint resmi platform |
| `platform_fee_bps` | u16 | 2 bytes | Fee platform (basis points, 500 = 5%) |
| `treasury_fee_bps` | u16 | 2 bytes | Fee treasury (basis points, 1000 = 10%) |
| `total_games` | u64 | 8 bytes | Total game yang pernah dibuat |
| `total_volume` | u64 | 8 bytes | Total volume transaksi (dalam token) |
| `treasury_balance` | u64 | 8 bytes | Saldo treasury saat ini |
| `paused` | bool | 1 byte | Status pause (emergency) |
| `bump` | u8 | 1 byte | PDA bump seed |

**Total Size:** 134 bytes (+ 8 bytes discriminator = 142 bytes)

### PDA Seeds
```
["platform"]
```

### Contoh Data
```json
{
  "authority": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "treasury": "8xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsV",
  "platform_mint": "9xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsW",
  "platform_fee_bps": 500,      // 5%
  "treasury_fee_bps": 1000,     // 10%
  "total_games": 1234,
  "total_volume": 50000000000,  // 50,000 tokens
  "treasury_balance": 5000000000, // 5,000 tokens
  "paused": false,
  "bump": 254
}
```

---

## 2️⃣ Game

Menyimpan data untuk setiap game individual.

### Schema

| Field | Type | Size | Deskripsi |
|-------|------|------|-----------|
| `game_id` | u64 | 8 bytes | ID unik game |
| `creator` | Pubkey | 32 bytes | Pembuat game |
| `game_mode` | GameMode | 1 byte | Mode game (1v1, 2v2, AI) |
| `status` | GameStatus | 1 byte | Status game |
| `entry_fee` | u64 | 8 bytes | Biaya masuk (dalam token) |
| `total_pot` | u64 | 8 bytes | Total hadiah |
| **AI Settings** | | | |
| `is_ai_game` | bool | 1 byte | Apakah game AI |
| `ai_difficulty` | Option<AiDifficulty> | 2 bytes | Tingkat kesulitan AI |
| `ai_player` | Option<Pubkey> | 33 bytes | Wallet bot AI |
| `is_practice_mode` | bool | 1 byte | Mode latihan (gratis) |
| **Players** | | | |
| `team_a` | [Pubkey; 2] | 64 bytes | Pemain team A (max 2) |
| `team_b` | [Pubkey; 2] | 64 bytes | Pemain team B (max 2) |
| `team_a_count` | u8 | 1 byte | Jumlah pemain team A |
| `team_b_count` | u8 | 1 byte | Jumlah pemain team B |
| **Game State** | | | |
| `bullet_chamber` | u8 | 1 byte | Posisi peluru (1-6) |
| `current_chamber` | u8 | 1 byte | Chamber saat ini |
| `current_turn` | u8 | 1 byte | Giliran siapa |
| `shots_taken` | u8 | 1 byte | Total tembakan |
| **VRF** | | | |
| `vrf_seed` | [u8; 32] | 32 bytes | Seed untuk VRF |
| `vrf_result` | Option<[u8; 32]> | 33 bytes | Hasil VRF |
| **Results** | | | |
| `winner_team` | Option<u8> | 2 bytes | Team pemenang (0 atau 1) |
| `created_at` | i64 | 8 bytes | Timestamp dibuat |
| `finished_at` | Option<i64> | 9 bytes | Timestamp selesai |
| `bump` | u8 | 1 byte | PDA bump seed |

**Total Size:** ~280 bytes (+ 8 bytes discriminator = 288 bytes)

### PDA Seeds
```
["game", game_id.to_le_bytes()]
```

### Enum: GameMode

| Variant | Value | Deskripsi |
|---------|-------|-----------|
| `OneVsOne` | 0 | 1 vs 1 (2 pemain) |
| `TwoVsTwo` | 1 | 2 vs 2 (4 pemain) |
| `HumanVsAi` | 2 | Human vs AI (1 pemain + bot) |

### Enum: GameStatus

| Variant | Value | Deskripsi |
|---------|-------|-----------|
| `WaitingForPlayers` | 0 | Menunggu pemain join |
| `Delegated` | 1 | Sudah didelegasi ke ER |
| `InProgress` | 2 | Game sedang berlangsung |
| `Finished` | 3 | Game selesai |
| `Cancelled` | 4 | Game dibatalkan/diproses |

### Enum: AiDifficulty

| Variant | Value | Deskripsi |
|---------|-------|-----------|
| `Easy` | 0 | Random play |
| `Medium` | 1 | Basic probability |
| `Hard` | 2 | Monte Carlo simulation |

### Contoh Data - Game 1v1

```json
{
  "game_id": 0,
  "creator": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "game_mode": "OneVsOne",
  "status": "InProgress",
  "entry_fee": 100000000000,  // 100 tokens
  "total_pot": 200000000000,  // 200 tokens
  
  "is_ai_game": false,
  "ai_difficulty": null,
  "ai_player": null,
  "is_practice_mode": false,
  
  "team_a": [
    "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "11111111111111111111111111111111"  // Empty slot
  ],
  "team_b": [
    "8xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsV",
    "11111111111111111111111111111111"  // Empty slot
  ],
  "team_a_count": 1,
  "team_b_count": 1,
  
  "bullet_chamber": 3,      // Peluru di chamber 3
  "current_chamber": 1,     // Sekarang di chamber 1
  "current_turn": 0,        // Giliran player 0 (team A)
  "shots_taken": 0,
  
  "vrf_seed": [1, 2, 3, ...],
  "vrf_result": [45, 67, 89, ...],
  
  "winner_team": null,
  "created_at": 1704067200,
  "finished_at": null,
  "bump": 254
}
```

### Contoh Data - AI Practice Game

```json
{
  "game_id": 5,
  "creator": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "game_mode": "HumanVsAi",
  "status": "InProgress",
  "entry_fee": 0,           // GRATIS!
  "total_pot": 0,           // Tidak ada hadiah
  
  "is_ai_game": true,
  "ai_difficulty": "Medium",
  "ai_player": "9xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsW",
  "is_practice_mode": true,  // Mode latihan
  
  "team_a": [
    "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",  // Human
    "11111111111111111111111111111111"
  ],
  "team_b": [
    "9xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsW",  // AI Bot
    "11111111111111111111111111111111"
  ],
  "team_a_count": 1,
  "team_b_count": 1,
  
  "bullet_chamber": 4,
  "current_chamber": 1,
  "current_turn": 0,
  "shots_taken": 0,
  
  "vrf_seed": [10, 20, 30, ...],
  "vrf_result": [55, 77, 99, ...],
  
  "winner_team": null,
  "created_at": 1704067200,
  "finished_at": null,
  "bump": 253
}
```

---

## 3️⃣ PlayerStats

Menyimpan statistik pemain (belum diimplementasi dalam instruksi).

### Schema

| Field | Type | Size | Deskripsi |
|-------|------|------|-----------|
| `player` | Pubkey | 32 bytes | Wallet pemain |
| `games_played` | u64 | 8 bytes | Total game dimainkan |
| `games_won` | u64 | 8 bytes | Total game menang |
| `total_wagered` | u64 | 8 bytes | Total taruhan |
| `total_winnings` | u64 | 8 bytes | Total kemenangan |
| `shots_survived` | u64 | 8 bytes | Total tembakan selamat |
| `bump` | u8 | 1 byte | PDA bump seed |

**Total Size:** 73 bytes (+ 8 bytes discriminator = 81 bytes)

### PDA Seeds
```
["player_stats", player_pubkey]
```

### Contoh Data
```json
{
  "player": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "games_played": 50,
  "games_won": 25,
  "total_wagered": 5000000000000,   // 5,000 tokens
  "total_winnings": 8500000000000,  // 8,500 tokens (profit!)
  "shots_survived": 123,
  "bump": 254
}
```

---

## 4️⃣ TreasuryRewards

Menyimpan hadiah treasury yang bisa diklaim pemain.

### Schema

| Field | Type | Size | Deskripsi |
|-------|------|------|-----------|
| `player` | Pubkey | 32 bytes | Wallet pemain |
| `claimable_amount` | u64 | 8 bytes | Jumlah yang bisa diklaim |
| `total_claimed` | u64 | 8 bytes | Total yang sudah diklaim |
| `last_claim` | i64 | 8 bytes | Timestamp klaim terakhir |
| `bump` | u8 | 1 byte | PDA bump seed |

**Total Size:** 57 bytes (+ 8 bytes discriminator = 65 bytes)

### PDA Seeds
```
["rewards", player_pubkey]
```

### Contoh Data
```json
{
  "player": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "claimable_amount": 500000000,    // 0.5 tokens
  "total_claimed": 2000000000,      // 2 tokens
  "last_claim": 1704067200,
  "bump": 254
}
```

---

## 🔑 PDA (Program Derived Address)

### Platform Config
```rust
seeds = [b"platform"]
```
**Address:** Deterministik, sama untuk semua

### Game
```rust
seeds = [b"game", game_id.to_le_bytes()]
```
**Address:** Unik per game_id

### Game Vault (Token Account)
```rust
seeds = [b"game_vault", game_pubkey]
```
**Address:** Unik per game

### Player Stats
```rust
seeds = [b"player_stats", player_pubkey]
```
**Address:** Unik per pemain

### Treasury Rewards
```rust
seeds = [b"rewards", player_pubkey]
```
**Address:** Unik per pemain

---

## 📈 Relasi Antar Account

```
PlatformConfig (1)
    ├── total_games: u64
    ├── total_volume: u64
    └── treasury_balance: u64
    
Game (N)
    ├── game_id: u64 (dari PlatformConfig.total_games)
    ├── team_a: [Pubkey; 2]
    ├── team_b: [Pubkey; 2]
    └── total_pot: u64
    
PlayerStats (N)
    ├── player: Pubkey
    ├── games_played: u64
    └── games_won: u64
    
TreasuryRewards (N)
    ├── player: Pubkey
    └── claimable_amount: u64
```

---

## 💾 Storage Costs

Biaya rent untuk menyimpan account di Solana:

| Account Type | Size | Rent (SOL) | Rent (USD @ $100/SOL) |
|--------------|------|------------|----------------------|
| PlatformConfig | 142 bytes | ~0.001 SOL | ~$0.10 |
| Game | 288 bytes | ~0.002 SOL | ~$0.20 |
| PlayerStats | 81 bytes | ~0.0006 SOL | ~$0.06 |
| TreasuryRewards | 65 bytes | ~0.0005 SOL | ~$0.05 |

**Note:** Rent bisa dikembalikan jika account ditutup.

---

## 🔍 Query Examples

### Mendapatkan Platform Config
```typescript
const [platformConfig] = PublicKey.findProgramAddressSync(
  [Buffer.from("platform")],
  programId
);

const config = await program.account.platformConfig.fetch(platformConfig);
console.log("Total games:", config.totalGames.toString());
```

### Mendapatkan Game Tertentu
```typescript
const gameId = new BN(0);
const [gamePda] = PublicKey.findProgramAddressSync(
  [Buffer.from("game"), gameId.toArrayLike(Buffer, "le", 8)],
  programId
);

const game = await program.account.game.fetch(gamePda);
console.log("Status:", Object.keys(game.status)[0]);
console.log("Entry fee:", game.entryFee.toString());
```

### Mendapatkan Semua Game
```typescript
const allGames = await program.account.game.all();
console.log(`Found ${allGames.length} games`);

allGames.forEach(({ publicKey, account }) => {
  console.log(`Game ${account.gameId}: ${Object.keys(account.status)[0]}`);
});
```

### Filter Game by Status
```typescript
const activeGames = await program.account.game.all([
  {
    memcmp: {
      offset: 8 + 32 + 1, // Skip discriminator, game_id, creator, game_mode
      bytes: bs58.encode([2]) // GameStatus::InProgress = 2
    }
  }
]);
```

---

## 📝 Notes

1. **Discriminator**: Setiap account type memiliki 8 bytes discriminator di awal
2. **Option Types**: `Option<T>` menggunakan 1 byte untuk flag + size of T
3. **Arrays**: Fixed size arrays seperti `[Pubkey; 2]` = 32 * 2 = 64 bytes
4. **Enums**: Biasanya 1 byte untuk variant
5. **PDA Bumps**: Selalu disimpan untuk efisiensi (tidak perlu recalculate)

---

## 🚀 Best Practices

1. **Minimize Account Size**: Lebih kecil = lebih murah rent
2. **Use PDAs**: Deterministik dan aman
3. **Close Unused Accounts**: Kembalikan rent
4. **Index Important Fields**: Untuk query yang efisien
5. **Validate All Inputs**: Jangan percaya client data

---

## 📚 Resources

- **Anchor Book**: https://book.anchor-lang.com/
- **Solana Cookbook**: https://solanacookbook.com/
- **Account Model**: https://docs.solana.com/developing/programming-model/accounts
