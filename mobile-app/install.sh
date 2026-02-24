#!/bin/bash

echo "🚀 Magic Roulette Mobile App - Installation Script"
echo "=================================================="
echo ""

# Check if we're in the mobile-app directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    echo "Please run this script from the mobile-app directory:"
    echo "  cd mobile-app"
    echo "  bash install.sh"
    exit 1
fi

echo "📦 Step 1: Cleaning old installation..."
rm -rf node_modules package-lock.json
echo "✅ Cleaned"
echo ""

echo "📦 Step 2: Installing dependencies..."
npm install --legacy-peer-deps
if [ $? -ne 0 ]; then
    echo "❌ Installation failed!"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

echo "🔍 Step 3: Verifying Expo installation..."
npx expo --version
if [ $? -ne 0 ]; then
    echo "⚠️  Warning: Expo CLI not found, but it should work with npx"
fi
echo ""

echo "✅ Installation complete!"
echo ""
echo "🎮 To start the development server, run:"
echo "  npm run web"
echo ""
echo "📱 For mobile development:"
echo "  npm start"
echo ""
