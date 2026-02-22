# Magic Roulette - Integrasi Kamino & Squads (Bahasa Indonesia)

**Tanggal:** 21 Februari 2025
**Status:** Fase Desain
**Versi:** 1.0

---

## 🎯 Ringkasan

Dokumen ini menjelaskan integrasi **Kamino Finance** (pinjaman/lending) dan **Squads Protocol** (dompet multisig) ke dalam Magic Roulette.

### Fitur Baru:

1. **Kamino Integration**: Pemain bisa pinjam SOL untuk entry fee dengan jaminan (collateral)
2. **Squads Integration**: Treasury platform dikelola oleh multisig untuk keamanan
3. **Fitur Gabungan**: Gameplay dengan leverage + manajemen dana yang aman

---

## 💰 Kamino - Sistem Pinjaman

### Cara Kerja

**Skenario Normal (Tanpa Pinjaman)**
```
Pemain → Bayar 0.1 SOL → Main → Menang/Kalah
```

**Skenario Dengan Pinjaman Kamino**
```
Pemain → Deposit Jaminan 0.15 SOL → Pinjam 0.1 SOL → Main
         ↓
    Menang → Bayar Pinjaman + Bunga → Dapat Profit + Jaminan Kembali
    Kalah → Jaminan Diambil untuk Bayar Pinjaman
```

### Contoh Perhitungan

#### Contoh 1: Menang dengan Pinjaman
```
Entry Fee: 0.1 SOL
Jaminan: 0.11 SOL (110% dari entry fee)
Bunga Pinjaman: 0.001 SOL (1%)

Main dan MENANG:
- Total Pot: 0.2 SOL (2 pemain)
- Platform Fee (5%): 0.01 SOL
- Treasury Fee (10%): 0.02 SOL
- Hadiah Kotor: 0.17 SOL

Pembayaran:
1. Bayar Pinjaman: 0.1 SOL
2. Bayar Bunga: 0.001 SOL
3. Jaminan Kembali: 0.11 SOL
4. Profit Bersih: 0.069 SOL

Total Diterima: 0.11 + 0.069 = 0.179 SOL
Modal Awal: 0.11 SOL (jaminan)
Profit: 0.069 SOL (62.7% return!)
```

#### Contoh 2: Kalah dengan Pinjaman
```
Entry Fee: 0.1 SOL
Jaminan: 0.11 SOL

Main dan KALAH:
- Jaminan diambil: 0.11 SOL
- Untuk bayar pinjaman: 0.1 SOL
- Untuk bayar bunga: 0.001 SOL
- Sisa jaminan kembali: 0.009 SOL

Total Kerugian: 0.11 - 0.009 = 0.101 SOL
(Hampir sama dengan kalah normal, tapi pakai pinjaman)
```

### Keuntungan Sistem Pinjaman

1. **Modal Kecil, Main Besar**: Punya 0.15 SOL bisa main game 0.1 SOL
2. **Leverage**: Bisa main lebih banyak game dengan modal terbatas
3. **Aman**: Jaminan dikembalikan kalau menang
4. **Otomatis**: Pinjaman dibayar otomatis dari hadiah

### Syarat Pinjaman

- **Jaminan Minimum**: 110% dari entry fee
- **Jenis Jaminan**: SOL, USDC, USDT, mSOL, stSOL
- **Bunga**: ~5-10% per tahun (dihitung per hari)
- **Liquidation**: Jika nilai jaminan turun di bawah 105%

---

## 🔐 Squads - Multisig Wallet

### Apa itu Multisig?

Multisig = Multi-Signature = Dompet yang butuh beberapa tanda tangan untuk transaksi.

**Contoh**: Dompet 3-of-5
- Ada 5 orang pemilik
- Butuh 3 orang setuju untuk transfer dana
- Lebih aman dari 1 orang pegang semua

### Kenapa Pakai Multisig?

1. **Keamanan**: Tidak ada 1 orang yang bisa ambil semua dana
2. **Transparansi**: Semua transaksi harus disetujui tim
3. **Perlindungan**: Jika 1 wallet kena hack, dana tetap aman
4. **Profesional**: Standard untuk project crypto serius

### Struktur Multisig Magic Roulette

```
Squads Multisig (3-of-5)
├── Founder 1 (full access)
├── Founder 2 (full access)
├── Founder 3 (full access)
├── Developer 1 (full access)
└── Developer 2 (full access)

Vault Structure:
├── Vault 0: Platform Fee (dana operasional)
├── Vault 1: Treasury (dana jangka panjang)
└── Vault 2: Emergency Fund (dana darurat)
```

