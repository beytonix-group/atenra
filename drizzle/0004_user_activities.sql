-- Create user_activities table for tracking all user actions
CREATE TABLE IF NOT EXISTS user_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    user_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    info TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_ua_user_time ON user_activities (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ua_action_time ON user_activities (action, created_at);
CREATE INDEX IF NOT EXISTS idx_ua_created_at ON user_activities (created_at DESC);