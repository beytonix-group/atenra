-- Ensure plan names are unique so UPSERT works
CREATE UNIQUE INDEX IF NOT EXISTS idx_plans_name ON plans(name);

-- Upsert three monthly plans (Stripe IDs can be set later)
INSERT INTO plans (name, description, price, currency, billing_period, features, limits, is_active)
VALUES
  (
    'Essentials',
    'Everything you need to grow',
    49.00,
    'USD',
    'monthly',
    json('[
      "Everything in Guest",
      "Project participation tools",
      "Internal dashboards",
      "KPI tracking & analytics",
      "Priority support",
      "Team collaboration tools"
    ]'),
    NULL,
    1
  ),
  (
    'Premium',
    'Advanced features for teams',
    99.00,
    'USD',
    'monthly',
    json('[
      "Everything in Essentials",
      "Custom analytics & reporting",
      "Role-based access",
      "Voting rights",
      "Multi-project management",
      "API access",
      "24/7 phone support"
    ]'),
    NULL,
    1
  ),
  (
    'Executive',
    'Complete control & customization',
    199.00,
    'USD',
    'monthly',
    json('[
      "Everything in Premium",
      "Full platform access",
      "Policy decision voting",
      "Cross-tier management",
      "Governance visibility",
      "Capital allocation tools",
      "Custom integrations",
      "Dedicated AM"
    ]'),
    NULL,
    1
  )
ON CONFLICT(name) DO UPDATE SET
  description    = excluded.description,
  price          = excluded.price,
  currency       = excluded.currency,
  billing_period = excluded.billing_period,
  features       = excluded.features,
  limits         = excluded.limits,
  is_active      = excluded.is_active,
  updated_at     = unixepoch();
