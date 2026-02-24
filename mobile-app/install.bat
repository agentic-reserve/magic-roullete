@echo off
echo 🚀 Magic Roulette Mobile App - Installation Script
echo ==================================================
echo.

REM Check if we're in the mobile-app directory
if not exist "package.json" (
    echo ❌ Error: package.json not found!
    echo Please run this script from the mobile-app directory:
    echo   cd mobile-app
    echo   install.bat
    exit /b 1
)

echo 📦 Step 1: Cleaning old installation...
if exist "node_modules" rmdir /s /q node_modules
if exist "package-lock.json" del /f /q package-lock.json
echo ✅ Cleaned
echo.

echo 📦 Step 2: Installing dependencies...
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo ❌ Installation failed!
    exit /b 1
)
echo ✅ Dependencies installed
echo.

echo 🔍 Step 3: Verifying Expo installation...
call npx expo --version
echo.

echo ✅ Installation complete!
echo.
echo 🎮 To start the development server, run:
echo   npm run web
echo.
echo 📱 For mobile development:
echo   npm start
echo.
