-- Migration: Add user_service_preferences table
-- Description: Stores user preferences for service categories
-- Created: 2025-01-XX

-- Create user_service_preferences table
CREATE TABLE IF NOT EXISTS user_service_preferences (
  user_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  priority INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  PRIMARY KEY (user_id, category_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE CASCADE
);

-- Create indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_usp_user ON user_service_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_usp_category ON user_service_preferences(category_id);
CREATE INDEX IF NOT EXISTS idx_usp_user_priority ON user_service_preferences(user_id, priority);