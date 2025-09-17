----------------------------------------------------------------
-- Service Categories Hierarchical Seed Data
----------------------------------------------------------------
-- NOTE: This script uses INSERT OR IGNORE which relies on auto-generated IDs
-- If you need predictable IDs for foreign keys, consider using explicit IDs
-- and running update-sequences.sql afterwards to fix autoincrement counters

-- ROOTS
INSERT OR IGNORE INTO service_categories (name, description, parent_id)
VALUES
('Normal User Services', 'Top-level: personal-facing services', NULL),
('Business User Services', 'Top-level: business-facing services', NULL);

----------------------------------------------------------------
-- Normal User Services
----------------------------------------------------------------
-- Level 1
INSERT OR IGNORE INTO service_categories (name, description, parent_id) VALUES
('Finance Personal', 'Personal finance categories', (SELECT id FROM service_categories WHERE name='Normal User Services' AND parent_id IS NULL)),
('Healthcare Wellness', 'Healthcare and wellness services', (SELECT id FROM service_categories WHERE name='Normal User Services' AND parent_id IS NULL)),
('Housing Home Services', 'Home improvement and housing-related services', (SELECT id FROM service_categories WHERE name='Normal User Services' AND parent_id IS NULL)),
('Legal Community', 'Legal and community services', (SELECT id FROM service_categories WHERE name='Normal User Services' AND parent_id IS NULL)),
('Education Childcare', 'Education and childcare services', (SELECT id FROM service_categories WHERE name='Normal User Services' AND parent_id IS NULL)),
('Travel Leisure', 'Travel and leisure services', (SELECT id FROM service_categories WHERE name='Normal User Services' AND parent_id IS NULL));

-- Finance Personal children
INSERT OR IGNORE INTO service_categories (name, description, parent_id) VALUES
('Retail Banking', 'Checking, savings, and personal lending services', (SELECT id FROM service_categories WHERE name='Finance Personal')),
('Credit Unions', 'Member-owned financial cooperative services', (SELECT id FROM service_categories WHERE name='Finance Personal')),
('Personal Accounting', 'Personal accounting categories', (SELECT id FROM service_categories WHERE name='Finance Personal')),
('Insurance Personal', 'Personal insurance categories', (SELECT id FROM service_categories WHERE name='Finance Personal'));

-- Personal Accounting grandchildren
INSERT OR IGNORE INTO service_categories (name, description, parent_id) VALUES
('General Bookkeeping', 'Daily bookkeeping and record-keeping services', (SELECT id FROM service_categories WHERE name='Personal Accounting')),
('Tax Preparation', 'Filing and advisory services for personal taxes', (SELECT id FROM service_categories WHERE name='Personal Accounting')),
('Financial Planning', 'Personal financial planning and investment guidance', (SELECT id FROM service_categories WHERE name='Personal Accounting'));

-- Insurance Personal grandchildren
INSERT OR IGNORE INTO service_categories (name, description, parent_id) VALUES
('Health', 'Health insurance coverage and benefits', (SELECT id FROM service_categories WHERE name='Insurance Personal')),
('Auto', 'Automobile insurance policies and claims services', (SELECT id FROM service_categories WHERE name='Insurance Personal')),
('Homeowners Renters', 'Homeowners and renters insurance solutions', (SELECT id FROM service_categories WHERE name='Insurance Personal')),
('Life Disability', 'Life and disability insurance products', (SELECT id FROM service_categories WHERE name='Insurance Personal'));

-- Healthcare Wellness children
INSERT OR IGNORE INTO service_categories (name, description, parent_id) VALUES
('Medical', 'Medical provider categories', (SELECT id FROM service_categories WHERE name='Healthcare Wellness')),
('Dental', 'Dental provider categories', (SELECT id FROM service_categories WHERE name='Healthcare Wellness')),
('Mental Health', 'Mental health services', (SELECT id FROM service_categories WHERE name='Healthcare Wellness')),
('Allied Health', 'Allied health services', (SELECT id FROM service_categories WHERE name='Healthcare Wellness')),
('Wellness Personal', 'Wellness, fitness, and beauty services', (SELECT id FROM service_categories WHERE name='Healthcare Wellness'));

