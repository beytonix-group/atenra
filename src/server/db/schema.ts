import { integer, sqliteTable, text, primaryKey, index, uniqueIndex } from "drizzle-orm/sqlite-core"
import { relations, sql } from 'drizzle-orm';
import type { AdapterAccountType } from "next-auth/adapters"

// ----------------------------------------------------------
// NextAuth Tables (for OAuth authentication)
// ----------------------------------------------------------

export const authUsers = sqliteTable('auth_users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  emailVerified: integer('emailVerified', { mode: 'timestamp' }),
  name: text('name'),
  image: text('image'),
});

export const authUsersRelations = relations(authUsers, ({ one }) => ({
  businessProfile: one(users, {
    fields: [authUsers.id],
    references: [users.authUserId],
  }),
}));

export const accounts = sqliteTable('accounts', {
  userId: text('userId').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  type: text('type').$type<AdapterAccountType>().notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (account) => ({
  pk: primaryKey({ columns: [account.provider, account.providerAccountId] }),
}));

export const sessions = sqliteTable('sessions', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
});

export const verificationTokens = sqliteTable('verificationTokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
}, (vt) => ({
  pk: primaryKey({ columns: [vt.identifier, vt.token] }),
}));

// ----------------------------------------------------------
// Core User Management
// ----------------------------------------------------------

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  authUserId: text('auth_user_id').references(() => authUsers.id, { onDelete: 'cascade' }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  phone: text('phone'),
  addressLine1: text('address_line1'),
  addressLine2: text('address_line2'),
  city: text('city'),
  state: text('state'),
  zipCode: text('zip_code'),
  country: text('country').notNull().default('US'),
  emailVerified: integer('email_verified').notNull().default(0),
  status: text('status', { enum: ['active', 'suspended', 'deleted'] }).notNull().default('active'),
  stripeCustomerId: text('stripe_customer_id').unique(),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at').notNull().default(sql`(unixepoch())`),
  lastActiveAt: integer('last_active_at'),
}, (table) => ({
  emailIdx: uniqueIndex('idx_users_email').on(table.email),
}));

// ----------------------------------------------------------
// User Relationships
// ----------------------------------------------------------

export const relationshipTypes = sqliteTable('relationship_types', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  description: text('description'),
  isActive: integer('is_active').notNull().default(1),
});

export const userRelationships = sqliteTable('user_relationships', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  relatedUserId: integer('related_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  relationshipTypeId: integer('relationship_type_id').notNull().references(() => relationshipTypes.id),
  notes: text('notes'),
  isConfirmed: integer('is_confirmed').notNull().default(0),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at').notNull().default(sql`(unixepoch())`),
}, (table) => ({
  uniqueRelationship: uniqueIndex('unique_user_relationship').on(table.userId, table.relatedUserId, table.relationshipTypeId),
  userIdx: index('idx_user_relationships_user').on(table.userId),
  relatedUserIdx: index('idx_user_relationships_related').on(table.relatedUserId),
  typeIdx: index('idx_user_relationships_type').on(table.relationshipTypeId),
  confirmedIdx: index('idx_user_relationships_confirmed').on(table.isConfirmed),
}));

// ----------------------------------------------------------
// Asset Management
// ----------------------------------------------------------

export const assetTypes = sqliteTable('asset_types', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  category: text('category'),
  description: text('description'),
  isActive: integer('is_active').notNull().default(1),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
});

export const assets = sqliteTable('assets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  assetTypeId: integer('asset_type_id').notNull().references(() => assetTypes.id),
  name: text('name').notNull(),
  description: text('description'),
  estimatedValueCents: integer('estimated_value_cents'),
  acquisitionDate: text('acquisition_date'),
  location: text('location'),
  identificationInfo: text('identification_info'),
  notes: text('notes'),
  status: text('status', { enum: ['active', 'sold', 'disposed', 'inactive'] }).notNull().default('active'),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at').notNull().default(sql`(unixepoch())`),
}, (table) => ({
  typeIdx: index('idx_assets_type').on(table.assetTypeId),
  statusIdx: index('idx_assets_status').on(table.status),
}));

export const userAssets = sqliteTable('user_assets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  assetId: integer('asset_id').notNull().references(() => assets.id, { onDelete: 'cascade' }),
  ownershipType: text('ownership_type', {
    enum: ['owner', 'co-owner', 'beneficiary', 'trustee', 'manager']
  }).notNull().default('owner'),
  ownershipPercentage: integer('ownership_percentage').default(100),
  relationshipNotes: text('relationship_notes'),
  acquiredDate: text('acquired_date'),
  isPrimaryContact: integer('is_primary_contact').notNull().default(0),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at').notNull().default(sql`(unixepoch())`),
}, (table) => ({
  uniqueUserAsset: uniqueIndex('unique_user_asset').on(table.userId, table.assetId),
  userIdx: index('idx_user_assets_user').on(table.userId),
  assetIdx: index('idx_user_assets_asset').on(table.assetId),
  ownershipIdx: index('idx_user_assets_ownership').on(table.ownershipType),
}));

