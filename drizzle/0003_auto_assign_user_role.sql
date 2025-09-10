-- Create a trigger to automatically assign 'user' role to new users
-- This trigger fires after a user is inserted into the users table

-- Drop the trigger if it exists (for idempotency)
DROP TRIGGER IF EXISTS auto_assign_user_role;

-- Create the trigger
-- SQLite syntax for D1
CREATE TRIGGER auto_assign_user_role
AFTER INSERT ON users
FOR EACH ROW
WHEN NOT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = NEW.id
)
BEGIN
    -- Get the user role ID (assuming role with name 'user' exists)
    INSERT INTO user_roles (user_id, role_id)
    SELECT NEW.id, id 
    FROM roles 
    WHERE name = 'user'
    LIMIT 1;
END;