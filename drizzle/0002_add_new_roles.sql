-- ============================================
-- Migration: Add New Roles (manager, employee, user)
-- Assumes only super_admin exists in remote database
-- ============================================

-- Add new roles (will not duplicate super_admin due to unique constraint on name)
INSERT OR IGNORE INTO roles (name, description) VALUES
  ('super_admin', 'Super administrator with full system access'),
  ('manager', 'Manager level access - can manage employees and view reports'),
  ('employee', 'Employee level access - can access work-related features'),
  ('user', 'Regular user access - basic features only');

-- Assign default 'user' role to any users without a role (excluding those with super_admin)
INSERT OR IGNORE INTO user_roles (user_id, role_id)
SELECT 
  u.id,
  (SELECT id FROM roles WHERE name = 'user')
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id
)
AND u.status = 'active';