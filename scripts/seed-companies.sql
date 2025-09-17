-- IMPORTANT: This script uses explicit IDs which can cause autoincrement issues
-- After running this script, run update-sequences.sql to fix the autoincrement counters
-- This ensures new records won't conflict with these hardcoded IDs

-- Insert companies
INSERT INTO companies (id, name, slug, description, logo_url, website, email, phone, address_line1, city, state, zip_code, country, status) VALUES
-- Normal User Services Companies
(1, 'Sparkle Clean Services', 'sparkle-clean-services', 'Professional home cleaning services', 'https://example.com/logos/sparkle-clean.png', 'https://sparkleclean.com', 'contact@sparkleclean.com', '+1-555-0101', '123 Clean Street', 'New York', 'NY', '10001', 'USA', 'active'),
(2, 'Green Thumb Landscaping', 'green-thumb-landscaping', 'Expert lawn care and landscaping', 'https://example.com/logos/green-thumb.png', 'https://greenthumbland.com', 'info@greenthumbland.com', '+1-555-0102', '456 Garden Ave', 'Los Angeles', 'CA', '90001', 'USA', 'active'),
(3, 'Handy Helper Home Services', 'handy-helper-home-services', 'Professional handyman services', 'https://example.com/logos/handy-helper.png', 'https://handyhelper.com', 'help@handyhelper.com', '+1-555-0103', '789 Fix-It Blvd', 'Chicago', 'IL', '60601', 'USA', 'active'),
(4, 'Crystal Waters Pool Service', 'crystal-waters-pool-service', 'Pool cleaning and maintenance', 'https://example.com/logos/crystal-waters.png', 'https://crystalwaters.com', 'service@crystalwaters.com', '+1-555-0104', '321 Aqua Lane', 'Miami', 'FL', '33101', 'USA', 'active'),
(5, 'Plumb Perfect Solutions', 'plumb-perfect-solutions', 'Expert plumbing services', 'https://example.com/logos/plumb-perfect.png', 'https://plumbperfect.com', 'contact@plumbperfect.com', '+1-555-0105', '654 Pipe Road', 'Houston', 'TX', '77001', 'USA', 'active'),
(6, 'Bright Spark Electrical', 'bright-spark-electrical', '24/7 electrical services', 'https://example.com/logos/bright-spark.png', 'https://brightspark.com', 'info@brightspark.com', '+1-555-0106', '987 Electric Ave', 'Phoenix', 'AZ', '85001', 'USA', 'active'),
(7, 'Cool Breeze HVAC', 'cool-breeze-hvac', 'Heating and cooling specialists', 'https://example.com/logos/cool-breeze.png', 'https://coolbreezehvac.com', 'service@coolbreeze.com', '+1-555-0107', '246 Climate Dr', 'Philadelphia', 'PA', '19101', 'USA', 'active'),
(8, 'Happy Tails Pet Care', 'happy-tails-pet-care', 'Professional pet grooming and sitting', 'https://example.com/logos/happy-tails.png', 'https://happytails.com', 'pets@happytails.com', '+1-555-0108', '135 Pet Plaza', 'San Antonio', 'TX', '78201', 'USA', 'active'),
(9, 'Fit Life Personal Training', 'fit-life-personal-training', 'Certified personal trainers', 'https://example.com/logos/fit-life.png', 'https://fitlife.com', 'train@fitlife.com', '+1-555-0109', '864 Gym Street', 'San Diego', 'CA', '92101', 'USA', 'active'),
(10, 'Elite Tutoring Services', 'elite-tutoring-services', 'Academic tutoring for all ages', 'https://example.com/logos/elite-tutoring.png', 'https://elitetutoring.com', 'learn@elitetutoring.com', '+1-555-0110', '753 Education Way', 'Dallas', 'TX', '75201', 'USA', 'active'),
(11, 'Secure Home Systems', 'secure-home-systems', 'Home security installation', 'https://example.com/logos/secure-home.png', 'https://securehome.com', 'safety@securehome.com', '+1-555-0111', '951 Safety Blvd', 'San Jose', 'CA', '95101', 'USA', 'active'),
(12, 'Tech Support Heroes', 'tech-support-heroes', 'Computer repair and IT support', 'https://example.com/logos/tech-heroes.png', 'https://techheroes.com', 'help@techheroes.com', '+1-555-0112', '357 Tech Lane', 'Austin', 'TX', '78701', 'USA', 'active'),
(13, 'Gourmet Bites Catering', 'gourmet-bites-catering', 'Premium catering services', 'https://example.com/logos/gourmet-bites.png', 'https://gourmetbites.com', 'cater@gourmetbites.com', '+1-555-0113', '258 Cuisine Court', 'Seattle', 'WA', '98101', 'USA', 'active'),
(14, 'Wedding Bliss Planning', 'wedding-bliss-planning', 'Complete wedding planning services', 'https://example.com/logos/wedding-bliss.png', 'https://weddingbliss.com', 'plan@weddingbliss.com', '+1-555-0114', '456 Ceremony Ave', 'Denver', 'CO', '80201', 'USA', 'active'),
(15, 'Happy Faces Childcare', 'happy-faces-childcare', 'Licensed childcare services', 'https://example.com/logos/happy-faces.png', 'https://happyfaces.com', 'care@happyfaces.com', '+1-555-0115', '789 Kids Way', 'Boston', 'MA', '02101', 'USA', 'active'),

