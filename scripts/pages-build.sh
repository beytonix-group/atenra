#!/bin/bash

echo "🔄 Setting edge runtime for build..."

# Find and temporarily modify files
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "export const runtime" {} \; > /tmp/runtime-files.txt

# Backup and modify
while read -r file; do
  cp "$file" "$file.backup"
  sed -i '' "s/export const runtime = .*/export const runtime = 'edge';/g" "$file"
  echo "  ✓ Modified $(basename "$file")"
done < /tmp/runtime-files.txt

echo "📦 Building for Cloudflare Pages..."
bunx @cloudflare/next-on-pages

BUILD_EXIT_CODE=$?

echo "🔄 Restoring original runtime configuration..."
# Restore files
while read -r file; do
  mv "$file.backup" "$file"
  echo "  ✓ Restored $(basename "$file")"
done < /tmp/runtime-files.txt

# Clean up
rm /tmp/runtime-files.txt

if [ $BUILD_EXIT_CODE -eq 0 ]; then
  echo "✅ Build successful!"
else
  echo "❌ Build failed with exit code $BUILD_EXIT_CODE"
fi

exit $BUILD_EXIT_CODE