----------------------------------------------------------------
-- Service Categories Seed Script
-- Clean version that focuses only on service_categories table
-- Creates a complete hierarchical structure for marketplace
----------------------------------------------------------------

-- Clear existing data (optional - comment out if you want to append)
DELETE FROM service_categories;

----------------------------------------------------------------
-- ROOT CATEGORIES (Level 0)
----------------------------------------------------------------
INSERT INTO service_categories (name, description, parent_id, sort_order) VALUES
('Normal User Services', 'Services for individual consumers', NULL, 1),
('Business User Services', 'Services for business clients', NULL, 2);

----------------------------------------------------------------
-- NORMAL USER SERVICES - Level 1 Categories
----------------------------------------------------------------
INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Finance Personal', 'Personal finance and insurance services', id, 1 
FROM service_categories WHERE name = 'Normal User Services' AND parent_id IS NULL;

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Healthcare Wellness', 'Healthcare and wellness services', id, 2 
FROM service_categories WHERE name = 'Normal User Services' AND parent_id IS NULL;

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Housing Home Services', 'Home improvement and maintenance', id, 3 
FROM service_categories WHERE name = 'Normal User Services' AND parent_id IS NULL;

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Legal Community', 'Legal and community services', id, 4 
FROM service_categories WHERE name = 'Normal User Services' AND parent_id IS NULL;

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Education Childcare', 'Education and childcare services', id, 5 
FROM service_categories WHERE name = 'Normal User Services' AND parent_id IS NULL;

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Travel Leisure', 'Travel, dining, and entertainment', id, 6 
FROM service_categories WHERE name = 'Normal User Services' AND parent_id IS NULL;

----------------------------------------------------------------
-- FINANCE PERSONAL - Level 2 & 3
----------------------------------------------------------------
-- Level 2: Finance subcategories
INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Retail Banking', 'Personal banking services', id, 1
FROM service_categories WHERE name = 'Finance Personal';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Credit Unions', 'Member-owned financial cooperatives', id, 2
FROM service_categories WHERE name = 'Finance Personal';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Personal Accounting', 'Personal accounting services', id, 3
FROM service_categories WHERE name = 'Finance Personal';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Insurance Personal', 'Personal insurance products', id, 4
FROM service_categories WHERE name = 'Finance Personal';

-- Level 3: Personal Accounting subcategories
INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Bookkeeping Personal', 'Personal bookkeeping services', id, 1
FROM service_categories WHERE name = 'Personal Accounting';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Tax Preparation', 'Personal tax filing services', id, 2
FROM service_categories WHERE name = 'Personal Accounting';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Financial Planning', 'Personal financial planning', id, 3
FROM service_categories WHERE name = 'Personal Accounting';

-- Level 3: Personal Insurance subcategories
INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Health Insurance', 'Health insurance coverage', id, 1
FROM service_categories WHERE name = 'Insurance Personal';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Auto Insurance', 'Vehicle insurance policies', id, 2
FROM service_categories WHERE name = 'Insurance Personal';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Homeowners Renters', 'Property insurance', id, 3
FROM service_categories WHERE name = 'Insurance Personal';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Life Disability', 'Life and disability insurance', id, 4
FROM service_categories WHERE name = 'Insurance Personal';

----------------------------------------------------------------
-- HEALTHCARE WELLNESS - Level 2 & 3
----------------------------------------------------------------
-- Level 2: Healthcare subcategories
INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Medical Services', 'Medical care providers', id, 1
FROM service_categories WHERE name = 'Healthcare Wellness';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Dental Services', 'Dental care providers', id, 2
FROM service_categories WHERE name = 'Healthcare Wellness';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Mental Health', 'Mental health services', id, 3
FROM service_categories WHERE name = 'Healthcare Wellness';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Allied Health', 'Allied health services', id, 4
FROM service_categories WHERE name = 'Healthcare Wellness';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Wellness Personal', 'Personal wellness services', id, 5
FROM service_categories WHERE name = 'Healthcare Wellness';

-- Level 3: Medical subcategories
INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Hospitals', 'Hospital services', id, 1
FROM service_categories WHERE name = 'Medical Services';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Urgent Care', 'Urgent care clinics', id, 2
FROM service_categories WHERE name = 'Medical Services';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Specialty Clinics', 'Specialized medical clinics', id, 3
FROM service_categories WHERE name = 'Medical Services';

-- Level 3: Dental subcategories
INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'General Dentistry', 'General dental services', id, 1
FROM service_categories WHERE name = 'Dental Services';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Orthodontics', 'Orthodontic treatments', id, 2
FROM service_categories WHERE name = 'Dental Services';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Oral Surgery', 'Dental surgical procedures', id, 3
FROM service_categories WHERE name = 'Dental Services';