-- Business User Services Companies
(16, 'CloudTech Solutions', 'cloudtech-solutions', 'Enterprise cloud computing services', 'https://example.com/logos/cloudtech.png', 'https://cloudtech.com', 'enterprise@cloudtech.com', '+1-555-0201', '100 Cloud Drive', 'San Francisco', 'CA', '94101', 'USA', 'active'),
(17, 'DataGuard Security', 'dataguard-security', 'Cybersecurity and data protection', 'https://example.com/logos/dataguard.png', 'https://dataguard.com', 'security@dataguard.com', '+1-555-0202', '200 Secure Plaza', 'Washington', 'DC', '20001', 'USA', 'active'),
(18, 'NetFlow Systems', 'netflow-systems', 'Network infrastructure solutions', 'https://example.com/logos/netflow.png', 'https://netflow.com', 'network@netflow.com', '+1-555-0203', '300 Network Way', 'San Jose', 'CA', '95110', 'USA', 'active'),
(19, 'DevOps Pro Services', 'devops-pro-services', 'DevOps consulting and implementation', 'https://example.com/logos/devops-pro.png', 'https://devopspro.com', 'consult@devopspro.com', '+1-555-0204', '400 Pipeline Road', 'Seattle', 'WA', '98109', 'USA', 'active'),
(20, 'AI Innovations Lab', 'ai-innovations-lab', 'Artificial intelligence solutions', 'https://example.com/logos/ai-lab.png', 'https://ailab.com', 'ai@ailab.com', '+1-555-0205', '500 Intelligence Ave', 'Palo Alto', 'CA', '94301', 'USA', 'active'),
(21, 'Peak Performance Consulting', 'peak-performance-consulting', 'Business strategy and optimization', 'https://example.com/logos/peak-performance.png', 'https://peakperform.com', 'strategy@peakperform.com', '+1-555-0206', '600 Strategy Lane', 'New York', 'NY', '10011', 'USA', 'active'),
(22, 'Global Audit Partners', 'global-audit-partners', 'Financial auditing and compliance', 'https://example.com/logos/global-audit.png', 'https://globalaudit.com', 'audit@globalaudit.com', '+1-555-0207', '700 Compliance Court', 'Chicago', 'IL', '60611', 'USA', 'active'),
(23, 'Tax Masters Pro', 'tax-masters-pro', 'Corporate tax planning and filing', 'https://example.com/logos/tax-masters.png', 'https://taxmasters.com', 'tax@taxmasters.com', '+1-555-0208', '800 Tax Plaza', 'Atlanta', 'GA', '30301', 'USA', 'active'),
(24, 'Legal Eagle Associates', 'legal-eagle-associates', 'Corporate legal services', 'https://example.com/logos/legal-eagle.png', 'https://legaleagle.com', 'legal@legaleagle.com', '+1-555-0209', '900 Justice Way', 'Boston', 'MA', '02111', 'USA', 'active'),
(25, 'IP Shield Law', 'ip-shield-law', 'Intellectual property protection', 'https://example.com/logos/ip-shield.png', 'https://ipshield.com', 'ip@ipshield.com', '+1-555-0210', '1000 Patent Drive', 'San Francisco', 'CA', '94105', 'USA', 'active'),
(26, 'Brand Builders Marketing', 'brand-builders-marketing', 'Digital marketing and branding', 'https://example.com/logos/brand-builders.png', 'https://brandbuilders.com', 'brand@brandbuilders.com', '+1-555-0211', '1100 Marketing Ave', 'Los Angeles', 'CA', '90015', 'USA', 'active'),
(27, 'Social Pulse Media', 'social-pulse-media', 'Social media management', 'https://example.com/logos/social-pulse.png', 'https://socialpulse.com', 'social@socialpulse.com', '+1-555-0212', '1200 Social Street', 'Miami', 'FL', '33132', 'USA', 'active'),
(28, 'Content Craft Agency', 'content-craft-agency', 'Content creation and copywriting', 'https://example.com/logos/content-craft.png', 'https://contentcraft.com', 'content@contentcraft.com', '+1-555-0213', '1300 Creative Blvd', 'Austin', 'TX', '78702', 'USA', 'active'),
(29, 'SEO Experts Inc', 'seo-experts-inc', 'Search engine optimization', 'https://example.com/logos/seo-experts.png', 'https://seoexperts.com', 'seo@seoexperts.com', '+1-555-0214', '1400 Search Lane', 'Denver', 'CO', '80202', 'USA', 'active'),
(30, 'AdVantage PPC', 'advantage-ppc', 'Pay-per-click advertising', 'https://example.com/logos/advantage-ppc.png', 'https://advantageppc.com', 'ppc@advantageppc.com', '+1-555-0215', '1500 Click Road', 'Phoenix', 'AZ', '85004', 'USA', 'active'),
(31, 'Talent Scout HR', 'talent-scout-hr', 'Executive recruitment services', 'https://example.com/logos/talent-scout.png', 'https://talentscout.com', 'recruit@talentscout.com', '+1-555-0216', '1600 Talent Way', 'Dallas', 'TX', '75202', 'USA', 'active'),
(32, 'PayPro Solutions', 'paypro-solutions', 'Payroll and benefits management', 'https://example.com/logos/paypro.png', 'https://paypro.com', 'payroll@paypro.com', '+1-555-0217', '1700 Payroll Plaza', 'Houston', 'TX', '77002', 'USA', 'active'),
(33, 'Skill Builder Training', 'skill-builder-training', 'Corporate training programs', 'https://example.com/logos/skill-builder.png', 'https://skillbuilder.com', 'train@skillbuilder.com', '+1-555-0218', '1800 Training Court', 'Philadelphia', 'PA', '19102', 'USA', 'active'),
(34, 'Culture Shift Consulting', 'culture-shift-consulting', 'Organizational development', 'https://example.com/logos/culture-shift.png', 'https://cultureshift.com', 'culture@cultureshift.com', '+1-555-0219', '1900 Culture Ave', 'Portland', 'OR', '97201', 'USA', 'active'),
(35, 'Performance Plus Benefits', 'performance-plus-benefits', 'Employee benefits consulting', 'https://example.com/logos/performance-plus.png', 'https://performanceplus.com', 'benefits@performanceplus.com', '+1-555-0220', '2000 Benefits Blvd', 'San Diego', 'CA', '92102', 'USA', 'active'),
(36, 'Global Logistics Partners', 'global-logistics-partners', 'Supply chain management', 'https://example.com/logos/global-logistics.png', 'https://globallogistics.com', 'logistics@globallogistics.com', '+1-555-0221', '2100 Supply Way', 'Memphis', 'TN', '38101', 'USA', 'active'),
(37, 'FleetMax Management', 'fleetmax-management', 'Fleet management solutions', 'https://example.com/logos/fleetmax.png', 'https://fleetmax.com', 'fleet@fleetmax.com', '+1-555-0222', '2200 Fleet Road', 'Detroit', 'MI', '48201', 'USA', 'active'),
(38, 'Warehouse Pro Systems', 'warehouse-pro-systems', 'Warehouse management systems', 'https://example.com/logos/warehouse-pro.png', 'https://warehousepro.com', 'warehouse@warehousepro.com', '+1-555-0223', '2300 Storage Lane', 'Columbus', 'OH', '43201', 'USA', 'active'),
(39, 'Express Ship International', 'express-ship-international', 'International shipping services', 'https://example.com/logos/express-ship.png', 'https://expressship.com', 'ship@expressship.com', '+1-555-0224', '2400 Shipping Ave', 'Long Beach', 'CA', '90801', 'USA', 'active'),
(40, 'Inventory Genius', 'inventory-genius', 'Inventory management software', 'https://example.com/logos/inventory-genius.png', 'https://inventorygenius.com', 'inventory@inventorygenius.com', '+1-555-0225', '2500 Stock Street', 'Charlotte', 'NC', '28201', 'USA', 'active'),
(41, 'Capital Growth Advisors', 'capital-growth-advisors', 'Investment banking services', 'https://example.com/logos/capital-growth.png', 'https://capitalgrowth.com', 'invest@capitalgrowth.com', '+1-555-0226', '2600 Wall Street', 'New York', 'NY', '10005', 'USA', 'active'),
(42, 'Venture Bridge Partners', 'venture-bridge-partners', 'Venture capital funding', 'https://example.com/logos/venture-bridge.png', 'https://venturebridge.com', 'vc@venturebridge.com', '+1-555-0227', '2700 Innovation Way', 'Menlo Park', 'CA', '94025', 'USA', 'active'),
(43, 'Wealth Wise Management', 'wealth-wise-management', 'Wealth management services', 'https://example.com/logos/wealth-wise.png', 'https://wealthwise.com', 'wealth@wealthwise.com', '+1-555-0228', '2800 Prosperity Lane', 'Greenwich', 'CT', '06830', 'USA', 'active'),
(44, 'Risk Shield Insurance', 'risk-shield-insurance', 'Business insurance solutions', 'https://example.com/logos/risk-shield.png', 'https://riskshield.com', 'insurance@riskshield.com', '+1-555-0229', '2900 Coverage Blvd', 'Hartford', 'CT', '06101', 'USA', 'active'),
(45, 'Asset Pro Valuation', 'asset-pro-valuation', 'Asset valuation services', 'https://example.com/logos/asset-pro.png', 'https://assetpro.com', 'value@assetpro.com', '+1-555-0230', '3000 Value Court', 'Chicago', 'IL', '60604', 'USA', 'active');

