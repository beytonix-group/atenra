----------------------------------------------------------------
-- Marketplace Seed Data for Remote Database
-- Safe version that doesn't rely on hardcoded IDs
----------------------------------------------------------------

-- Clear existing data (be careful with this in production!)
DELETE FROM company_service_categories;
DELETE FROM companies;
DELETE FROM service_categories;

----------------------------------------------------------------
-- Service Categories - Simplified hierarchy for initial setup
----------------------------------------------------------------

-- Root categories
INSERT INTO service_categories (name, description, parent_id, sort_order) 
VALUES 
('Consumer Services', 'Services for individual consumers', NULL, 1),
('Business Services', 'Services for businesses', NULL, 2);

-- Consumer Services subcategories
INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Home Services', 'Home maintenance and improvement', id, 1 
FROM service_categories WHERE name = 'Consumer Services' AND parent_id IS NULL;

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Personal Care', 'Health, wellness, and personal services', id, 2 
FROM service_categories WHERE name = 'Consumer Services' AND parent_id IS NULL;

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Education & Family', 'Education and family services', id, 3 
FROM service_categories WHERE name = 'Consumer Services' AND parent_id IS NULL;

-- Business Services subcategories  
INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Technology', 'IT and technology services', id, 1 
FROM service_categories WHERE name = 'Business Services' AND parent_id IS NULL;

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Professional Services', 'Legal, financial, and consulting', id, 2 
FROM service_categories WHERE name = 'Business Services' AND parent_id IS NULL;

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Marketing & Sales', 'Marketing and sales services', id, 3 
FROM service_categories WHERE name = 'Business Services' AND parent_id IS NULL;

-- Home Services detailed categories
INSERT INTO service_categories (name, parent_id, sort_order)
SELECT 'Plumbing', id, 1 FROM service_categories 
WHERE name = 'Home Services' AND parent_id = (SELECT id FROM service_categories WHERE name = 'Consumer Services' AND parent_id IS NULL);

INSERT INTO service_categories (name, parent_id, sort_order)
SELECT 'Electrical', id, 2 FROM service_categories 
WHERE name = 'Home Services' AND parent_id = (SELECT id FROM service_categories WHERE name = 'Consumer Services' AND parent_id IS NULL);

INSERT INTO service_categories (name, parent_id, sort_order)
SELECT 'HVAC', id, 3 FROM service_categories 
WHERE name = 'Home Services' AND parent_id = (SELECT id FROM service_categories WHERE name = 'Consumer Services' AND parent_id IS NULL);

INSERT INTO service_categories (name, parent_id, sort_order)
SELECT 'Landscaping', id, 4 FROM service_categories 
WHERE name = 'Home Services' AND parent_id = (SELECT id FROM service_categories WHERE name = 'Consumer Services' AND parent_id IS NULL);

INSERT INTO service_categories (name, parent_id, sort_order)
SELECT 'Cleaning', id, 5 FROM service_categories 
WHERE name = 'Home Services' AND parent_id = (SELECT id FROM service_categories WHERE name = 'Consumer Services' AND parent_id IS NULL);

INSERT INTO service_categories (name, parent_id, sort_order)
SELECT 'Handyman', id, 6 FROM service_categories 
WHERE name = 'Home Services' AND parent_id = (SELECT id FROM service_categories WHERE name = 'Consumer Services' AND parent_id IS NULL);

-- Technology detailed categories
INSERT INTO service_categories (name, parent_id, sort_order)
SELECT 'Cloud Services', id, 1 FROM service_categories 
WHERE name = 'Technology' AND parent_id = (SELECT id FROM service_categories WHERE name = 'Business Services' AND parent_id IS NULL);

INSERT INTO service_categories (name, parent_id, sort_order)
SELECT 'Cybersecurity', id, 2 FROM service_categories 
WHERE name = 'Technology' AND parent_id = (SELECT id FROM service_categories WHERE name = 'Business Services' AND parent_id IS NULL);

INSERT INTO service_categories (name, parent_id, sort_order)
SELECT 'IT Support', id, 3 FROM service_categories 
WHERE name = 'Technology' AND parent_id = (SELECT id FROM service_categories WHERE name = 'Business Services' AND parent_id IS NULL);

INSERT INTO service_categories (name, parent_id, sort_order)
SELECT 'Software Development', id, 4 FROM service_categories 
WHERE name = 'Technology' AND parent_id = (SELECT id FROM service_categories WHERE name = 'Business Services' AND parent_id IS NULL);

----------------------------------------------------------------
-- Sample Companies
----------------------------------------------------------------

