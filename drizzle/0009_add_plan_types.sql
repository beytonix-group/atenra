-- Add new columns to plans table for different plan types and promotional features

-- Add plan_type column
ALTER TABLE plans ADD COLUMN plan_type TEXT NOT NULL DEFAULT 'regular';

-- Add tagline column
ALTER TABLE plans ADD COLUMN tagline TEXT;

-- Add detailed_description column
ALTER TABLE plans ADD COLUMN detailed_description TEXT;

-- Add quick_view_json column
ALTER TABLE plans ADD COLUMN quick_view_json TEXT;

-- Add industries_json column
ALTER TABLE plans ADD COLUMN industries_json TEXT;

-- Add is_invite_only column
ALTER TABLE plans ADD COLUMN is_invite_only INTEGER NOT NULL DEFAULT 0;

-- Add has_promotion column
ALTER TABLE plans ADD COLUMN has_promotion INTEGER NOT NULL DEFAULT 0;

-- Add promotion_percent_off column
ALTER TABLE plans ADD COLUMN promotion_percent_off INTEGER;

-- Add promotion_months column
ALTER TABLE plans ADD COLUMN promotion_months INTEGER;

-- Add has_refund_guarantee column
ALTER TABLE plans ADD COLUMN has_refund_guarantee INTEGER NOT NULL DEFAULT 0;

-- Create index on plan_type
CREATE INDEX IF NOT EXISTS idx_plans_type ON plans(plan_type);
