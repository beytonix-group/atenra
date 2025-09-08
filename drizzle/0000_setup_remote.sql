-- Database Schema for Cloudflare SaaS Stack
-- Compatible with: npx wrangler d1 execute DB_NAME --file=schema.sql
-- SQLite/D1 Compatible Schema (No Transaction Blocks)

-- ----------------------------------------------------------
-- Users (all accounts: individuals and company users)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  email           TEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  first_name      TEXT,
  last_name       TEXT,
  display_name    TEXT,
  avatar_url      TEXT,
  phone           TEXT,
  address_line1   TEXT,
  address_line2   TEXT,
  city            TEXT,
  state           TEXT,
  zip_code        TEXT,
  country         TEXT NOT NULL DEFAULT 'US',
  email_verified  INTEGER NOT NULL DEFAULT 0, -- 0/1
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','deleted')),
  created_at      TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER IF NOT EXISTS trg_users_updated_at
AFTER UPDATE ON users
FOR EACH ROW BEGIN
  UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- ----------------------------------------------------------
-- User Relationships (Many-to-Many with Relationship Types)
-- ----------------------------------------------------------

-- Relationship types lookup table
CREATE TABLE IF NOT EXISTS relationship_types (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL UNIQUE,        -- 'parent', 'child', 'spouse', 'sibling', etc.
  description TEXT,
  is_active   INTEGER NOT NULL DEFAULT 1
);

-- User relationships (bidirectional many-to-many)
CREATE TABLE IF NOT EXISTS user_relationships (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id               INTEGER NOT NULL,
  related_user_id       INTEGER NOT NULL,
  relationship_type_id  INTEGER NOT NULL,
  notes                 TEXT,               -- optional notes about the relationship
  is_confirmed          INTEGER NOT NULL DEFAULT 0, -- 0=pending, 1=confirmed by both parties
  created_at            TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, related_user_id, relationship_type_id),
  CHECK(user_id != related_user_id),        -- prevent self-relationships
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (related_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (relationship_type_id) REFERENCES relationship_types(id)
);

CREATE TRIGGER IF NOT EXISTS trg_user_relationships_updated_at
AFTER UPDATE ON user_relationships
FOR EACH ROW BEGIN
  UPDATE user_relationships SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- ----------------------------------------------------------
-- Asset Management
-- ----------------------------------------------------------

-- Asset types lookup table
CREATE TABLE IF NOT EXISTS asset_types (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL UNIQUE,        -- 'property', 'investment', 'vehicle', 'bank_account', etc.
  category    TEXT,                        -- 'real_estate', 'financial', 'personal_property'
  description TEXT,
  is_active   INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Main assets table
CREATE TABLE IF NOT EXISTS assets (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_type_id         INTEGER NOT NULL,
  name                  TEXT NOT NULL,      -- "Family Home", "Toyota Camry", "401k Account"
  description           TEXT,               -- detailed description
  estimated_value_cents INTEGER,            -- value in cents (e.g., $100,000 = 10000000)
  acquisition_date      TEXT,               -- when acquired
  location              TEXT,               -- address for properties, location for vehicles
  identification_info   TEXT,               -- VIN, account numbers, property tax ID, etc.
  notes                 TEXT,               -- additional information
  status                TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','sold','disposed','inactive')),
  created_at            TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_type_id) REFERENCES asset_types(id)
);

CREATE TRIGGER IF NOT EXISTS trg_assets_updated_at
AFTER UPDATE ON assets
FOR EACH ROW BEGIN
  UPDATE assets SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- ----------------------------------------------------------
-- User-Asset Associations (Many-to-Many with Ownership Details)
-- ----------------------------------------------------------

-- User asset ownership/association
CREATE TABLE IF NOT EXISTS user_assets (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id              INTEGER NOT NULL,
  asset_id             INTEGER NOT NULL,
  ownership_type       TEXT NOT NULL DEFAULT 'owner' CHECK (ownership_type IN ('owner','co-owner','beneficiary','trustee','manager')),
  ownership_percentage INTEGER DEFAULT 100 CHECK (ownership_percentage > 0 AND ownership_percentage <= 100),
  relationship_notes   TEXT,               -- "Joint ownership with spouse", "Inherited from father"
  acquired_date        TEXT,               -- when this user acquired interest in the asset
  is_primary_contact   INTEGER NOT NULL DEFAULT 0, -- who manages this asset primarily
  created_at           TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, asset_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

CREATE TRIGGER IF NOT EXISTS trg_user_assets_updated_at
AFTER UPDATE ON user_assets
FOR EACH ROW BEGIN
  UPDATE user_assets SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- ----------------------------------------------------------
-- Service Categories (lookup)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS service_categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active   INTEGER NOT NULL DEFAULT 1  -- 0/1
);

