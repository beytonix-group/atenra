-- Migration to add company_service_categories junction table
-- Note: Keeping service_categories as-is since removing UNIQUE constraint
-- would require complex data migration with self-referencing foreign keys

-- Create company_service_categories junction table
CREATE TABLE IF NOT EXISTS company_service_categories (
    company_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    PRIMARY KEY (company_id, category_id),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE CASCADE
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_csc_category ON company_service_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_csc_company_created_at ON company_service_categories(company_id, created_at);

-- Add index for service_categories parent lookups if not exists
CREATE INDEX IF NOT EXISTS idx_sc_parent ON service_categories(parent_id);

-- Note: The UNIQUE constraint on service_categories.name from 0001_initial_schema.sql
-- means category names must be globally unique. Consider this when seeding data.