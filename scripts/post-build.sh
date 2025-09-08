#!/bin/bash

# Create async_hooks shim after build
echo "Adding async_hooks shim to build output..."

ASYNC_HOOKS_PATH=".vercel/output/static/_worker.js/__next-on-pages-dist__/functions/async_hooks.js"

cat > "$ASYNC_HOOKS_PATH" << 'EOF'
// Polyfill for async_hooks module
// This is a stub implementation for Cloudflare Workers environment

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
    } finally {
      // Store remains deleted
    }
  }

  enterWith(store) {
    this._store.set('current', store);
  }

  disable() {
    this._store.clear();
  }
};

export default {
  AsyncLocalStorage
};
EOF

echo "✅ async_hooks shim added successfully"