-- ----------------------------------------------------------
-- Companies / Contractors
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS companies (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  name               TEXT NOT NULL,
  email              TEXT,
  phone              TEXT,
  website_url        TEXT,
  address_line1      TEXT,
  address_line2      TEXT,
  city               TEXT,
  state              TEXT,
  zip_code           TEXT,
  country            TEXT NOT NULL DEFAULT 'US',
  description        TEXT,
  license_number     TEXT,
  insurance_number   TEXT,
  is_public          INTEGER NOT NULL DEFAULT 1, -- listed/visible in search
  memo               TEXT, -- internal notes
  created_by_user_id INTEGER,                    -- who registered this company
  status             TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','pending_verification')),
  created_at         TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TRIGGER IF NOT EXISTS trg_companies_updated_at
AFTER UPDATE ON companies
FOR EACH ROW BEGIN
  UPDATE companies SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- ----------------------------------------------------------
-- Company Services (categories a company offers)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS company_services (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id   INTEGER NOT NULL,
  category_id  INTEGER NOT NULL,
  description  TEXT,
  is_active    INTEGER NOT NULL DEFAULT 1,
  UNIQUE (company_id, category_id),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES service_categories(id)
);

-- ----------------------------------------------------------
-- Jobs / Engagements (user -> company)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_company_jobs (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id             INTEGER NOT NULL,   -- requester (individual account)
  company_id          INTEGER NOT NULL,
  category_id         INTEGER NOT NULL,
  description         TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','cancelled')),
  start_date          TEXT,
  end_date            TEXT,
  notes               TEXT,
  -- optional pricing & location fields
  budget_cents        INTEGER,
  job_address_line1   TEXT,
  job_city            TEXT,
  job_state           TEXT,
  job_zip             TEXT,
  created_at          TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES service_categories(id)
);

CREATE TRIGGER IF NOT EXISTS trg_user_company_jobs_updated_at
AFTER UPDATE ON user_company_jobs
FOR EACH ROW BEGIN
  UPDATE user_company_jobs SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- ----------------------------------------------------------
-- Company team accounts (maps user <-> company)
-- A user becomes a "company user" by appearing here.
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS company_users (
  company_id    INTEGER NOT NULL,
  user_id       INTEGER NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('owner','manager','staff')),
  is_default    INTEGER NOT NULL DEFAULT 0, -- default company context for this user
  invited_at    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (company_id, user_id),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)    REFERENCES users(id) ON DELETE CASCADE
);

-- Prevent deleting the last owner of a company
CREATE TRIGGER IF NOT EXISTS trg_company_users_prevent_orphan_owner
BEFORE DELETE ON company_users
FOR EACH ROW
WHEN OLD.role = 'owner'
BEGIN
  SELECT CASE
    WHEN (SELECT COUNT(*) FROM company_users cu
          WHERE cu.company_id = OLD.company_id AND cu.role = 'owner') <= 1
    THEN RAISE(ABORT, 'Cannot remove the last owner of a company')
  END;
END;

-- ----------------------------------------------------------
-- RBAC (system-wide roles & permissions)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permissions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  action      TEXT NOT NULL,     -- e.g. 'read' | 'write' | 'delete' | 'manage'
  resource    TEXT NOT NULL,     -- e.g. 'users' | 'companies' | 'jobs' | 'billing' | 'reports'
  description TEXT,
  UNIQUE (action, resource)
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id             INTEGER NOT NULL,
  role_id             INTEGER NOT NULL,
  assigned_at         TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  assigned_by_user_id INTEGER,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id)             REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id)             REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id       INTEGER NOT NULL,
  permission_id INTEGER NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id)       REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------
