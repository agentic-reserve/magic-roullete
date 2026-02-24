# Fix Installation Issues

Jika mengalami error `expo-asset cannot be found` atau `expo: not found`, ikuti langkah berikut:

## SOLUSI LENGKAP (Recommended)

```bash
# 1. Pastikan Anda di folder mobile-app
cd mobile-app

# 2. Hapus instalasi lama
rm -rf node_modules package-lock.json

# 3. Install dependencies dengan legacy peer deps
npm install --legacy-peer-deps

# 4. Verifikasi expo terinstall
npx expo --version

# 5. Jalankan development server
npm run web
```

## Option 1: Clean Install (Jika masih error)

```bash
cd mobile-app

# Hapus node_modules dan package-lock
rm -rf node_modules package-lock.json

# Install ulang
npm install --legacy-peer-deps

# Install expo-cli secara global (optional)
npm install -g expo-cli
```

## Option 2: Manual Install Expo Packages

```bash
cd mobile-app

# Install expo packages yang diperlukan
npm install expo-asset expo-font expo-constants --legacy-peer-deps
```

## Option 3: Use Expo CLI

```bash
cd mobile-app

# Install dengan expo
npx expo install expo-asset expo-font expo-constants
```

## Verify Installation

Setelah install, cek apakah packages ada:

```bash
ls node_modules/expo-asset
ls node_modules/expo-font
ls node_modules/expo-constants
```

## Run Development Server

```bash
npm run web
```

## Troubleshooting

### Error: Cannot find module 'expo-asset'

**Solution:**
```bash
npm install expo-asset@latest --legacy-peer-deps
```

### Error: Metro bundler issues

**Solution:**
```bash
# Clear metro cache
npx expo start --clear

# Or
npm start -- --reset-cache
```

### Error: Peer dependency conflicts

**Solution:**
Always use `--legacy-peer-deps` flag:
```bash
npm install --legacy-peer-deps
```

## Alternative: Use Yarn

Jika npm terus bermasalah, coba yarn:

```bash
# Install yarn
npm install -g yarn

# Install dependencies
yarn install

# Run
yarn web
```
