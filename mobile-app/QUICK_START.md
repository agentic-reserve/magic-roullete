# 🚀 Quick Start Guide - Magic Roulette Mobile App

## Prerequisites

- Node.js 18+ installed
- npm atau yarn
- Git

## Installation (Pilih salah satu)

### Option 1: Automatic Installation (Recommended)

**Linux/Mac/WSL:**
```bash
cd mobile-app
bash install.sh
```

**Windows:**
```cmd
cd mobile-app
install.bat
```

### Option 2: Manual Installation

```bash
# 1. Masuk ke folder mobile-app
cd mobile-app

# 2. Hapus instalasi lama (jika ada)
rm -rf node_modules package-lock.json

# 3. Install dependencies
npm install --legacy-peer-deps

# 4. Verifikasi instalasi
npx expo --version
```

## Running the App

### Web Development (Laptop/Desktop)

```bash
npm run web
```

Aplikasi akan terbuka di browser: `http://localhost:8081`

### Mobile Development

```bash
npm start
```

Scan QR code dengan Expo Go app di smartphone Anda.

## Troubleshooting

### Error: `expo: not found`

**Solution:**
```bash
# Install expo-cli globally
npm install -g expo-cli

# Or use npx
npx expo start --web
```

### Error: `expo-asset cannot be found`

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Error: Peer dependency conflicts

**Solution:**
Always use `--legacy-peer-deps` flag:
```bash
npm install --legacy-peer-deps
```

### Error: Metro bundler issues

**Solution:**
```bash
# Clear cache
npx expo start --clear

# Or
npm start -- --reset-cache
```

## Project Structure

```
mobile-app/
├── src/
│   ├── contexts/          # Wallet contexts (Mobile & Web)
│   ├── services/          # Solana & Game services
│   ├── hooks/             # Custom React hooks
│   ├── components/        # Reusable components
│   └── screens/           # App screens
├── App.tsx                # Mobile entry point
├── AppWeb.tsx             # Web entry point
└── package.json           # Dependencies
```

## Development Workflow

1. **Start development server:**
   ```bash
   npm run web
   ```

2. **Connect wallet:**
   - Klik tombol "Connect Wallet"
   - Pilih wallet (Phantom, Solflare, dll)
   - Approve connection

3. **Test game flow:**
   - Create new game
   - Join existing game
   - Place bet
   - Spin roulette

## Smart Contract Info

- **Program ID:** `HA71kX5tHESphxAhqdnrhHWawmEHWHLdiHjeyfA82Bam`
- **Network:** Devnet
- **RPC:** `https://brooks-dn4q23-fast-devnet.helius-rpc.com`
- **Platform Config:** `D2foAR2UbNF3Mm85NGuKbAG1LtDehLxNpMWj89FMUdZR`

## Next Steps

1. ✅ Install dependencies
2. ✅ Run development server
3. 🔄 Connect wallet
4. 🔄 Test game creation
5. 🔄 Test betting flow
6. 🔄 Test game completion

## Need Help?

- Check `INSTALL_FIX.md` for installation issues
- Check `WEB_DEVELOPMENT_GUIDE.md` for web development
- Check `TESTING_GUIDE.md` for testing instructions

## Common Commands

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start web development
npm run web

# Start mobile development
npm start

# Clear cache
npx expo start --clear

# Check Expo version
npx expo --version
```
