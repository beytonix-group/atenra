import { integer, sqliteTable, text, primaryKey, index, uniqueIndex } from "drizzle-orm/sqlite-core"
import { relations, sql } from 'drizzle-orm';
import { drizzle } from "drizzle-orm/libsql"
import type { AdapterAccountType } from "next-auth/adapters"
import { db } from "."

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
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
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
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
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
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
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
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
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
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
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
  isActive: integer('is_active').notNull().default(1),
});

export const companies = sqliteTable('companies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
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
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
}, (table) => ({
  nameIdx: index('idx_companies_name').on(table.name),
  publicStatusIdx: index('idx_companies_public_status').on(table.isPublic, table.status),
}));

export const companyUsers = sqliteTable('company_users', {
  companyId: integer('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['owner', 'manager', 'staff'] }).notNull(),
  isDefault: integer('is_default').notNull().default(0),
  invitedAt: text('invited_at').notNull().default('CURRENT_TIMESTAMP'),
}, (table) => ({
  pk: primaryKey({ columns: [table.companyId, table.userId] }),
  userIdx: index('idx_company_users_user').on(table.userId),
  companyIdx: index('idx_company_users_company').on(table.companyId),
}));

export const companyServices = sqliteTable('company_services', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  companyId: integer('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').notNull().references(() => serviceCategories.id),
  description: text('description'),
  isActive: integer('is_active').notNull().default(1),
}, (table) => ({
  uniqueCompanyCategory: uniqueIndex('unique_company_category').on(table.companyId, table.categoryId),
  companyIdx: index('idx_company_services_company').on(table.companyId),
  categoryIdx: index('idx_company_services_category').on(table.categoryId),
}));

// ----------------------------------------------------------
// Jobs & Engagements
// ----------------------------------------------------------

export const userCompanyJobs = sqliteTable('user_company_jobs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  companyId: integer('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').notNull().references(() => serviceCategories.id),
  description: text('description').notNull(),
  status: text('status', { enum: ['active', 'completed', 'cancelled'] }).notNull().default('active'),
  startDate: text('start_date'),
  endDate: text('end_date'),
  notes: text('notes'),
  budgetCents: integer('budget_cents'),
  jobAddressLine1: text('job_address_line1'),
  jobCity: text('job_city'),
  jobState: text('job_state'),
  jobZip: text('job_zip'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
}, (table) => ({
  userIdx: index('idx_user_company_jobs_user').on(table.userId),
  companyIdx: index('idx_user_company_jobs_company').on(table.companyId),
  statusIdx: index('idx_user_company_jobs_status').on(table.status),
}));

// ----------------------------------------------------------
// Subscription & Billing
// ----------------------------------------------------------

export const plans = sqliteTable('plans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  priceCents: integer('price_cents').notNull(),
  interval: text('interval', { enum: ['month', 'year'] }).notNull(),
  featuresJson: text('features_json'),
  isActive: integer('is_active').notNull().default(1),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
}, (table) => ({
  activeIdx: index('idx_plans_active').on(table.isActive),
}));

export const subscriptions = sqliteTable('subscriptions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  planId: integer('plan_id').notNull().references(() => plans.id),
  provider: text('provider', { enum: ['stripe', 'braintree'] }).notNull(),
  externalCustomerId: text('external_customer_id'),
  externalSubscriptionId: text('external_subscription_id').unique(),
  status: text('status', {
    enum: ['active', 'past_due', 'canceled', 'incomplete', 'trialing']
  }).notNull(),
  currentPeriodStart: text('current_period_start'),
  currentPeriodEnd: text('current_period_end'),
  trialEnd: text('trial_end'),
  canceledAt: text('canceled_at'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
}, (table) => ({
  userIdx: index('idx_subscriptions_user').on(table.userId),
  companyIdx: index('idx_subscriptions_company').on(table.companyId),
  statusIdx: index('idx_subscriptions_status').on(table.status),
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
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
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
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
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
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
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
  assignedAt: text('assigned_at').notNull().default('CURRENT_TIMESTAMP'),
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

  // RBAC
  rolesAssigned: many(userRoles, { relationName: 'userRole' }),
  roleAssignments: many(userRoles, { relationName: 'assignedByUser' }),
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
  jobRequests: many(userCompanyJobs),
  subscriptions: many(subscriptions),
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
  jobs: many(userCompanyJobs),
}));

export const companyServicesRelations = relations(companyServices, ({ one }) => ({
  company: one(companies, {
    fields: [companyServices.companyId],
    references: [companies.id],
  }),
  category: one(serviceCategories, {
    fields: [companyServices.categoryId],
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

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
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
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: text('action').notNull(),
  info: text('info'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  userTimeIdx: index('idx_ua_user_time').on(table.userId, table.createdAt),
  actionTimeIdx: index('idx_ua_action_time').on(table.action, table.createdAt),
  createdAtIdx: index('idx_ua_created_at').on(table.createdAt),
}));

export const userActivitiesRelations = relations(userActivities, ({ one }) => ({
  user: one(users, {
    fields: [userActivities.userId],
    references: [users.id],
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
