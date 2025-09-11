-- Restore user data after schema migration
-- This script restores the existing users and their roles

-- Insert users
INSERT INTO users (auth_user_id, email, password_hash, first_name, last_name, display_name, email_verified, status) VALUES
    ('d7bb6640-edee-4777-9e3c-fde20245cf6d', 'yinchengjie2@gmail.com', '', 'Chengjie', 'Yin', 'Chengjie Yin', 1, 'active'),
    ('73733370-60d0-4fd6-9f69-f9806a5e0ad0', 'rtran1986@gmail.com', '', 'Robert', '', 'Robert', 1, 'active'),
    ('2079c11c-da28-406d-985c-415ea1dd8b7b', 'alvavic2015@gmail.com', '', 'Victoria', 'Alvarez', 'Victoria Alvarez', 1, 'active'),
    ('54b12a8d-39fd-4ec9-9333-4dcc79480f64', 'sacc9535@gmail.com', '', 'spam', 'acc', 'spam acc', 1, 'active'),
    ('ee546267-b712-4521-99cd-b2c15c7ec95d', 'jihuali5213@gmail.com', '', 'Ji', 'hua Li', 'Ji hua Li', 1, 'active');

-- Assign super_admin role to specific users
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id 
FROM users u, roles r 
WHERE r.name = 'super_admin' 
AND u.email IN ('yinchengjie2@gmail.com', 'rtran1986@gmail.com', 'alvavic2015@gmail.com');

-- User role for jihuali5213@gmail.com is already assigned by the trigger