-- Medical grandchildren
INSERT OR IGNORE INTO service_categories (name, description, parent_id) VALUES
('Hospitals', 'Comprehensive inpatient and outpatient medical services', (SELECT id FROM service_categories WHERE name='Medical')),
('Urgent Care', 'Immediate medical care for non-life-threatening conditions', (SELECT id FROM service_categories WHERE name='Medical')),
('Specialty Clinics', 'Specialized medical services and treatments', (SELECT id FROM service_categories WHERE name='Medical'));

-- Dental grandchildren
INSERT OR IGNORE INTO service_categories (name, description, parent_id) VALUES
('General', 'Routine dental check-ups and cleanings', (SELECT id FROM service_categories WHERE name='Dental')),
('Orthodontics', 'Braces, aligners, and orthodontic treatments', (SELECT id FROM service_categories WHERE name='Dental')),
('Oral Surgery', 'Dental surgical procedures and extractions', (SELECT id FROM service_categories WHERE name='Dental'));

-- Mental Health grandchildren
INSERT OR IGNORE INTO service_categories (name, description, parent_id) VALUES
('Therapy', 'Counseling and psychotherapy services', (SELECT id FROM service_categories WHERE name='Mental Health')),
('Psychiatry', 'Mental health evaluations and psychiatric care', (SELECT id FROM service_categories WHERE name='Mental Health')),
('Addiction Treatment', 'Programs for substance abuse recovery', (SELECT id FROM service_categories WHERE name='Mental Health'));

-- Allied Health grandchildren
INSERT OR IGNORE INTO service_categories (name, description, parent_id) VALUES
('Physical Therapy', 'Rehabilitation for injuries and mobility improvement', (SELECT id FROM service_categories WHERE name='Allied Health')),
('Occupational Therapy', 'Support for daily living and occupational skills', (SELECT id FROM service_categories WHERE name='Allied Health')),
('Speech Therapy', 'Speech, language, and communication therapy', (SELECT id FROM service_categories WHERE name='Allied Health'));

-- Wellness Personal grandchildren
INSERT OR IGNORE INTO service_categories (name, description, parent_id) VALUES
('Nutritionists', 'Personal nutrition and diet planning', (SELECT id FROM service_categories WHERE name='Wellness Personal')),
('Personal Training', 'Fitness coaching and personal exercise programs', (SELECT id FROM service_categories WHERE name='Wellness Personal')),
('Massage Therapy', 'Therapeutic massage and wellness treatments', (SELECT id FROM service_categories WHERE name='Wellness Personal')),
('Salons Spas', 'Hair, beauty, and spa services', (SELECT id FROM service_categories WHERE name='Wellness Personal'));

-- Housing Home Services children
INSERT OR IGNORE INTO service_categories (name, description, parent_id) VALUES
('Plumbing', 'Plumbing categories', (SELECT id FROM service_categories WHERE name='Housing Home Services')),
('Electrical', 'Electrical categories', (SELECT id FROM service_categories WHERE name='Housing Home Services')),
('HVAC', 'Heating, ventilation, and air conditioning', (SELECT id FROM service_categories WHERE name='Housing Home Services')),
('Carpentry', 'Carpentry categories', (SELECT id FROM service_categories WHERE name='Housing Home Services')),
('Masonry', 'Masonry categories', (SELECT id FROM service_categories WHERE name='Housing Home Services')),
('Roofing', 'Roofing categories', (SELECT id FROM service_categories WHERE name='Housing Home Services')),
('Landscaping', 'Landscaping categories', (SELECT id FROM service_categories WHERE name='Housing Home Services'));

-- Plumbing grandchildren
INSERT OR IGNORE INTO service_categories (name, description, parent_id) VALUES
('Drain Cleaning', 'Cleaning and maintenance of plumbing drains', (SELECT id FROM service_categories WHERE name='Plumbing' AND parent_id=(SELECT id FROM service_categories WHERE name='Housing Home Services'))),
('Pipe Fitting', 'Installation and repair of plumbing pipes', (SELECT id FROM service_categories WHERE name='Plumbing' AND parent_id=(SELECT id FROM service_categories WHERE name='Housing Home Services'))),
('Gas Fitting', 'Gas line installation and maintenance', (SELECT id FROM service_categories WHERE name='Plumbing' AND parent_id=(SELECT id FROM service_categories WHERE name='Housing Home Services'))),
('Septic Services', 'Septic system installation and repair', (SELECT id FROM service_categories WHERE name='Plumbing' AND parent_id=(SELECT id FROM service_categories WHERE name='Housing Home Services')));

