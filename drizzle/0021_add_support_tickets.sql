-- Add internal_employee role for support ticket management
INSERT OR IGNORE INTO roles (name, description) VALUES ('internal_employee', 'Internal employee with access to support ticket management');

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  urgency TEXT NOT NULL CHECK(urgency IN ('minor', 'urgent', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  internal_notes TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  resolved_at INTEGER
);

-- Create indexes for support_tickets
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_urgency ON support_tickets(urgency);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status_urgency ON support_tickets(status, urgency);
CREATE INDEX IF NOT EXISTS idx_support_tickets_company ON support_tickets(company_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned ON support_tickets(assigned_to_user_id);

-- Trigger to automatically update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_support_tickets_updated_at
AFTER UPDATE ON support_tickets
FOR EACH ROW
BEGIN
  UPDATE support_tickets SET updated_at = unixepoch() WHERE id = NEW.id;
END;
