-- Add Stripe fields to users table
ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;

-- Add Stripe fields to plans table
ALTER TABLE plans ADD COLUMN stripe_product_id TEXT;
ALTER TABLE plans ADD COLUMN stripe_price_id TEXT;
ALTER TABLE plans ADD COLUMN trial_days INTEGER DEFAULT 0;

-- Create unique indexes for Stripe fields
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_plans_stripe_product ON plans(stripe_product_id) WHERE stripe_product_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_plans_stripe_price ON plans(stripe_price_id) WHERE stripe_price_id IS NOT NULL;

-- Add Stripe fields to subscriptions table
ALTER TABLE subscriptions ADD COLUMN stripe_checkout_session_id TEXT;
ALTER TABLE subscriptions ADD COLUMN cancel_at_period_end INTEGER DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN canceled_reason TEXT;
ALTER TABLE subscriptions ADD COLUMN metadata TEXT;

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('card', 'us_bank_account', 'sepa_debit', 'link', 'paypal')),
  card_brand TEXT,
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  is_default INTEGER DEFAULT 0,
  status TEXT DEFAULT 'valid' CHECK(status IN ('valid', 'invalid', 'detached')),
  fingerprint TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX idx_pm_user ON payment_methods(user_id);
CREATE INDEX idx_pm_stripe_id ON payment_methods(stripe_payment_method_id);
CREATE INDEX idx_pm_status ON payment_methods(status);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE SET NULL,
  stripe_invoice_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  amount_due INTEGER NOT NULL CHECK(amount_due >= 0),
  amount_paid INTEGER NOT NULL CHECK(amount_paid >= 0),
  status TEXT NOT NULL CHECK(status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  hosted_invoice_url TEXT,
  invoice_pdf TEXT,
  due_date INTEGER,
  paid_at INTEGER,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX idx_inv_user ON invoices(user_id);
CREATE INDEX idx_inv_subscription ON invoices(subscription_id);
CREATE INDEX idx_inv_stripe_id ON invoices(stripe_invoice_id);
CREATE INDEX idx_inv_status ON invoices(status);

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE SET NULL,
  invoice_id INTEGER REFERENCES invoices(id) ON DELETE SET NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  amount_cents INTEGER NOT NULL CHECK(amount_cents >= 0),
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL CHECK(status IN ('succeeded', 'pending', 'failed', 'canceled', 'refunded')),
  txn_type TEXT DEFAULT 'payment' CHECK(txn_type IN ('payment', 'refund', 'dispute', 'fee')),
  related_txn_id INTEGER REFERENCES payment_transactions(id),
  payment_method_id INTEGER REFERENCES payment_methods(id),
  failure_code TEXT,
  failure_message TEXT,
  metadata TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX idx_pt_user ON payment_transactions(user_id);
CREATE INDEX idx_pt_subscription ON payment_transactions(subscription_id);
CREATE INDEX idx_pt_status ON payment_transactions(status);
CREATE INDEX idx_pt_txn_type ON payment_transactions(txn_type);
CREATE INDEX idx_pt_related_txn ON payment_transactions(related_txn_id);
CREATE UNIQUE INDEX idx_pt_charge_unique ON payment_transactions(stripe_charge_id) WHERE stripe_charge_id IS NOT NULL;

-- Create stripe_webhook_events table
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  event_data TEXT NOT NULL,
  processed INTEGER DEFAULT 0,
  processing_error TEXT,
  received_at INTEGER DEFAULT (unixepoch()),
  processed_at INTEGER
);

CREATE INDEX idx_swe_event_id ON stripe_webhook_events(stripe_event_id);
CREATE INDEX idx_swe_processed ON stripe_webhook_events(processed);
CREATE INDEX idx_swe_type ON stripe_webhook_events(event_type);
