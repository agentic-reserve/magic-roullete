# Bubblewrap CLI - PWA to APK Conversion Guide

Convert your Magic Roulette PWA into a native Android APK using Bubblewrap.

## Prerequisites

1. **Node.js** (v16+)
2. **Java JDK** (v11+)
3. **Android SDK** with Build Tools
4. **ANDROID_HOME** environment variable set

### Check Prerequisites

```bash
# Check Java
java -version

# Check Android SDK
echo $ANDROID_HOME  # Linux/Mac
echo %ANDROID_HOME%  # Windows

# Should point to Android SDK location
# Example: /Users/username/Library/Android/sdk
```

## Step 1: Build PWA

First, build your web app:

```bash
cd magic-roullete
npm run export:web
```

This creates a `dist/` folder with your PWA.

## Step 2: Deploy PWA (Required)

Bubblewrap needs a live URL. Deploy to any static host:

### Option A: Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

### Option B: Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Option C: GitHub Pages
```bash
npm install -g gh-pages
gh-pages -d dist
```

You'll get a URL like: `https://your-app.ver