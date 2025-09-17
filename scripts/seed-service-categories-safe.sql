-- Safe seed script for service categories without explicit IDs
-- Uses temporary mapping table to maintain relationships

-- Create temporary mapping table
CREATE TEMP TABLE IF NOT EXISTS category_mapping (
    temp_id INTEGER PRIMARY KEY,
    real_id INTEGER,
    name TEXT
);

-- Insert root categories
INSERT INTO service_categories (name, description, parent_id, sort_order) 
VALUES ('Normal User Services', 'Services for individual consumers', NULL, 1);
INSERT INTO category_mapping (temp_id, real_id, name) 
VALUES (1, last_insert_rowid(), 'Normal User Services');

INSERT INTO service_categories (name, description, parent_id, sort_order) 
VALUES ('Business User Services', 'Services for business clients', NULL, 2);
INSERT INTO category_mapping (temp_id, real_id, name) 
VALUES (2, last_insert_rowid(), 'Business User Services');

-- Insert Normal User Services subcategories
INSERT INTO service_categories (name, parent_id, sort_order) 
SELECT 'Finance Personal', real_id, 1 FROM category_mapping WHERE name = 'Normal User Services';

INSERT INTO service_categories (name, parent_id, sort_order) 
SELECT 'Healthcare Wellness', real_id, 2 FROM category_mapping WHERE name = 'Normal User Services';

INSERT INTO service_categories (name, parent_id, sort_order) 
SELECT 'Housing Home Services', real_id, 3 FROM category_mapping WHERE name = 'Normal User Services';
INSERT INTO category_mapping (temp_id, real_id, name) 
VALUES (5, last_insert_rowid(), 'Housing Home Services');

INSERT INTO service_categories (name, parent_id, sort_order) 
SELECT 'Legal Community', real_id, 4 FROM category_mapping WHERE name = 'Normal User Services';

INSERT INTO service_categories (name, parent_id, sort_order) 
SELECT 'Education Childcare', real_id, 5 FROM category_mapping WHERE name = 'Normal User Services';

INSERT INTO service_categories (name, parent_id, sort_order) 
SELECT 'Travel Leisure', real_id, 6 FROM category_mapping WHERE name = 'Normal User Services';

-- Insert Business User Services subcategories
INSERT INTO service_categories (name, parent_id, sort_order) 
SELECT 'Corporate Finance', real_id, 1 FROM category_mapping WHERE name = 'Business User Services';

INSERT INTO service_categories (name, parent_id, sort_order) 
SELECT 'Business Insurance', real_id, 2 FROM category_mapping WHERE name = 'Business User Services';

INSERT INTO service_categories (name, parent_id, sort_order) 
SELECT 'Professional Legal', real_id, 3 FROM category_mapping WHERE name = 'Business User Services';

INSERT INTO service_categories (name, parent_id, sort_order) 
SELECT 'Consulting Advisory', real_id, 4 FROM category_mapping WHERE name = 'Business User Services';

INSERT INTO service_categories (name, parent_id, sort_order) 
SELECT 'Technology IT', real_id, 5 FROM category_mapping WHERE name = 'Business User Services';
INSERT INTO category_mapping (temp_id, real_id, name) 
VALUES (88, last_insert_rowid(), 'Technology IT');

INSERT INTO service_categories (name, parent_id, sort_order) 
SELECT 'RealEstate Construction', real_id, 6 FROM category_mapping WHERE name = 'Business User Services';

INSERT INTO service_categories (name, parent_id, sort_order) 
SELECT 'Marketing Communications', real_id, 7 FROM category_mapping WHERE name = 'Business User Services';

INSERT INTO service_categories (name, parent_id, sort_order) 
SELECT 'Business Support', real_id, 8 FROM category_mapping WHERE name = 'Business User Services';

INSERT INTO service_categories (name, parent_id, sort_order) 
SELECT 'Industrial Research', real_id, 9 FROM category_mapping WHERE name = 'Business User Services';

-- Insert third-level categories under Housing Home Services
INSERT INTO service_categories (name, parent_id, sort_order)
SELECT 'Plumbing', real_id, 1 FROM category_mapping WHERE name = 'Housing Home Services';

INSERT INTO service_categories (name, parent_id, sort_order)
SELECT 'Electrical', real_id, 2 FROM category_mapping WHERE name = 'Housing Home Services';

INSERT INTO service_categories (name, parent_id, sort_order)
SELECT 'HVAC', real_id, 3 FROM category_mapping WHERE name = 'Housing Home Services';

INSERT INTO service_categories (name, parent_id, sort_order)
SELECT 'Carpentry', real_id, 4 FROM category_mapping WHERE name = 'Housing Home Services';

INSERT INTO service_categories (name, parent_id, sort_order)
SELECT 'Landscaping', real_id, 5 FROM category_mapping WHERE name = 'Housing Home Services';

-- Insert third-level categories under Technology IT
INSERT INTO service_categories (name, parent_id, sort_order)
SELECT 'Managed IT', real_id, 1 FROM category_mapping WHERE name = 'Technology IT';

INSERT INTO service_categories (name, parent_id, sort_order)
SELECT 'Helpdesk', real_id, 2 FROM category_mapping WHERE name = 'Technology IT';

INSERT INTO service_categories (name, parent_id, sort_order)
SELECT 'Cloud Infrastructure', real_id, 3 FROM category_mapping WHERE name = 'Technology IT';

INSERT INTO service_categories (name, parent_id, sort_order)
SELECT 'Cybersecurity', real_id, 4 FROM category_mapping WHERE name = 'Technology IT';

INSERT INTO service_categories (name, parent_id, sort_order)
SELECT 'Software Development', real_id, 5 FROM category_mapping WHERE name = 'Technology IT';

INSERT INTO service_categories (name, parent_id, sort_order)
SELECT 'Data Analytics', real_id, 6 FROM category_mapping WHERE name = 'Technology IT';

-- Clean up
DROP TABLE category_mapping;