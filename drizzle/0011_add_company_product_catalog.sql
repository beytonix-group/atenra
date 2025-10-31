-- Migration: Add company product/service catalog with pricing
-- This allows each company to have their own products/services with custom pricing

-- Table: company_products
-- Stores products/services that companies offer
CREATE TABLE IF NOT EXISTS company_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES service_categories(id) ON DELETE SET NULL,

    -- Product type: 'service' or 'product'
    product_type TEXT NOT NULL CHECK (product_type IN ('service', 'product')) DEFAULT 'service',

    -- Pricing information
    base_price REAL, -- Base price (can be null if custom pricing only)
    currency TEXT DEFAULT 'USD',
    pricing_type TEXT CHECK (pricing_type IN ('fixed', 'hourly', 'custom', 'quote')) DEFAULT 'fixed',

    -- Service duration (for hourly services)
    duration_minutes INTEGER,

    -- Availability
    is_active INTEGER DEFAULT 1,
    is_featured INTEGER DEFAULT 0,
    is_public INTEGER DEFAULT 1, -- Whether to show in public marketplace

    -- SKU and inventory (for physical products)
    sku TEXT,
    stock_quantity INTEGER,
    track_inventory INTEGER DEFAULT 0,

    -- Media
    image_url TEXT,
    gallery_urls TEXT, -- JSON array of image URLs

    -- Additional details
    requirements TEXT, -- What customer needs to provide
    inclusions TEXT, -- What's included in the service/product
    exclusions TEXT, -- What's NOT included
    terms_and_conditions TEXT,

    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT,

    -- Metadata
    metadata TEXT, -- JSON for additional flexible data

    -- Timestamps
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    created_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

    -- Unique constraint
    UNIQUE(company_id, slug)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_company_products_company ON company_products(company_id);
CREATE INDEX IF NOT EXISTS idx_company_products_category ON company_products(category_id);
CREATE INDEX IF NOT EXISTS idx_company_products_active ON company_products(is_active, is_public);
CREATE INDEX IF NOT EXISTS idx_company_products_featured ON company_products(is_featured) WHERE is_featured = 1;

-- Table: company_product_variants
-- For products with variants (e.g., different sizes, colors, options)
CREATE TABLE IF NOT EXISTS company_product_variants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL REFERENCES company_products(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., "Small", "Medium", "Large" or "Basic Package", "Premium Package"
    description TEXT,

    -- Pricing (overrides base product price)
    price REAL NOT NULL,
    compare_at_price REAL, -- Original price for showing discounts

    -- SKU and inventory
    sku TEXT,
    stock_quantity INTEGER,

    -- Additional attributes
    attributes TEXT, -- JSON for flexible attributes like {"size": "M", "color": "Blue"}

    -- Sort order
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,

    -- Timestamps
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),

    UNIQUE(product_id, name)
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product ON company_product_variants(product_id);

-- Table: company_product_pricing_tiers
-- For tiered pricing (e.g., bulk discounts, membership levels)
CREATE TABLE IF NOT EXISTS company_product_pricing_tiers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL REFERENCES company_products(id) ON DELETE CASCADE,
    tier_name TEXT NOT NULL, -- e.g., "Basic", "Standard", "Premium" or "1-10 units", "11-50 units"
    description TEXT,

    -- Pricing
    price REAL NOT NULL,

    -- Quantity range (for bulk pricing)
    min_quantity INTEGER,
    max_quantity INTEGER,

    -- Membership/plan requirement (optional)
    required_plan_id INTEGER REFERENCES plans(id) ON DELETE CASCADE,

    -- Sort order
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,

    -- Timestamps
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_pricing_tiers_product ON company_product_pricing_tiers(product_id);
CREATE INDEX IF NOT EXISTS idx_pricing_tiers_plan ON company_product_pricing_tiers(required_plan_id);

-- Table: company_product_addons
-- Optional add-ons or extras for products/services
CREATE TABLE IF NOT EXISTS company_product_addons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL REFERENCES company_products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,

    -- Pricing
    price REAL NOT NULL,
    pricing_type TEXT CHECK (pricing_type IN ('fixed', 'percentage')) DEFAULT 'fixed',

    -- Constraints
    is_required INTEGER DEFAULT 0,
    max_quantity INTEGER DEFAULT 1,

    -- Sort order
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,

    -- Timestamps
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_product_addons_product ON company_product_addons(product_id);

-- Table: company_product_reviews (for marketplace functionality)
CREATE TABLE IF NOT EXISTS company_product_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL REFERENCES company_products(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Review content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,

    -- Media
    image_urls TEXT, -- JSON array

    -- Moderation
    is_verified_purchase INTEGER DEFAULT 0,
    is_approved INTEGER DEFAULT 0,
    is_featured INTEGER DEFAULT 0,

    -- Response from company
    company_response TEXT,
    company_response_at INTEGER,

    -- Timestamps
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),

    -- User can only review each product once
    UNIQUE(product_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON company_product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user ON company_product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_approved ON company_product_reviews(is_approved) WHERE is_approved = 1;

-- Table: company_product_availability
-- For services with specific availability schedules
CREATE TABLE IF NOT EXISTS company_product_availability (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL REFERENCES company_products(id) ON DELETE CASCADE,

    -- Day of week (0 = Sunday, 6 = Saturday)
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),

    -- Time slots (in minutes from midnight)
    start_time INTEGER NOT NULL, -- e.g., 540 for 9:00 AM (9 * 60)
    end_time INTEGER NOT NULL,   -- e.g., 1020 for 5:00 PM (17 * 60)

    -- Capacity
    max_bookings INTEGER DEFAULT 1,

    -- Active status
    is_active INTEGER DEFAULT 1,

    -- Timestamps
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_product_availability_product ON company_product_availability(product_id);
CREATE INDEX IF NOT EXISTS idx_product_availability_day ON company_product_availability(day_of_week);

-- Table: company_product_tags
-- For categorizing and filtering products
CREATE TABLE IF NOT EXISTS company_product_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    color TEXT, -- Hex color for UI

    created_at INTEGER NOT NULL DEFAULT (unixepoch()),

    UNIQUE(company_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_product_tags_company ON company_product_tags(company_id);

-- Table: company_product_tag_relations
-- Many-to-many relationship between products and tags
CREATE TABLE IF NOT EXISTS company_product_tag_relations (
    product_id INTEGER NOT NULL REFERENCES company_products(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES company_product_tags(id) ON DELETE CASCADE,

    created_at INTEGER NOT NULL DEFAULT (unixepoch()),

    PRIMARY KEY (product_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_product_tag_relations_product ON company_product_tag_relations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_tag_relations_tag ON company_product_tag_relations(tag_id);

-- Update trigger for company_products
CREATE TRIGGER IF NOT EXISTS update_company_products_timestamp
AFTER UPDATE ON company_products
BEGIN
    UPDATE company_products SET updated_at = unixepoch() WHERE id = NEW.id;
END;

-- Update trigger for company_product_variants
CREATE TRIGGER IF NOT EXISTS update_company_product_variants_timestamp
AFTER UPDATE ON company_product_variants
BEGIN
    UPDATE company_product_variants SET updated_at = unixepoch() WHERE id = NEW.id;
END;

-- Update trigger for company_product_reviews
CREATE TRIGGER IF NOT EXISTS update_company_product_reviews_timestamp
AFTER UPDATE ON company_product_reviews
BEGIN
    UPDATE company_product_reviews SET updated_at = unixepoch() WHERE id = NEW.id;
END;
