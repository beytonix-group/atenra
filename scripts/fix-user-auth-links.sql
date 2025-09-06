-- Script to link existing users with their auth_users records
-- This fixes the issue where users table has records without auth_user_id

-- Update users table to link with auth_users based on matching email
UPDATE users 
SET auth_user_id = (
    SELECT id 
    FROM auth_users 
    WHERE auth_users.email = users.email
    LIMIT 1
)
WHERE auth_user_id IS NULL
AND EXISTS (
    SELECT 1 
    FROM auth_users 
    WHERE auth_users.email = users.email
);

-- Verify the update
SELECT 
    u.id as user_id,
    u.email,
    u.auth_user_id,
    au.id as auth_id,
    au.email as auth_email
FROM users u
LEFT JOIN auth_users au ON u.auth_user_id = au.id;