### Contoh Penggunaan

#### Skenario 1: Withdraw Treasury
```
1. Developer 1 buat proposal: "Withdraw 100 SOL untuk marketing"
2. Founder 1 approve ✅
3. Founder 2 approve ✅
4. Developer 2 approve ✅
5. Proposal disetujui (3 dari 5)
6. Tunggu 24 jam (time lock)
7. Execute transfer 100 SOL
```

#### Skenario 2: Emergency Pause
```
1. Ditemukan bug critical
2. Founder 1 buat proposal: "Pause platform"
3. Founder 2 approve ✅
4. Founder 3 approve ✅
5. Platform langsung di-pause
6. Tidak ada game baru bisa dibuat
7. Dana pemain aman
```

#### Skenario 3: Spending Limit
```
Operations Manager punya limit 10 SOL/hari
- Bisa withdraw sampai 10 SOL tanpa approval
- Untuk operasional sehari-hari
- Lebih dari 10 SOL butuh approval multisig
```

---

## 🎮 Alur Game Lengkap dengan Kamino + Squads

### Alur Normal (Tanpa Pinjaman)
```
1. Pemain bayar 0.1 SOL → Game Vault
2. Main game
3. Menang → Dapat hadiah
4. Platform fee → Squads Vault 0
5. Treasury fee → Squads Vault 1
```

### Alur Dengan Pinjaman Kamino
```
1. Pemain deposit jaminan 0.15 SOL → Kamino
2. Kamino pinjamkan 0.1 SOL → Game Vault
3. Main game
4. Menang:
   a. Bayar pinjaman 0.1 SOL → Kamino
   b. Bayar bunga 0.001 SOL → Kamino
   c. Jaminan 0.15 SOL → Kembali ke pemain
   d. Profit 0.069 SOL → Ke pemain
   e. Platform fee → Squads Vault 0
   f. Treasury fee → Squads Vault 1
5. Kalah:
   a. Jaminan 0.15 SOL → Kamino (bayar pinjaman)
   b. Sisa jaminan → Kembali ke pemain
   c. Hadiah → Ke pemenang
   d. Platform fee → Squads Vault 0
   e. Treasury fee → Squads Vault 1
```

---

## 🔧 Instruksi Baru yang Akan Dibuat

### 1. `create_game_with_loan`
**Fungsi**: Buat game pakai pinjaman Kamino

**Parameter**:
- `game_mode`: 1v1 atau 2v2
- `entry_fee`: Biaya masuk (SOL)
- `collateral_amount`: Jumlah jaminan (minimum 150% dari entry fee)
- `vrf_seed`: Seed untuk randomness

**Proses**:
1. Validasi jaminan cukup (min 150%)
2. Deposit jaminan ke Kamino
3. Pinjam SOL dari Kamino
4. Buat game seperti biasa
5. Tandai game punya pinjaman

### 2. `finalize_game_with_loan_repayment`
**Fungsi**: Selesaikan game dan bayar pinjaman otomatis

**Proses**:
1. Cek game sudah selesai
2. Hitung hadiah
3. Jika pemenang punya pinjaman:
   - Bayar pinjaman dari hadiah
   - Bayar bunga
   - Kembalikan jaminan
   - Sisa hadiah ke pemenang
4. Jika pemenang tidak punya pinjaman:
   - Hadiah langsung ke pemenang
5. Fee ke Squads multisig vaults

### 3. `initialize_platform_with_multisig`
**Fungsi**: Setup platform dengan Squads multisig

**Proses**:
1. Buat platform config
2. Set multisig sebagai authority (bukan 1 wallet)
3. Set Squads vaults untuk platform fee dan treasury
4. Set fee percentages

### 4. `withdraw_treasury_via_multisig`
**Fungsi**: Withdraw dari treasury (butuh approval multisig)

**Proses**:
1. Validasi multisig adalah authority
2. Cek proposal sudah diapprove
3. Execute transfer
4. Update treasury balance

---

## 🔒 Keamanan

### Kamino Security

1. **Collateral Ratio**: Selalu cek minimum 150%
2. **Oracle Price**: Pakai Scope oracle (gabungan banyak sumber)
3. **Liquidation**: Monitor threshold 120%
4. **Auto-Repayment**: Bayar otomatis dari hadiah

### Squads Security

1. **Multisig 3-of-5**: Butuh 3 approval dari 5 members
2. **Time Lock**: Tunggu 24 jam untuk withdraw besar
3. **Spending Limit**: Limit harian untuk operasional
4. **Emergency Pause**: Bisa pause platform kalau ada masalah

