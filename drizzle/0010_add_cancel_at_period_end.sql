-- Migration: Add cancel_at_period_end column to subscriptions table
-- This column tracks whether a subscription is scheduled to cancel at the end of the billing period

ALTER TABLE subscriptions ADD COLUMN cancel_at_period_end INTEGER DEFAULT 0 NOT NULL;

-- Add comment for clarity (SQLite doesn't support comments, but documenting here)
-- cancel_at_period_end: 0 = subscription continues, 1 = will cancel at period end
