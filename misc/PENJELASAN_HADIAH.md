# Magic Roulette - Penjelasan Hadiah dan Kerugian

## 💰 Berapa Yang Hilang Untuk Pemain Yang Kalah?

### Jawaban Singkat:
**Pemain yang kalah kehilangan 100% dari entry fee mereka.**

---

## 📊 Rincian Distribusi Hadiah

### Contoh: Game 1v1 dengan Entry Fee 100 Token

#### Total Pot
- Player 1 bayar: **100 token**
- Player 2 bayar: **100 token**
- **Total pot: 200 token**

#### Distribusi Setelah Game Selesai

Dengan konfigurasi default:
- Platform Fee: **5%** (500 basis points)
- Treasury Fee: **10%** (1000 basis points)

**Perhitungan:**
```
Total Pot:        200 token
Platform Fee:     200 × 5%  = 10 token
Treasury Fee:     200 × 10% = 20 token
Untuk Pemenang:   200 - 10 - 20 = 170 token
```

#### Hasil Akhir

| Pihak | Dapat | Keterangan |
|-------|-------|------------|
| **Pemenang** | **170 token** | Profit: +70 token (bayar 100, dapat 170) |
| **Kalah** | **0 token** | Loss: -100 token (bayar 100, dapat 0) |
| Platform | 10 token | 5% dari total pot |
| Treasury | 20 token | 10% dari total pot |

---

## 🎮 Contoh Berbagai Skenario

### Skenario 1: Game 1v1 - Entry Fee 100 Token

**Sebelum Game:**
- Player A: 1000 token → Bayar 100 → Sisa 900 token
- Player B: 1000 token → Bayar 100 → Sisa 900 token

**Setelah Game (Player A Menang):**
- Player A: 900 + 170 = **1070 token** ✅ (Profit +70)
- Player B: 900 + 0 = **900 token** ❌ (Loss -100)

---

### Skenario 2: Game 2v2 - Entry Fee 200 Token

**Total Pot:** 4 × 200 = 800 token

**Distribusi:**
```
Platform Fee:     800 × 5%  = 40 token
Treasury Fee:     800 × 10% = 80 token
Untuk Pemenang:   800 - 40 - 80 = 680 token
Per Pemenang:     680 ÷ 2 = 340 token
```

**Hasil:**
- **Setiap Pemenang**: Dapat 340 token (Profit +140)
- **Setiap Kalah**: Dapat 0 token (Loss -200)

---

### Skenario 3: AI Practice Mode (GRATIS)

**Entry Fee:** 0 token (GRATIS!)

**Hasil:**
- **Pemenang**: Dapat 0 token (tidak ada hadiah)
- **Kalah**: Dapat 0 token (tidak ada kerugian)
- **Tujuan**: Latihan saja, tidak ada uang yang hilang

---

## 📈 Tabel Perbandingan Entry Fee

| Entry Fee | Total Pot (1v1) | Platform Fee (5%) | Treasury Fee (10%) | Pemenang Dapat | Kalah Kehilangan |
|-----------|-----------------|-------------------|-------------------|----------------|------------------|
| 10 token  | 20 token        | 1 token           | 2 token           | 17 token       | -10 token        |
| 50 token  | 100 token       | 5 token           | 10 token          | 85 token       | -50 token        |
| 100 token | 200 token       | 10 token          | 20 token          | 170 token      | -100 token       |
| 500 token | 1000 token      | 50 token          | 100 token         | 850 token      | -500 token       |
| 1000 token| 2000 token      | 100 token         | 200 token         | 1700 token     | -1000 token      |

---

## 🎯 Kesimpulan

### Untuk Pemain Yang Kalah:
- ❌ **Kehilangan 100% dari entry fee**
- ❌ **Tidak mendapat apa-apa**
- ❌ **Tidak ada refund**

### Untuk Pemain Yang Menang:
- ✅ **Mendapat 85% dari total pot** (setelah dikurangi fee)
- ✅ **Profit sekitar 70% dari entry fee** (untuk 1v1)
- ✅ **Semakin besar entry fee, semakin besar profit**

### Untuk Platform & Treasury:
- Platform mendapat 5% dari setiap game
- Treasury mendapat 10% dari setiap game
- Total fee: 15% dari total pot

---

## 💡 Tips

### Untuk Meminimalkan Kerugian:
1. **Mulai dengan entry fee kecil** untuk belajar
2. **Gunakan AI Practice Mode** untuk latihan gratis
3. **Pahami mekanisme game** sebelum bermain dengan uang besar
4. **Jangan bermain dengan uang yang tidak bisa Anda rugikan**

### Untuk Memaksimalkan Profit:
1. **Menang lebih sering** (obviously! 😄)
2. **Bermain di game dengan entry fee lebih besar** (risk vs reward)
3. **Pahami probabilitas** (1 peluru dalam 6 chamber)

---

## 🔢 Kalkulator Cepat

### Formula Sederhana:

**Untuk 1v1:**
```
Entry Fee Anda:        X token
Jika Menang:          X × 1.7 token (profit +70%)
Jika Kalah:           0 token (loss -100%)
```

**Untuk 2v2:**
```
Entry Fee Anda:        X token
Jika Menang:          X × 1.7 token (profit +70%)
Jika Kalah:           0 token (loss -100%)
```

**Catatan:** Angka 1.7 adalah perkiraan dengan fee 15% total

---

## ⚠️ Peringatan

1. **Ini adalah game gambling** - Anda bisa kehilangan semua entry fee
2. **Tidak ada jaminan menang** - Ini game keberuntungan
3. **Bermain dengan bijak** - Jangan gunakan uang yang Anda butuhkan
4. **Pahami risikonya** - Kalah = kehilangan 100% entry fee

---

## 🆓 Mode Gratis (AI Practice)

Jika Anda ingin bermain **TANPA RISIKO**:
- Gunakan **AI Practice Mode**
- Entry fee: **0 token**
- Tidak ada hadiah, tidak ada kerugian
- Cocok untuk belajar dan berlatih

---

## 📞 Pertanyaan Lain?

Lihat dokumentasi lengkap di:
- `IMPLEMENTATION_STATUS.md` - Status implementasi
- `DEPLOYMENT_GUIDE.md` - Panduan deployment
- `SUMMARY.md` - Ringkasan proyek
