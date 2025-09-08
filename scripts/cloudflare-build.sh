#!/bin/bash

echo "Starting Cloudflare Pages build process..."

# Run the actual build
bunx @cloudflare/next-on-pages@1.12.1

# Check if build was successful
if [ $? -eq 0 ]; then
  echo "Build completed successfully"
else
  echo "Build failed, attempting to add async_hooks shim..."
  
  # Create the shim directory if it doesn't exist
  mkdir -p .vercel/output/static/_worker.js/__next-on-pages-dist__/functions
  
  # Create the async_hooks shim
  cat > ".vercel/output/static/_worker.js/__next-on-pages-dist__/functions/async_hooks.js" << 'EOF'
// Polyfill for async_hooks module
export const AsyncLocalStorage = class AsyncLocalStorage {
  constructor() {
    this._store = new Map();
  }
  
  getStore() {
    return this._store.get('current');
  }
  
  run(store, callback, ...args) {
    this._store.set('current', store);
    try {
      return callback(...args);
    } finally {
      this._store.delete('current');
    }
  }
  
  exit(callback, ...args) {
    this._store.delete('current');
    try {
      return callback(...args);
    } finally {}
  }
  
  enterWith(store) {
    this._store.set('current', store);
  }
  
  disable() {
    this._store.clear();
  }
};

export default { AsyncLocalStorage };
EOF
  
  echo "✅ async_hooks shim added, retrying build..."
  
  # Retry the build
  bunx @cloudflare/next-on-pages@1.12.1
fi

# Ensure the shim exists anyway
bash scripts/post-build.sh

echo "Build process complete"