-- Insert company_service_categories associations
-- Home Services
INSERT INTO company_service_categories (company_id, category_id) VALUES
(1, 2), -- Sparkle Clean -> Cleaning
(2, 3), -- Green Thumb -> Landscaping
(3, 4), -- Handy Helper -> Handyman
(4, 5), -- Crystal Waters -> Pool Cleaning
(5, 6), -- Plumb Perfect -> Plumbing
(6, 7), -- Bright Spark -> Electrical
(7, 8), -- Cool Breeze -> HVAC
(8, 9), -- Happy Tails -> Pet Care

-- Personal Services
(9, 11), -- Fit Life -> Personal Training
(10, 12), -- Elite Tutoring -> Tutoring
(11, 13), -- Secure Home -> Home Security
(12, 14), -- Tech Support Heroes -> Tech Support

-- Event Services
(13, 16), -- Gourmet Bites -> Catering
(14, 17), -- Wedding Bliss -> Wedding Planning
(15, 18), -- Happy Faces -> Child Care

-- Technology Services
(16, 20), -- CloudTech -> Cloud Computing
(17, 21), -- DataGuard -> Cybersecurity
(18, 22), -- NetFlow -> Network Solutions
(19, 23), -- DevOps Pro -> DevOps
(20, 24), -- AI Lab -> AI/ML