// ----------------------------------------------------------
// Service Categories & Companies
// ----------------------------------------------------------

export const serviceCategories = sqliteTable('service_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  description: text('description'),
  parentId: integer('parent_id').references((): any => serviceCategories.id),
  icon: text('icon'),
  sortOrder: integer('sort_order').default(0),
  isActive: integer('is_active').notNull().default(1),
});

export const userServicePreferences = sqliteTable('user_service_preferences', {
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').notNull().references(() => serviceCategories.id, { onDelete: 'cascade' }),
  priority: integer('priority').default(0),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.categoryId] }),
  userIdx: index('idx_usp_user').on(table.userId),
  categoryIdx: index('idx_usp_category').on(table.categoryId),
  userPriorityIdx: index('idx_usp_user_priority').on(table.userId, table.priority),
}));

export const companies = sqliteTable('companies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  einNumber: text('ein_number').notNull(),
  email: text('email'),
  phone: text('phone'),
  websiteUrl: text('website_url'),
  addressLine1: text('address_line1'),
  addressLine2: text('address_line2'),
  city: text('city'),
  state: text('state'),
  zipCode: text('zip_code'),
  country: text('country').notNull().default('US'),
  description: text('description'),
  licenseNumber: text('license_number'),
  insuranceNumber: text('insurance_number'),
  isPublic: integer('is_public').notNull().default(1),
  memo: text('memo'),
  createdByUserId: integer('created_by_user_id').references(() => users.id),
  status: text('status', { enum: ['active', 'suspended', 'pending_verification'] }).notNull().default('active'),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at').notNull().default(sql`(unixepoch())`),
}, (table) => ({
  nameIdx: index('idx_companies_name').on(table.name),
  publicStatusIdx: index('idx_companies_public_status').on(table.isPublic, table.status),
}));

export const companyUsers = sqliteTable('company_users', {
  companyId: integer('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['owner', 'manager', 'staff'] }).notNull(),
  isDefault: integer('is_default').notNull().default(0),
  invitedAt: text('invited_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  pk: primaryKey({ columns: [table.companyId, table.userId] }),
  userIdx: index('idx_company_users_user').on(table.userId),
  companyIdx: index('idx_company_users_company').on(table.companyId),
}));

// This is the actual junction table between companies and service categories
export const companyServiceCategories = sqliteTable('company_service_categories', {
  companyId: integer('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').notNull().references(() => serviceCategories.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
}, (table) => ({
  pk: primaryKey({ columns: [table.companyId, table.categoryId] }),
  categoryIdx: index('idx_csc_category').on(table.categoryId),
  companyCreatedIdx: index('idx_csc_company_created_at').on(table.companyId, table.createdAt),
}));

// Legacy table - kept for compatibility but not used in marketplace
export const companyServices = sqliteTable('company_services', {
  companyId: integer('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  serviceId: integer('service_id').notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.companyId, table.serviceId] }),
}));

// ----------------------------------------------------------
// Jobs & Engagements
// ----------------------------------------------------------

export const userCompanyJobs = sqliteTable('user_company_jobs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }), // Optional - for registered users
  companyId: integer('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').notNull().references(() => serviceCategories.id),
  // Customer info (for non-registered or any customer)
  customerName: text('customer_name'),
  customerEmail: text('customer_email'),
  customerPhone: text('customer_phone'),
  description: text('description').notNull(),
  status: text('status', { enum: ['active', 'completed', 'cancelled'] }).notNull().default('active'),
  priority: text('priority', { enum: ['low', 'medium', 'high', 'urgent'] }).notNull().default('medium'),
  startDate: integer('start_date'),
  endDate: integer('end_date'),
  notes: text('notes'),
  budgetCents: integer('budget_cents'),
  jobAddressLine1: text('job_address_line1'),
  jobAddressLine2: text('job_address_line2'),
  jobCity: text('job_city'),
  jobState: text('job_state'),
  jobZip: text('job_zip'),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at').notNull().default(sql`(unixepoch())`),
}, (table) => ({
  userIdx: index('idx_user_company_jobs_user').on(table.userId),
  companyIdx: index('idx_user_company_jobs_company').on(table.companyId),
  statusIdx: index('idx_user_company_jobs_status').on(table.status),
  priorityIdx: index('idx_user_company_jobs_priority').on(table.priority),
  companyStatusIdx: index('idx_ucj_company_status').on(table.companyId, table.status),
}));

// ----------------------------------------------------------
// Subscription & Billing
// ----------------------------------------------------------

export const plans = sqliteTable('plans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  planType: text('plan_type', { enum: ['student', 'regular', 'business'] }).notNull(),
  tagline: text('tagline'),
  description: text('description'),
  detailedDescription: text('detailed_description'),
  priceCents: integer('price_cents').notNull(),
  interval: text('interval', { enum: ['month', 'year'] }).notNull(),
  featuresJson: text('features_json'),
  quickViewJson: text('quick_view_json'),
  industriesJson: text('industries_json'),
  isActive: integer('is_active').notNull().default(1),
  isInviteOnly: integer('is_invite_only').notNull().default(0),
  hasPromotion: integer('has_promotion').notNull().default(0),
  promotionPercentOff: integer('promotion_percent_off'),
  promotionMonths: integer('promotion_months'),
  trialDays: integer('trial_days').default(0),
  hasRefundGuarantee: integer('has_refund_guarantee').notNull().default(0),
  stripeProductId: text('stripe_product_id').unique(),
  stripePriceId: text('stripe_price_id').unique(),
  paypalPlanId: text('paypal_plan_id').unique(),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at').notNull().default(sql`(unixepoch())`),
}, (table) => ({
  activeIdx: index('idx_plans_active').on(table.isActive),
  typeIdx: index('idx_plans_type').on(table.planType),
}));

