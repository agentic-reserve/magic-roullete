#!/bin/bash

# Magic Roulette - Android Build Script
echo "🎰 Building Magic Roulette for Android..."

# Generate native Android project
echo "📱 Generating native Android project..."
npm run android:build

# Navigate to android directory
cd android

# Clean previous builds
echo "🧹 Cleaning previous builds..."
./gradlew clean

# Build release APK
echo "🔨 Building release APK..."
./gradlew assembleRelease

# Check if build was successful
if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
    echo "✅ Build successful!"
    echo "📦 APK location: android/app/build/outputs/apk/release/app-release.apk"
    
    # Copy APK to root for easy access
    cp app/build/outputs/apk/release/app-release.apk ../magic-roulette.apk
    echo "📋 Copied to: magic-roulette.apk"
else
    echo "❌ Build failed!"
    exit 1
fi

cd ..
