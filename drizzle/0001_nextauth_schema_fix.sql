-- Migration: NextAuth Schema Fix
-- Date: 2025-08-30
-- Description: Fix NextAuth adapter tables to use proper INTEGER timestamps and create missing accounts table

-- Disable foreign key checks temporarily
PRAGMA foreign_keys=off;

-- Fix sessions table schema (TEXT -> INTEGER for expires)
DROP TABLE IF EXISTS sessions;
CREATE TABLE sessions (
  sessionToken TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  expires INTEGER NOT NULL, -- ms since epoch
  FOREIGN KEY (userId) REFERENCES auth_users(id) ON DELETE CASCADE
);

-- Fix verificationTokens table schema (TEXT -> INTEGER for expires)
DROP TABLE IF EXISTS verificationTokens;
CREATE TABLE verificationTokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires INTEGER NOT NULL, -- ms since epoch
  PRIMARY KEY (identifier, token)
);

-- Ensure auth_users table has correct schema
DROP TABLE IF EXISTS auth_users;
CREATE TABLE auth_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  emailVerified INTEGER, -- ms since epoch (nullable)
  name TEXT,
  image TEXT
);

-- Create missing accounts table (required for OAuth providers)
CREATE TABLE IF NOT EXISTS accounts (
  userId TEXT NOT NULL,
  type TEXT NOT NULL,
  provider TEXT NOT NULL, 
  providerAccountId TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  PRIMARY KEY (provider, providerAccountId),
  FOREIGN KEY (userId) REFERENCES auth_users(id) ON DELETE CASCADE
);

-- Re-enable foreign key checks
PRAGMA foreign_keys=on;