-- Electrical grandchildren
INSERT OR IGNORE INTO service_categories (name, description, parent_id) VALUES
('Residential Wiring', 'Electrical wiring and repair for homes', (SELECT id FROM service_categories WHERE name='Electrical' AND parent_id=(SELECT id FROM service_categories WHERE name='Housing Home Services'))),
('Generator Installation', 'Backup generator installation and maintenance', (SELECT id FROM service_categories WHERE name='Electrical' AND parent_id=(SELECT id FROM service_categories WHERE name='Housing Home Services'))),
('Lighting Repairs', 'Indoor and outdoor lighting repair services', (SELECT id FROM service_categories WHERE name='Electrical' AND parent_id=(SELECT id FROM service_categories WHERE name='Housing Home Services')));

-- HVAC grandchildren
INSERT OR IGNORE INTO service_categories (name, description, parent_id) VALUES
('Heating Furnace', 'Installation and maintenance of heating systems', (SELECT id FROM service_categories WHERE name='HVAC' AND parent_id=(SELECT id FROM service_categories WHERE name='Housing Home Services'))),
('Air Conditioning', 'AC installation, repair, and maintenance', (SELECT id FROM service_categories WHERE name='HVAC' AND parent_id=(SELECT id FROM service_categories WHERE name='Housing Home Services'))),
('Refrigeration', 'Commercial and residential refrigeration services', (SELECT id FROM service_categories WHERE name='HVAC' AND parent_id=(SELECT id FROM service_categories WHERE name='Housing Home Services')));

-- Carpentry grandchildren
INSERT OR IGNORE INTO service_categories (name, description, parent_id) VALUES
('Framing', 'Structural framing and carpentry work', (SELECT id FROM service_categories WHERE name='Carpentry' AND parent_id=(SELECT id FROM service_categories WHERE name='Housing Home Services'))),
('Cabinetry', 'Custom cabinets and wood storage solutions', (SELECT id FROM service_categories WHERE name='Carpentry' AND parent_id=(SELECT id FROM service_categories WHERE name='Housing Home Services'))),
('Finish Work', 'Interior finish carpentry work', (SELECT id FROM service_categories WHERE name='Carpentry' AND parent_id=(SELECT id FROM service_categories WHERE name='Housing Home Services')));

-- Masonry grandchildren
INSERT OR IGNORE INTO service_categories (name, description, parent_id) VALUES
('Brick', 'Brick masonry construction and repair', (SELECT id FROM service_categories WHERE name='Masonry' AND parent_id=(SELECT id FROM service_categories WHERE name='Housing Home Services'))),
('Stone', 'Stone masonry and hardscape services', (SELECT id FROM service_categories WHERE name='Masonry' AND parent_id=(SELECT id FROM service_categories WHERE name='Housing Home Services'))),
('Concrete', 'Concrete installation, repair, and finishing', (SELECT id FROM service_categories WHERE name='Masonry' AND parent_id=(SELECT id FROM service_categories WHERE name='Housing Home Services')));

-- Roofing grandchildren
INSERT OR IGNORE INTO service_categories (name, description, parent_id) VALUES
('Shingle', 'Shingle roof installation and repair services', (SELECT id FROM service_categories WHERE name='Roofing' AND parent_id=(SELECT id FROM service_categories WHERE name='Housing Home Services'))),
('Metal', 'Metal roofing services and installation', (SELECT id FROM service_categories WHERE name='Roofing' AND parent_id=(SELECT id FROM service_categories WHERE name='Housing Home Services'))),
('Flat', 'Flat roof construction and maintenance', (SELECT id FROM service_categories WHERE name='Roofing' AND parent_id=(SELECT id FROM service_categories WHERE name='Housing Home Services')));

-- Landscaping grandchildren
INSERT OR IGNORE INTO service_categories (name, description, parent_id) VALUES
('Tree Care', 'Tree trimming, pruning, and health services', (SELECT id FROM service_categories WHERE name='Landscaping')),
('Irrigation', 'Sprinkler and irrigation system installation', (SELECT id FROM service_categories WHERE name='Landscaping')),
('Lawn Turf', 'Lawn and turf installation and maintenance', (SELECT id FROM service_categories WHERE name='Landscaping')),
('Stump Removal', 'Tree stump removal and grinding services', (SELECT id FROM service_categories WHERE name='Landscaping'));

