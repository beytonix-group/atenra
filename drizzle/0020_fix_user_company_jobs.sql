-- Fix user_company_jobs table to match schema.ts
-- This migration drops and recreates the table with proper structure
-- including priority field, job address fields, and autoincrement id

-- Drop the old table (NOTE: this will delete all existing job data!)
DROP TABLE IF EXISTS user_company_jobs;

-- Recreate with proper schema
CREATE TABLE user_company_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES service_categories(id),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  start_date INTEGER,
  end_date INTEGER,
  notes TEXT,
  budget_cents INTEGER,
  job_address_line1 TEXT,
  job_address_line2 TEXT,
  job_city TEXT,
  job_state TEXT,
  job_zip TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Create indexes for user_company_jobs
CREATE INDEX IF NOT EXISTS idx_ucj_user ON user_company_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_ucj_company ON user_company_jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_ucj_category ON user_company_jobs(category_id);
CREATE INDEX IF NOT EXISTS idx_ucj_status ON user_company_jobs(status);
CREATE INDEX IF NOT EXISTS idx_user_company_jobs_priority ON user_company_jobs(priority);
CREATE INDEX IF NOT EXISTS idx_ucj_company_status ON user_company_jobs(company_id, status);
CREATE INDEX IF NOT EXISTS idx_ucj_user_company ON user_company_jobs(user_id, company_id);