### Combined Security

1. **Reentrancy Protection**: Update state sebelum external calls
2. **Access Control**: Multisig untuk config, player untuk game
3. **Error Handling**: Graceful handling kalau Kamino/Squads gagal

---

## 📅 Rencana Implementasi

### Phase 1: Update State (Minggu 1)
- Tambah field baru di `PlatformConfig`
- Tambah field baru di `Game`
- Tambah error codes baru

### Phase 2: Integrasi Kamino (Minggu 2)
- Implementasi `create_game_with_loan`
- Implementasi `finalize_game_with_loan_repayment`
- Testing dengan Kamino devnet

### Phase 3: Integrasi Squads (Minggu 3)
- Implementasi `initialize_platform_with_multisig`
- Implementasi `withdraw_treasury_via_multisig`
- Testing dengan Squads devnet

### Phase 4: Testing (Minggu 4)
- Integration tests
- End-to-end tests
- Security audit
- Load testing

### Phase 5: Deployment (Minggu 5)
- Deploy ke devnet
- Buat multisig di devnet
- Test dengan real Kamino loans
- Deploy ke mainnet

**Total Waktu**: 5 minggu

---

## 💡 Keuntungan untuk Pemain

### Dengan Kamino
1. **Modal Kecil**: Punya 0.15 SOL bisa main game 0.1 SOL
2. **Leverage**: Bisa main lebih banyak game
3. **Risk Management**: Jaminan dikembalikan kalau menang
4. **Otomatis**: Tidak perlu manual bayar pinjaman

### Dengan Squads
1. **Keamanan**: Dana platform aman di multisig
2. **Transparansi**: Semua transaksi bisa dilacak
3. **Trust**: Tidak ada 1 orang bisa ambil semua dana
4. **Profesional**: Standard industri crypto

---

## 📊 Biaya

### Transaction Costs
- Create game with loan: ~0.003 SOL
- Finalize with repayment: ~0.001 SOL
- Multisig proposal: ~0.002 SOL
- Multisig execute: ~0.001 SOL

### Kamino Fees
- Bunga: ~5-10% per tahun
- Origination fee: 0.1%
- Liquidation penalty: 5%

### Squads Fees
- Buat multisig: ~0.01 SOL (sekali)
- Transaction rent: ~0.001 SOL per proposal
- Tidak ada biaya bulanan

---

## 🎯 Target Sukses

### Kamino
- 30% game pakai pinjaman
- <1% liquidation rate
- 95% loan repayment rate

### Squads
- 100% treasury withdrawals via multisig
- <24 jam average approval time
- 0 unauthorized withdrawals

---

## ❓ FAQ

### Q: Apa bedanya main dengan pinjaman vs normal?
**A**: Dengan pinjaman, kamu hanya perlu deposit jaminan (150% dari entry fee). Kalau menang, pinjaman dibayar otomatis dan jaminan kembali. Kalau kalah, jaminan dipakai bayar pinjaman.

### Q: Apa yang terjadi kalau harga SOL turun saat main?
**A**: Kamino monitor nilai jaminan. Kalau turun di bawah 120%, jaminan akan di-liquidate otomatis untuk bayar pinjaman. Tapi ini jarang terjadi karena game cepat (beberapa menit).

### Q: Kenapa pakai multisig?
**A**: Untuk keamanan. Tidak ada 1 orang yang bisa ambil semua dana platform. Semua transaksi besar harus disetujui minimal 3 dari 5 team members.

### Q: Berapa lama approval multisig?
**A**: Untuk withdraw besar, ada time lock 24 jam. Untuk operasional kecil (di bawah limit), bisa langsung.

### Q: Apa risiko pakai pinjaman?
**A**: Risiko utama adalah liquidation kalau harga jaminan turun drastis. Tapi karena game cepat dan jaminan 150%, risiko ini sangat kecil.

---

## 🚀 Next Steps

1. ✅ Architecture selesai
2. ⏳ Review dengan team
3. ⏳ Mulai implementasi Phase 1
4. ⏳ Testing di devnet
5. ⏳ Deploy ke mainnet

**Status**: ✅ Desain Lengkap - Siap Implementasi
**Estimasi**: 5 minggu
**Risk Level**: Medium (butuh testing menyeluruh)

---

## 📚 Resources

- [Kamino Finance](https://kamino.finance)
- [Squads Protocol](https://squads.so)
- [Magic Roulette Docs](./README.md)
- [Security Audit Report](./SECURITY_AUDIT_REPORT.md)
