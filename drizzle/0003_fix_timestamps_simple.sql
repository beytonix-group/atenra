-- Fix timestamps in users table
UPDATE users SET created_at = datetime('now') WHERE created_at = 'CURRENT_TIMESTAMP';
UPDATE users SET updated_at = datetime('now') WHERE updated_at = 'CURRENT_TIMESTAMP';