-- Legal Community children
INSERT OR IGNORE INTO service_categories (name, description, parent_id) VALUES
('Family Law', 'Legal services for family law matters', (SELECT id FROM service_categories WHERE name='Legal Community')),
('Immigration', 'Immigration legal services and visa assistance', (SELECT id FROM service_categories WHERE name='Legal Community')),
('Estate Planning', 'Wills, trusts, and estate management', (SELECT id FROM service_categories WHERE name='Legal Community')),
('Consumer Rights', 'Protection of consumer rights and disputes', (SELECT id FROM service_categories WHERE name='Legal Community'));

-- Education Childcare children
INSERT OR IGNORE INTO service_categories (name, description, parent_id) VALUES
('Schools', 'Primary, secondary, and high schools', (SELECT id FROM service_categories WHERE name='Education Childcare')),
('Tutoring', 'Academic tutoring and test preparation', (SELECT id FROM service_categories WHERE name='Education Childcare')),
('Childcare Daycare', 'Childcare, daycare, and early learning services', (SELECT id FROM service_categories WHERE name='Education Childcare')),
('Vocational Training', 'Career and technical training programs', (SELECT id FROM service_categories WHERE name='Education Childcare'));

-- Travel Leisure children
INSERT OR IGNORE INTO service_categories (name, description, parent_id) VALUES
('Restaurants Cafes', 'Food and beverage services including dining', (SELECT id FROM service_categories WHERE name='Travel Leisure')),
('Hotels Airbnb', 'Short-term lodging and hospitality services', (SELECT id FROM service_categories WHERE name='Travel Leisure')),
('Airlines Tourism', 'Air travel and tourism services', (SELECT id FROM service_categories WHERE name='Travel Leisure')),
('Fitness Gyms', 'Physical fitness centers and gym services', (SELECT id FROM service_categories WHERE name='Travel Leisure')),
('Entertainment', 'Movies, amusement parks, theaters, and live shows', (SELECT id FROM service_categories WHERE name='Travel Leisure'));

----------------------------------------------------------------
-- Business User Services
----------------------------------------------------------------
-- Level 1
INSERT OR IGNORE INTO service_categories (name, description, parent_id) VALUES
('Corporate Finance', 'Corporate finance categories', (SELECT id FROM service_categories WHERE name='Business User Services' AND parent_id IS NULL)),
('Business Insurance', 'Business insurance categories', (SELECT id FROM service_categories WHERE name='Business User Services' AND parent_id IS NULL)),
('Professional Legal', 'Corporate legal services', (SELECT id FROM service_categories WHERE name='Business User Services' AND parent_id IS NULL)),
('Consulting Advisory', 'Consulting and advisory services', (SELECT id FROM service_categories WHERE name='Business User Services' AND parent_id IS NULL)),
('Technology IT', 'IT and software services', (SELECT id FROM service_categories WHERE name='Business User Services' AND parent_id IS NULL)),
('RealEstate Construction', 'Real estate & construction', (SELECT id FROM service_categories WHERE name='Business User Services' AND parent_id IS NULL)),
('Marketing Communications', 'Marketing and communications', (SELECT id FROM service_categories WHERE name='Business User Services' AND parent_id IS NULL)),
('Business Support', 'Business support services', (SELECT id FROM service_categories WHERE name='Business User Services' AND parent_id IS NULL)),
('Industrial Research', 'Industrial R&D services', (SELECT id FROM service_categories WHERE name='Business User Services' AND parent_id IS NULL));

-- Corporate Finance children
INSERT OR IGNORE INTO service_categories (name, description, parent_id) VALUES
('Commercial Banking', 'Business checking, loans, and credit services', (SELECT id FROM service_categories WHERE name='Corporate Finance')),
('Business Accounting', 'Business accounting categories', (SELECT id FROM service_categories WHERE name='Corporate Finance')),
('Investment Banking', 'Advisory and capital raising services for businesses', (SELECT id FROM service_categories WHERE name='Corporate Finance')),
('Corporate Tax', 'Corporate tax planning and filing services', (SELECT id FROM service_categories WHERE name='Corporate Finance'));

