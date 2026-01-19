-- Add unit_price_cents column to cart_items table
-- Price is stored in cents for precision (null = no price set)

ALTER TABLE `cart_items` ADD COLUMN `unit_price_cents` INTEGER;