-- Level 3: Mental Health subcategories
INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Therapy Counseling', 'Therapy and counseling', id, 1
FROM service_categories WHERE name = 'Mental Health';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Psychiatry', 'Psychiatric services', id, 2
FROM service_categories WHERE name = 'Mental Health';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Addiction Treatment', 'Substance abuse treatment', id, 3
FROM service_categories WHERE name = 'Mental Health';

-- Level 3: Allied Health subcategories
INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Physical Therapy', 'Physical rehabilitation', id, 1
FROM service_categories WHERE name = 'Allied Health';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Occupational Therapy', 'Occupational rehabilitation', id, 2
FROM service_categories WHERE name = 'Allied Health';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Speech Therapy', 'Speech and language therapy', id, 3
FROM service_categories WHERE name = 'Allied Health';

-- Level 3: Wellness subcategories
INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Nutritionists', 'Nutrition counseling', id, 1
FROM service_categories WHERE name = 'Wellness Personal';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Personal Training', 'Fitness training', id, 2
FROM service_categories WHERE name = 'Wellness Personal';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Massage Therapy', 'Massage services', id, 3
FROM service_categories WHERE name = 'Wellness Personal';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Salons Spas', 'Beauty and spa services', id, 4
FROM service_categories WHERE name = 'Wellness Personal';

----------------------------------------------------------------
-- HOUSING HOME SERVICES - Level 2 & 3
----------------------------------------------------------------
-- Level 2: Home Service subcategories
INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Plumbing', 'Plumbing services', id, 1
FROM service_categories WHERE name = 'Housing Home Services';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Electrical', 'Electrical services', id, 2
FROM service_categories WHERE name = 'Housing Home Services';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'HVAC', 'Heating and cooling services', id, 3
FROM service_categories WHERE name = 'Housing Home Services';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Carpentry', 'Carpentry services', id, 4
FROM service_categories WHERE name = 'Housing Home Services';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Masonry', 'Masonry services', id, 5
FROM service_categories WHERE name = 'Housing Home Services';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Roofing', 'Roofing services', id, 6
FROM service_categories WHERE name = 'Housing Home Services';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Landscaping', 'Landscaping services', id, 7
FROM service_categories WHERE name = 'Housing Home Services';

-- Level 3: Plumbing subcategories
INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Drain Cleaning', 'Drain cleaning services', id, 1
FROM service_categories WHERE name = 'Plumbing' 
AND parent_id = (SELECT id FROM service_categories WHERE name = 'Housing Home Services');

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Pipe Fitting', 'Pipe installation and repair', id, 2
FROM service_categories WHERE name = 'Plumbing'
AND parent_id = (SELECT id FROM service_categories WHERE name = 'Housing Home Services');

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Gas Fitting', 'Gas line services', id, 3
FROM service_categories WHERE name = 'Plumbing'
AND parent_id = (SELECT id FROM service_categories WHERE name = 'Housing Home Services');

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Septic Services', 'Septic system services', id, 4
FROM service_categories WHERE name = 'Plumbing'
AND parent_id = (SELECT id FROM service_categories WHERE name = 'Housing Home Services');

-- Level 3: Electrical subcategories
INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Residential Wiring', 'Home electrical wiring', id, 1
FROM service_categories WHERE name = 'Electrical'
AND parent_id = (SELECT id FROM service_categories WHERE name = 'Housing Home Services');

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Generator Installation', 'Generator services', id, 2
FROM service_categories WHERE name = 'Electrical'
AND parent_id = (SELECT id FROM service_categories WHERE name = 'Housing Home Services');

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Lighting Repairs', 'Lighting services', id, 3
FROM service_categories WHERE name = 'Electrical'
AND parent_id = (SELECT id FROM service_categories WHERE name = 'Housing Home Services');

-- Level 3: HVAC subcategories
INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Heating Furnace', 'Heating system services', id, 1
FROM service_categories WHERE name = 'HVAC'
AND parent_id = (SELECT id FROM service_categories WHERE name = 'Housing Home Services');

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Air Conditioning', 'AC services', id, 2
FROM service_categories WHERE name = 'HVAC'
AND parent_id = (SELECT id FROM service_categories WHERE name = 'Housing Home Services');

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Refrigeration', 'Refrigeration services', id, 3
FROM service_categories WHERE name = 'HVAC'
AND parent_id = (SELECT id FROM service_categories WHERE name = 'Housing Home Services');

