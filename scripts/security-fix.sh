#!/bin/bash

# Security Fix Script for Magic Roulette
# This script helps remove exposed credentials and secure the repository

set -e

echo "🔒 Magic Roulette Security Fix Script"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check if .env files are tracked
echo "📋 Step 1: Checking for tracked .env files..."
TRACKED_ENV=$(git ls-files | grep "\.env$" || true)

if [ -n "$TRACKED_ENV" ]; then
    echo -e "${RED}❌ Found tracked .env files:${NC}"
    echo "$TRACKED_ENV"
    echo ""
    
    read -p "Remove these files from git tracking? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Removing .env files from git..."
        git rm --cached .env 2>/dev/null || true
        git rm --cached backend/.env 2>/dev/null || true
        git rm --cached web-app-magicroullete/.env 2>/dev/null || true
        echo -e "${GREEN}✅ .env files removed from tracking${NC}"
    fi
else
    echo -e "${GREEN}✅ No tracked .env files found${NC}"
fi

echo ""

# Step 2: Backup current .env files
echo "📋 Step 2: Backing up current .env files..."
BACKUP_DIR="env-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

if [ -f ".env" ]; then
    cp .env "$BACKUP_DIR/.env"
    echo "✅ Backed up .env"
fi

if [ -f "backend/.env" ]; then
    cp backend/.env "$BACKUP_DIR/backend.env"
    echo "✅ Backed up backend/.env"
fi

if [ -f "web-app-magicroullete/.env" ]; then
    cp web-app-magicroullete/.env "$BACKUP_DIR/web-app.env"
    echo "✅ Backed up web-app/.env"
fi

echo -e "${GREEN}✅ Backups saved to: $BACKUP_DIR${NC}"
echo ""

# Step 3: Create new .env from examples
echo "📋 Step 3: Creating new .env files from examples..."

if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "✅ Created .env from .env.example"
fi

if [ -f "backend/.env.example" ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env from example"
fi

if [ -f "web-app-magicroullete/.env.example" ]; then
    cp web-app-magicroullete/.env.example web-app-magicroullete/.env
    echo "✅ Created web-app/.env from example"
fi

echo ""

# Step 4: Fix hardcoded API key in setup script
echo "📋 Step 4: Fixing hardcoded API key in setup script..."

SETUP_FILE="scripts/setup-kamino-integration.ts"
if [ -f "$SETUP_FILE" ]; then
    # Check if hardcoded key exists
    if grep -q "17d9dba-7315-4095-a0ed-acbf1a641dac" "$SETUP_FILE"; then
        echo -e "${YELLOW}⚠️  Found hardcoded API key in $SETUP_FILE${NC}"
        echo "This needs manual fix. Replace line 17 with:"
        echo ""
        echo "const HELIUS_API_KEY = process.env.HELIUS_API_KEY;"
        echo "if (!HELIUS_API_KEY) {"
        echo "  throw new Error('HELIUS_API_KEY environment variable is required');"
        echo "}"
        echo ""
    else
        echo -e "${GREEN}✅ No hardcoded API key found${NC}"
    fi
fi

echo ""

# Step 5: Verify .gitignore
echo "📋 Step 5: Verifying .gitignore..."

if grep -q "^\.env$" .gitignore; then
    echo -e "${GREEN}✅ .env is in .gitignore${NC}"
else
    echo -e "${RED}❌ .env not found in .gitignore${NC}"
    echo "Adding .env to .gitignore..."
    echo ".env" >> .gitignore
fi

echo ""

# Step 6: Create pre-commit hook
echo "📋 Step 6: Creating pre-commit hook to prevent .env commits..."

HOOK_FILE=".git/hooks/pre-commit"
cat > "$HOOK_FILE" << 'EOF'
#!/bin/bash

# Pre-commit hook to prevent committing .env files

if git diff --cached --name-only | grep -E "\.env$|\.env\.local$"; then
    echo "❌ ERROR: Attempting to commit .env file!"
    echo "Please remove .env files from your commit:"
    echo "  git reset HEAD .env"
    echo ""
    exit 1
fi

# Check for potential API keys in staged files
if git diff --cached | grep -E "(PRIVATE_KEY|SECRET_KEY|API_KEY|APIKEY).*=.*['\"][a-zA-Z0-9]{20,}"; then
    echo "⚠️  WARNING: Potential API key detected in staged files!"
    echo "Please review your changes carefully."
    echo ""
    read -p "Continue with commit? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi
EOF

chmod +x "$HOOK_FILE"
echo -e "${GREEN}✅ Pre-commit hook installed${NC}"

echo ""
echo "======================================"
echo -e "${GREEN}🎉 Security fix completed!${NC}"
echo ""
echo "📝 IMPORTANT NEXT STEPS:"
echo "1. Get new API keys from:"
echo "   - Helius: https://dashboard.helius.dev"
echo "   - Supabase: https://app.supabase.com"
echo ""
echo "2. Update your new .env files with the new keys"
echo ""
echo "3. Commit the changes:"
echo "   git add .gitignore"
echo "   git commit -m 'security: remove exposed credentials and add protections'"
echo ""
echo "4. Review backup files in: $BACKUP_DIR"
echo ""
echo "5. Read full security report: SECURITY_AUDIT_REPORT.md"
echo ""
echo -e "${YELLOW}⚠️  DO NOT push until you've rotated all API keys!${NC}"
