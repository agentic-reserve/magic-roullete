#!/bin/bash

# Magic Roulette - PWA Build Script
echo "🎰 Building Magic Roulette PWA..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/

# Build for web
echo "🌐 Building web version..."
npx expo export --platform web

# Check if build was successful
if [ -d "dist" ]; then
    echo "✅ Build successful!"
    echo "📦 Output directory: dist/"
    echo ""
    echo "Next steps:"
    echo "1. Test locally: npx serve dist"
    echo "2. Deploy to Vercel: vercel --prod"
    echo "3. Deploy to Netlify: netlify deploy --prod --dir=dist"
    echo "4. Convert to APK with Bubblewrap: bubblewrap init"
else
    echo "❌ Build failed!"
    exit 1
fi