-- Business Consulting
(21, 26), -- Peak Performance -> Strategy Consulting
(22, 27), -- Global Audit -> Financial Auditing
(23, 28), -- Tax Masters -> Tax Services
(24, 29), -- Legal Eagle -> Business Law
(25, 30), -- IP Shield -> IP Law

-- Marketing Services
(26, 32), -- Brand Builders -> Digital Marketing
(27, 33), -- Social Pulse -> Social Media
(28, 34), -- Content Craft -> Content Creation
(29, 35), -- SEO Experts -> SEO
(30, 36), -- AdVantage -> PPC

-- Human Resources
(31, 38), -- Talent Scout -> Recruitment
(32, 39), -- PayPro -> Payroll
(33, 40), -- Skill Builder -> Training
(34, 41), -- Culture Shift -> Org Development
(35, 42), -- Performance Plus -> Benefits

-- Supply Chain
(36, 44), -- Global Logistics -> Logistics
(37, 45), -- FleetMax -> Fleet Management
(38, 46), -- Warehouse Pro -> Warehouse
(39, 47), -- Express Ship -> Shipping
(40, 48), -- Inventory Genius -> Inventory

-- Financial Services
(41, 50), -- Capital Growth -> Investment Banking
(42, 51), -- Venture Bridge -> VC
(43, 52), -- Wealth Wise -> Wealth Management
(44, 53), -- Risk Shield -> Insurance
(45, 54); -- Asset Pro -> Valuation

-- Add some companies to multiple categories for realistic associations
INSERT INTO company_service_categories (company_id, category_id) VALUES
-- Handy Helper also does plumbing and electrical
(3, 6), -- Handy Helper -> Plumbing
(3, 7), -- Handy Helper -> Electrical

-- Tech Support Heroes also does cybersecurity
(12, 21), -- Tech Support Heroes -> Cybersecurity

-- Legal Eagle also does IP Law
(24, 30), -- Legal Eagle -> IP Law

-- Brand Builders also does SEO and PPC
(26, 35), -- Brand Builders -> SEO
(26, 36); -- Brand Builders -> PPC

-- Update the autoincrement sequence to prevent ID conflicts
UPDATE sqlite_sequence 
SET seq = (SELECT MAX(id) FROM companies) 
WHERE name = 'companies';