-- Add addedByUserId column to cart_items
ALTER TABLE `cart_items` ADD COLUMN `added_by_user_id` integer REFERENCES `users`(`id`) ON DELETE SET NULL;

-- Create index for added_by_user_id
CREATE INDEX IF NOT EXISTS `idx_cart_items_added_by` ON `cart_items` (`added_by_user_id`);

-- Create cart audit logs table
CREATE TABLE IF NOT EXISTS `cart_audit_logs` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `target_user_id` integer NOT NULL,
  `employee_user_id` integer NOT NULL,
  `action` text NOT NULL,
  `item_id` integer,
  `item_title` text,
  `item_description` text,
  `metadata` text,
  `ip_address` text,
  `created_at` integer DEFAULT (unixepoch()) NOT NULL,
  FOREIGN KEY (`target_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`employee_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT
);

-- Create indexes for cart_audit_logs
CREATE INDEX IF NOT EXISTS `idx_cart_audit_target_user` ON `cart_audit_logs` (`target_user_id`);
CREATE INDEX IF NOT EXISTS `idx_cart_audit_employee` ON `cart_audit_logs` (`employee_user_id`);
CREATE INDEX IF NOT EXISTS `idx_cart_audit_action` ON `cart_audit_logs` (`action`);
CREATE INDEX IF NOT EXISTS `idx_cart_audit_created_at` ON `cart_audit_logs` (`created_at`);
