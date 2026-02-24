#!/bin/bash

echo "🔧 Fixing mobile app dependencies..."
echo ""

# Remove old dependencies
echo "📦 Removing old node_modules..."
rm -rf node_modules package-lock.json

# Clear npm cache
echo "🧹 Clearing npm cache..."
npm cache clean --force

# Reinstall dependencies
echo "📥 Installing dependencies..."
npm install --legacy-peer-deps

echo ""
echo "✅ Dependencies fixed!"
echo ""
echo "Now run: npm run web"
