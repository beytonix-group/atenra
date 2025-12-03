-- Migration: Add user presence tracking
-- Adds last_active_at column to track when user was last online

-- Add last_active_at column to users table
ALTER TABLE users ADD COLUMN last_active_at INTEGER;

-- Create index for efficient presence queries
CREATE INDEX idx_users_last_active ON users(last_active_at);
