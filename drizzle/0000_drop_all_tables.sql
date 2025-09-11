-- Drop all existing tables and views to prepare for clean migration
-- This must be run before the initial schema migration

-- Drop views first
DROP VIEW IF EXISTS user_is_company_user;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS plan_content_access;
DROP TABLE IF EXISTS content_items;
DROP TABLE IF EXISTS usage_counters;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS plans;
DROP TABLE IF EXISTS company_services;
DROP TABLE IF EXISTS service_categories;
DROP TABLE IF EXISTS user_company_jobs;
DROP TABLE IF EXISTS company_users;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS user_assets;
DROP TABLE IF EXISTS asset_types;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS user_relationships;
DROP TABLE IF EXISTS relationship_types;
DROP TABLE IF EXISTS user_activities;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS verificationTokens;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS auth_users;