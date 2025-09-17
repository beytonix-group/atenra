-- Clear existing associations
DELETE FROM company_service_categories;

-- Insert company_service_categories associations with correct category IDs
INSERT INTO company_service_categories (company_id, category_id) VALUES
-- Home Services Companies
-- Sparkle Clean Services -> no specific cleaning category, skip for now
-- Green Thumb Landscaping -> Landscaping (47)
(2, 47),
-- Handy Helper -> Carpentry (44) as closest to Handyman
(3, 44),
-- Crystal Waters Pool Service -> no specific pool category, skip
-- Plumb Perfect -> Plumbing (41)
(5, 41),
-- Bright Spark -> Electrical (42)
(6, 42),
-- Cool Breeze -> HVAC (43)
(7, 43),
-- Happy Tails Pet Care -> no specific pet care category

-- Personal Services
-- Fit Life -> Personal Training (38)
(9, 38),
-- Elite Tutoring -> Tutoring (76)
(10, 76),
-- Secure Home Systems -> no specific home security category
-- Tech Support Heroes -> Helpdesk (116) as IT support
(12, 116),

-- Event Services
-- Gourmet Bites Catering -> Restaurants Cafes (79) as closest
(13, 79),
-- Wedding Bliss Planning -> Event Travel Management (149)
(14, 149),
-- Happy Faces Childcare -> Childcare Daycare (77)
(15, 77),

-- Business Technology Services
-- CloudTech -> Cloud Infrastructure (117)
(16, 117),
-- DataGuard -> Cybersecurity (118)
(17, 118),
-- NetFlow Systems -> Managed IT (115) as network solutions
(18, 115),
-- DevOps Pro -> IT Consulting (112)
(19, 112),
-- AI Innovations Lab -> Data Analytics (120) as closest to AI/ML
(20, 120),

-- Business Consulting
-- Peak Performance -> Strategy (111)
(21, 111),
-- Global Audit -> Forensic Audits (99)
(22, 99),
-- Tax Masters -> Corporate Tax (96)
(23, 96),
-- Legal Eagle -> Corporate Law (105)
(24, 105),
-- IP Shield -> Intellectual Property (106)
(25, 106),

-- Marketing Services
-- Brand Builders -> Advertising Agencies (141)
(26, 141),
-- Social Pulse Media -> Public Relations (142) as social media mgmt
(27, 142),
-- Content Craft -> Advertising Agencies (141) for content creation
(28, 141),
-- SEO Experts -> Market Research (143) as closest to SEO
(29, 143),
-- AdVantage PPC -> Advertising Agencies (141)
(30, 141),

-- Human Resources
-- Talent Scout HR -> HR Personnel (113)
(31, 113),
-- PayPro Solutions -> Payroll Services (148)
(32, 148),
-- Skill Builder Training -> Vocational Training (78)
(33, 78),
-- Culture Shift -> Management (110) for org development
(34, 110),
-- Performance Plus Benefits -> Group Health (104) for employee benefits
(35, 104),

-- Supply Chain & Logistics - no direct matches in the categories
-- Global Logistics Partners -> no specific logistics category
-- FleetMax Management -> no specific fleet category
-- Warehouse Pro Systems -> no specific warehouse category
-- Express Ship International -> no specific shipping category
-- Inventory Genius -> no specific inventory category

-- Financial Services
-- Capital Growth -> Investment Banking (95)
(41, 95),
-- Venture Bridge Partners -> Investment Banking (95) for VC
(42, 95),
-- Wealth Wise Management -> Financial Planning (15)
(43, 15),
-- Risk Shield Insurance -> Commercial Property (101) for business insurance
(44, 101),
-- Asset Pro Valuation -> Financial Statements (100) as closest to valuation
(45, 100),

-- Add some cross-category associations for companies with multiple services
-- Handy Helper also does plumbing and electrical
(3, 41), -- Handy Helper -> Plumbing
(3, 42), -- Handy Helper -> Electrical

-- Tech Support Heroes also does cybersecurity
(12, 118), -- Tech Support Heroes -> Cybersecurity

-- Legal Eagle also does IP Law
(24, 106), -- Legal Eagle -> Intellectual Property (already added above)

-- Brand Builders also does market research
(26, 143), -- Brand Builders -> Market Research

-- Additional relevant associations
-- Green Thumb also does Tree Care and Irrigation
(2, 67), -- Green Thumb -> Tree Care
(2, 68), -- Green Thumb -> Irrigation

-- Plumb Perfect also does Drain Cleaning and Pipe Fitting
(5, 48), -- Plumb Perfect -> Drain Cleaning
(5, 49), -- Plumb Perfect -> Pipe Fitting

-- Bright Spark also does Residential Wiring and Lighting Repairs
(6, 52), -- Bright Spark -> Residential Wiring
(6, 54), -- Bright Spark -> Lighting Repairs

-- Cool Breeze also does Heating Furnace and Air Conditioning
(7, 55), -- Cool Breeze -> Heating Furnace
(7, 56); -- Cool Breeze -> Air Conditioning