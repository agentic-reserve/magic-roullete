#!/bin/bash

echo "🔨 Building Magic Roulette Program..."
echo ""

cargo build 2>&1 | tee build_output.log

if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
else
    echo ""
    echo "❌ Build failed. Check build_output.log for details"
    echo ""
    echo "Last 30 lines of error:"
    tail -30 build_output.log
fi
