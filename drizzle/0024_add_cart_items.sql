-- Add shopping cart items table
CREATE TABLE IF NOT EXISTS `cart_items` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` integer NOT NULL,
  `title` text(50) NOT NULL,
  `description` text(500),
  `quantity` integer DEFAULT 1 NOT NULL,
  `created_at` integer DEFAULT (unixepoch()) NOT NULL,
  `updated_at` integer DEFAULT (unixepoch()) NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade
);

-- Create indexes
CREATE INDEX IF NOT EXISTS `idx_cart_items_user` ON `cart_items` (`user_id`);