export const subscriptions = sqliteTable('subscriptions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  planId: integer('plan_id').notNull().references(() => plans.id),
  provider: text('provider', { enum: ['stripe', 'braintree', 'paypal'] }).notNull(),
  externalCustomerId: text('external_customer_id'),
  externalSubscriptionId: text('external_subscription_id').unique(),
  status: text('status', {
    enum: ['active', 'past_due', 'canceled', 'incomplete', 'trialing', 'suspended']
  }).notNull(),
  currentPeriodStart: integer('current_period_start'),
  currentPeriodEnd: integer('current_period_end'),
  trialEnd: integer('trial_end'),
  canceledAt: integer('canceled_at'),
  stripeCheckoutSessionId: text('stripe_checkout_session_id'),
  cancelAtPeriodEnd: integer('cancel_at_period_end').default(0),
  canceledReason: text('canceled_reason'),
  metadata: text('metadata'),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at').notNull().default(sql`(unixepoch())`),
}, (table) => ({
  userIdx: index('idx_subscriptions_user').on(table.userId),
  companyIdx: index('idx_subscriptions_company').on(table.companyId),
  statusIdx: index('idx_subscriptions_status').on(table.status),
}));

// ----------------------------------------------------------
// Stripe Payment Methods
// ----------------------------------------------------------

export const paymentMethods = sqliteTable('payment_methods', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  stripePaymentMethodId: text('stripe_payment_method_id').unique().notNull(),
  type: text('type', {
    enum: ['card', 'us_bank_account', 'sepa_debit', 'link', 'paypal']
  }).notNull(),
  cardBrand: text('card_brand'),
  cardLast4: text('card_last4'),
  cardExpMonth: integer('card_exp_month'),
  cardExpYear: integer('card_exp_year'),
  isDefault: integer('is_default').default(0),
  status: text('status', {
    enum: ['valid', 'invalid', 'detached']
  }).default('valid'),
  fingerprint: text('fingerprint'),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at').notNull().default(sql`(unixepoch())`),
}, (table) => ({
  userIdx: index('idx_pm_user').on(table.userId),
  stripeIdIdx: index('idx_pm_stripe_id').on(table.stripePaymentMethodId),
  statusIdx: index('idx_pm_status').on(table.status),
}));

// ----------------------------------------------------------
// Invoices
// ----------------------------------------------------------

export const invoices = sqliteTable('invoices', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  subscriptionId: integer('subscription_id').references(() => subscriptions.id, { onDelete: 'set null' }),
  stripeInvoiceId: text('stripe_invoice_id').unique().notNull(),
  stripeCustomerId: text('stripe_customer_id').notNull(),
  amountDue: integer('amount_due').notNull(),
  amountPaid: integer('amount_paid').notNull(),
  status: text('status', {
    enum: ['draft', 'open', 'paid', 'void', 'uncollectible']
  }).notNull(),
  hostedInvoiceUrl: text('hosted_invoice_url'),
  invoicePdf: text('invoice_pdf'),
  dueDate: integer('due_date'),
  paidAt: integer('paid_at'),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at').notNull().default(sql`(unixepoch())`),
}, (table) => ({
  userIdx: index('idx_inv_user').on(table.userId),
  subscriptionIdx: index('idx_inv_subscription').on(table.subscriptionId),
  stripeIdIdx: index('idx_inv_stripe_id').on(table.stripeInvoiceId),
  statusIdx: index('idx_inv_status').on(table.status),
}));

// ----------------------------------------------------------
// Payment Transactions
// ----------------------------------------------------------

export const paymentTransactions = sqliteTable('payment_transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  subscriptionId: integer('subscription_id').references(() => subscriptions.id, { onDelete: 'set null' }),
  invoiceId: integer('invoice_id').references(() => invoices.id, { onDelete: 'set null' }),
  stripePaymentIntentId: text('stripe_payment_intent_id').unique(),
  stripeChargeId: text('stripe_charge_id'),
  amountCents: integer('amount_cents').notNull(),
  currency: text('currency').default('usd'),
  status: text('status', {
    enum: ['succeeded', 'pending', 'failed', 'canceled', 'refunded']
  }).notNull(),
  paymentMethodId: integer('payment_method_id').references(() => paymentMethods.id),
  failureCode: text('failure_code'),
  failureMessage: text('failure_message'),
  metadata: text('metadata'),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at').notNull().default(sql`(unixepoch())`),
}, (table) => ({
  userIdx: index('idx_pt_user').on(table.userId),
  subscriptionIdx: index('idx_pt_subscription').on(table.subscriptionId),
  statusIdx: index('idx_pt_status').on(table.status),
}));