-- Plans (membership tiers)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS plans (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  code          TEXT NOT NULL UNIQUE,     -- "basic", "pro", "business"
  name          TEXT NOT NULL,
  description   TEXT,
  price_cents   INTEGER NOT NULL,
  interval      TEXT NOT NULL CHECK (interval IN ('month','year')),
  features_json TEXT,                     -- optional JSON of feature flags/limits
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER IF NOT EXISTS trg_plans_updated_at
AFTER UPDATE ON plans
FOR EACH ROW BEGIN
  UPDATE plans SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- ----------------------------------------------------------
-- Content catalog & plan-based access (tier gating)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS content_items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  body        TEXT, -- store content or metadata; binary assets may live in R2
  is_active   INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER IF NOT EXISTS trg_content_items_updated_at
AFTER UPDATE ON content_items
FOR EACH ROW BEGIN
  UPDATE content_items SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TABLE IF NOT EXISTS plan_content_access (
  plan_id     INTEGER NOT NULL,
  content_id  INTEGER NOT NULL,
  PRIMARY KEY (plan_id, content_id),
  FOREIGN KEY (plan_id)    REFERENCES plans(id) ON DELETE CASCADE,
  FOREIGN KEY (content_id) REFERENCES content_items(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------
-- Subscriptions (belongs to a USER or a COMPANY)
-- Provider-agnostic (Stripe/Braintree)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
  id                       INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id                  INTEGER, -- nullable
  company_id               INTEGER, -- nullable
  plan_id                  INTEGER NOT NULL,
  provider                 TEXT NOT NULL CHECK (provider IN ('stripe','braintree')),
  external_customer_id     TEXT,
  external_subscription_id TEXT UNIQUE,
  status                   TEXT NOT NULL CHECK (status IN ('active','past_due','canceled','incomplete','trialing')),
  current_period_start     TEXT,
  current_period_end       TEXT,
  trial_end                TEXT,
  canceled_at              TEXT,
  created_at               TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at               TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK ( (user_id IS NOT NULL AND company_id IS NULL) OR (user_id IS NULL AND company_id IS NOT NULL) ),
  FOREIGN KEY (user_id)    REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id)    REFERENCES plans(id)
);

CREATE TRIGGER IF NOT EXISTS trg_subscriptions_updated_at
AFTER UPDATE ON subscriptions
FOR EACH ROW BEGIN
  UPDATE subscriptions SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- Optional: ensure one active-ish sub per owner/provider (tune statuses as needed)
CREATE UNIQUE INDEX IF NOT EXISTS ux_sub_unique_active
ON subscriptions(COALESCE(user_id, -1), COALESCE(company_id, -1), provider)
WHERE status IN ('active','trialing','incomplete','past_due');

-- ----------------------------------------------------------
-- Per-user Usage Counters (monthly or daily)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS usage_counters (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL,
  metric     TEXT NOT NULL,        -- e.g. "jobs_created", "exports"
  period     TEXT NOT NULL,        -- e.g. "2025-08" or "2025-08-12"
  value      INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, metric, period),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TRIGGER IF NOT EXISTS trg_usage_counters_updated_at
AFTER UPDATE ON usage_counters
FOR EACH ROW BEGIN
  UPDATE usage_counters SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- ----------------------------------------------------------
-- Read-only Helper View
-- ----------------------------------------------------------
CREATE VIEW IF NOT EXISTS user_is_company_user AS
SELECT
  u.id AS user_id,
  CASE WHEN EXISTS (SELECT 1 FROM company_users cu WHERE cu.user_id = u.id)
       THEN 1 ELSE 0 END AS is_company_user
FROM users u;

-- ----------------------------------------------------------
-- Seeds (idempotent)
-- ----------------------------------------------------------
INSERT OR IGNORE INTO service_categories (name, description) VALUES
('Roofing', 'Roof repair, installation, and maintenance services'),
('Plumbing', 'Plumbing repair, installation, and emergency services'),
('Electrical', 'Electrical repair, wiring, and installation services'),
('HVAC', 'Heating, ventilation, and air conditioning services'),
('House Cleaning', 'Residential cleaning and maintenance services'),
('Landscaping', 'Lawn care, gardening, and outdoor maintenance'),
('Painting', 'Interior and exterior painting services'),
('Flooring', 'Floor installation, repair, and refinishing'),
('Carpentry', 'Custom carpentry and woodworking services'),
('Masonry', 'Brick, stone, and concrete work'),
('Car Mechanics', 'Automotive repair and maintenance services'),
('Appliance Repair', 'Home appliance repair and servicing'),
('Pest Control', 'Pest elimination and prevention services'),
('Security Systems', 'Home security installation and monitoring'),
('Pool Service', 'Pool cleaning, maintenance, and repair'),
('Tree Service', 'Tree trimming, removal, and care'),
('Handyman', 'General home repair and maintenance'),
('Food Service', 'Catering and food preparation services'),
('Moving Services', 'Residential and commercial moving'),
('Window Cleaning', 'Window washing and maintenance services');

-- Insert relationship types
INSERT OR IGNORE INTO relationship_types (name, description) VALUES
('parent', 'Parent-child relationship (parent perspective)'),
('child', 'Parent-child relationship (child perspective)'),
('spouse', 'Married partner'),
('sibling', 'Brother or sister'),
('grandparent', 'Grandparent-grandchild relationship (grandparent perspective)'),
('grandchild', 'Grandparent-grandchild relationship (grandchild perspective)'),
('partner', 'Domestic partner or significant other'),
('friend', 'Personal friend'),
('relative', 'Extended family member'),
('guardian', 'Legal guardian'),
('dependent', 'Legal dependent');

-- Insert asset types
INSERT OR IGNORE INTO asset_types (name, category, description) VALUES
('residential_property', 'real_estate', 'Single family homes, condos, townhouses'),
('commercial_property', 'real_estate', 'Office buildings, retail spaces, warehouses'),
('investment_property', 'real_estate', 'Rental properties and real estate investments'),
('land', 'real_estate', 'Vacant land and lots'),
('vehicle', 'personal_property', 'Cars, trucks, motorcycles, boats'),
('bank_account', 'financial', 'Checking and savings accounts'),
('investment_account', 'financial', '401k, IRA, brokerage accounts'),
('cryptocurrency', 'financial', 'Bitcoin, Ethereum, and other digital assets'),
('business_ownership', 'financial', 'Shares in private companies or partnerships'),
('collectibles', 'personal_property', 'Art, antiques, jewelry, and collectible items'),
('equipment', 'personal_property', 'Tools, machinery, and professional equipment'),
('intellectual_property', 'financial', 'Patents, copyrights, trademarks');

-- ----------------------------------------------------------
-- NextAuth Tables (for OAuth authentication)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS auth_users (
  id              TEXT PRIMARY KEY,
  email           TEXT UNIQUE,
  emailVerified   TEXT, -- timestamp stored as text
  name            TEXT,
  image           TEXT
);

CREATE TABLE IF NOT EXISTS accounts (
  userId            TEXT NOT NULL,
  type              TEXT NOT NULL,
  provider          TEXT NOT NULL,
  providerAccountId TEXT NOT NULL,
  refresh_token     TEXT,
  access_token      TEXT,
  expires_at        INTEGER,
  token_type        TEXT,
  scope             TEXT,
  id_token          TEXT,
  session_state     TEXT,
  PRIMARY KEY (provider, providerAccountId),
  FOREIGN KEY (userId) REFERENCES auth_users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sessions (
  sessionToken TEXT PRIMARY KEY,
  userId       TEXT NOT NULL,
  expires      TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES auth_users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS verificationTokens (
  identifier TEXT NOT NULL,
  token      TEXT NOT NULL,
  expires    TEXT NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- ----------------------------------------------------------
-- Indexes for Performance
-- ----------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_email                    ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_relationships_user        ON user_relationships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_relationships_related     ON user_relationships(related_user_id);
CREATE INDEX IF NOT EXISTS idx_user_relationships_type        ON user_relationships(relationship_type_id);
CREATE INDEX IF NOT EXISTS idx_user_relationships_confirmed   ON user_relationships(is_confirmed);
CREATE INDEX IF NOT EXISTS idx_assets_type                    ON assets(asset_type_id);
CREATE INDEX IF NOT EXISTS idx_assets_status                  ON assets(status);
CREATE INDEX IF NOT EXISTS idx_user_assets_user               ON user_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_assets_asset              ON user_assets(asset_id);
CREATE INDEX IF NOT EXISTS idx_user_assets_ownership          ON user_assets(ownership_type);
CREATE INDEX IF NOT EXISTS idx_companies_name                 ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_public_status        ON companies(is_public, status);
CREATE INDEX IF NOT EXISTS idx_company_services_company       ON company_services(company_id);
CREATE INDEX IF NOT EXISTS idx_company_services_category      ON company_services(category_id);
CREATE INDEX IF NOT EXISTS idx_company_users_user             ON company_users(user_id);
CREATE INDEX IF NOT EXISTS idx_company_users_company          ON company_users(company_id);
CREATE INDEX IF NOT EXISTS idx_user_company_jobs_user         ON user_company_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_company_jobs_company      ON user_company_jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_user_company_jobs_status       ON user_company_jobs(status);
CREATE INDEX IF NOT EXISTS idx_user_roles_user                ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user             ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_company          ON subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status           ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_plans_active                   ON plans(is_active);
CREATE INDEX IF NOT EXISTS idx_usage_user_metric              ON usage_counters(user_id, metric);
CREATE INDEX IF NOT EXISTS idx_usage_period                   ON usage_counters(period);
