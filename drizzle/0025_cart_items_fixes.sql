-- Fix cart_items table: Add trigger for updated_at and CHECK constraints for text lengths

-- Auto-update updated_at timestamp on modifications
CREATE TRIGGER IF NOT EXISTS `update_cart_items_updated_at`
AFTER UPDATE ON `cart_items`
FOR EACH ROW
BEGIN
  UPDATE `cart_items` SET `updated_at` = unixepoch() WHERE `id` = NEW.`id`;
END;

-- Note: SQLite doesn't allow adding CHECK constraints to existing columns via ALTER TABLE.
-- The CHECK constraints for title (50 chars) and description (500 chars) are enforced
-- at the API level in src/app/api/cart/route.ts and src/app/api/cart/[id]/route.ts.
-- For new tables, use: CHECK(length(title) <= 50) and CHECK(description IS NULL OR length(description) <= 500)