// ----------------------------------------------------------
// Stripe Webhook Events
// ----------------------------------------------------------

export const stripeWebhookEvents = sqliteTable('stripe_webhook_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  stripeEventId: text('stripe_event_id').unique().notNull(),
  eventType: text('event_type').notNull(),
  eventData: text('event_data').notNull(),
  processed: integer('processed').default(0),
  processingError: text('processing_error'),
  receivedAt: integer('received_at').notNull().default(sql`(unixepoch())`),
  processedAt: integer('processed_at'),
}, (table) => ({
  eventIdIdx: index('idx_swe_event_id').on(table.stripeEventId),
  processedIdx: index('idx_swe_processed').on(table.processed),
  typeIdx: index('idx_swe_type').on(table.eventType),
}));

// ----------------------------------------------------------
// PayPal Webhook Events
// ----------------------------------------------------------

export const paypalWebhookEvents = sqliteTable('paypal_webhook_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  paypalEventId: text('paypal_event_id').unique().notNull(),
  eventType: text('event_type').notNull(),
  eventData: text('event_data').notNull(),
  processed: integer('processed').default(0),
  processingError: text('processing_error'),
  receivedAt: integer('received_at').notNull().default(sql`(unixepoch())`),
  processedAt: integer('processed_at'),
}, (table) => ({
  eventIdIdx: index('idx_pwe_event_id').on(table.paypalEventId),
  processedIdx: index('idx_pwe_processed').on(table.processed),
  typeIdx: index('idx_pwe_type').on(table.eventType),
}));

// ----------------------------------------------------------
// Company Invoices (for tracking company earnings/revenue)
// ----------------------------------------------------------

export const companyInvoices = sqliteTable('company_invoices', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  companyId: integer('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  jobId: integer('job_id').references(() => userCompanyJobs.id, { onDelete: 'set null' }),

  // Invoice identification
  invoiceNumber: text('invoice_number').notNull(),

  // Customer information snapshot (denormalized for historical accuracy)
  customerId: integer('customer_id').references(() => users.id, { onDelete: 'restrict' }), // Optional - for registered users
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email'),
  customerPhone: text('customer_phone'),
  customerAddressLine1: text('customer_address_line1'),
  customerAddressLine2: text('customer_address_line2'),
  customerCity: text('customer_city'),
  customerState: text('customer_state'),
  customerZip: text('customer_zip'),

  // Financial details (all in cents to avoid floating-point issues)
  subtotalCents: integer('subtotal_cents').notNull(),
  taxRateBps: integer('tax_rate_bps').default(0), // Basis points (e.g., 825 = 8.25%)
  taxAmountCents: integer('tax_amount_cents').default(0),
  discountCents: integer('discount_cents').default(0),
  totalCents: integer('total_cents').notNull(),
  amountPaidCents: integer('amount_paid_cents').notNull().default(0),

  // Status tracking
  status: text('status', {
    enum: ['draft', 'sent', 'viewed', 'paid', 'partial', 'overdue', 'void', 'refunded']
  }).notNull().default('draft'),

  // Dates
  invoiceDate: integer('invoice_date').notNull(),
  dueDate: integer('due_date'),
  paidAt: integer('paid_at'),

  // Optional payment tracking (if processed through Stripe/PayPal)
  paymentProvider: text('payment_provider', { enum: ['stripe', 'paypal', 'manual', 'cash', 'check'] }),
  externalPaymentId: text('external_payment_id'),

  // Notes and descriptions
  description: text('description'),
  notes: text('notes'), // Internal notes
  terms: text('terms'), // Payment terms

  // Metadata
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at').notNull().default(sql`(unixepoch())`),
}, (table) => ({
  companyIdx: index('idx_ci_company').on(table.companyId),
  customerIdx: index('idx_ci_customer').on(table.customerId),
  jobIdx: index('idx_ci_job').on(table.jobId),
  statusIdx: index('idx_ci_status').on(table.status),
  invoiceDateIdx: index('idx_ci_invoice_date').on(table.invoiceDate),
  companyInvoiceDateIdx: index('idx_ci_company_invoice_date').on(table.companyId, table.invoiceDate),
  companyStatusIdx: index('idx_ci_company_status').on(table.companyId, table.status),
  uniqueInvoiceNumber: uniqueIndex('unique_company_invoice_number').on(table.companyId, table.invoiceNumber),
}));

