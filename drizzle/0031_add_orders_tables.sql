-- Orders table for one-time cart purchases
CREATE TABLE IF NOT EXISTS `orders` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` integer NOT NULL,
  `order_number` text NOT NULL,
  `status` text NOT NULL DEFAULT 'pending',
  `subtotal_cents` integer NOT NULL,
  `discount_cents` integer DEFAULT 0,
  `discount_type` text,
  `discount_reason` text,
  `coupon_code_id` integer,
  `tax_cents` integer DEFAULT 0,
  `total_cents` integer NOT NULL,
  `currency` text DEFAULT 'usd',
  `payment_provider` text,
  `stripe_checkout_session_id` text UNIQUE,
  `stripe_payment_intent_id` text UNIQUE,
  `paypal_order_id` text UNIQUE,
  `paypal_capture_id` text,
  `metadata` text,
  `created_at` integer DEFAULT (unixepoch()) NOT NULL,
  `updated_at` integer DEFAULT (unixepoch()) NOT NULL,
  `completed_at` integer,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade
);

-- Indexes for orders table
CREATE INDEX IF NOT EXISTS `idx_orders_user` ON `orders`(`user_id`);
CREATE INDEX IF NOT EXISTS `idx_orders_status` ON `orders`(`status`);
CREATE INDEX IF NOT EXISTS `idx_orders_order_number` ON `orders`(`order_number`);
CREATE INDEX IF NOT EXISTS `idx_orders_created_at` ON `orders`(`created_at`);
CREATE INDEX IF NOT EXISTS `idx_orders_stripe_session` ON `orders`(`stripe_checkout_session_id`);
CREATE INDEX IF NOT EXISTS `idx_orders_paypal_order` ON `orders`(`paypal_order_id`);

-- Order items table
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `order_id` integer NOT NULL,
  `title` text NOT NULL,
  `description` text,
  `quantity` integer NOT NULL DEFAULT 1,
  `unit_price_cents` integer NOT NULL,
  `discount_cents` integer DEFAULT 0,
  `total_cents` integer NOT NULL,
  `cart_item_id` integer,
  `metadata` text,
  `created_at` integer DEFAULT (unixepoch()) NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade
);

-- Indexes for order_items table
CREATE INDEX IF NOT EXISTS `idx_order_items_order` ON `order_items`(`order_id`);

-- Coupon codes table (placeholder for future)
CREATE TABLE IF NOT EXISTS `coupon_codes` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `code` text NOT NULL UNIQUE,
  `description` text,
  `discount_type` text NOT NULL,
  `discount_value` integer NOT NULL,
  `min_order_cents` integer,
  `max_discount_cents` integer,
  `usage_limit` integer,
  `usage_count` integer DEFAULT 0,
  `per_user_limit` integer DEFAULT 1,
  `valid_from` integer,
  `valid_until` integer,
  `is_active` integer DEFAULT 1,
  `created_by_user_id` integer,
  `created_at` integer DEFAULT (unixepoch()) NOT NULL,
  `updated_at` integer DEFAULT (unixepoch()) NOT NULL,
  FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE set null
);

-- Indexes for coupon_codes table
CREATE INDEX IF NOT EXISTS `idx_coupon_codes_code` ON `coupon_codes`(`code`);
CREATE INDEX IF NOT EXISTS `idx_coupon_codes_active` ON `coupon_codes`(`is_active`);
CREATE INDEX IF NOT EXISTS `idx_coupon_codes_valid` ON `coupon_codes`(`valid_from`, `valid_until`);
