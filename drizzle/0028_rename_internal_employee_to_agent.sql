-- Rename internal_employee role to agent for better clarity
UPDATE roles
SET name = 'agent',
    description = 'Agent with access to support ticket management and cart management'
WHERE name = 'internal_employee';