export const companyInvoiceLineItems = sqliteTable('company_invoice_line_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  invoiceId: integer('invoice_id').notNull().references(() => companyInvoices.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  quantity: integer('quantity').notNull().default(1),
  unitPriceCents: integer('unit_price_cents').notNull(),
  totalCents: integer('total_cents').notNull(),
  categoryId: integer('category_id').references(() => serviceCategories.id, { onDelete: 'set null' }),
  sortOrder: integer('sort_order').default(0),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at').notNull().default(sql`(unixepoch())`),
}, (table) => ({
  invoiceIdx: index('idx_cili_invoice').on(table.invoiceId),
}));

// ----------------------------------------------------------
// Content Management
// ----------------------------------------------------------

export const contentItems = sqliteTable('content_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  body: text('body'),
  isActive: integer('is_active').notNull().default(1),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at').notNull().default(sql`(unixepoch())`),
});

export const planContentAccess = sqliteTable('plan_content_access', {
  planId: integer('plan_id').notNull().references(() => plans.id, { onDelete: 'cascade' }),
  contentId: integer('content_id').notNull().references(() => contentItems.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.planId, table.contentId] }),
}));

// ----------------------------------------------------------
// Usage Tracking
// ----------------------------------------------------------

export const usageCounters = sqliteTable('usage_counters', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  metric: text('metric').notNull(),
  period: text('period').notNull(),
  value: integer('value').notNull().default(0),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at').notNull().default(sql`(unixepoch())`),
}, (table) => ({
  uniqueUserMetricPeriod: uniqueIndex('unique_user_metric_period').on(table.userId, table.metric, table.period),
  userMetricIdx: index('idx_usage_user_metric').on(table.userId, table.metric),
  periodIdx: index('idx_usage_period').on(table.period),
}));

// ----------------------------------------------------------
// RBAC System
// ----------------------------------------------------------

export const roles = sqliteTable('roles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
});

export const permissions = sqliteTable('permissions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  action: text('action').notNull(),
  resource: text('resource').notNull(),
  description: text('description'),
}, (table) => ({
  uniqueActionResource: uniqueIndex('unique_action_resource').on(table.action, table.resource),
}));

export const userRoles = sqliteTable('user_roles', {
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: integer('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  assignedAt: text('assigned_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  assignedByUserId: integer('assigned_by_user_id').references(() => users.id),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.roleId] }),
  userIdx: index('idx_user_roles_user').on(table.userId),
}));

export const rolePermissions = sqliteTable('role_permissions', {
  roleId: integer('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: integer('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
}));

// ----------------------------------------------------------
// Relations for Enhanced Querying
// ----------------------------------------------------------

export const usersRelations = relations(users, ({ one, many }) => ({
  // Auth relationship
  authUser: one(authUsers, {
    fields: [users.authUserId],
    references: [authUsers.id],
  }),

  // User relationships
  relationships: many(userRelationships, { relationName: 'userRelationships' }),
  relatedBy: many(userRelationships, { relationName: 'relatedUserRelationships' }),

  // Assets
  assets: many(userAssets),

  // Company memberships
  companyMemberships: many(companyUsers),
  companiesCreated: many(companies),

  // Jobs
  jobRequests: many(userCompanyJobs),

  // Billing
  subscriptions: many(subscriptions),
  usageCounters: many(usageCounters),
  paymentMethods: many(paymentMethods),
  invoices: many(invoices),
  paymentTransactions: many(paymentTransactions),

  // Service Preferences
  servicePreferences: many(userServicePreferences),

  // RBAC
  rolesAssigned: many(userRoles, { relationName: 'userRole' }),
  roleAssignments: many(userRoles, { relationName: 'assignedByUser' }),

  // Messaging
  conversationsCreated: many(conversations),
  conversationParticipations: many(conversationParticipants),
  messagesSent: many(messages),

  // Support
  supportTickets: many(supportTickets, { relationName: 'createdTickets' }),
  assignedTickets: many(supportTickets, { relationName: 'assignedTickets' }),

  // Shopping Cart
  cartItems: many(cartItems),

  // Employee Assignments
  employeeAssignments: many(employeeAssignments, { relationName: 'employeeAssignments' }),
  assignedToAssignments: many(employeeAssignments, { relationName: 'assignedToUser' }),
}));

export const userRelationshipsRelations = relations(userRelationships, ({ one }) => ({
  user: one(users, {
    fields: [userRelationships.userId],
    references: [users.id],
    relationName: 'userRelationships',
  }),
  relatedUser: one(users, {
    fields: [userRelationships.relatedUserId],
    references: [users.id],
    relationName: 'relatedUserRelationships',
  }),
  relationshipType: one(relationshipTypes, {
    fields: [userRelationships.relationshipTypeId],
    references: [relationshipTypes.id],
  }),
}));

export const relationshipTypesRelations = relations(relationshipTypes, ({ many }) => ({
  relationships: many(userRelationships),
}));

export const assetsRelations = relations(assets, ({ one, many }) => ({
  assetType: one(assetTypes, {
    fields: [assets.assetTypeId],
    references: [assetTypes.id],
  }),
  owners: many(userAssets),
}));

export const assetTypesRelations = relations(assetTypes, ({ many }) => ({
  assets: many(assets),
}));

