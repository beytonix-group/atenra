-- Initial database schema for Atenra SaaS Platform
-- All date/time fields use INTEGER (Unix timestamps) for better performance
-- Compatible with Cloudflare D1 SQLite

-- ============================================
-- NextAuth Tables
-- ============================================

CREATE TABLE auth_users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    emailVerified INTEGER,
    name TEXT,
    image TEXT
);

CREATE TABLE accounts (
    userId TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    providerAccountId TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    PRIMARY KEY (provider, providerAccountId)
);

CREATE TABLE sessions (
    sessionToken TEXT PRIMARY KEY,
    userId TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    expires INTEGER NOT NULL
);

CREATE TABLE verificationTokens (
    identifier TEXT NOT NULL,
    token TEXT NOT NULL,
    expires INTEGER NOT NULL,
    PRIMARY KEY (identifier, token)
);

-- ============================================
-- Core Business Tables
-- ============================================

-- Users table (Business Profile extending NextAuth)
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    auth_user_id TEXT UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    display_name TEXT,
    phone TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT DEFAULT 'US',
    avatar_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
    email_verified INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);

-- ============================================
-- RBAC (Role-Based Access Control)
-- ============================================

CREATE TABLE roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE user_roles (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    resource TEXT,
    action TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE role_permissions (
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- ============================================
-- Activity Tracking
-- ============================================

CREATE TABLE user_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    auth_user_id TEXT,
    activity_type TEXT NOT NULL,
    description TEXT,
    metadata TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_auth_user_id ON user_activities(auth_user_id);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at);

-- ============================================
-- Relationships
-- ============================================

CREATE TABLE relationship_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    inverse_name TEXT,
    description TEXT
);

CREATE TABLE user_relationships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    related_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_relationships_user ON user_relationships(user_id);
CREATE INDEX idx_relationships_related ON user_relationships(related_user_id);

-- ============================================
-- Assets Management
-- ============================================

CREATE TABLE asset_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    mime_types TEXT,
    max_size INTEGER,
    allowed_extensions TEXT
);

CREATE TABLE assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    s3_key TEXT,
    size INTEGER,
    mime_type TEXT,
    metadata TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE user_assets (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, asset_id)
);

-- ============================================
-- Companies & Organizations
-- ============================================

CREATE TABLE companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    website TEXT,
    logo_url TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT DEFAULT 'US',
    phone TEXT,
    email TEXT,
    status TEXT DEFAULT 'active',
    metadata TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX idx_companies_slug ON companies(slug);

CREATE TABLE company_users (
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    PRIMARY KEY (company_id, user_id)
);

CREATE TABLE user_company_jobs (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    job_title TEXT,
    start_date INTEGER,
    end_date INTEGER,
    PRIMARY KEY (user_id, company_id)
);

-- ============================================
-- Services & Plans
-- ============================================

CREATE TABLE service_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id INTEGER REFERENCES service_categories(id),
    icon TEXT,
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id INTEGER,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    billing_period TEXT DEFAULT 'monthly',
    features TEXT,
    limits TEXT,
    is_active INTEGER DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE company_services (
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    service_id INTEGER NOT NULL,
    PRIMARY KEY (company_id, service_id)
);

-- ============================================
-- Subscriptions & Billing
-- ============================================

CREATE TABLE subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES plans(id),
    provider TEXT NOT NULL CHECK (provider IN ('stripe', 'braintree')),
    external_customer_id TEXT,
    external_subscription_id TEXT UNIQUE,
    status TEXT NOT NULL CHECK (status IN ('active', 'past_due', 'canceled', 'incomplete', 'trialing')),
    current_period_start INTEGER,
    current_period_end INTEGER,
    trial_end INTEGER,
    canceled_at INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_company ON subscriptions(company_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- ============================================
-- Content Management
-- ============================================

CREATE TABLE content_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT,
    metadata TEXT,
    author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'draft',
    published_at INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX idx_content_slug ON content_items(slug);
CREATE INDEX idx_content_type ON content_items(type);
CREATE INDEX idx_content_status ON content_items(status);

CREATE TABLE plan_content_access (
    plan_id INTEGER NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    content_item_id INTEGER NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    PRIMARY KEY (plan_id, content_item_id)
);

-- ============================================
-- Usage Tracking
-- ============================================

CREATE TABLE usage_counters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    counter_type TEXT NOT NULL,
    value INTEGER DEFAULT 0,
    limit_value INTEGER,
    reset_period TEXT,
    last_reset INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_usage_user ON usage_counters(user_id);
CREATE INDEX idx_usage_type ON usage_counters(counter_type);

-- ============================================
-- Views
-- ============================================

CREATE VIEW user_is_company_user AS
SELECT
  u.id AS user_id,
  CASE WHEN EXISTS (SELECT 1 FROM company_users cu WHERE cu.user_id = u.id)
       THEN 1 ELSE 0 END AS is_company_user
FROM users u;

-- ============================================
-- Default Data
-- ============================================

-- Insert default roles
INSERT INTO roles (name, description) VALUES 
    ('super_admin', 'Full system access'),
    ('manager', 'Manager level access - can manage employees and view reports'),
    ('employee', 'Employee level access - can access work-related features'),
    ('user', 'Regular user access - basic features only');

-- ============================================
-- Triggers
-- ============================================

-- Auto-assign 'user' role to new users
CREATE TRIGGER auto_assign_user_role
AFTER INSERT ON users
FOR EACH ROW
WHEN NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = NEW.id)
BEGIN
  INSERT INTO user_roles (user_id, role_id)
  SELECT NEW.id, id FROM roles WHERE name = 'user';
END;