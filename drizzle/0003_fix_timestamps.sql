-- Fix timestamps in users table
UPDATE users SET created_at = datetime('now') WHERE created_at = 'CURRENT_TIMESTAMP';
UPDATE users SET updated_at = datetime('now') WHERE updated_at = 'CURRENT_TIMESTAMP';

-- Fix timestamps in other tables if needed
UPDATE companies SET created_at = datetime('now') WHERE created_at = 'CURRENT_TIMESTAMP';
UPDATE companies SET updated_at = datetime('now') WHERE updated_at = 'CURRENT_TIMESTAMP';

UPDATE assets SET created_at = datetime('now') WHERE created_at = 'CURRENT_TIMESTAMP';
UPDATE assets SET updated_at = datetime('now') WHERE updated_at = 'CURRENT_TIMESTAMP';

UPDATE services SET created_at = datetime('now') WHERE created_at = 'CURRENT_TIMESTAMP';
UPDATE services SET updated_at = datetime('now') WHERE updated_at = 'CURRENT_TIMESTAMP';

UPDATE subscriptions SET created_at = datetime('now') WHERE created_at = 'CURRENT_TIMESTAMP';
UPDATE subscriptions SET updated_at = datetime('now') WHERE updated_at = 'CURRENT_TIMESTAMP';

UPDATE invoices SET created_at = datetime('now') WHERE created_at = 'CURRENT_TIMESTAMP';
UPDATE invoices SET updated_at = datetime('now') WHERE updated_at = 'CURRENT_TIMESTAMP';

UPDATE payments SET created_at = datetime('now') WHERE created_at = 'CURRENT_TIMESTAMP';
UPDATE payments SET updated_at = datetime('now') WHERE updated_at = 'CURRENT_TIMESTAMP';

UPDATE audit_logs SET created_at = datetime('now') WHERE created_at = 'CURRENT_TIMESTAMP';

UPDATE support_tickets SET created_at = datetime('now') WHERE created_at = 'CURRENT_TIMESTAMP';
UPDATE support_tickets SET updated_at = datetime('now') WHERE updated_at = 'CURRENT_TIMESTAMP';

UPDATE pages SET created_at = datetime('now') WHERE created_at = 'CURRENT_TIMESTAMP';
UPDATE pages SET updated_at = datetime('now') WHERE updated_at = 'CURRENT_TIMESTAMP';

UPDATE blog_posts SET created_at = datetime('now') WHERE created_at = 'CURRENT_TIMESTAMP';
UPDATE blog_posts SET updated_at = datetime('now') WHERE updated_at = 'CURRENT_TIMESTAMP';

UPDATE user_activities SET created_at = datetime('now') WHERE created_at = 'CURRENT_TIMESTAMP';