export const userAssetsRelations = relations(userAssets, ({ one }) => ({
  user: one(users, {
    fields: [userAssets.userId],
    references: [users.id],
  }),
  asset: one(assets, {
    fields: [userAssets.assetId],
    references: [assets.id],
  }),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [companies.createdByUserId],
    references: [users.id]
  }),
  teamMembers: many(companyUsers),
  services: many(companyServices),
  serviceCategories: many(companyServiceCategories),
  jobRequests: many(userCompanyJobs),
  subscriptions: many(subscriptions),
  companyInvoices: many(companyInvoices),
}));

export const companyUsersRelations = relations(companyUsers, ({ one }) => ({
  company: one(companies, {
    fields: [companyUsers.companyId],
    references: [companies.id],
  }),
  user: one(users, {
    fields: [companyUsers.userId],
    references: [users.id],
  }),
}));

export const serviceCategoriesRelations = relations(serviceCategories, ({ many }) => ({
  companyServices: many(companyServices),
  companyServiceCategories: many(companyServiceCategories),
  jobs: many(userCompanyJobs),
  userPreferences: many(userServicePreferences),
}));

export const userServicePreferencesRelations = relations(userServicePreferences, ({ one }) => ({
  user: one(users, {
    fields: [userServicePreferences.userId],
    references: [users.id],
  }),
  category: one(serviceCategories, {
    fields: [userServicePreferences.categoryId],
    references: [serviceCategories.id],
  }),
}));

export const companyServicesRelations = relations(companyServices, ({ one }) => ({
  company: one(companies, {
    fields: [companyServices.companyId],
    references: [companies.id],
  }),
}));

export const companyServiceCategoriesRelations = relations(companyServiceCategories, ({ one }) => ({
  company: one(companies, {
    fields: [companyServiceCategories.companyId],
    references: [companies.id],
  }),
  category: one(serviceCategories, {
    fields: [companyServiceCategories.categoryId],
    references: [serviceCategories.id],
  }),
}));

export const userCompanyJobsRelations = relations(userCompanyJobs, ({ one }) => ({
  user: one(users, {
    fields: [userCompanyJobs.userId],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [userCompanyJobs.companyId],
    references: [companies.id],
  }),
  category: one(serviceCategories, {
    fields: [userCompanyJobs.categoryId],
    references: [serviceCategories.id],
  }),
}));

export const plansRelations = relations(plans, ({ many }) => ({
  subscriptions: many(subscriptions),
  contentAccess: many(planContentAccess),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [subscriptions.companyId],
    references: [companies.id],
  }),
  plan: one(plans, {
    fields: [subscriptions.planId],
    references: [plans.id],
  }),
  invoices: many(invoices),
  transactions: many(paymentTransactions),
}));

export const contentItemsRelations = relations(contentItems, ({ many }) => ({
  planAccess: many(planContentAccess),
}));

export const planContentAccessRelations = relations(planContentAccess, ({ one }) => ({
  plan: one(plans, {
    fields: [planContentAccess.planId],
    references: [plans.id],
  }),
  content: one(contentItems, {
    fields: [planContentAccess.contentId],
    references: [contentItems.id],
  }),
}));

export const usageCountersRelations = relations(usageCounters, ({ one }) => ({
  user: one(users, {
    fields: [usageCounters.userId],
    references: [users.id],
  }),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
  permissions: many(rolePermissions),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  roles: many(rolePermissions),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
    relationName: 'userRole',
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
  assignedBy: one(users, {
    fields: [userRoles.assignedByUserId],
    references: [users.id],
    relationName: 'assignedByUser',
  }),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));

// ----------------------------------------------------------
// Activity Tracking
// ----------------------------------------------------------

export const userActivities = sqliteTable('user_activities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  authUserId: text('auth_user_id'),
  activityType: text('activity_type').notNull(),
  description: text('description'),
  metadata: text('metadata'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
}, (table) => ({
  userTimeIdx: index('idx_ua_user_time').on(table.userId, table.createdAt),
  activityTypeTimeIdx: index('idx_ua_activity_type_time').on(table.activityType, table.createdAt),
  createdAtIdx: index('idx_ua_created_at').on(table.createdAt),
}));

export const userActivitiesRelations = relations(userActivities, ({ one }) => ({
  user: one(users, {
    fields: [userActivities.userId],
    references: [users.id],
  }),
}));

// ----------------------------------------------------------
// Employee Invitations
// ----------------------------------------------------------

export const employeeInvitations = sqliteTable('employee_invitations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull(),
  companyId: integer('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at').notNull(),
  status: text('status', { enum: ['pending', 'accepted', 'expired'] }).notNull().default('pending'),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  acceptedAt: integer('accepted_at'),
}, (table) => ({
  emailCompanyIdx: index('idx_ei_email_company').on(table.email, table.companyId),
  tokenIdx: uniqueIndex('idx_ei_token').on(table.token),
  statusIdx: index('idx_ei_status').on(table.status),
  companyIdx: index('idx_ei_company').on(table.companyId),
  expiresAtIdx: index('idx_ei_expires_at').on(table.expiresAt),
}));

