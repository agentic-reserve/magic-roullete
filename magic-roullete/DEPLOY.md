# Deployment Guide

## Web (PWA)

```bash
npm run export:web
vercel --prod
```

## Android APK via Bubblewrap

1. Deploy PWA first (see above)
2. Install Bubblewrap: `npm install -g @bubblewrap/cli`
3. Initialize: `bubblewrap init --manifest https://your-url.com/manifest.json`
4. Build: `bubblewrap build`

## Native Android

```bash
npm run android:build
cd android
./gradlew assembleRelease
```

APK: `android/app/build/outputs/apk/release/app-release.apk`
