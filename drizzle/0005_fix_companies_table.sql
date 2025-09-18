-- Migration to fix companies table schema mismatches
-- Add missing columns and rename existing ones to match Drizzle schema

-- Rename website to website_url
ALTER TABLE companies RENAME COLUMN website TO website_url;

-- Add missing columns
ALTER TABLE companies ADD COLUMN license_number TEXT;
ALTER TABLE companies ADD COLUMN insurance_number TEXT;
ALTER TABLE companies ADD COLUMN is_public INTEGER DEFAULT 1;
ALTER TABLE companies ADD COLUMN memo TEXT;
ALTER TABLE companies ADD COLUMN created_by_user_id INTEGER REFERENCES users(id);

-- Note: slug, logo_url, and metadata columns exist in DB but not in Drizzle schema
-- We'll keep them for backward compatibility

-- Add missing columns to service_categories
ALTER TABLE service_categories ADD COLUMN is_active INTEGER DEFAULT 1;