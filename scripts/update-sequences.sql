-- Update SQLite sequences after seeding to ensure proper autoincrement values
-- This prevents ID conflicts when new records are inserted

-- Update service_categories sequence to the max ID + 1
UPDATE sqlite_sequence 
SET seq = (SELECT MAX(id) FROM service_categories) 
WHERE name = 'service_categories';

-- Update companies sequence to the max ID + 1
UPDATE sqlite_sequence 
SET seq = (SELECT MAX(id) FROM companies) 
WHERE name = 'companies';

-- Verify the sequences are set correctly
SELECT name, seq FROM sqlite_sequence 
WHERE name IN ('companies', 'service_categories');