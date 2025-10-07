-- Fix user_roles table schema
-- Add missing columns that the application code expects

ALTER TABLE user_roles ADD COLUMN assigned_at TEXT;
ALTER TABLE user_roles ADD COLUMN assigned_by_user_id INTEGER;

-- Update existing rows with current timestamp
UPDATE user_roles SET assigned_at = CURRENT_TIMESTAMP WHERE assigned_at IS NULL;

-- Fix company_users table schema
-- Add missing columns

ALTER TABLE company_users ADD COLUMN is_default INTEGER NOT NULL DEFAULT 0;
ALTER TABLE company_users ADD COLUMN invited_at TEXT;

-- Update existing rows with current timestamp for invited_at
UPDATE company_users SET invited_at = CURRENT_TIMESTAMP WHERE invited_at IS NULL;
