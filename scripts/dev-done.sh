#!/bin/bash

# Script to restore all runtime exports back to 'edge' after local development
echo "Restoring runtime exports to 'edge'..."

# Find all TypeScript files that contain runtime exports
files_to_restore=$(find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "export const runtime = 'nodejs'" {} \;)

if [ -z "$files_to_restore" ]; then
  echo "No files need to be restored (all files already use 'edge' runtime)"
  exit 0
fi

# Counter for tracking changes
count=0

# Update each file back to edge runtime
for file in $files_to_restore; do
  sed -i '' "s/export const runtime = 'nodejs'/export const runtime = 'edge'/g" "$file"
  echo "✓ Restored: $file"
  ((count++))
done

echo ""
echo "✅ Successfully restored $count file(s) to edge runtime"
echo ""
echo "You can now:"
echo "  • Run 'bun run pages:build' for production build"
echo "  • Commit your changes (runtime configs are back to edge)"
echo "  • Push to repository"