#!/bin/bash

echo "🔄 Setting nodejs runtime for local development..."

# Find and temporarily modify only route.ts files (API routes)
find src/app -type f -name "route.ts" -exec grep -l "export const runtime = 'edge'" {} \; > /tmp/runtime-files.txt

# Backup and modify
while read -r file; do
  cp "$file" "$file.backup"
  sed -i '' "s/export const runtime = 'edge'/export const runtime = 'nodejs'/g" "$file"
  echo "  ✓ Modified $(basename "$file")"
done < /tmp/runtime-files.txt

echo "🚀 Starting development server..."

# Function to restore files
restore_files() {
  echo ""
  echo "🔄 Restoring edge runtime configuration..."
  while read -r file; do
    if [ -f "$file.backup" ]; then
      mv "$file.backup" "$file"
      echo "  ✓ Restored $(basename "$file")"
    fi
  done < /tmp/runtime-files.txt
  rm -f /tmp/runtime-files.txt
}

# Trap to restore files on exit
trap restore_files EXIT INT TERM

# Run the dev server
next dev

# Files will be restored automatically when the script exits