-- Business Accounting grandchildren
INSERT OR IGNORE INTO service_categories (name, description, parent_id) VALUES
('General Bookkeeping', 'Business bookkeeping and accounting services', (SELECT id FROM service_categories WHERE name='Business Accounting')),
('Payroll', 'Payroll processing and employee payment services', (SELECT id FROM service_categories WHERE name='Business Accounting')),
('Forensic Audits', 'Investigative accounting and audit services', (SELECT id FROM service_categories WHERE name='Business Accounting')),
('Financial Statements', 'Preparation of corporate financial statements', (SELECT id FROM service_categories WHERE name='Business Accounting'));

-- Business Insurance children
INSERT OR IGNORE INTO service_categories (name, description, parent_id) VALUES
('Commercial Property', 'Insurance coverage for commercial buildings and property', (SELECT id FROM service_categories WHERE name='Business Insurance')),
('General Liability', 'Business liability insurance solutions', (SELECT id FROM service_categories WHERE name='Business Insurance')),
('Workers Comp', 'Worker compensation insurance services', (SELECT id FROM service_categories WHERE name='Business Insurance')),
('Group Health', 'Health insurance plans for employees', (SELECT id FROM service_categories WHERE name='Business Insurance'));

-- Professional Legal children
INSERT OR IGNORE INTO service_categories (name, description, parent_id) VALUES
('Corporate Law', 'Legal services for corporations and business entities', (SELECT id FROM service_categories WHERE name='Professional Legal')),
('Intellectual Property', 'Patent, trademark, and IP legal services', (SELECT id FROM service_categories WHERE name='Professional Legal')),
('Contract Litigation', 'Legal representation in contract disputes', (SELECT id FROM service_categories WHERE name='Professional Legal')),
('Compliance Regulatory', 'Compliance consulting for business regulations', (SELECT id FROM service_categories WHERE name='Professional Legal')),
('Mergers Acquisitions', 'Advisory services for mergers and acquisitions', (SELECT id FROM service_categories WHERE name='Professional Legal'));

-- Consulting Advisory children
INSERT OR IGNORE INTO service_categories (name, description, parent_id) VALUES
('Management', 'Management consulting for operational efficiency', (SELECT id FROM service_categories WHERE name='Consulting Advisory')),
('Strategy', 'Business strategy planning and execution', (SELECT id FROM service_categories WHERE name='Consulting Advisory')),
('IT Consulting', 'Information technology consulting services', (SELECT id FROM service_categories WHERE name='Consulting Advisory')),
('HR Personnel', 'Human resources and personnel management consulting', (SELECT id FROM service_categories WHERE name='Consulting Advisory')),
('Risk Management', 'Enterprise risk analysis and mitigation consulting', (SELECT id FROM service_categories WHERE name='Consulting Advisory'));

-- Technology IT children
INSERT OR IGNORE INTO service_categories (name, description, parent_id) VALUES
('Managed IT', 'Managed IT services and system administration', (SELECT id FROM service_categories WHERE name='Technology IT')),
('Helpdesk', 'Technical support and helpdesk services', (SELECT id FROM service_categories WHERE name='Technology IT')),
('Cloud Infrastructure', 'Cloud computing and infrastructure management', (SELECT id FROM service_categories WHERE name='Technology IT')),
('Cybersecurity', 'Business cybersecurity services and protection', (SELECT id FROM service_categories WHERE name='Technology IT')),
('Software Development', 'Software development categories', (SELECT id FROM service_categories WHERE name='Technology IT')),
('Data Analytics', 'Business intelligence and data analytics services', (SELECT id FROM service_categories WHERE name='Technology IT'));

-- Software Development grandchildren
INSERT OR IGNORE INTO service_categories (name, description, parent_id) VALUES
('Web Applications', 'Development of web-based applications', (SELECT id FROM service_categories WHERE name='Software Development')),
('Mobile Apps', 'Design and development of mobile applications', (SELECT id FROM service_categories WHERE name='Software Development')),
('Enterprise Solutions', 'Custom enterprise software development', (SELECT id FROM service_categories WHERE name='Software Development'));

-- RealEstate Construction children
INSERT OR IGNORE INTO service_categories (name, description, parent_id) VALUES
('Commercial Leasing', 'Leasing and rental services for commercial properties', (SELECT id FROM service_categories WHERE name='RealEstate Construction')),
('Property Management', 'Management of commercial and residential properties', (SELECT id FROM service_categories WHERE name='RealEstate Construction')),
('General Contracting Commercial', 'Commercial general contracting categories', (SELECT id FROM service_categories WHERE name='RealEstate Construction')),
('Specialized Trades', 'Specialized commercial trades', (SELECT id FROM service_categories WHERE name='RealEstate Construction')),
('Fabrication Metalwork', 'Metal fabrication categories', (SELECT id FROM service_categories WHERE name='RealEstate Construction'));

