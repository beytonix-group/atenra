-- Cleanup script to remove all data from marketplace tables
-- This will delete all data but keep the table structure intact

-- Delete in correct order due to foreign key constraints
DELETE FROM company_service_categories;
DELETE FROM companies;
DELETE FROM service_categories;

-- Reset the autoincrement sequences
UPDATE sqlite_sequence SET seq = 0 WHERE name = 'companies';
UPDATE sqlite_sequence SET seq = 0 WHERE name = 'service_categories';

-- Verify cleanup
SELECT 'company_service_categories' as table_name, COUNT(*) as count FROM company_service_categories
UNION ALL
SELECT 'companies', COUNT(*) FROM companies
UNION ALL
SELECT 'service_categories', COUNT(*) FROM service_categories;