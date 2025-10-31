-- Migration: Refactor reviews from products to companies
-- Reviews should focus on the company's overall service quality, not individual products

-- Drop the product reviews table
DROP TABLE IF EXISTS company_product_reviews;
DROP INDEX IF EXISTS idx_product_reviews_product;
DROP INDEX IF EXISTS idx_product_reviews_user;
DROP INDEX IF EXISTS idx_product_reviews_approved;
DROP TRIGGER IF EXISTS update_company_product_reviews_timestamp;

-- Create company reviews table
CREATE TABLE IF NOT EXISTS company_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Review content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT NOT NULL,

    -- Specific rating categories (optional, can be NULL)
    professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
    timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),

    -- Service/project context
    service_type TEXT, -- e.g., "Plumbing", "Web Design", "Lawn Care"
    project_description TEXT,
    project_cost REAL, -- Optional: helps others understand scope

    -- Media
    image_urls TEXT, -- JSON array of review images

    -- Verification and moderation
    is_verified_customer INTEGER DEFAULT 0, -- Verified transaction with this company
    is_approved INTEGER DEFAULT 0,
    is_featured INTEGER DEFAULT 0,
    moderation_notes TEXT, -- Admin notes

    -- Response from company
    company_response TEXT,
    company_response_at INTEGER,
    company_response_by_user_id INTEGER REFERENCES users(id),

    -- Helpfulness tracking
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),

    -- User can only review each company once
    UNIQUE(company_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_company_reviews_company ON company_reviews(company_id);
CREATE INDEX IF NOT EXISTS idx_company_reviews_user ON company_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_company_reviews_approved ON company_reviews(is_approved) WHERE is_approved = 1;
CREATE INDEX IF NOT EXISTS idx_company_reviews_rating ON company_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_company_reviews_featured ON company_reviews(is_featured) WHERE is_featured = 1;

-- Table: company_review_helpfulness
-- Track which users found reviews helpful
CREATE TABLE IF NOT EXISTS company_review_helpfulness (
    review_id INTEGER NOT NULL REFERENCES company_reviews(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_helpful INTEGER NOT NULL CHECK (is_helpful IN (0, 1)), -- 1 = helpful, 0 = not helpful
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),

    PRIMARY KEY (review_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_review_helpfulness_review ON company_review_helpfulness(review_id);
CREATE INDEX IF NOT EXISTS idx_review_helpfulness_user ON company_review_helpfulness(user_id);

-- Table: company_review_reports
-- Allow users to report inappropriate reviews
CREATE TABLE IF NOT EXISTS company_review_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    review_id INTEGER NOT NULL REFERENCES company_reviews(id) ON DELETE CASCADE,
    reported_by_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL CHECK (reason IN ('spam', 'offensive', 'fake', 'inappropriate', 'other')),
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    admin_notes TEXT,
    resolved_at INTEGER,
    resolved_by_user_id INTEGER REFERENCES users(id),

    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_review_reports_review ON company_review_reports(review_id);
CREATE INDEX IF NOT EXISTS idx_review_reports_status ON company_review_reports(status);

-- Update trigger for company_reviews
CREATE TRIGGER IF NOT EXISTS update_company_reviews_timestamp
AFTER UPDATE ON company_reviews
BEGIN
    UPDATE company_reviews SET updated_at = unixepoch() WHERE id = NEW.id;
END;

-- Update trigger for company_review_reports
CREATE TRIGGER IF NOT EXISTS update_company_review_reports_timestamp
AFTER UPDATE ON company_review_reports
BEGIN
    UPDATE company_review_reports SET updated_at = unixepoch() WHERE id = NEW.id;
END;

-- Trigger to update helpfulness counts
CREATE TRIGGER IF NOT EXISTS update_review_helpful_count_insert
AFTER INSERT ON company_review_helpfulness
BEGIN
    UPDATE company_reviews
    SET helpful_count = (
        SELECT COUNT(*) FROM company_review_helpfulness
        WHERE review_id = NEW.review_id AND is_helpful = 1
    ),
    not_helpful_count = (
        SELECT COUNT(*) FROM company_review_helpfulness
        WHERE review_id = NEW.review_id AND is_helpful = 0
    )
    WHERE id = NEW.review_id;
END;

CREATE TRIGGER IF NOT EXISTS update_review_helpful_count_update
AFTER UPDATE ON company_review_helpfulness
BEGIN
    UPDATE company_reviews
    SET helpful_count = (
        SELECT COUNT(*) FROM company_review_helpfulness
        WHERE review_id = NEW.review_id AND is_helpful = 1
    ),
    not_helpful_count = (
        SELECT COUNT(*) FROM company_review_helpfulness
        WHERE review_id = NEW.review_id AND is_helpful = 0
    )
    WHERE id = NEW.review_id;
END;

CREATE TRIGGER IF NOT EXISTS update_review_helpful_count_delete
AFTER DELETE ON company_review_helpfulness
BEGIN
    UPDATE company_reviews
    SET helpful_count = (
        SELECT COUNT(*) FROM company_review_helpfulness
        WHERE review_id = OLD.review_id AND is_helpful = 1
    ),
    not_helpful_count = (
        SELECT COUNT(*) FROM company_review_helpfulness
        WHERE review_id = OLD.review_id AND is_helpful = 0
    )
    WHERE id = OLD.review_id;
END;