----------------------------------------------------------------
-- LEGAL COMMUNITY - Level 2
----------------------------------------------------------------
INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Family Law', 'Family legal services', id, 1
FROM service_categories WHERE name = 'Legal Community';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Immigration Law', 'Immigration services', id, 2
FROM service_categories WHERE name = 'Legal Community';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Estate Planning', 'Estate planning services', id, 3
FROM service_categories WHERE name = 'Legal Community';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Consumer Rights', 'Consumer protection', id, 4
FROM service_categories WHERE name = 'Legal Community';

----------------------------------------------------------------
-- EDUCATION CHILDCARE - Level 2
----------------------------------------------------------------
INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Schools', 'Educational institutions', id, 1
FROM service_categories WHERE name = 'Education Childcare';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Tutoring', 'Tutoring services', id, 2
FROM service_categories WHERE name = 'Education Childcare';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Childcare Daycare', 'Childcare services', id, 3
FROM service_categories WHERE name = 'Education Childcare';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Vocational Training', 'Career training', id, 4
FROM service_categories WHERE name = 'Education Childcare';

----------------------------------------------------------------
-- TRAVEL LEISURE - Level 2
----------------------------------------------------------------
INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Restaurants Cafes', 'Dining services', id, 1
FROM service_categories WHERE name = 'Travel Leisure';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Hotels Lodging', 'Accommodation services', id, 2
FROM service_categories WHERE name = 'Travel Leisure';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Travel Tourism', 'Travel services', id, 3
FROM service_categories WHERE name = 'Travel Leisure';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Fitness Gyms', 'Fitness centers', id, 4
FROM service_categories WHERE name = 'Travel Leisure';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Entertainment', 'Entertainment venues', id, 5
FROM service_categories WHERE name = 'Travel Leisure';

----------------------------------------------------------------
-- BUSINESS USER SERVICES - Level 1 Categories
----------------------------------------------------------------
INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Corporate Finance', 'Business financial services', id, 1
FROM service_categories WHERE name = 'Business User Services' AND parent_id IS NULL;

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Business Insurance', 'Commercial insurance', id, 2
FROM service_categories WHERE name = 'Business User Services' AND parent_id IS NULL;

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Professional Legal', 'Business legal services', id, 3
FROM service_categories WHERE name = 'Business User Services' AND parent_id IS NULL;

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Consulting Advisory', 'Business consulting', id, 4
FROM service_categories WHERE name = 'Business User Services' AND parent_id IS NULL;

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Technology IT', 'IT and technology services', id, 5
FROM service_categories WHERE name = 'Business User Services' AND parent_id IS NULL;

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Real Estate Construction', 'Commercial real estate', id, 6
FROM service_categories WHERE name = 'Business User Services' AND parent_id IS NULL;

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Marketing Communications', 'Marketing services', id, 7
FROM service_categories WHERE name = 'Business User Services' AND parent_id IS NULL;

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Business Support', 'Business support services', id, 8
FROM service_categories WHERE name = 'Business User Services' AND parent_id IS NULL;

----------------------------------------------------------------
-- CORPORATE FINANCE - Level 2 & 3
----------------------------------------------------------------
-- Level 2: Corporate Finance subcategories
INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Commercial Banking', 'Business banking', id, 1
FROM service_categories WHERE name = 'Corporate Finance';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Business Accounting', 'Business accounting', id, 2
FROM service_categories WHERE name = 'Corporate Finance';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Investment Banking', 'Investment services', id, 3
FROM service_categories WHERE name = 'Corporate Finance';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Corporate Tax', 'Business tax services', id, 4
FROM service_categories WHERE name = 'Corporate Finance';

-- Level 3: Business Accounting subcategories
INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Bookkeeping Business', 'Business bookkeeping', id, 1
FROM service_categories WHERE name = 'Business Accounting';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Payroll Services', 'Payroll processing', id, 2
FROM service_categories WHERE name = 'Business Accounting';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Financial Audits', 'Audit services', id, 3
FROM service_categories WHERE name = 'Business Accounting';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Financial Reporting', 'Financial statements', id, 4
FROM service_categories WHERE name = 'Business Accounting';

----------------------------------------------------------------
-- BUSINESS INSURANCE - Level 2
----------------------------------------------------------------
INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Commercial Property', 'Property insurance', id, 1
FROM service_categories WHERE name = 'Business Insurance';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'General Liability', 'Liability insurance', id, 2
FROM service_categories WHERE name = 'Business Insurance';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Workers Compensation', 'Workers comp insurance', id, 3
FROM service_categories WHERE name = 'Business Insurance';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Group Health', 'Employee health insurance', id, 4
FROM service_categories WHERE name = 'Business Insurance';