-- General Contracting Commercial grandchildren
INSERT OR IGNORE INTO service_categories (name, description, parent_id) VALUES
('Civil Infrastructure', 'Civil construction and infrastructure projects', (SELECT id FROM service_categories WHERE name='General Contracting Commercial')),
('HighRise Construction', 'Construction of high-rise commercial buildings', (SELECT id FROM service_categories WHERE name='General Contracting Commercial')),
('Industrial Complexes', 'Industrial complex construction and management', (SELECT id FROM service_categories WHERE name='General Contracting Commercial'));

-- Specialized Trades grandchildren (as separate leaf nodes under this business branch)
INSERT OR IGNORE INTO service_categories (name, description, parent_id) VALUES
('Plumbing', 'Commercial plumbing including drain, pipe, gas, and septic', (SELECT id FROM service_categories WHERE name='Specialized Trades')),
('Electrical', 'Commercial electrical services including high voltage and lighting', (SELECT id FROM service_categories WHERE name='Specialized Trades')),
('HVAC', 'Commercial heating, ventilation, and air conditioning services', (SELECT id FROM service_categories WHERE name='Specialized Trades')),
('Carpentry', 'Commercial carpentry including framing, cabinetry, finish work', (SELECT id FROM service_categories WHERE name='Specialized Trades')),
('Masonry', 'Concrete, brick, and stone masonry services', (SELECT id FROM service_categories WHERE name='Specialized Trades')),
('Roofing', 'Commercial roofing services including flat, metal, shingle', (SELECT id FROM service_categories WHERE name='Specialized Trades'));

-- Fabrication Metalwork grandchildren
INSERT OR IGNORE INTO service_categories (name, description, parent_id) VALUES
('Welding', 'Structural, pipeline, and micro welding services', (SELECT id FROM service_categories WHERE name='Fabrication Metalwork')),
('Machining', 'Metal machining and fabrication services', (SELECT id FROM service_categories WHERE name='Fabrication Metalwork')),
('CNC Milling', 'Precision CNC milling and metal cutting services', (SELECT id FROM service_categories WHERE name='Fabrication Metalwork'));

-- Marketing Communications children
INSERT OR IGNORE INTO service_categories (name, description, parent_id) VALUES
('Advertising Agencies', 'Advertising and creative marketing agencies', (SELECT id FROM service_categories WHERE name='Marketing Communications')),
('Public Relations', 'Public relations and media management services', (SELECT id FROM service_categories WHERE name='Marketing Communications')),
('Market Research', 'Market research, surveys, and analytics', (SELECT id FROM service_categories WHERE name='Marketing Communications')),
('Translation Localization', 'Language translation and localization services', (SELECT id FROM service_categories WHERE name='Marketing Communications'));

-- Business Support children
INSERT OR IGNORE INTO service_categories (name, description, parent_id) VALUES
('Notary Services', 'Business notary and document certification services', (SELECT id FROM service_categories WHERE name='Business Support')),
('Virtual Assistants', 'Remote administrative and virtual assistant services', (SELECT id FROM service_categories WHERE name='Business Support')),
('Call Centers', 'Business call center and customer support services', (SELECT id FROM service_categories WHERE name='Business Support')),
('Payroll Services', 'Corporate payroll processing services', (SELECT id FROM service_categories WHERE name='Business Support')),
('Event Travel Management', 'Corporate event planning and travel management', (SELECT id FROM service_categories WHERE name='Business Support'));

-- Industrial Research children
INSERT OR IGNORE INTO service_categories (name, description, parent_id) VALUES
('Clinical Trials', 'Clinical research and trial management services', (SELECT id FROM service_categories WHERE name='Industrial Research')),
('Genetic Sequencing', 'Genetic sequencing and analysis services', (SELECT id FROM service_categories WHERE name='Industrial Research')),
('Materials Science', 'Research and development in materials science', (SELECT id FROM service_categories WHERE name='Industrial Research')),
('Nanotechnology', 'Research and applications in nanotechnology', (SELECT id FROM service_categories WHERE name='Industrial Research')),
('Nuclear Physics', 'Research and consulting in nuclear physics', (SELECT id FROM service_categories WHERE name='Industrial Research'));