export const employeeInvitationsRelations = relations(employeeInvitations, ({ one }) => ({
  company: one(companies, {
    fields: [employeeInvitations.companyId],
    references: [companies.id],
  }),
  user: one(users, {
    fields: [employeeInvitations.userId],
    references: [users.id],
  }),
}));

export type EmployeeInvitation = typeof employeeInvitations.$inferSelect;
export type NewEmployeeInvitation = typeof employeeInvitations.$inferInsert;

export const paymentMethodsRelations = relations(paymentMethods, ({ one, many }) => ({
  user: one(users, {
    fields: [paymentMethods.userId],
    references: [users.id],
  }),
  transactions: many(paymentTransactions),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  user: one(users, {
    fields: [invoices.userId],
    references: [users.id],
  }),
  subscription: one(subscriptions, {
    fields: [invoices.subscriptionId],
    references: [subscriptions.id],
  }),
  transactions: many(paymentTransactions),
}));

export const paymentTransactionsRelations = relations(paymentTransactions, ({ one }) => ({
  user: one(users, {
    fields: [paymentTransactions.userId],
    references: [users.id],
  }),
  subscription: one(subscriptions, {
    fields: [paymentTransactions.subscriptionId],
    references: [subscriptions.id],
  }),
  invoice: one(invoices, {
    fields: [paymentTransactions.invoiceId],
    references: [invoices.id],
  }),
  paymentMethod: one(paymentMethods, {
    fields: [paymentTransactions.paymentMethodId],
    references: [paymentMethods.id],
  }),
}));

export const companyInvoicesRelations = relations(companyInvoices, ({ one, many }) => ({
  company: one(companies, {
    fields: [companyInvoices.companyId],
    references: [companies.id],
  }),
  job: one(userCompanyJobs, {
    fields: [companyInvoices.jobId],
    references: [userCompanyJobs.id],
  }),
  customer: one(users, {
    fields: [companyInvoices.customerId],
    references: [users.id],
  }),
  lineItems: many(companyInvoiceLineItems),
}));

export const companyInvoiceLineItemsRelations = relations(companyInvoiceLineItems, ({ one }) => ({
  invoice: one(companyInvoices, {
    fields: [companyInvoiceLineItems.invoiceId],
    references: [companyInvoices.id],
  }),
  category: one(serviceCategories, {
    fields: [companyInvoiceLineItems.categoryId],
    references: [serviceCategories.id],
  }),
}));

// ----------------------------------------------------------
// Messaging System
// ----------------------------------------------------------

export const conversations = sqliteTable('conversations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title'),
  isGroup: integer('is_group').notNull().default(0),
  createdByUserId: integer('created_by_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at').notNull().default(sql`(unixepoch())`),
}, (table) => ({
  createdByIdx: index('idx_conversations_created_by').on(table.createdByUserId),
  updatedAtIdx: index('idx_conversations_updated_at').on(table.updatedAt),
}));

export const conversationParticipants = sqliteTable('conversation_participants', {
  conversationId: integer('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  joinedAt: integer('joined_at').notNull().default(sql`(unixepoch())`),
  lastReadAt: integer('last_read_at'),
  isAdmin: integer('is_admin').notNull().default(0),
}, (table) => ({
  pk: primaryKey({ columns: [table.conversationId, table.userId] }),
  userIdx: index('idx_cp_user_id').on(table.userId),
  lastReadIdx: index('idx_cp_last_read').on(table.conversationId, table.lastReadAt),
}));

export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  conversationId: integer('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  senderId: integer('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  contentType: text('content_type', { enum: ['html', 'json'] }).notNull().default('html'),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  editedAt: integer('edited_at'),
  isDeleted: integer('is_deleted').notNull().default(0),
}, (table) => ({
  conversationIdx: index('idx_messages_conversation').on(table.conversationId, table.createdAt),
  senderIdx: index('idx_messages_sender').on(table.senderId),
  createdAtIdx: index('idx_messages_created_at').on(table.createdAt),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [conversations.createdByUserId],
    references: [users.id],
  }),
  participants: many(conversationParticipants),
  messages: many(messages),
}));

