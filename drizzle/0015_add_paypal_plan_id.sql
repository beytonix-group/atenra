-- Migration: Add paypal_plan_id column to plans table
-- Date: 2025-01-17
-- Description: Adds PayPal billing plan ID column to support PayPal plan sync functionality
-- This mirrors the existing stripe_product_id and stripe_price_id pattern

-- Add paypal_plan_id column to plans table
-- This stores the PayPal billing plan ID (format: P-XXXXXXXXX)
-- Note: SQLite doesn't support adding UNIQUE constraint with ALTER TABLE
-- We add the column first, then create a unique index
ALTER TABLE plans ADD COLUMN paypal_plan_id TEXT;

-- Create unique index for PayPal plan ID (ensures uniqueness + faster lookups)
CREATE UNIQUE INDEX IF NOT EXISTS idx_plans_paypal_plan_id ON plans(paypal_plan_id) WHERE paypal_plan_id IS NOT NULL;
