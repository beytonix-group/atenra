----------------------------------------------------------------
-- Company Service Categories Associations (Fixed)
-- Maps companies to their service categories using correct category names
----------------------------------------------------------------

-- Financial Services Companies
INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'first-national-bank' AND sc.name = 'Retail Banking';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'union-credit-cooperative' AND sc.name = 'Credit Unions';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'precision-bookkeeping' AND sc.name = 'Bookkeeping Business';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'cleartax-consulting' AND sc.name = 'Tax Preparation';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'wealthwise-financial' AND sc.name = 'Financial Planning';

-- Healthcare Companies
INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'city-hospital' AND sc.name = 'Hospitals';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'quickcare-urgent-clinic' AND sc.name = 'Urgent Care';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'heart-and-lung-specialty-clinic' AND sc.name = 'Specialty Clinics';

-- Dental Services
INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'smile-dental' AND sc.name = 'General Dentistry';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'align-orthodontics' AND sc.name = 'Orthodontics';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'oralcare-surgery-center' AND sc.name = 'Oral Surgery';

-- Mental Health Services
INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'mindbalance-therapy' AND sc.name = 'Therapy Counseling';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'peak-psychiatry' AND sc.name = 'Psychiatry';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'recovery-path' AND sc.name = 'Addiction Treatment';

-- Therapy Services
INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'movewell-physical-therapy' AND sc.name = 'Physical Therapy';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'skillmotion-occupational-therapy' AND sc.name = 'Occupational Therapy';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'speechease-therapy' AND sc.name = 'Speech Therapy';

-- Wellness Services
INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'nutriguide' AND sc.name = 'Nutritionists';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'fitpro-training' AND sc.name = 'Personal Training';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'relaxation-spa' AND sc.name = 'Massage Therapy';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'luxury-salon-and-spa' AND sc.name = 'Salons Spas';

-- Plumbing Services
INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'flow-rite-plumbing-co' AND sc.name = 'Drain Cleaning';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'pipemasters' AND sc.name = 'Pipe Fitting';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'gassafe-installers' AND sc.name = 'Gas Fitting';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'septic-solutions' AND sc.name = 'Septic Services';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'plumbright-industrial' AND sc.name = 'Plumbing';

-- Electrical Services
INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'brightwire-electric' AND sc.name = 'Residential Wiring';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'genpower-installers' AND sc.name = 'Generator Installation';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'lightfix-solutions' AND sc.name = 'Lighting Repairs';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'highvolt-electrical' AND sc.name = 'Electrical';

-- HVAC Services
INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'airflow-solutions-hvac' AND sc.name = 'Heating Furnace';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'coolbreeze-hvac' AND sc.name = 'Air Conditioning';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'freezetech-refrigeration' AND sc.name = 'Refrigeration';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'coolair-hvac' AND sc.name = 'HVAC';

-- Carpentry Services
INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'craftsman-carpentry' AND sc.name = 'Carpentry';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'cabinetpro' AND sc.name = 'Carpentry';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'finishworks' AND sc.name = 'Carpentry';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'mastercarpentry' AND sc.name = 'Carpentry';

-- Masonry Services
INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'stonecraft-masonry' AND sc.name = 'Masonry';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'rocksolid' AND sc.name = 'Masonry';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'concrete-pros' AND sc.name = 'Masonry';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'masonworks' AND sc.name = 'Masonry';

-- Roofing Services
INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'peak-roofing-solutions' AND sc.name = 'Roofing';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'metalmasters' AND sc.name = 'Roofing';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'flatroof-solutions' AND sc.name = 'Roofing';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'roofpro-solutions' AND sc.name = 'Roofing';

-- Landscaping Services
INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'treemight-arborists' AND sc.name = 'Landscaping';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'irrigate-pros' AND sc.name = 'Landscaping';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'lawn-masters' AND sc.name = 'Landscaping';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'stumpbusters' AND sc.name = 'Landscaping';

-- Legal Services
INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'familyfirst-law' AND sc.name = 'Family Law';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'crossborder-immigration-services' AND sc.name = 'Immigration Law';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'estatewise-planning' AND sc.name = 'Estate Planning';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'consumerprotect' AND sc.name = 'Consumer Rights';

