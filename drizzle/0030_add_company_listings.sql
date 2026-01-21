-- Add company_listings table for services/items
CREATE TABLE `company_listings` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  `company_id` INTEGER NOT NULL REFERENCES `companies`(`id`) ON DELETE CASCADE,
  `title` TEXT NOT NULL,
  `description` TEXT,
  `price` REAL,
  `is_active` INTEGER NOT NULL DEFAULT 1,
  `sort_order` INTEGER NOT NULL DEFAULT 0,
  `created_at` INTEGER NOT NULL DEFAULT (unixepoch()),
  `updated_at` INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX `idx_company_listings_company` ON `company_listings`(`company_id`);
CREATE INDEX `idx_company_listings_company_active` ON `company_listings`(`company_id`, `is_active`);

-- Auto-update updated_at on modifications
CREATE TRIGGER `update_company_listings_updated_at`
AFTER UPDATE ON `company_listings`
FOR EACH ROW
BEGIN
  UPDATE `company_listings` SET `updated_at` = unixepoch() WHERE `id` = NEW.`id`;
END;