-- Home Services Companies
INSERT INTO companies (name, slug, description, status) VALUES
('Sparkle Clean Pro', 'sparkle-clean-pro', 'Professional cleaning services for homes and offices', 'active'),
('Green Thumb Landscaping', 'green-thumb-landscaping', 'Expert lawn care and garden design', 'active'),
('Quick Fix Handyman', 'quick-fix-handyman', 'Reliable handyman services for all home repairs', 'active'),
('Cool Breeze HVAC', 'cool-breeze-hvac', 'Heating and cooling installation and repair', 'active'),
('Bright Spark Electric', 'bright-spark-electric', '24/7 electrical services and installations', 'active');

-- Technology Companies
INSERT INTO companies (name, slug, description, status) VALUES
('CloudTech Solutions', 'cloudtech-solutions', 'Enterprise cloud migration and management', 'active'),
('SecureNet Cyber', 'securenet-cyber', 'Comprehensive cybersecurity solutions', 'active'),
('DevPro Software', 'devpro-software', 'Custom software development and consulting', 'active'),
('TechHelp IT Support', 'techhelp-it-support', 'Managed IT services for small businesses', 'active');

-- Professional Services Companies
INSERT INTO companies (name, slug, description, status) VALUES
('Summit Consulting Group', 'summit-consulting', 'Business strategy and management consulting', 'active'),
('LegalEagle Associates', 'legaleagle-associates', 'Corporate legal services and compliance', 'active'),
('TaxPro Advisors', 'taxpro-advisors', 'Tax planning and accounting services', 'active');

-- Marketing Companies
INSERT INTO companies (name, slug, description, status) VALUES
('Digital Boost Marketing', 'digital-boost', 'Digital marketing and SEO services', 'active'),
('Creative Minds Agency', 'creative-minds', 'Branding and creative design services', 'active');

----------------------------------------------------------------
-- Company-Category Associations
-- Using subqueries to find the correct category IDs
----------------------------------------------------------------

-- Sparkle Clean Pro -> Cleaning
INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'sparkle-clean-pro' AND sc.name = 'Cleaning'
AND sc.parent_id = (SELECT id FROM service_categories WHERE name = 'Home Services');

-- Green Thumb Landscaping -> Landscaping
INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'green-thumb-landscaping' AND sc.name = 'Landscaping'
AND sc.parent_id = (SELECT id FROM service_categories WHERE name = 'Home Services');

-- Quick Fix Handyman -> Handyman
INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'quick-fix-handyman' AND sc.name = 'Handyman'
AND sc.parent_id = (SELECT id FROM service_categories WHERE name = 'Home Services');

-- Cool Breeze HVAC -> HVAC
INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'cool-breeze-hvac' AND sc.name = 'HVAC'
AND sc.parent_id = (SELECT id FROM service_categories WHERE name = 'Home Services');

-- Bright Spark Electric -> Electrical
INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'bright-spark-electric' AND sc.name = 'Electrical'
AND sc.parent_id = (SELECT id FROM service_categories WHERE name = 'Home Services');

-- CloudTech Solutions -> Cloud Services
INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'cloudtech-solutions' AND sc.name = 'Cloud Services'
AND sc.parent_id = (SELECT id FROM service_categories WHERE name = 'Technology');

-- SecureNet Cyber -> Cybersecurity
INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'securenet-cyber' AND sc.name = 'Cybersecurity'
AND sc.parent_id = (SELECT id FROM service_categories WHERE name = 'Technology');

-- DevPro Software -> Software Development
INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'devpro-software' AND sc.name = 'Software Development'
AND sc.parent_id = (SELECT id FROM service_categories WHERE name = 'Technology');

-- TechHelp IT Support -> IT Support
INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'techhelp-it-support' AND sc.name = 'IT Support'
AND sc.parent_id = (SELECT id FROM service_categories WHERE name = 'Technology');

-- Professional Services associations (to parent categories since we didn't create subcategories)
INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'summit-consulting' AND sc.name = 'Professional Services'
AND sc.parent_id = (SELECT id FROM service_categories WHERE name = 'Business Services');

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'legaleagle-associates' AND sc.name = 'Professional Services'
AND sc.parent_id = (SELECT id FROM service_categories WHERE name = 'Business Services');

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'taxpro-advisors' AND sc.name = 'Professional Services'
AND sc.parent_id = (SELECT id FROM service_categories WHERE name = 'Business Services');

-- Marketing associations
INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'digital-boost' AND sc.name = 'Marketing & Sales'
AND sc.parent_id = (SELECT id FROM service_categories WHERE name = 'Business Services');

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'creative-minds' AND sc.name = 'Marketing & Sales'
AND sc.parent_id = (SELECT id FROM service_categories WHERE name = 'Business Services');

----------------------------------------------------------------
-- Update sequences to prevent conflicts
----------------------------------------------------------------
UPDATE sqlite_sequence SET seq = (SELECT MAX(id) FROM service_categories) WHERE name = 'service_categories';
UPDATE sqlite_sequence SET seq = (SELECT MAX(id) FROM companies) WHERE name = 'companies';