#!/bin/bash

echo "🔧 Building in Linux filesystem to avoid WSL I/O issues..."
echo ""

# Create temp directory in Linux filesystem
TEMP_DIR=~/magic-roulette-build
echo "📁 Creating temp directory: $TEMP_DIR"
rm -rf $TEMP_DIR
mkdir -p $TEMP_DIR

# Copy project to Linux filesystem
echo "📋 Copying project files..."
rsync -av --exclude='target' --exclude='node_modules' --exclude='.git' . $TEMP_DIR/

# Build in Linux filesystem
echo ""
echo "🔨 Building program..."
cd $TEMP_DIR
cargo build-sbf 2>&1 | tee build.log

BUILD_STATUS=${PIPESTATUS[0]}

if [ $BUILD_STATUS -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "📦 Copying artifacts back..."
    
    # Copy build artifacts back
    mkdir -p /mnt/c/Users/raden/Documents/magic-roullete/target/deploy
    cp -v $TEMP_DIR/target/deploy/*.so /mnt/c/Users/raden/Documents/magic-roullete/target/deploy/ 2>/dev/null || true
    cp -v $TEMP_DIR/target/deploy/*.json /mnt/c/Users/raden/Documents/magic-roullete/target/deploy/ 2>/dev/null || true
    
    echo ""
    echo "✅ Build artifacts copied to target/deploy/"
    ls -lh /mnt/c/Users/raden/Documents/magic-roullete/target/deploy/
else
    echo ""
    echo "❌ Build failed!"
    echo ""
    echo "Last 50 lines of error:"
    tail -50 build.log
    
    # Copy log back
    cp build.log /mnt/c/Users/raden/Documents/magic-roullete/build_linux.log
fi

# Cleanup
echo ""
echo "🧹 Cleaning up temp directory..."
cd /mnt/c/Users/raden/Documents/magic-roullete
rm -rf $TEMP_DIR

exit $BUILD_STATUS
