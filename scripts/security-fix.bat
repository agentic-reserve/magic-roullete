@echo off
REM Security Fix Script for Magic Roulette (Windows)
REM This script helps remove exposed credentials and secure the repository

echo ============================================
echo 🔒 Magic Roulette Security Fix Script
echo ============================================
echo.

REM Step 1: Check if .env files are tracked
echo 📋 Step 1: Checking for tracked .env files...
git ls-files | findstr "\.env$" > nul 2>&1
if %errorlevel% equ 0 (
    echo ❌ Found tracked .env files
    echo.
    set /p REMOVE="Remove .env files from git tracking? (y/n): "
    if /i "%REMOVE%"=="y" (
        echo Removing .env files from git...
        git rm --cached .env 2>nul
        git rm --cached backend\.env 2>nul
        git rm --cached web-app-magicroullete\.env 2>nul
        echo ✅ .env files removed from tracking
    )
) else (
    echo ✅ No tracked .env files found
)
echo.

REM Step 2: Backup current .env files
echo 📋 Step 2: Backing up current .env files...
set BACKUP_DIR=env-backup-%date:~-4,4%%date:~-10,2%%date:~-7,2%-%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_DIR=%BACKUP_DIR: =0%
mkdir "%BACKUP_DIR%" 2>nul

if exist ".env" (
    copy .env "%BACKUP_DIR%\.env" >nul
    echo ✅ Backed up .env
)

if exist "backend\.env" (
    copy backend\.env "%BACKUP_DIR%\backend.env" >nul
    echo ✅ Backed up backend\.env
)

if exist "web-app-magicroullete\.env" (
    copy web-app-magicroullete\.env "%BACKUP_DIR%\web-app.env" >nul
    echo ✅ Backed up web-app\.env
)

echo ✅ Backups saved to: %BACKUP_DIR%
echo.

REM Step 3: Create new .env from examples
echo 📋 Step 3: Creating new .env files from examples...

if exist ".env.example" (
    copy .env.example .env >nul
    echo ✅ Created .env from .env.example
)

if exist "backend\.env.example" (
    copy backend\.env.example backend\.env >nul
    echo ✅ Created backend\.env from example
)

if exist "web-app-magicroullete\.env.example" (
    copy web-app-magicroullete\.env.example web-app-magicroullete\.env >nul
    echo ✅ Created web-app\.env from example
)

echo.

REM Step 4: Check hardcoded API key
echo 📋 Step 4: Checking for hardcoded API keys...
findstr /C:"17d9dba-7315-4095-a0ed-acbf1a641dac" scripts\setup-kamino-integration.ts >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Found hardcoded API key in scripts\setup-kamino-integration.ts
    echo This needs manual fix. Replace line 17 with:
    echo.
    echo const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
    echo if ^(!HELIUS_API_KEY^) {
    echo   throw new Error^('HELIUS_API_KEY environment variable is required'^);
    echo }
    echo.
) else (
    echo ✅ No hardcoded API key found
)
echo.

REM Step 5: Verify .gitignore
echo 📋 Step 5: Verifying .gitignore...
findstr /C:".env" .gitignore >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ .env is in .gitignore
) else (
    echo ❌ .env not found in .gitignore
    echo Adding .env to .gitignore...
    echo .env >> .gitignore
)
echo.

REM Step 6: Create pre-commit hook
echo 📋 Step 6: Creating pre-commit hook...
if not exist ".git\hooks" mkdir .git\hooks

(
echo #!/bin/bash
echo.
echo # Pre-commit hook to prevent committing .env files
echo.
echo if git diff --cached --name-only ^| grep -E "\.env$^|\.env\.local$"; then
echo     echo "❌ ERROR: Attempting to commit .env file!"
echo     echo "Please remove .env files from your commit:"
echo     echo "  git reset HEAD .env"
echo     echo ""
echo     exit 1
echo fi
) > .git\hooks\pre-commit

echo ✅ Pre-commit hook created
echo.

echo ============================================
echo 🎉 Security fix completed!
echo ============================================
echo.
echo 📝 IMPORTANT NEXT STEPS:
echo 1. Get new API keys from:
echo    - Helius: https://dashboard.helius.dev
echo    - Supabase: https://app.supabase.com
echo.
echo 2. Update your new .env files with the new keys
echo.
echo 3. Commit the changes:
echo    git add .gitignore
echo    git commit -m "security: remove exposed credentials and add protections"
echo.
echo 4. Review backup files in: %BACKUP_DIR%
echo.
echo 5. Read full security report: SECURITY_AUDIT_REPORT.md
echo.
echo ⚠️  DO NOT push until you've rotated all API keys!
echo.
pause
