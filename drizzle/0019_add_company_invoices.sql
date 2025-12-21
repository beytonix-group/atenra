-- Create company_invoices table
CREATE TABLE IF NOT EXISTS company_invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  job_id INTEGER REFERENCES user_company_jobs(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  customer_address_line1 TEXT,
  customer_address_line2 TEXT,
  customer_city TEXT,
  customer_state TEXT,
  customer_zip TEXT,
  subtotal_cents INTEGER NOT NULL,
  tax_rate_bps INTEGER DEFAULT 0,
  tax_amount_cents INTEGER DEFAULT 0,
  discount_cents INTEGER DEFAULT 0,
  total_cents INTEGER NOT NULL,
  amount_paid_cents INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'paid', 'partial', 'overdue', 'void', 'refunded')),
  invoice_date INTEGER NOT NULL,
  due_date INTEGER,
  paid_at INTEGER,
  payment_provider TEXT CHECK (payment_provider IN ('stripe', 'paypal', 'manual', 'cash', 'check')),
  external_payment_id TEXT,
  description TEXT,
  notes TEXT,
  terms TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Create indexes for company_invoices
CREATE INDEX IF NOT EXISTS idx_ci_company ON company_invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_ci_customer ON company_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_ci_job ON company_invoices(job_id);
CREATE INDEX IF NOT EXISTS idx_ci_status ON company_invoices(status);
CREATE INDEX IF NOT EXISTS idx_ci_invoice_date ON company_invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_ci_company_invoice_date ON company_invoices(company_id, invoice_date);
CREATE INDEX IF NOT EXISTS idx_ci_company_status ON company_invoices(company_id, status);
CREATE UNIQUE INDEX IF NOT EXISTS unique_company_invoice_number ON company_invoices(company_id, invoice_number);

-- Create company_invoice_line_items table
CREATE TABLE IF NOT EXISTS company_invoice_line_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL REFERENCES company_invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_cents INTEGER NOT NULL,
  total_cents INTEGER NOT NULL,
  category_id INTEGER REFERENCES service_categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Create index for company_invoice_line_items
CREATE INDEX IF NOT EXISTS idx_cili_invoice ON company_invoice_line_items(invoice_id);