----------------------------------------------------------------
-- PROFESSIONAL LEGAL - Level 2
----------------------------------------------------------------
INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Corporate Law', 'Corporate legal services', id, 1
FROM service_categories WHERE name = 'Professional Legal';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Intellectual Property', 'IP legal services', id, 2
FROM service_categories WHERE name = 'Professional Legal';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Contract Litigation', 'Contract disputes', id, 3
FROM service_categories WHERE name = 'Professional Legal';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Compliance Regulatory', 'Compliance services', id, 4
FROM service_categories WHERE name = 'Professional Legal';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Mergers Acquisitions', 'M&A services', id, 5
FROM service_categories WHERE name = 'Professional Legal';

----------------------------------------------------------------
-- CONSULTING ADVISORY - Level 2
----------------------------------------------------------------
INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Management Consulting', 'Management consulting', id, 1
FROM service_categories WHERE name = 'Consulting Advisory';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Strategy Consulting', 'Strategy services', id, 2
FROM service_categories WHERE name = 'Consulting Advisory';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'IT Consulting', 'IT consulting', id, 3
FROM service_categories WHERE name = 'Consulting Advisory';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'HR Consulting', 'HR consulting', id, 4
FROM service_categories WHERE name = 'Consulting Advisory';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Risk Management', 'Risk consulting', id, 5
FROM service_categories WHERE name = 'Consulting Advisory';

----------------------------------------------------------------
-- TECHNOLOGY IT - Level 2 & 3
----------------------------------------------------------------
-- Level 2: Technology subcategories
INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Managed IT', 'Managed IT services', id, 1
FROM service_categories WHERE name = 'Technology IT';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'IT Support', 'Technical support', id, 2
FROM service_categories WHERE name = 'Technology IT';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Cloud Services', 'Cloud computing', id, 3
FROM service_categories WHERE name = 'Technology IT';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Cybersecurity', 'Security services', id, 4
FROM service_categories WHERE name = 'Technology IT';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Software Development', 'Software development', id, 5
FROM service_categories WHERE name = 'Technology IT';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Data Analytics', 'Data services', id, 6
FROM service_categories WHERE name = 'Technology IT';

-- Level 3: Software Development subcategories
INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Web Development', 'Web applications', id, 1
FROM service_categories WHERE name = 'Software Development';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Mobile Development', 'Mobile apps', id, 2
FROM service_categories WHERE name = 'Software Development';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Enterprise Software', 'Enterprise solutions', id, 3
FROM service_categories WHERE name = 'Software Development';

----------------------------------------------------------------
-- MARKETING COMMUNICATIONS - Level 2
----------------------------------------------------------------
INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Advertising Agencies', 'Advertising services', id, 1
FROM service_categories WHERE name = 'Marketing Communications';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Public Relations', 'PR services', id, 2
FROM service_categories WHERE name = 'Marketing Communications';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Market Research', 'Research services', id, 3
FROM service_categories WHERE name = 'Marketing Communications';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Digital Marketing', 'Digital marketing', id, 4
FROM service_categories WHERE name = 'Marketing Communications';

----------------------------------------------------------------
-- BUSINESS SUPPORT - Level 2
----------------------------------------------------------------
INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Virtual Assistants', 'Virtual assistant services', id, 1
FROM service_categories WHERE name = 'Business Support';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Call Centers', 'Call center services', id, 2
FROM service_categories WHERE name = 'Business Support';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Translation Services', 'Translation services', id, 3
FROM service_categories WHERE name = 'Business Support';

INSERT INTO service_categories (name, description, parent_id, sort_order)
SELECT 'Event Management', 'Event planning', id, 4
FROM service_categories WHERE name = 'Business Support';

----------------------------------------------------------------
-- Update sequences to prevent ID conflicts
----------------------------------------------------------------
UPDATE sqlite_sequence 
SET seq = (SELECT MAX(id) FROM service_categories) 
WHERE name = 'service_categories';

----------------------------------------------------------------
-- Verification query
----------------------------------------------------------------
SELECT 
    'Total Categories: ' || COUNT(*) as summary,
    'Root Categories: ' || SUM(CASE WHEN parent_id IS NULL THEN 1 ELSE 0 END) as roots,
    'Level 1 Categories: ' || SUM(CASE WHEN parent_id IN (SELECT id FROM service_categories WHERE parent_id IS NULL) THEN 1 ELSE 0 END) as level1,
    'Leaf Categories: ' || SUM(CASE WHEN id NOT IN (SELECT DISTINCT parent_id FROM service_categories WHERE parent_id IS NOT NULL) THEN 1 ELSE 0 END) as leaves
FROM service_categories;