-- Add auth_user_id column to users table for NextAuth integration
ALTER TABLE users ADD COLUMN auth_user_id TEXT;

-- Create unique index on auth_user_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);