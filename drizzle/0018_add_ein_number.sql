-- Add EIN (Employer Identification Number) column to companies table
-- EIN is required for all businesses

-- Add the ein_number column with a temporary default for existing rows
ALTER TABLE companies ADD COLUMN ein_number TEXT NOT NULL DEFAULT 'PENDING';

-- Remove the default constraint (SQLite doesn't support DROP DEFAULT, but new inserts will require the value)
-- Existing rows will keep 'PENDING' until updated