-- Education Services
INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'bright-futures-school' AND sc.name = 'Schools';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'smarttutors' AND sc.name = 'Tutoring';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'little-stars-daycare' AND sc.name = 'Childcare Daycare';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'careertech-vocational' AND sc.name = 'Vocational Training';

-- Travel & Hospitality
INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'city-bites-cafe' AND sc.name = 'Restaurants Cafes';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'urban-stay-hotels' AND sc.name = 'Hotels Lodging';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'skyhigh-airlines' AND sc.name = 'Travel Tourism';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'fitzone-gym' AND sc.name = 'Fitness Gyms';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'funtime-entertainment' AND sc.name = 'Entertainment';

-- Business Insurance
INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'secure-commercial-property' AND sc.name = 'Commercial Property';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'liability-shield' AND sc.name = 'General Liability';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'workerscomp-experts' AND sc.name = 'Workers Compensation';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'group-health-solutions' AND sc.name = 'Group Health';

-- Corporate Legal
INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'corporatelaw-partners' AND sc.name = 'Corporate Law';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'ip-protectors' AND sc.name = 'Intellectual Property';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'contractlitigation-group' AND sc.name = 'Contract Litigation';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'compliance-advisors' AND sc.name = 'Compliance Regulatory';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'm-and-a-solutions' AND sc.name = 'Mergers Acquisitions';

-- Business Consulting
INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'top-management-consultants' AND sc.name = 'Management Consulting';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'strategic-edge' AND sc.name = 'Strategy Consulting';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'it-insight-consulting' AND sc.name = 'IT Consulting';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'hr-solutions' AND sc.name = 'HR Consulting';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'riskguard-advisory' AND sc.name = 'Risk Management';

-- IT Services
INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'managed-it-pros' AND sc.name = 'Managed IT';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'helpdesk-heroes' AND sc.name = 'IT Support';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'cloudworks' AND sc.name = 'Cloud Services';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'cybershield' AND sc.name = 'Cybersecurity';

-- Software Development
INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'webapps-co' AND sc.name = 'Web Development';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'appmakers' AND sc.name = 'Mobile Development';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'enterprise-solutions-inc' AND sc.name = 'Enterprise Software';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'dataintel-analytics' AND sc.name = 'Data Analytics';

-- Real Estate & Construction
INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'leasepro-commercial' AND sc.name = 'Real Estate Construction';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'propmanage-solutions' AND sc.name = 'Real Estate Construction';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'civic-builders' AND sc.name = 'Real Estate Construction';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'highrise-constructors' AND sc.name = 'Real Estate Construction';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'industrial-complex-co' AND sc.name = 'Real Estate Construction';

-- Industrial Services (Map to closest available categories)
INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'weldtech' AND sc.name = 'Housing Home Services';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'machinex' AND sc.name = 'Housing Home Services';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'cnc-precision' AND sc.name = 'Housing Home Services';

-- Marketing & PR
INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'creative-ads-agency' AND sc.name = 'Advertising Agencies';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'pr-connect' AND sc.name = 'Public Relations';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'marketvision' AND sc.name = 'Market Research';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'lingualocal' AND sc.name = 'Translation Services';

-- Business Support Services
INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'notary-express' AND sc.name = 'Business Support';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'virtual-assist-co' AND sc.name = 'Virtual Assistants';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'callconnect-solutions' AND sc.name = 'Call Centers';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'payroll-experts' AND sc.name = 'Payroll Services';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'event-travel-co' AND sc.name = 'Event Management';

-- Research & Development (Map to Technology IT as closest category)
INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'clinical-trials-inc' AND sc.name = 'Healthcare Wellness';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'geneseq-labs' AND sc.name = 'Healthcare Wellness';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'material-science-co' AND sc.name = 'Technology IT';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'nanotech-research' AND sc.name = 'Technology IT';

INSERT INTO company_service_categories (company_id, category_id)
SELECT c.id, sc.id FROM companies c, service_categories sc
WHERE c.slug = 'nuclear-physics-labs' AND sc.name = 'Technology IT';

-- Verification query
SELECT COUNT(*) as total_associations FROM company_service_categories;