export const conversationParticipantsRelations = relations(conversationParticipants, ({ one }) => ({
  conversation: one(conversations, {
    fields: [conversationParticipants.conversationId],
    references: [conversations.id],
  }),
  user: one(users, {
    fields: [conversationParticipants.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

// ----------------------------------------------------------
// Employee Assignments (Round-Robin Tracking)
// ----------------------------------------------------------

export const employeeAssignments = sqliteTable('employee_assignments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  employeeUserId: integer('employee_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  assignedToUserId: integer('assigned_to_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  conversationId: integer('conversation_id').references(() => conversations.id, { onDelete: 'set null' }),
  userRequest: text('user_request'),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
}, (table) => ({
  employeeIdx: index('idx_employee_assignments_employee').on(table.employeeUserId),
  assignedToIdx: index('idx_employee_assignments_assigned_to').on(table.assignedToUserId),
}));

export const employeeAssignmentsRelations = relations(employeeAssignments, ({ one }) => ({
  employee: one(users, {
    fields: [employeeAssignments.employeeUserId],
    references: [users.id],
    relationName: 'employeeAssignments',
  }),
  assignedTo: one(users, {
    fields: [employeeAssignments.assignedToUserId],
    references: [users.id],
    relationName: 'assignedToUser',
  }),
  conversation: one(conversations, {
    fields: [employeeAssignments.conversationId],
    references: [conversations.id],
  }),
}));

// ----------------------------------------------------------
// Support Tickets
// ----------------------------------------------------------

export const supportTickets = sqliteTable('support_tickets', {
  id: text('id').primaryKey(), // 6-character alphanumeric ID (e.g., "ABC123")
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'set null' }),
  subject: text('subject').notNull(),
  description: text('description').notNull(), // Rich text HTML, max 5000 chars
  urgency: text('urgency', { enum: ['minor', 'urgent', 'critical'] }).notNull(),
  status: text('status', { enum: ['open', 'in_progress', 'resolved', 'closed'] }).notNull().default('open'),
  assignedToUserId: integer('assigned_to_user_id').references(() => users.id, { onDelete: 'set null' }),
  internalNotes: text('internal_notes'),
  adminResponse: text('admin_response'), // Visible to users - admin's reply/instructions
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at').notNull().default(sql`(unixepoch())`),
  resolvedAt: integer('resolved_at'),
}, (table) => ({
  userIdx: index('idx_support_tickets_user').on(table.userId),
  statusIdx: index('idx_support_tickets_status').on(table.status),
  urgencyIdx: index('idx_support_tickets_urgency').on(table.urgency),
  statusUrgencyIdx: index('idx_support_tickets_status_urgency').on(table.status, table.urgency),
  companyIdx: index('idx_support_tickets_company').on(table.companyId),
  assignedIdx: index('idx_support_tickets_assigned').on(table.assignedToUserId),
}));

export const supportTicketsRelations = relations(supportTickets, ({ one }) => ({
  user: one(users, {
    fields: [supportTickets.userId],
    references: [users.id],
    relationName: 'createdTickets',
  }),
  company: one(companies, {
    fields: [supportTickets.companyId],
    references: [companies.id],
  }),
  assignedTo: one(users, {
    fields: [supportTickets.assignedToUserId],
    references: [users.id],
    relationName: 'assignedTickets',
  }),
}));

// ----------------------------------------------------------
// Type Exports for TypeScript Inference
// ----------------------------------------------------------

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type UserRelationship = typeof userRelationships.$inferSelect;
export type NewUserRelationship = typeof userRelationships.$inferInsert;

export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;

export type UserAsset = typeof userAssets.$inferSelect;
export type NewUserAsset = typeof userAssets.$inferInsert;

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;

export type UserCompanyJob = typeof userCompanyJobs.$inferSelect;
export type NewUserCompanyJob = typeof userCompanyJobs.$inferInsert;

export type Plan = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

export type ContentItem = typeof contentItems.$inferSelect;
export type NewContentItem = typeof contentItems.$inferInsert;

export type UsageCounter = typeof usageCounters.$inferSelect;
export type NewUsageCounter = typeof usageCounters.$inferInsert;

export type UserServicePreference = typeof userServicePreferences.$inferSelect;
export type NewUserServicePreference = typeof userServicePreferences.$inferInsert;

export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type NewPaymentMethod = typeof paymentMethods.$inferInsert;

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type NewPaymentTransaction = typeof paymentTransactions.$inferInsert;

export type StripeWebhookEvent = typeof stripeWebhookEvents.$inferSelect;
export type NewStripeWebhookEvent = typeof stripeWebhookEvents.$inferInsert;

export type PayPalWebhookEvent = typeof paypalWebhookEvents.$inferSelect;
export type NewPayPalWebhookEvent = typeof paypalWebhookEvents.$inferInsert;

export type CompanyInvoice = typeof companyInvoices.$inferSelect;
export type NewCompanyInvoice = typeof companyInvoices.$inferInsert;

export type CompanyInvoiceLineItem = typeof companyInvoiceLineItems.$inferSelect;
export type NewCompanyInvoiceLineItem = typeof companyInvoiceLineItems.$inferInsert;

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;

export type ConversationParticipant = typeof conversationParticipants.$inferSelect;
export type NewConversationParticipant = typeof conversationParticipants.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

export type SupportTicket = typeof supportTickets.$inferSelect;
export type NewSupportTicket = typeof supportTickets.$inferInsert;

// ----------------------------------------------------------
// Shopping Cart
// ----------------------------------------------------------

export const cartItems = sqliteTable('cart_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title', { length: 50 }).notNull(),
  description: text('description', { length: 500 }),
  quantity: integer('quantity').notNull().default(1),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at').notNull().default(sql`(unixepoch())`),
}, (table) => ({
  userIdx: index('idx_cart_items_user').on(table.userId),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
}));

export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;
