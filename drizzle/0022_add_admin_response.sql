-- Add admin_response column to support_tickets table
-- This field is visible to users and allows admins to communicate with ticket submitters
ALTER TABLE support_tickets ADD COLUMN admin_response TEXT;
