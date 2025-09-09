-- Insert base permissions for all resources
INSERT INTO permissions (action, resource, description) VALUES
  -- User management
  ('create', 'users', 'Create new users'),
  ('read', 'users', 'View user profiles'),
  ('update', 'users', 'Edit user profiles'),
  ('delete', 'users', 'Delete users'),
  
  -- Company management
  ('create', 'companies', 'Create new companies'),
  ('read', 'companies', 'View company details'),
  ('update', 'companies', 'Edit company details'),
  ('delete', 'companies', 'Delete companies'),
  
  -- Asset management
  ('create', 'assets', 'Create new assets'),
  ('read', 'assets', 'View asset details'),
  ('update', 'assets', 'Edit asset details'),
  ('delete', 'assets', 'Delete assets'),
  
  -- Subscription management
  ('create', 'subscriptions', 'Create subscriptions'),
  ('read', 'subscriptions', 'View subscription details'),
  ('update', 'subscriptions', 'Modify subscriptions'),
  ('delete', 'subscriptions', 'Cancel subscriptions'),
  
  -- Content management
  ('create', 'content', 'Create content items'),
  ('read', 'content', 'View content'),
  ('update', 'content', 'Edit content'),
  ('delete', 'content', 'Delete content'),
  
  -- Job management
  ('create', 'jobs', 'Create job requests'),
  ('read', 'jobs', 'View job details'),
  ('update', 'jobs', 'Edit job details'),
  ('delete', 'jobs', 'Delete jobs'),
  
  -- System administration
  ('read', 'admin', 'Access admin dashboard'),
  ('manage', 'roles', 'Manage user roles and permissions'),
  ('manage', 'system', 'System configuration and maintenance');

-- Create roles (super_admin, manager, employee, user)
INSERT INTO roles (name, description) VALUES
  ('super_admin', 'Super administrator with full system access'),
  ('manager', 'Manager level access - can manage employees and view reports'),
  ('employee', 'Employee level access - can access work-related features'),
  ('user', 'Regular user access - basic features only');

-- Assign ALL permissions to super admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'super_admin'),
  id
FROM permissions;